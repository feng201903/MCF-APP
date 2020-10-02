<template>
  <div class="record">
    <div class="balance">
      <p>{{parseInt((assetBalance.balance) * 10000)/10000||0}}<span>{{assetBalance.assetName}}</span></p>
    </div>
    <h5>最近转账记录</h5>
    <div class="record-list" :style="{height: listHeight}">
      <mt-loadmore :top-method="loadTop" :auto-fill="false" ref="loadmore">
        <ul v-infinite-scroll="loadMore" infinite-scroll-disabled="allLoaded" infinite-scroll-distance="10" infinite-scroll-immediate-check="false">
          <li v-for="(item,index) in recordList" :key="index" @click="$router.push({ path: '/user/tdetail', query: { signature: item.signature}})">
            <p class="address">{{item.creatorAddress=== address?item.recipient:item.creatorAddress}}</p>
            <p>{{item.timestamp}}<span :class="item.creatorAddress=== address?'red':'green'">{{item.creatorAddress=== address?'-':'+'}}{{item.amount}}{{item.assetName||"MCF"}}</span></p>
          </li>
        </ul>
        <div class="loading-box tc" v-if="isLoading">
          <mt-spinner :size="20" type="snake" class="loading-more"></mt-spinner>
          <span class="loading-more-txt">加载中...</span>
        </div>
        <div class="no-more" v-show="allLoaded">没有更多了~</div>
      </mt-loadmore>
    </div>
  </div>
</template>

<script>
import { format } from '@/assets/js/utils.js'
export default {
  data () {
    return {
      listHeight: '',
      address: this.$route.query.address,
      assetId: this.$route.query.assetId,
      assetBalance: '',
      isLoading: false,
      allLoaded: false,
      page: 1,
      recordList: []
    }
  },
  methods: {
    loadTop () {
      console.log('下拉刷新')
      this.recordList = []
      this.page = 1
      this.allLoaded = false
      this.setRecordList()
      this.$refs.loadmore.onTopLoaded()
    },
    loadMore () {
      console.log('加载更多')
      if (this.isLoading) {
        console.log('等待上次加载结束')
      } else {
        this.setRecordList()
      }
    },
    setAssetBalance () {
      this.axios.get('assets/balances?address=' + this.address + '&assetid=' + this.assetId + '&limit=0').then((response) => {
        // console.log(response.data)
        this.assetBalance = response.data[0]
      }).catch((err) => {
        console.log(err)
      })
    },
    async setRecordList () {
      console.log('当前页：' + this.page)
      this.isLoading = true
      try {
        var result = await this.getRecordList(this.page)
        result.forEach((item, index, arr) => {
          arr[index].timestamp = format(parseInt(item.timestamp))
        })
        // console.log(result)
        this.recordList = this.recordList.concat(result)
        var nextPage = await this.getRecordList(this.page + 1)
        // console.log(nextPage)
        console.log('下一页长度：' + nextPage.length)
        if (nextPage.length <= 0) {
          this.allLoaded = true
        }
        this.page++
      } catch (error) {
        console.log(error)
      }
      this.isLoading = false
    },
    getRecordList (page) {
      // console.log('getRecordList:' + page)
      return new Promise((resolve, reject) => {
        let url
        let limit = 10
        let offset = (page - 1) * limit
        if (this.assetId === '0' || this.assetId === 0) {
          url = 'transactions/search?txType=PAYMENT&address=' + this.address + '&confirmationStatus=CONFIRMED&limit=' + limit + '&offset=' + offset + '&reverse=true'
        } else {
          url = 'assets/transfers/' + this.assetId + '?address=' + this.address + '&limit=' + limit + '&offset=' + offset + '&reverse=true'
        }
        this.axios.get(url).then((response) => {
          //  console.log(response.data)
          resolve(response.data)
        }).catch(function (error) {
          //  console.log(error)
          if (error.response) {
            reject(error.response.data)
          }
        })
      })
    }
  },
  created () {
    this.listHeight = (window.innerHeight - 140) + 'px'
    this.setAssetBalance()
    this.setRecordList()
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
  h5 {
    margin: 5px 0px;
    background: rgba(0, 0, 0, 0.1);
  }
  .record-list {
    // background-color: aquamarine;
    overflow: scroll;
    ul {
      list-style: none;
      margin: 0px;
      padding: 0px;
      li {
        // background-color: aquamarine;
        margin: 10px;
        // padding: 10px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        p {
          margin: 20px 0px;
          font-size: 15px;
          &.address {
            font-size: 16px;
            font-family: "宋体", monospace;
          }
        }
        span {
          float: right;
          font-size: 14px;
          &.red {
            color: red;
          }
          &.green {
            color: green;
          }
        }
      }
    }
    .loading-box {
      padding: 5px 0;
      background-color: rgba(0, 0, 0, 0.1);
      text-align: center;
      .loading-more {
        display: inline-block;
        vertical-align: middle;
      }
      .loading-more-txt {
        vertical-align: middle;
        font-size: 14px;
        margin-left: 10px;
      }
    }
    .no-more {
      text-align: center;
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
