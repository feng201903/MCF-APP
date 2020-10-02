<template>
  <div>
    <h3>转账种类</h3>
    <select name="" id="" v-model="assetId">
      <option disabled value="">请选择种类</option>
      <option v-for="item in newAssetsBalance" :key="item.assetId" :value="item.assetId">{{item.assetName}}：{{item.balance}}</option>
    </select>
    <h3>转账地址</h3>
    <mt-field placeholder="输入或粘贴" v-model="recipient" disableClear><i class="iconfont icon-lianxiren" @click="popupVisible = true"></i></mt-field>
    <h3>转账金额</h3>
    <mt-field placeholder="请输入转账数量" v-model.trim="amount" @keyup.native="onInput"></mt-field>
    <p>转账手续费：<strong>0.00001MCF</strong></p>
    <button class="mcf-btn btn-blue create-trans" @click="createTrans">确定</button>
    <mt-popup v-model="popupVisible" position="right" class="mint-popup-3" :modal="false">
      <mt-header fixed title="联系人">
        <mt-button icon="back" @click.native="popupVisible = false" slot="left"></mt-button>
      </mt-header>
      <div class="contacts-list" style="color:black">
        <div class="contacts-list-item" v-for="(item,index) in contactsList" :key="index" @click="selectContacts(item.address)">
          <p>{{item.name}}</p>
          <p class="address">{{item.address}}</p>
          <div class="item-btn">
            <button class="btn-blue" @click.stop="showDialog(index)">修改</button>
            <button class="btn-red" @click.stop="del(index)">删除</button>
          </div>
        </div>
      </div>
      <button class="mcf-btn btn-blue add-contacts" @click="dialogShow = true">添加联系人</button>
      <div class="dialog" @click="hideDialogByBlank" v-show="dialogShow">
        <div class="dialog-container" id='dialog-container'>
          <h4>备注</h4>
          <input type="text" placeholder="请输入备注" v-model="contactsName">
          <h4>地址</h4>
          <input type="text" placeholder="请输入地址" v-model="contactsAddress">
          <button class="mcf-btn btn-blue sub-edit" @click="edit()">确定</button>
          <button class="mcf-btn btn-orange sub-edit" @click="hideDialogByBtn">取消</button>
        </div>
      </div>
    </mt-popup>
  </div>
</template>

<script>
import { trans, decryptPwd } from '@/assets/js/utils.js'
export default {
  data () {
    return {
      creator: this.$route.query.creator,
      recipient: this.$route.query.recipient || '',
      assetsBalance: [],
      assetId: '',
      amount: null,
      popupVisible: false,
      dialogShow: false,
      contactsList: JSON.parse(localStorage.getItem('contactsList')) || [],
      contactsIndex: null,
      contactsName: '',
      contactsAddress: ''
    }
  },
  computed: {
    newAssetsBalance () {
      return this.assetsBalance.filter(item => {
        return item.balance > 0
      })
    }
  },
  methods: {
    onInput (e) {
      if (this.assetId === 0) {
        var len = 8
        this.amount = this.amount.replace(/[^\d.]/g, '')
        this.amount = this.amount.replace(/^\./g, '')
        this.amount = this.amount.replace(/\.{2,}/g, '.')
        this.amount = this.amount.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
        var re = new RegExp('^(\\-)*(\\d+)\\.(\\d{' + len + '}).*$')
        this.amount = this.amount.replace(re, '$1$2.$3')
      } else if (this.assetId > 0) {
        if (this.amount.length === 1) {
          this.amount = this.amount.replace(/[^1-9]/g, '')
        } else {
          this.amount = this.amount.replace(/\D/g, '')
        }
      }
    },
    setAssetsBalance () {
      this.axios.get('assets/balances?address=' + this.creator + '&limit=0').then((response) => {
        this.assetsBalance = response.data
      }).catch((err) => {
        console.log(err)
      })
    },
    createTrans () {
      // console.log(this.amount)
      if (this.assetId === '') {
        this.$toast('请选择种类')
        return
      }
      if (this.recipient === '') {
        this.$toast('请填写转账地址')
        return
      }
      if (!this.amount) {
        this.$toast('请填写转账金额')
        return
      }
      let salt = this.$store.getters.salt
      let accountInfo = JSON.parse(localStorage.getItem('AccountList')).filter(item => {
        return item.address === this.creator
      })
      this.$messagebox.prompt(' ', '请输入密码', { inputType: 'password' }).then(async ({ value, action }) => {
        var privateKey = decryptPwd(accountInfo[0].code, value, salt)
        if (!privateKey) {
          this.$toast('密码错误')
          return
        }
        let creatorInfo = {
          address: accountInfo[0].address,
          privateKey: privateKey
        }
        let transInfo = {
          assetId: this.assetId,
          amount: this.amount,
          recipient: this.recipient
        }
        // console.log(creatorInfo, transInfo)
        try {
          var result = await trans(creatorInfo, transInfo)
          // console.log(result)
          if (result.data === true) {
            this.$toast('转账成功')
            // this.$router.push({ path: '/user/assets', query: { address: this.creator } })
          }
        } catch (error) {
          console.log(error)
          this.$toast('转账失败:' + error.message)
        }
      }).catch(() => {
        this.$toast('操作取消')
      })
    },
    hideDialogByBlank (event) {
      let dom = document.getElementById('dialog-container')
      if (dom) {
        if (!dom.contains(event.target)) {
          this.dialogShow = false
        }
      }
    },
    hideDialogByBtn () {
      this.clearInput()
      this.dialogShow = false
    },
    showDialog (index) {
      this.dialogShow = true
      this.contactsName = this.contactsList[index].name
      this.contactsAddress = this.contactsList[index].address
      this.contactsIndex = index
    },
    edit () {
      if (!this.contactsName || !this.contactsAddress) {
        alert('请填写地址和备注')
        return
      }
      let contactsInfo = {
        name: this.contactsName,
        address: this.contactsAddress
      }
      if (this.contactsIndex || this.contactsIndex === 0) {
        this.contactsList[this.contactsIndex] = contactsInfo
      } else {
        this.contactsList.push(contactsInfo)
      }
      localStorage.setItem('contactsList', JSON.stringify(this.contactsList))
      this.clearInput()
      this.dialogShow = false
    },
    del (index) {
      this.contactsList.splice(index, 1)
      localStorage.setItem('contactsList', JSON.stringify(this.contactsList))
    },
    clearInput () {
      this.contactsName = ''
      this.contactsAddress = ''
      this.contactsIndex = null
    },
    selectContacts (address) {
      this.recipient = address
      this.popupVisible = false
    }
  },
  mounted () {
    this.setAssetsBalance()
  },
  watch: {
    assetId (newValue, oldValue) {
      this.amount = null
    }
  }
}
</script>

<style lang="less" scoped>
.mint-popup-3 {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
.contacts-list {
  margin-top: 41px;
  height: 600px;
  //   background-color: green;
  overflow: hidden;
  overflow-y: scroll;
}
.contacts-list-item {
  //   background-color: skyblue;
  height: 70px;
  margin: 5px 0px;
  position: relative;
  padding: 5px 10px;
  border-bottom: 1px solid rgba(112, 128, 144, 0.2);
}
.contacts-list-item p {
  color: black;
  margin: 10px 0px;
}
.contacts-list-item .address {
  color: #7d8492;
  font-size: 12px;
}
.item-btn {
  position: absolute;
  width: 50px;
  //   background-color: blueviolet;
  right: 10px;
  top: 0;
}
.item-btn button {
  border-radius: 3px;
  border: 0px;
  margin-top: 10px;
  height: 25px;
}
/deep/ .mint-cell {
  min-height: 42px;
}
/deep/ .mint-cell-wrapper {
  border: 1px solid #888888;
  border-radius: 3px;
  height: 20px;
}
h3,
h4,
p {
  color: #7d8492;
}
p > strong {
  color: black;
}
select {
  height: 42px;
  width: 100%;
}
.create-trans {
  width: 50%;
  margin: 50px 25% 0;
}
.add-contacts {
  width: 50%;
  position: fixed;
  bottom: 30px;
  left: 25%;
}
.dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
}
.dialog .dialog-container {
  width: 300px;
  height: 260px;
  background: #ffffff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 0 10px;
}
.dialog .dialog-container input {
  width: 100%;
  height: 40px;
  box-sizing: border-box;
  padding: 5px;
}
.dialog .dialog-container h4 {
  margin: 20px 0px 10px;
}
.sub-edit {
  width: 40%;
  margin: 20px 5%;
  height: 40px;
  line-height: 40px;
}
</style>
