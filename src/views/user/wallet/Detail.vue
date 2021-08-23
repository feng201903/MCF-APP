<template>
  <div>
    <van-cell :title="$t('user.detail.from')">
      <template #default>
        <code @click="doCopy(detail.creatorAddress)">{{detail.creatorAddress}}</code>
      </template>
    </van-cell>
    <van-cell :title="$t('user.detail.to')">
      <template #default>
        <code @click="doCopy(detail.recipient)">{{detail.recipient}}</code>
      </template>
    </van-cell>
    <van-cell :title="$t('user.detail.txHash')">
      <template #default>
        <code @click="doCopy(detail.signature)">{{detail.signature}}</code>
      </template>
    </van-cell>
    <van-cell :title="$t('common.amount')" :value="detail.amount+(detail.assetName||'MCF')" />
    <van-cell :title="$t('common.block')" :value="detail.blockHeight" />
    <van-cell :title="$t('common.fee')" :value="detail.fee+'MCF'" />
    <van-cell :title="$t('common.time')" :value="$mcf.format(detail.timestamp)" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      signature: this.$route.query.signature,
      detail: {}
    }
  },
  methods: {
    getDetail() {
      this.$api.getTxBySignature(this.signature).then(res => {
        // console.log(res)
        this.detail = res.data
      }).catch(err => {
        console.log(err)
      })
    },
    doCopy: function (text) {
      var _this = this
      this.$copyText(text).then(function (e) {
        console.log('复制成功！')
        _this.$toast({
          type: 'html',
          message: `<div style="word-break:break-all;text-align:left">${text}</div>`
        })
      }, function (e) {
        console.log('复制失败！')
        _this.$toast('copy failed')
      })
    }
  },
  mounted() {
    this.getDetail();
  },
}
</script>

<style lang="less" scoped>
.van-cell {
  padding: 10px 5%;
}
::v-deep .van-cell__value {
  flex-basis: 60%;
  text-align: left;
  code {
    color: #5b85ff;
    border-bottom: 1px solid #5b85ff;
  }
}
</style>