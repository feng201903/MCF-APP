<template>
  <div>
    <van-list v-model="loading" :finished="finished" :finished-text="$t('common.noData')" :loading-text="$t('common.loading')" @load="onLoad">
      <van-cell v-for="item in message" @click="item.type!=='ISSUE_ASSET'?toDetail(item.signature):''" :key="item.signature" :title="messageInfo(item).title" :label="messageInfo(item).time" />
    </van-list>
  </div>
</template>

<script>
export default {
  name: 'Message',
  data() {
    return {
      list: [],
      loading: false,
      finished: false,
      address: this.$mcf.getStorage('defaultAccount').address,
      message: [],
      page: 1
    }
  },
  methods: {
    messageInfo(message) {
      let title
      let time = this.$mcf.format(message.timestamp)
      switch (message.type) {
        case "ISSUE_ASSET":
          title = `${this.$t('user.message.issue')} ${message.assetName} ${this.approvalStatus(message.approvalStatus)}`
          break;
        case "PAYMENT":
        case "TRANSFER_ASSET":
          title = `${this.$t('user.message.message')}：${message.amount} ${message.assetName || "MCF"} ${this.$t('user.message.success')}`
          break;
        default:
          break;
      }
      return {
        title, time
      }
    },
    approvalStatus(status) {
      switch (status) {
        case 'NOT_REQUIRED':
        case 'APPROVED':
          return this.$t('user.message.APPROVED')
        case 'PENDING':
          return this.$t('user.message.PENDING')
        case 'REJECTED':
        case 'EXPIRED':
        case 'INVALID':
          return this.$t('user.message.INVALID')
        default:
          return 'error'
      }
    },
    async onLoad() {
      // console.log("查询第" + this.page + "页")
      try {
        let message = (await this.$api.getMessage({
          data: this.address,
          page: this.page,
          limit: 20
        })).data
        // console.log("第" + this.page + "页" + message.length + "条")
        // console.log(message)
        this.message = this.message.concat(message)
        // console.log(this.message)
        this.page += 1
        let next = (await this.$api.getMessage({
          data: this.address,
          page: this.page,
          limit: 20
        })).data
        // console.log("下一页第" + this.page + "页" + next.length + "条")
        if (next.length === 0) {
          // console.log("下一页无数据")
          this.finished = true;
        }
      } catch (error) {
        console.log(error)
      } finally {
        this.loading = false
      }
    },
    toDetail(signature) {
      this.$router.push({ path: '/user/wallet/detail', query: { signature } })
    }
  },
  beforeRouteLeave(to, from, next) {
    if (to.path.indexOf('detail') > -1) {
      this.$emit('setKeepAlive', ['Message'])
    } else {
      this.$emit('setKeepAlive', [])
    }
    next()
  }
}
</script>

<style lang="less" scoped>
</style>