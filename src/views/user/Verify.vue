<template>
  <div class="list">
    <ul>
      <li v-for="item in newVerify" :key="item.signature">
        <p>{{cutAddr(item.owner)}}发行了以下资产</p>
        <p>资产简称：{{item.assetName}}</p>
        <p>资产全称：{{decodeURIComponent(item.data.full)}}</p>
        <p>资产中文名：{{decodeURIComponent(item.description)}}</p>
        <p>发行总量：{{item.quantity}}</p>
        <p>可分割：{{item.isDivisible?'可分割':'不可分割'}}</p>
        <p>url：{{item.data.url}}</p>
        <p>web：{{item.data.web}}</p>
        <p>logo：{{item.assetName}}</p>
        <p>简介：{{decodeURIComponent(item.data.content)}}</p>
        <p><button @click="toVerify(item.signature)">通过</button></p>
      </li>
    </ul>
  </div>
</template>

<script>
import { decryptPwd, doVerify } from '@/assets/js/utils.js'
export default {
  data () {
    return {
      verify: null
    }
  },
  computed: {
    newVerify () {
      return this.verify ? this.verify.map(el => {
        el.data = JSON.parse(el.data)
        return el
      }) : []
    }
  },
  methods: {
    getVerify () {
      this.axios.get('transactions/pending?txGroupId=2&limit=100').then((response) => {
        // this.axios.get('transactions/search?txType=ISSUE_ASSET&confirmationStatus=CONFIRMED&limit=20').then((response) => {
        // console.log(response.data)
        this.verify = response.data
      }).catch(function (error) {
        console.log(error)
      })
    },
    toVerify (signature) {
      let salt = this.$store.getters.salt
      let accountInfo = JSON.parse(localStorage.getItem('AccountList')).filter(item => {
        return item.isDefault === true
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
        try {
          var result = await doVerify(creatorInfo, signature)
          // console.log(result)
          if (result.data === true) {
            this.$toast('转账成功')
          }
        } catch (error) {
          console.log(error)
          this.$toast('转账失败:' + error.message)
        }
      }).catch((error) => {
        console.log(error)
        this.$toast('操作取消')
      })
    },
    cutAddr (address) {
      return address.slice(0, 10) + '...' + address.slice(-10)
    }
  },
  mounted () {
    this.getVerify()
  }
}
</script>

<style lang="less" scoped>
.list {
  ul {
    list-style: none;
    padding: 0px;
    font-size: 14px;
    li {
      border: 1px solid slategray;
      padding: 0px 10px;
      margin-top: 10px;
      p {
        margin: 5px 0px;
        width: 100%;
        word-break: break-all;
      }
    }
  }
}
</style>
