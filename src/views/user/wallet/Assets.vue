<template>
  <div class="assets">
    <div class="assets-header">
      <div class="assets-header-info">
        <div class="name">{{accountInfo?accountInfo.name:''}}
          <van-icon name="edit" @click="isShowRenameDialog=!isShowRenameDialog" size="20" />
        </div>

        <div class="balance">
          {{balanceByAssetId(0)?balanceByAssetId(0).balance:0}} <span class="mcf">MCF</span>
        </div>
        <div class="address" @click="copy">
          {{cutAddr}}
          <i class="iconfont icon-copy"></i>
        </div>
      </div>
      <div class="assets-header-btn">
        <div v-if="showScan"><i class="iconfont icon-scan" @click="$router.push({ path: '/user/wallet/scan',query: { creator: address }})"></i>{{$t('user.assets.scan')}}</div>
        <div><i class="iconfont icon-out" @click="$router.push({ path: '/user/wallet/transfer',query: { creator: address }})"></i>{{$t('user.assets.transfer')}}</div>
        <div><i class="iconfont icon-in" @click="isShowQrDialog=!isShowQrDialog"></i>{{$t('user.assets.collect')}}</div>
      </div>
      <button class="active" :class="isActive?'is-active':''" @click="active" :disabled='isActive'>{{isActive?$t('user.assets.activated'):$t('user.assets.unactivated')}}</button>
      <!-- <button class="active" :class="isActive?'is-active':''" @click="active">{{isActive?"已激活":"未激活"}}</button> -->
    </div>
    <div class="assets-list">
      <div class="list-header">
        <span class="list-header-name">{{$t('user.assets.asset')}}</span>
        <span class="list-header-balance">{{$t('user.assets.balance')}}</span>
      </div>
      <ul class="list-body">
        <van-empty v-show="allKnownAssets.length===0" :description="$t('common.noData')" />
        <li v-for="item in allKnownAssets" :key="item.assetId" @click="$router.push({ path: '/user/wallet/record',query: { address: address ,assetId:item.assetId}})">
          <img :src="JSON.parse(item.data).logo">
          <span class="list-body-name">{{ item.name }}</span>
          <span class="list-body-balance">{{ balanceByAssetId(item.assetId)?balanceByAssetId(item.assetId).balance:0 }}</span>
        </li>
      </ul>
    </div>
    <van-dialog v-model="isShowRenameDialog" :title="$t('user.assets.newName')" show-cancel-button @confirm="confirm" :confirmButtonText="$t('common.btnConfirm')" :cancelButtonText="$t('common.btnCancel')">
      <input type="text" class="dialog-input" v-model="newName" />
    </van-dialog>

    <van-dialog v-model="isShowQrDialog" style="text-align:center;padding-top:10px">
      <vue-qr :text="qrData" :margin="20" colorLight="#fff" :size="250"></vue-qr>
      <code class="code-address" style=" display: block;font-size:13px;margin-bottom:10px;">{{address}}</code>
    </van-dialog>
  </div>
</template>

<script>
import vueQr from 'vue-qr'
export default {
  data() {
    return {
      accountList: this.$mcf.getStorage('accountList'),
      address: this.$route.query.address ? this.$route.query.address : this.$mcf.getStorage('defaultAccount').address,
      isShowRenameDialog: false,
      newName: '',
      allBalance: [],
      addresses: {},
      isShowQrDialog: false,
      showScan: !!window.plus
    }
  },
  components: {
    vueQr
  },
  props: {
    allKnownAssets: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  methods: {
    confirm() {
      let accountList = this.accountList
      for (let i = 0; i < accountList.length; i++) {
        if (this.accountInfo.address === accountList[i].address) {
          accountList[i].name = this.newName || 'wallet'
          break
        }
      }
      localStorage.setItem('accountList', JSON.stringify(this.accountList))
    },
    async getAllBalance() {
      let address = this.address ? this.address : this.$mcf.getStorage('defaultAccount').address
      try {
        this.allBalance = (await this.$api.getAllBalancesByAddress(address)).data
      } catch (error) {
        this.$notify({ type: 'warning', message: error.message })
      }
    },
    getAddresses() {
      let address = this.address ? this.address : this.$mcf.getStorage('defaultAccount').address
      this.$api.getAddresses(address).then(res => {
        this.addresses = res.data
      }).catch(err => {
        console.log(err)
      })
    },
    copy() {
      var _this = this
      this.$copyText(this.accountInfo.address).then(function (e) {
        _this.$toast(_this.accountInfo.address)
      }, function (e) {
        console.log(e)
        _this.$toast('copy failed')
      })
    },
    active() {
      let account = this.accountInfo
      this.$mcf.transactions('JOIN_GROUP', { creator: this.address, groupId: 2, ...account }).then(res => {
        if (res.data) {
          this.$toast(this.$t('user.assets.activationSubmitted'))
        }
      }).catch(error => {
        console.log(error)
        if (error.err_message) {
          this.$notify({ type: 'danger', message: error.err_message })
        }
      })
    },
    balanceByAssetId(assetId) {
      return this.allBalance.filter(item => {
        return item.assetId === assetId
      })[0]
    }
  },
  computed: {
    cutAddr() {
      let address = this.accountInfo ? this.accountInfo.address : this.$mcf.getStorage('defaultAccount').address
      if (address)
        return address.slice(0, 10) + '*****' + address.slice(-10)
    },
    accountInfo() {
      let address = this.address ? this.address : this.$mcf.getStorage('defaultAccount').address
      return this.accountList.filter(item => {
        return item.address === address
      })[0]
    },
    isActive() {
      return this.addresses.defaultGroupId === 2
    },
    qrData() {
      let address = this.address ? this.address : this.$mcf.getStorage('defaultAccount').address
      let codeInfo = {
        type: 'trans',
        address
      }
      return JSON.stringify(codeInfo)
    }
  },
  mounted() {
    if (this.address) {
      this.getAllBalance()
      this.getAddresses()
    } else {
      this.$router.replace({ path: '/user/wallet' })
    }
  },
}
</script>

<style lang="less" scoped>
.assets {
  background-color: white;
  .assets-header {
    background-color: #5b85ff;
    color: white;
    padding: 0 5%;
    margin: 0 5%;
    border-radius: 5px;
    position: relative;

    .assets-header-info {
      padding: 15px 0 10px;
      font-size: 18px;
      line-height: 18px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      .name {
        .van-icon {
          display: inline-block;
          vertical-align: top;
        }
      }
      .address {
        font-size: 14px;
      }
      .balance {
        font-size: 22px;
        margin: 15px 0 10px;
        .mcf {
          font-size: 13px;
        }
      }
    }
    .assets-header-btn {
      padding: 10px 0;
      display: flex;
      justify-content: space-around;
      font-size: 13px;
      i {
        display: block;
        text-align: center;
        margin-bottom: 5px;
        &.iconfont::before {
          font-size: 35px;
        }
      }
    }
    .active {
      position: absolute;
      background-color: dimgrey;
      border: none;
      right: 0px;
      top: 10px;
      font-size: 13px;
      padding: 5px;
      border-radius: 5px 0px 0px 5px;
      &.is-active {
        background-color: #95dd37;
      }
    }
  }
  .list-header {
    font-size: 12px;
    margin: 10px 5%;
    span {
      display: inline-block;
      width: 50%;
      &.list-header-balance {
        text-align: right;
      }
    }
  }
  .list-body {
    font-size: 13px;
    background-color: white;
    li {
      padding: 15px 5%;
      border-bottom: 1px solid hsla(0, 0%, 86.7%, 0.4);
      img {
        display: inline-block;
        vertical-align: middle;
        width: 10%;
      }
      span {
        display: inline-block;
        vertical-align: middle;
        width: 30%;
        &.list-body-name {
          box-sizing: border-box;
          padding-left: 5%;
        }
        &.list-body-balance {
          width: 60%;
          text-align: right;
        }
      }
    }
  }
  .dialog-input {
    width: 76%;
    margin: 10px 10%;
    padding: 5px 2%;
    outline-style: none;
    border: 1px solid #ccc;
    border-radius: 3px;
  }
}
</style>
