<template>
  <div>
    <van-list v-model="loading" :finished="finished" :finished-text="$t('common.noData')" :loading-text="$t('common.loading')" @load="onLoad">
      <van-cell v-for="item in record" @click="$router.push({ path: '/user/wallet/detail',query: { signature: item.signature }})" :key="item.signature" :class="item.creatorAddress===address?'out':'in'" :label="messageInfo(item).time" :value="messageInfo(item).value">
        <template #title>
          <code>{{item.creatorAddress=== address?item.recipient:item.creatorAddress}}</code>
        </template>
      </van-cell>
    </van-list>
  </div>
</template>

<script>
export default {
  name: 'Record',
  data() {
    return {
      loading: false,
      finished: false,
      address: this.$route.query.address,
      assetId: this.$route.query.assetId,
      record: [],
      page: 1
    }
  },
  methods: {
    messageInfo(message) {
      let title
      let time = this.$mcf.format(message.timestamp)
      let value = message.creatorAddress === this.address ? `-${message.amount}${message.assetName || "MCF"}` : `+${message.amount}${message.assetName || "MCF"}`
      return {
        value, time
      }
    },
    async onLoad() {
      console.log("查询第" + this.page + "页")
      try {
        let api = this.assetId > 0 ? 'getTransferRecordOther' : 'getTransferRecordMcf'
        let record = (await this.$api[api]({
          address: this.address,
          page: this.page,
          limit: 20,
          assetId: this.assetId
        })).data
        // console.log("第" + this.page + "页" + record.length + "条")
        // console.log(record)
        this.record = this.record.concat(record)
        // console.log(this.record)
        this.page += 1
        let next = (await this.$api[api]({
          address: this.address,
          page: this.page,
          limit: 20,
          assetId: this.assetId
        })).data
        // console.log("下一页第" + this.page + "页" + next.length + "条")
        // this.loading = false;
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
  },
  beforeRouteLeave(to, from, next) {
    if (to.path.indexOf('detail') > -1) {
      // console.log(`push Record`)
      this.$emit('setKeepAlive', 'Record', 'push')
    } else {
      // console.log(`remove Record`)
      this.$emit('setKeepAlive', 'Record', 'remove')
    }
    next()
  }
}
</script>

<style lang="less" scoped>
.van-cell {
  padding: 10px 5%;
  &::after {
    right: 0;
    left: 0;
  }
  .van-cell__title {
    overflow: hidden;
  }
  .van-cell__value {
    position: absolute;
    bottom: 8px;
    right: 5%;
  }
  &.out {
    .van-cell__value {
      color: red;
    }
  }
  &.in {
    .van-cell__value {
      color: green;
    }
  }
}
</style>