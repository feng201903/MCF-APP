<template>
  <div>
    <van-form @submit="onSubmit">
      <van-field v-model="recipient" name="creator" :label="$t('user.transfer.recipient')" :placeholder="$t('user.transfer.recipient')" :rules="[{ required: true, message: '请填写接收地址' }]" right-icon="friends" @click-right-icon="contact" />
      <van-field readonly clickable name="picker" :value="asset" :label="$t('user.transfer.assetType')" :placeholder="$t('user.transfer.select')" @click="showPicker = true" />
      <van-field v-model="amount" type="number" name="amount" :label="$t('user.transfer.amount')" :placeholder="$t('user.transfer.amount')" :rules="[{ required: true, message: '请填写转账金额' }]" />
      <span class="fee">{{$t('common.fee')}}: 0.00001MCF</span>
      <div class="btn">
        <van-button round block type="info" native-type="submit">{{$t('user.transfer.submit')}}</van-button>
      </div>
    </van-form>

    <van-popup v-model="showPicker" position="bottom">
      <van-picker show-toolbar :columns="assets" :confirm-button-text="$t('common.btnConfirm')" :cancel-button-text="$t('common.btnCancel')" @confirm="onConfirm" @cancel="showPicker = false" />
    </van-popup>

  </div>
</template>

<script>
export default {
  data() {
    return {
      recipient: this.$route.query.recipient,
      amount: '',
      asset: '',
      assets: [],
      showPicker: false,
      creator: this.$route.query.creator,
      allBalance: []
    }
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
    async onSubmit() {
      console.log(this.assetId)
      if (this.assetId >= 0) {
        try {
          let txType = this.assetId === 0 ? 'PAYMENT' : 'TRANSFER_ASSET'
          let account = this.$mcf.getAccountByStorage(this.creator)
          let config = {
            creator: this.creator,
            recipient: this.recipient,
            amount: this.amount,
            assetId: this.assetId
          }
          let res = await this.$mcf.transactions(txType, { ...config, ...account })
          console.log(res)
          if (res === true) {
            this.$notify({ type: 'success', message: this.$t('user.transfer.success') })
          }
        } catch (error) {
          console.log(error)
          if (error.err_message) {
            this.$notify({ type: 'danger', message: error.err_message })
          }
        }
      } else {
        this.$notify({ type: 'danger', message: this.$t('user.transfer.assetType') })
      }
    },
    onConfirm(value) {
      this.asset = value;
      this.showPicker = false;
    },
    getAllBalance() {
      let address = this.creator
      this.$api.getAllBalancesByAddress(address).then(res => {
        this.allBalance = res.data
        let all = res.data
        for (let i = 0; i < all.length; i++) {
          this.assets.push(all[i].assetName + ':' + all[i].balance)
        }
      }).catch(err => {
        console.log(err)
      })
    },
    contact() {
      console.log("联系人")
      this.$router.push({ path: '/user/wallet/contact', query: { creator: this.creator } })
    }
  },
  computed: {
    assetId() {
      if (this.asset) {
        let assetName = (this.asset.split(":"))[0]
        console.log(assetName)
        let all = this.allKnownAssets
        for (let i = 0; i < all.length; i++) {
          if (all[i].name === assetName)
            return all[i].assetId
        }
      }
    },
  },
  mounted() {
    this.getAllBalance()
  },
}
</script>

<style lang="less" scoped>
.fee {
  display: block;
  font-size: 13px;
  margin: 20px 0 10px;
  padding: 0 5%;
  color: dimgrey;
  opacity: 0.5;
}
.contactList {
  padding-top: 50px;
}
.btn {
  margin: 30px 5%;
}
</style>