<template>
  <div class="record">
    <div class="balance">
      <p>{{transInfo.amount||0}}<span>{{transInfo.assetName||"MCF"}}</span></p>
    </div>
    <div class="detail">
      <h4>发款方</h4>
      <p class="line" @click="doCopy(transInfo.creatorAddress)">{{transInfo.creatorAddress}}</p>
      <h4>收款方</h4>
      <p class="line" @click="doCopy(transInfo.recipient)">{{transInfo.recipient}}</p>
      <h4>交易手续费</h4>
      <p>{{transInfo.fee}}MCF</p>
      <h4>交易ID</h4>
      <p class="line" @click="doCopy(transInfo.signature)">{{cutSignature(transInfo.signature)}}</p>
      <h4>区块</h4>
      <p>{{transInfo.blockHeight}}</p>
      <h4>交易时间</h4>
      <p>{{format(transInfo.timestamp)}}</p>
    </div>

  </div>
</template>

<script>
import { format } from '@/assets/js/utils.js'
export default {
  data () {
    return {
      signature: this.$route.query.signature,
      transInfo: ''
    }
  },
  methods: {
    format (time) {
      return format(time)
    },
    cutSignature (signature) {
      if (signature) {
        return signature.slice(0, 10) + '...' + signature.slice(-10)
      }
    },
    doCopy: function (text) {
      var _this = this
      this.$copyText(text).then(function (e) {
        console.log('复制成功！')
        _this.$toast('复制成功')
      }, function (e) {
        console.log('复制失败！')
        _this.$toast('复制失败')
      })
    }
  },
  created () {
    this.axios.get('transactions/signature/' + this.signature).then((response) => {
      //  console.log(response.data)
      this.transInfo = response.data
    }).catch(function (error) {
      console.log(error)
    })
  }
}
</script>

<style lang="less" scoped>
.record {
  .balance {
    background-color: #5b85ff;
    color: white;
    p {
      position: relative;
      text-align: center;
      font-size: 30px;
      margin: 5px 0px;
      padding: 10px 0px;
      span {
        position: absolute;
        font-size: 12px;
        bottom: 14px;
        margin-left: 5px;
      }
    }
  }
  .detail {
    padding-left: 10px;
    h4 {
      color: rgba(0, 0, 0, 0.5);
      margin: 20px 0px 0px;
    }
    p {
      margin: 5px 0px;
      font-size: 14px;
      &.line {
        display: inline-block;
        color: #5b85ff;
        font-family: "宋体", monospace;
        border-bottom: 1px solid #5b85ff;
      }
    }
  }
}
</style>
