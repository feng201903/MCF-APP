<template>
  <div class="market">
    <mt-header fixed :title="$t('title.market')">
      <mt-button slot="right" @click="$router.push({ path: '/search'})"><i class="iconfont icon-sousuo"></i></mt-button>
      <mt-button slot="right" @click="sort"><i class="iconfont icon-paixu"></i></mt-button>
    </mt-header>
    <div class="list">
      <mt-navbar v-model="selected">
        <mt-tab-item id="1">{{$t("page.market.favorite")}}</mt-tab-item>
        <mt-tab-item id="2">MCF</mt-tab-item>
      </mt-navbar>
      <!-- tab-container -->
      <mt-tab-container v-model="selected">
        <mt-tab-container-item id="1">
          <div class="title">
            <span>{{$t("page.market.asset")}}</span>
            <span>{{$t("page.market.price")}}</span>
            <span>{{$t("page.market.change")}}</span>
          </div>
          <ul :style="{height: listHeight + 'px'}">
            <li v-for="item in favoriteMacket" :key="item.assetId" @click="$router.push({ path: '/deal', query: { assetid: item.assetId}})">
              <img :src="item.data.logo">
              <span>{{item.name}}</span>
              <span>{{item.recentPrice}}</span>
              <span :class="item.recentPercent>=0?'green':'red'">{{item.recentPercent>=0?'+':''}}{{(item.recentPercent*100).toFixed(2)}}%</span>
            </li>
          </ul>
        </mt-tab-container-item>
        <mt-tab-container-item id="2">
          <div class="title">
            <span>{{$t("page.market.asset")}}</span>
            <span>{{$t("page.market.price")}}</span>
            <span>{{$t("page.market.change")}}</span>
          </div>
          <ul :style="{height: listHeight + 'px'}">
            <li v-for="item in allMacket" :key="item.assetId" @click="$router.push({ path: '/deal', query: { assetid: item.assetId}})">
              <img :src="item.data.logo">
              <span>{{item.name}}</span>
              <span>{{item.recentPrice}}</span>
              <span :class="item.recentPercent>=0?'green':'red'">{{item.recentPercent>=0?'+':''}}{{(item.recentPercent*100).toFixed(2)}}%</span>
            </li>
          </ul>
        </mt-tab-container-item>
      </mt-tab-container>
    </div>
    <mt-actionsheet :actions="menu" v-model="sheetVisible"></mt-actionsheet>
  </div>
</template>

<script>
export default {
  data () {
    return {
      selected: this.$route.query.tab || '1',
      allAsset: JSON.parse(localStorage.getItem('allAsset')) || [],
      allRecent: [],
      listHeight: window.innerHeight - 190,
      sortRule: 1, //  1：价格降序 2:价格升序  3：涨跌幅降序 4：涨跌幅升序
      menu: [{
        name: this.$t('page.market.descendingPrice'),
        method: this.changeRule,
        sortRule: 1
      }, {
        name: this.$t('page.market.ascendingPrice'),
        method: this.changeRule,
        sortRule: 2
      }, {
        name: this.$t('page.market.descendingChange'),
        method: this.changeRule,
        sortRule: 3
      }, {
        name: this.$t('page.market.ascendingChange'),
        method: this.changeRule,
        sortRule: 4
      }],
      sheetVisible: false,
      favorite: JSON.parse(localStorage.getItem('favorite')) || []
    }
  },
  computed: {
    allMacket () {
      let all = this.allRecent
      all.sort((a, b) => {
        switch (this.sortRule) {
          case 1:
            return a.recentPrice - b.recentPrice
          case 2:
            return b.recentPrice - a.recentPrice
          case 3:
            return a.recentPercent - b.recentPercent
          case 4:
            return b.recentPercent - a.recentPercent
          default:
            break
        }
      })
      return all
    },
    favoriteMacket () {
      let all = this.allRecent.filter(item => {
        return this.favorite.indexOf(item.assetId) > -1
      })
      all.sort((a, b) => {
        switch (this.sortRule) {
          case 1:
            return b.recentPrice - a.recentPrice
          case 2:
            return a.recentPrice - b.recentPrice
          case 3:
            return a.recentPercent - b.recentPercent
          case 4:
            return b.recentPercent - a.recentPercent
          default:
            break
        }
      })
      return all
    }
  },
  methods: {
    search () {
      console.log('搜索')
    },
    sort () {
      this.sheetVisible = true
    },
    changeRule (obj) {
      this.sortRule = obj.sortRule
    },
    getRecent () {
      let _this = this
      let allAsset = JSON.parse(JSON.stringify(this.allAsset))
      let urlAssetId = ''
      let urlOtherAssetId = ''
      allAsset.forEach(item => {
        urlAssetId += 'assetid=' + item.assetId + '&'
        urlOtherAssetId += 'otherassetid=' + item.assetId + '&'
      })
      let result1 = this.axios.get('assets/trades/recent?' + urlAssetId + 'otherassetid=0&limit=0&reverse=false')
      let result2 = this.axios.get('assets/trades/recent?assetid=0&' + urlOtherAssetId + 'limit=0&reverse=false')
      this.axios.all([result1, result2])
        .then(this.axios.spread(function (res1, res2) {
          let recent = res1.data.concat(res2.data)
          for (let i = 0; i < allAsset.length; i++) {
            let tempArr = []
            let recentPrice = 0
            let recentPercent = 0
            if (allAsset[i].assetId === 0) {
              continue
            }
            for (let j = 0; j < recent.length; j++) {
              if (recent[j].assetId === allAsset[i].assetId || recent[j].otherAssetId === allAsset[i].assetId) {
                tempArr.push(recent[j])
              }
            }
            // console.log(tempArr)
            tempArr.sort(function (a, b) {
              return b.timestamp - a.timestamp
            })
            if (tempArr.length === 1) {
              //  最近买卖交易只有一笔,只有最近成交价,没有增长百分比
              recentPrice = _this.computePrice(tempArr[0], allAsset[i].assetId)
            } else if (tempArr.length >= 2) {
              //  最近买卖交易超过两笔,取前两条计算百分比
              recentPrice = _this.computePrice(tempArr[0], allAsset[i].assetId)
              var recentPrice2 = _this.computePrice(tempArr[1], allAsset[i].assetId) //  前一笔交易成交价
              recentPercent = ((recentPrice - recentPrice2) / recentPrice2)
            }
            allAsset[i].recentPrice = recentPrice
            allAsset[i].recentPercent = recentPercent
            allAsset[i].data = JSON.parse(allAsset[i].data)
          }
          // console.log(allAsset)
          _this.allRecent = allAsset.filter(item => {
            return item.assetId > 0
          })
        }))
    },
    computePrice (dealInfo, assetId) {
      let price = 0
      if (dealInfo.assetId === assetId || dealInfo.otherAssetId === 0) {
        price = dealInfo.otherAmount / dealInfo.amount
      } else if (dealInfo.assetId === 0 || dealInfo.otherAssetId === assetId) {
        price = dealInfo.amount / dealInfo.otherAmount
      }
      return parseFloat(price).toFixed(8)
    }
  },
  mounted () {
    this.getRecent()
  }
}
</script>

<style lang="less" scoped>
.market {
  margin-bottom: 60px;
  .mint-header {
    .is-right {
      button {
        margin-left: 10px;
      }
    }
  }
  .list {
    .mint-navbar {
      border-bottom: 1px solid #dddddd;
    }
    .title {
      font-size: 13px;
      padding-left: 40px;
      height: 50px;
      span {
        height: 50px;
        line-height: 50px;
        float: left;
      }
      :nth-child(1) {
        width: 100px;
        text-align: center;
      }
      :nth-child(2) {
        width: 80px;
      }
      :nth-child(3) {
        float: right;
        margin-right: 10px;
        width: 60px;
      }
    }
    ul {
      list-style: none;
      // background-color: aqua;
      padding: 0px;
      margin: 0px;
      overflow: auto;
      li {
        // background-color: blanchedalmond;
        margin-bottom: 5px;
        height: 50px;
        line-height: 50px;
        font-size: 13px;
        border-bottom: 1px solid rgba(221, 221, 221, 0.4);
        img {
          width: 40px;
          height: 40px;
          margin-top: 5px;
          float: left;
        }
        span {
          height: 50px;
          line-height: 50px;
          float: left;
        }
        :nth-child(2) {
          width: 100px;
          text-align: center;
        }
        :nth-child(3) {
          width: 80px;
        }
        :nth-child(4) {
          float: right;
          margin-right: 10px;
          width: 60px;
          &.red {
            color: red;
          }
          &.green {
            color: green;
          }
        }
      }
    }
  }
}
</style>
