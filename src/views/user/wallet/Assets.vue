<template>
  <div class="assets">
    <div class="assets-top">
      <div class="base-info">
        <span>{{ accountInfo.name }}<i class="iconfont icon-bianji" @click="editName"></i></span>
        <!-- <span>{{cutAddr}}<i class="iconfont icon-fuzhi" v-clipboard:copy="accountInfo.address" v-clipboard:success="onCopy" v-clipboard:error="onError"></i></span> -->
        <span>{{ cutAddr }}<i class="iconfont icon-fuzhi" @click="doCopy"></i></span>
        <span class="balance">{{ mcfBalance }}</span>
        <span style="font-size: 12px; opacity: 0.5">{{ $t("page.user.allAssets") }}（MCF）</span>
      </div>
      <hr />
      <div class="box">
        <div
          class="box-item"
          @click="$router.push({ path: '/user/scan', query: { creator: accountInfo.address } })"
          v-if="showScan"
        >
          <i class="iconfont icon-tubiaozhizuomoban"></i>扫一扫
        </div>
        <div class="box-item">
          <i
            class="iconfont icon-M-bitebitixian"
            @click="
              $router.push({ path: '/user/transfer', query: { creator: accountInfo.address } })
            "
          ></i
          >转账
        </div>
        <div class="box-item">
          <i class="iconfont icon-M-bitebichongzhi" @click="showQrcode"></i>收款
        </div>
      </div>
      <button class="active" v-if="showActive" :disabled="disabledActive" @click="activeW">
        {{ activeText }}
      </button>
      <i
        class="iconfont icon-add"
        @click="$router.push({ path: '/user/addasset', query: { address: accountInfo.address } })"
      ></i>
    </div>
    <div class="assets-list">
      <ul>
        <li style="color: black; font-size: 13px">
          <span class="asset-logo"></span>
          <span class="asset-name">资产名称</span>
          <span class="asset-balance">资产</span>
        </li>
        <li
          v-for="item in listInfo"
          :key="item.assetId"
          @click="
            $router.push({
              path: '/user/trecord',
              query: { address: accountInfo.address, assetId: item.assetId },
            })
          "
        >
          <span class="asset-logo"><img :src="item.logo" /></span>
          <span class="asset-name">{{ item.assetName }}</span>
          <span class="asset-balance">{{ item.balance }}</span>
        </li>
      </ul>
    </div>
    <div class="dialog" @click="hideDialog" v-show="dialogShow">
      <div class="dialog-container" id="dialog-container">
        <div id="qrCode" ref="qrCodeDiv"></div>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcodejs2'
import { activeWallet, decryptPwd } from '@/assets/js/utils.js'
export default {
  data () {
    return {
      address: '',
      mcfBalance: 0,
      allBalance: '',
      assetsList: '',
      AccountList: JSON.parse(localStorage.getItem('AccountList')) || [],
      showScan: window.plus || true,
      dialogShow: false,
      showActive: false,
      activeText: this.$t('page.user.inactive'),
      disabledActive: true
    }
  },
  computed: {
    cutAddr () {
      return this.accountInfo.address.slice(0, 10) + '...' + this.accountInfo.address.slice(-10)
    },
    accountInfo () {
      var AccountList = this.AccountList
      var aInfo
      if (this.$route.query.address) {
        for (let i = 0, len = AccountList.length; i < len; i++) {
          if (AccountList[i].address === this.$route.query.address) {
            aInfo = AccountList[i]
          }
        }
      } else {
        for (let i = 0, len = AccountList.length; i < len; i++) {
          if (AccountList[i].isDefault === true) {
            aInfo = AccountList[i]
          }
        }
      }
      return aInfo
    },
    listInfo () {
      let allBalance = this.allBalance
      let assetsList = this.assetsList
      for (let i = 0; i < allBalance.length; i++) {
        for (let j = 0; j < assetsList.length; j++) {
          if (allBalance[i].assetId === assetsList[j].assetId) {
            allBalance[i].logo = JSON.parse(assetsList[j].data).logo
          }
        }
      }
      return allBalance
    }
  },
  methods: {
    getMcfBalance () {
      this.axios.get('addresses/balance/' + this.accountInfo.address).then((response) => {
        // console.log(response.data)
        this.mcfBalance = response.data.value
      }).catch((err) => {
        console.log(err)
      })
    },
    getAllBalance () {
      let arrAssetId = JSON.parse(localStorage.getItem('assetIds-' + this.accountInfo.address)) || []
      if (arrAssetId.length > 0) {
        let strAssetsId = ''
        for (let i = 0, len = arrAssetId.length; i < len; i++) {
          strAssetsId += '&assetid=' + arrAssetId[i]
        }
        this.axios.get('assets/balances?address=' + this.accountInfo.address + strAssetsId + '&limit=0').then((response) => {
          // console.log(response.data)
          this.allBalance = response.data
        }).catch((err) => {
          console.log(err)
        })
      } else {
        // console.log('未选中任何资产')
      }
    },
    getAssetsList () {
      let allAsset = JSON.parse(localStorage.getItem('allAsset')) || []
      if (allAsset.length <= 0) {
        this.axios.get('assets?includeData=true&limit=0&offset=0&reverse=false').then((response) => {
          // console.log(response.data)
          this.assetsList = response.data
          localStorage.setItem('allAsset', JSON.stringify(response.data))
        }).catch((err) => {
          console.log(err)
        })
      } else {
        this.assetsList = allAsset
      }
    },
    editName () {
      this.$messagebox.prompt(' ', '请输入新名称', { inputType: 'text' }).then(({ value, action }) => {
        // console.log(value)
        let accountList = this.AccountList
        for (let i = 0; i < accountList.length; i++) {
          if (this.accountInfo.address === accountList[i].address && value) {
            // console.log(accountList[i])
            accountList[i].name = value
            break
          }
        }
        this.AccountList = accountList
        localStorage.setItem('AccountList', JSON.stringify(this.AccountList))
      })
    },
    doCopy: function () {
      var _this = this
      this.$copyText(this.accountInfo.address).then(function (e) {
        console.log('复制成功！')
        _this.$toast('复制成功')
      }, function (e) {
        console.log('复制失败！')
        _this.$toast('复制失败')
      })
    },
    hideDialog (event) {
      let dom = document.getElementById('dialog-container')
      if (dom) {
        if (!dom.contains(event.target)) {
          this.dialogShow = false
        }
      }
    },
    bindQRCode () {
      let codeInfo = {
        type: 'trans',
        address: this.accountInfo.address
      }
      // eslint-disable-next-line
      new QRCode(this.$refs.qrCodeDiv, {
        text: JSON.stringify(codeInfo),
        width: 200,
        height: 200,
        colorDark: '#333333',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.L
      })
    },
    showQrcode () {
      document.getElementById('qrCode').innerHTML = ''
      this.$nextTick(function () {
        this.bindQRCode()
        this.dialogShow = true
      })
    },
    checkActive () {
      this.axios.get('addresses/' + this.accountInfo.address).then((response) => {
        if (response.data.reference) {
          this.showActive = true
        }
        if (response.data.defaultGroupId === 2) {
          this.activeText = this.$t('page.user.activated')
        } else {
          this.disabledActive = false
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    activeW () {
      let salt = this.$store.getters.salt
      let accountInfo = JSON.parse(localStorage.getItem('AccountList')).filter(item => {
        return item.address === this.accountInfo.address
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
          var result = await activeWallet(creatorInfo)
          // console.log(result)
          if (result.data === true) {
            this.$toast('激活请求已提交，稍后更新状态')
          }
        } catch (error) {
          console.log(error)
          this.$toast('激活失败:' + error.message)
        }
      }).catch(() => {
        this.$toast('操作取消')
      })
    }
  },
  created () {
    this.getMcfBalance()
    this.getAllBalance()
    this.getAssetsList()
    this.checkActive()
  }
}
</script>

<style lang="less" scoped>
.assets {
  .assets-top {
    background-color: #5b85ff;
    margin-top: 5px;
    padding: 5px 0px;
    color: white;
    border-radius: 5px;
    position: relative;
    hr {
      background-color: rgba(128, 128, 128, 0.3);
      // opacity: 0.5;
      height: 1px;
      border: 0px;
      width: 95%;
    }
    .active {
      position: absolute;
      top: 15px;
      background-color: #95dd37;
      border: 0px;
      border-radius: 3px;
      color: white;
      padding: 5px 15px;
    }
    .icon-add {
      position: absolute;
      right: 30px;
      bottom: 80px;
    }
    .base-info {
      span {
        text-align: center;
        display: block;
        margin: 10px 0px;
        font-size: 15px;
        position: relative;
      }
      .balance {
        font-size: 30px;
      }
      i {
        position: absolute;
        margin-left: 10px;
      }
      .iconfont::before {
        font-size: 18px;
      }
    }
    .box {
      padding: 5px 30px;
      display: flex;
      justify-content: space-around;
      font-size: 15px;
      i {
        display: block;
        text-align: center;
      }
      .iconfont::before {
        font-size: 30px;
      }
    }
  }
  .assets-list {
    ul {
      list-style: none;
      margin: 0px;
      padding: 0px 30px 0px 0px;
      font-size: 15px;
      color: #888888;
      li {
        display: flex;
        border-bottom: 1px solid rgba(128, 128, 128, 0.1);
        span {
          height: 60px;
          line-height: 60px;
          &.asset-logo {
            // background-color: forestgreen;
            flex-basis: 80px;
            img {
              margin-top: 5px;
              width: 50px;
            }
          }
          &.asset-name {
            // background-color: yellow;
            flex-basis: 80px;
          }
          &.asset-balance {
            flex-grow: 3;
            // background-color: red;
            text-align: right;
          }
        }
      }
    }
  }
  .dialog {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 9999;
    .dialog-container {
      padding: 25px;
      width: 200px;
      height: 200px;
      background: #ffffff;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 10px;
    }
  }
}
</style>
