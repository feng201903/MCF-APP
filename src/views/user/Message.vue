<template>
  <div class="message-list">
    <ul>
      <li v-for="item in messageList" :key="item.signature">
        <div v-if="item.type === 'ISSUE_ASSET'">
          <p>您发行的资产 {{item.assetName}} {{approvalStatus(item.approvalStatus)}}</p>
          <p>发行总量:{{item.quantity}}</p>
          <p class="time">{{format(item.timestamp)}}</p>
        </div>
        <div v-else @click="$router.push({ path: '/user/tdetail', query: { signature: item.signature}})">
          <p>收付通知：{{item.amount}} {{item.assetName||"MCF"}} 收付成功</p>
          <p class="time">{{format(item.timestamp)}}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { format } from '@/assets/js/utils.js'
export default {
  data () {
    return {
      messageList: [],
      AccountList: JSON.parse(localStorage.getItem('AccountList')) || []
    }
  },
  methods: {
    format (time) {
      return format(time)
    },
    approvalStatus (sta) {
      switch (sta) {
        case 'NOT_REQUIRED':
        case 'APPROVED':
          return '已通过审核'
        case 'PENDING':
          return '待审核'
        case 'REJECTED':
        case 'EXPIRED':
        case 'INVALID':
          return '未通过审核'
        default:
          return '未知状态'
      }
    },
    getMessage () {
      var AccountList = this.AccountList
      var aInfo
      for (let i = 0, len = AccountList.length; i < len; i++) {
        if (AccountList[i].isDefault === true) {
          aInfo = AccountList[i]
          break
        }
      }
      this.axios.get('transactions/search?txType=PAYMENT&txType=ISSUE_ASSET&txType=TRANSFER_ASSET&address=' + aInfo.address + '&confirmationStatus=CONFIRMED&limit=50&reverse=true').then((response) => {
        // console.log(response.data)
        this.messageList = response.data
      }).catch(function (error) {
        console.log(error)
      })
    }
  },
  mounted () {
    this.getMessage()
  }
}
</script>

<style lang="less" scoped>
.message-list {
  ul {
    list-style: none;
    padding: 0px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    li {
      display: inline-block;
      width: 100%;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      p {
        font-size: 14px;
        margin: 10px;
        &.time {
          margin-bottom: 5px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
