<template>
  <div class="container">
    <van-tabs v-model="activeName" type="card" color="#26A2FF">
      <van-tab :title="$t('market.favorite')" name="自选">
        <div class="list-header">
          <div class="list-header-name">{{$t('market.asset')}}</div>
          <div class="list-header-price" @click="sort('mcf','price')">
            <span>{{$t('market.price')}}</span>
            <van-icon v-if="this.sortMark===1" name="arrow-up" />
            <van-icon v-else name="arrow-down" />
          </div>
          <div class="list-header-change" @click="sort('mcf','change')">
            <span>{{$t('market.change')}}</span>
            <van-icon v-if="this.sortMark===3" name="arrow-up" />
            <van-icon v-else name="arrow-down" />
          </div>
        </div>
        <ul class="list-body" :style="'height:'+(windowHeight-162)+'px'">
          <van-empty v-show="list2.length===0" :description="$t('common.noData')" />
          <li v-for="item in list2" :key="item.assetId" @click="toDeal(item.assetId)">
            <img :src="logo(item.data)">
            <span class="list-body-name">{{ item.name }}</span>
            <span class="list-body-price">{{ item.lastPrice }}</span>
            <span class="list-body-change" :class="item.change>=0?'up':'down'">{{ item.change }}</span>
          </li>
        </ul>
      </van-tab>
      <van-tab title="MCF" name="MCF">
        <div class="list-header">
          <div class="list-header-name">{{$t('market.asset')}}</div>
          <div class="list-header-price" @click="sort('mcf','price')">
            <span>{{$t('market.price')}}</span>
            <van-icon v-if="this.sortMark===1" name="arrow-up" />
            <van-icon v-else name="arrow-down" />
          </div>
          <div class="list-header-change" @click="sort('mcf','change')">
            <span>{{$t('market.change')}}</span>
            <van-icon v-if="this.sortMark===3" name="arrow-up" />
            <van-icon v-else name="arrow-down" />
          </div>
        </div>
        <ul class="list-body" :style="'height:'+(windowHeight-162)+'px'">
          <van-empty v-show="list.length===0" :description="$t('common.noData')" />
          <li v-for="item in list" :key="item.assetId" @click="toDeal(item.assetId)">
            <img :src="logo(item.data)">
            <span class="list-body-name">{{ item.name }}</span>
            <span class="list-body-price">{{ item.lastPrice }}</span>
            <span class="list-body-change" :class="item.change>=0?'up':'down'">{{ item.change }}</span>
          </li>
        </ul>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
export default {
  data() {
    return {
      windowHeight: window.innerHeight,
      activeName: '自选',
      favoriteKnownAssets: [],
      tradesRecent: [],
      sortMark: 1,
      allAssets: this.allKnownAssets
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
    toDeal(assetId) {
      localStorage.setItem('currentDealAssetId', assetId)
      this.$router.push({ path: 'trade' })
    },
    sort(type, by) {
      if (type === 'mcf') {
        if (by === 'price') {
          this.sortMark = this.sortMark === 1 ? 2 : 1
        } else {
          this.sortMark = this.sortMark === 3 ? 4 : 3
        }
      }
    },
    async getMarketList() {
      try {
        //获取所有资产
        let allAssets = this.allKnownAssets.filter(item => {
          return item.assetId > 0
        })

        //获取所有交易对最近交易记录
        let assetsTradesRecentSell = (await this.$api.getAssetsTradesRecentSell({ data: allAssets })).data
        let assetsTradesRecentBuy = (await this.$api.getAssetsTradesRecentBuy({ data: allAssets })).data
        let tradesRecent = assetsTradesRecentSell.concat(assetsTradesRecentBuy)

        allAssets.forEach((item, index) => {
          //单个交易对最近交易记录
          let assetId = item.assetId
          let trades = tradesRecent.filter(item => {
            return item.assetId === assetId || item.otherAssetId === assetId
          })
          //按时间排序
          trades.sort((a, b) => {
            return b.timestamp - a.timestamp
          })
          if (trades.length > 0) {
            //计算价格
            item.lastPrice = assetId === trades[0].assetId ?
              parseFloat(trades[0].otherAmount / trades[0].amount).toFixed(8) :
              parseFloat(trades[0].amount / trades[0].otherAmount).toFixed(8)
            if (trades.length > 1) {
              //计算涨幅
              let price2 = assetId === trades[1].assetId ?
                parseFloat(trades[1].otherAmount / trades[1].amount).toFixed(8) :
                parseFloat(trades[1].amount / trades[1].otherAmount).toFixed(8)
              item.change = ((item.lastPrice - price2) / price2 * 100).toFixed(2)
            } else {
              item.change = parseFloat(0).toFixed(2)
            }
          } else {
            item.lastPrice = parseFloat(0).toFixed(8)
            item.change = parseFloat(0).toFixed(2)
          }
          this.$set(this.allAssets, index + 1, item)
        })
      } catch (error) {
        console.log(error)
      }
    },
    logo(data) {
      return JSON.parse(data).logo
    },
  },
  computed: {
    list() {
      let _allKnownAssets = this.allAssets.filter(item => {
        return item.assetId > 0
      })
      _allKnownAssets.sort((a, b) => {
        switch (this.sortMark) {
          case 1:
            return b.lastPrice - a.lastPrice
          case 2:
            return a.lastPrice - b.lastPrice
          case 3:
            return b.change - a.change
          case 4:
            return a.change - b.change
          default:
            break
        }
      })
      return _allKnownAssets
    },
    list2() {
      let collectedAssetId = this.$mcf.getStorage('collectedAssetId')
      let _allKnownAssets = this.allAssets.filter(item => {
        return collectedAssetId.indexOf((item.assetId).toString()) > -1
      })
      _allKnownAssets.sort((a, b) => {
        switch (this.sortMark) {
          case 1:
            return b.lastPrice - a.lastPrice
          case 2:
            return a.lastPrice - b.lastPrice
          case 3:
            return b.change - a.change
          case 4:
            return a.change - b.change
          default:
            break
        }
      })
      return _allKnownAssets
    }
  },
  mounted() {
    setTimeout(() => {
      this.getMarketList()
    }, 1000)
  },
}
</script>

<style lang="less" scoped>
.container {
  background-color: white;
}
.list-header,
.list-body {
  padding: 0 5%;
  text-align: left;
}
.list-header {
  font-size: 12px;
  margin: 10px 0;
  div {
    display: inline-block;
    width: 30%;
    &.list-header-name {
      width: 40%;
    }
    &.list-header-change {
      text-align: right;
    }
    span {
      vertical-align: middle;
    }
    i {
      vertical-align: middle;
    }
  }
}
.list-body {
  font-size: 13px;
  overflow: scroll;
  li {
    // background-color: aquamarine;
    padding: 15px 0;
    border-bottom: 1px solid hsla(0, 0%, 86.7%, 0.4);
    img {
      display: inline-block;
      vertical-align: middle;
      width: 5%;
    }
    span {
      display: inline-block;
      vertical-align: middle;
      width: 30%;
      &.list-body-name {
        padding-left: 2%;
        width: 33%;
      }
      &.list-body-change {
        text-align: right;
        &::after {
          content: "%";
        }
        &.up {
          color: green;
          &::before {
            content: "+";
          }
        }
        &.down {
          color: red;
        }
      }
    }
  }
}
</style>