<template>
  <div>
    <van-nav-bar :left-text="pair" @click-left='getAssetInfo' fixed :placeholder=true>
      <template #right>
        <van-icon name="star-o" size="20" @click="collect" :color="isCollected?'#ffbe4e':''" style="margin-right:10px" />
        <van-icon name="notes-o" size="20" @click="show=true" style="margin-right:5px" />
      </template>
    </van-nav-bar>
    <div class="container">
      <div class="deal">
        <div class="deal-left">
          <div style="text-align:center">
            <van-button :plain="type==='sell'" hairline size="small" :type="type==='buy'?'primary':''" @click="type='buy'">{{$t('trade.buy')}}</van-button>
            <van-button :plain="type==='buy'" hairline size="small" :type="type==='sell'?'danger':''" @click="type='sell'">{{$t('trade.sell')}}</van-button>
          </div>
          <div class="group">
            <div class="group-item">
              <input type="number" :placeholder="$t('trade.price')" v-model="price">
              <span>MCF</span>
            </div>
            <div class="group-item">
              <input type="number" :placeholder="$t('trade.amount')" v-model="amount">
              <span>{{assetInfo.name}}</span>
            </div>
            <div class="group-item flex">
              <span class="label">{{$t('trade.available')}}</span>
              <span>{{type==='buy'?`${$mcf.cutZero(balanceMcf)}MCF`:`${parseFloat(balanceOther)}${assetInfo.name}`}}</span>
            </div>
            <div class="group-item flex">
              <span class="label">{{$t('trade.volume')}}</span>
              <span>{{total}}MCF</span>
            </div>
            <div class="group-item flex">
              <span class="label">{{$t('common.fee')}}</span>
              <span>0.00001MCF</span>
            </div>
            <van-button :disabled="!amount||!price||!defaultAccount.address" :type="type==='buy'?'primary':'danger'" block size="small" @click="sub">{{type==='buy'?$t('trade.buy'):$t('trade.sell')}} {{assetInfo.name}}</van-button>
          </div>
        </div>
        <div class="deal-right">
          <div class="list-title">
            <span>{{$t('trade.price')}}</span>
            <span>{{$t('trade.amount')}}</span>
          </div>
          <ul class="list-body sell">
            <li v-for="item,index in orderBookBuy" :key="index" @click="price = item.price">
              <span>{{item.price}}</span>
              <span>{{$mcf.numFormat(item.unfulfilled)}}</span>
            </li>
          </ul>
          <div class="market">
            <span class="price">{{recentPrice}}</span>
            <span class="change" :class="recentChange>=0?'change-market-green':'change-market-red'">{{recentChange>=0?'+':''}}{{recentChange}}%</span>
          </div>
          <ul class="list-body buy">
            <li v-for="item,index in orderBookSell" :key="index" @click="price = item.price">
              <span>{{item.price}}</span>
              <span>{{$mcf.numFormat(item.unfulfilled)}}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="record">
        <van-tabs v-model="activeName" type="line" line-height=0 title-active-color="#1989FA">
          <van-tab :title="$t('trade.order')" name="a">
            <van-tabs type="card" v-model="unfinishedActive" color="#1989FA" style="margin-top:10px">
              <van-tab :title="$t('trade.buy')" name='buy' class="unfinished-buy">
                <van-list v-model="unfinishedBuyLoading" :finished="unfinishedBuyFinished" :finished-text="$t('common.noData')" :loading-text="$t('common.loading')" @load="onLoadUnfinished('buy')">
                  <div class="list-item" v-for="item in unfinishedBuy" :key="item.orderId">
                    <div>
                      <span>{{$t('trade.amount')}}:{{$mcf.cutZero(item.fulfilled)}}/{{$mcf.cutZero(item.amount)}}</span>
                      <span>{{$t('trade.price')}}:{{item.price}}</span>
                    </div>
                    <div class="time">
                      {{$mcf.format(item.timestamp)}}
                    </div>
                    <van-button plain hairline type="primary" size="mini" color="#ffbe4e" class="btn" @click="cancel(item.orderId)">{{$t('trade.cancel')}}</van-button>
                  </div>
                </van-list>
              </van-tab>
              <van-tab :title="$t('trade.sell')" name='sell'>
                <van-list v-model="unfinishedSellLoading" :finished="unfinishedSellFinished" :finished-text="$t('common.noData')" :loading-text="$t('common.loading')" @load="onLoadUnfinished('sell')">
                  <div class="list-item" v-for="item in unfinishedSell" :key="item.orderId">
                    <div>
                      <span>{{$t('trade.amount')}}:{{$mcf.cutZero(item.fulfilled)}}/{{$mcf.cutZero(item.amount)}}</span>
                      <span>{{$t('trade.price')}}:{{item.price}}</span>
                    </div>
                    <div class="time">
                      {{$mcf.format(item.timestamp)}}
                    </div>
                    <van-button plain hairline type="primary" size="mini" color="#ffbe4e" class="btn" @click="cancel(item.orderId)">{{$t('trade.cancel')}}</van-button>
                  </div>
                </van-list>
              </van-tab>
            </van-tabs>
          </van-tab>
          <van-tab :title="$t('trade.history')" name="b">
            <van-tabs type="card" v-model="finishedActive" color="#1989FA" style="margin-top:10px">
              <van-tab :title="$t('trade.buy')" name='buy'>
                <van-list v-model="finishedBuyLoading" :finished="finishedBuyFinished" :finished-text="$t('common.noData')" :loading-text="$t('common.loading')" @load="onLoadFinished('buy')">
                  <div class="list-item" v-for="item in finishedBuy" :key="item.orderId">
                    <div>
                      <span>{{$t('trade.amount')}}:{{$mcf.cutZero(item.fulfilled)}}/{{$mcf.cutZero(item.amount)}}</span>
                      <span>{{$t('trade.price')}}:{{item.price}}</span>
                    </div>
                    <div class="time">
                      {{$mcf.format(item.timestamp)}}
                    </div>
                  </div>
                </van-list>
              </van-tab>
              <van-tab :title="$t('trade.sell')" name='sell'>
                <van-list v-model="finishedSellLoading" :finished="finishedSellFinished" :finished-text="$t('common.noData')" :loading-text="$t('common.loading')" @load="onLoadFinished('sell')">
                  <div class="list-item" v-for="item in finishedSell" :key="item.orderId">
                    <div>
                      <span>{{$t('trade.amount')}}:{{$mcf.cutZero(item.fulfilled)}}/{{$mcf.cutZero(item.amount)}}</span>
                      <span>{{$t('trade.price')}}:{{item.price}}</span>
                    </div>
                    <div class="time">
                      {{$mcf.format(item.timestamp)}}
                    </div>
                  </div>
                </van-list>
              </van-tab>
            </van-tabs>
          </van-tab>
        </van-tabs>
      </div>
    </div>
    <van-popup v-model="show" closeable position="right" :style="{ width: '100%',height:'100%' }">
      <div class="asset-info">
        <van-cell-group>
          <van-cell :title="$t('trade.assetCode')" :value="assetInfo.name" />
          <van-cell :title="$t('trade.assetFullName')" v-if="assetInfo.data" :value="decodeURIComponent(JSON.parse(assetInfo.data).full)" />
          <van-cell :title="$t('trade.assetChineseName')" :value="decodeURIComponent(assetInfo.description)" />
          <van-cell :title="$t('trade.tatalIssuance')" :value="assetInfo.quantity" />
          <van-cell :title="$t('trade.productUrl')" v-if="assetInfo.data" value-class="left">
            <template #default>
              <code @click="doCopy(JSON.parse(assetInfo.data).url)">{{JSON.parse(assetInfo.data).url}}</code>
            </template>
          </van-cell>
          <van-cell :title="$t('trade.websiteUrl')" v-if="assetInfo.data" value-class="left">
            <template #default>
              <code @click="doCopy(JSON.parse(assetInfo.data).web)">{{JSON.parse(assetInfo.data).web}}</code>
            </template>
          </van-cell>
          <van-cell :title="$t('trade.introduction')" v-if="assetInfo.data" value-class="left" :value="decodeURIComponent(JSON.parse(assetInfo.data).content)" />
        </van-cell-group>
      </div>
    </van-popup>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: false,
      type: 'buy',
      assetId: localStorage.getItem('currentDealAssetId') || '1',
      defaultAccount: this.$mcf.getStorage('defaultAccount'),
      collectedAssetId: this.$mcf.getStorage('collectedAssetId'),
      assetInfo: {},
      price: null,
      amount: null,
      balances: [],
      orderBookBuy: [],
      orderBookSell: [],
      recentPrice: '--',
      recentChange: 0.00,
      activeName: 'a',
      unfinishedActive: 'buy',
      unfinishedBuy: [],
      unfinishedBuyLoading: false,
      unfinishedBuyFinished: false,
      unfinishedSell: [],
      unfinishedSellLoading: false,
      unfinishedSellFinished: false,
      unfinishedPage: {
        buy: 1,
        sell: 1
      },
      finishedActive: 'buy',
      finishedBuy: [],
      finishedBuyLoading: false,
      finishedBuyFinished: false,
      finishedSell: [],
      finishedSellLoading: false,
      finishedSellFinished: false,
      finishedPage: {
        buy: 1,
        sell: 1
      },
    }
  },
  methods: {
    async onLoadUnfinished(type) {
      if (!this.defaultAccount.address)
        return false
      try {
        let record = (await this.$api.getUnfinishedByAddress({
          limit: 10,
          address: this.defaultAccount.address,
          assetId: this.assetId,
          type,
          page: this.unfinishedPage[type]
        })).data
        if (type === 'buy') {
          this.unfinishedBuy = this.unfinishedBuy.concat(record)
        } else {
          this.unfinishedSell = this.unfinishedSell.concat(record)
        }
        this.unfinishedPage[type] += 1
        let next = (await this.$api.getUnfinishedByAddress({
          limit: 10,
          address: this.defaultAccount.address,
          assetId: this.assetId,
          type,
          page: this.unfinishedPage[type]
        })).data
        if (next.length === 0) {
          if (type === 'buy') {
            this.unfinishedBuyFinished = true
          } else {
            this.unfinishedSellFinished = true
          }
        }
      } catch (error) {
        console.log(error)
        if (type === 'buy') {
          this.unfinishedBuyFinished = true
        } else {
          this.unfinishedSellFinished = true
        }
      } finally {
        if (type === 'buy') {
          this.unfinishedBuyLoading = false
        } else {
          this.unfinishedSellLoading = false
        }
      }
    },
    async onLoadFinished(type) {
      if (!this.defaultAccount.address)
        return false
      try {
        let record = (await this.$api.getFinishedByAddress({
          limit: 10,
          address: this.defaultAccount.address,
          assetId: this.assetId,
          type,
          page: this.finishedPage[type]
        })).data
        console.log(record)
        if (type === 'buy') {
          this.finishedBuy = this.finishedBuy.concat(record)
        } else {
          this.finishedSell = this.finishedSell.concat(record)
        }
        this.finishedPage[type] += 1
        let next = (await this.$api.getFinishedByAddress({
          limit: 10,
          address: this.defaultAccount.address,
          assetId: this.assetId,
          type,
          page: this.finishedPage[type]
        })).data
        if (next.length === 0) {
          if (type === 'buy') {
            this.finishedBuyFinished = true
          } else {
            this.finishedSellFinished = true
          }
        }
      } catch (error) {
        console.log(error)
        if (type === 'buy') {
          this.finishedBuyFinished = true
        } else {
          this.finishedSellFinished = true
        }
      } finally {
        if (type === 'buy') {
          this.finishedBuyLoading = false
        } else {
          this.finishedSellLoading = false
        }
      }
    },
    sub() {
      console.log(this.type, this.amount, this.price)
      let haveAssetId, wantAssetId
      if (this.type === 'buy') {
        haveAssetId = 0
        wantAssetId = this.assetId
      } else {
        haveAssetId = this.assetId
        wantAssetId = 0
      }
      let config = {
        creator: this.defaultAccount.address,
        price: this.price,
        amount: this.amount,
        haveAssetId,
        wantAssetId
      }
      this.$mcf.transactions('CREATE_ASSET_ORDER', { ...config, ...this.defaultAccount }).then(res => {
        if (res === true) {
          this.$notify({ type: 'success', message: this.$t('trade.orderSubmitted') })
        }
      }).catch(error => {
        console.log(error)
        if (error.err_message) {
          this.$notify({ type: 'danger', message: error.err_message })
        }
      })
    },
    cancel(orderId) {
      let config = {
        creator: this.defaultAccount.address,
        orderId,
      }
      this.$mcf.transactions('CANCEL_ASSET_ORDER', { ...config, ...this.defaultAccount }).then(res => {
        if (res === true) {
          this.$notify({ type: 'success', message: this.$t('trade.orderCancelled') })
        }
      }).catch(error => {
        console.log(error)
        if (error.err_message) {
          this.$notify({ type: 'danger', message: error.err_message })
        }
      })
    },
    async getAssetInfo() {
      try {
        this.assetInfo = (await this.$api.getAssetsById(this.assetId)).data
        this.orderBookBuy = (await this.$api.getAssetsOrderbookBuy(this.assetId)).data.reverse()
        this.orderBookSell = (await this.$api.getAssetsOrderbookSell(this.assetId)).data
        if (this.defaultAccount.address) {
          this.balances = (await this.$api.getAllBalancesByAddress(this.defaultAccount.address)).data
        } else {
          this.$dialog.alert({
            message: this.$t('trade.noWalletError'),
          })
        }
      } catch (error) {
        console.log(error)
      }
    },
    async getRecent() {
      try {
        let buy = (await this.$api.getTradesRecentBuy(this.assetId)).data
        let sell = (await this.$api.getTradesRecentSell(this.assetId)).data
        let recent = buy.concat(sell)
        if (recent.length === 1) {
          this.recentPrice = this.computePrice(recent[0], this.assetId)
        } else if (recent.length >= 2) {
          recent.sort(function (a, b) {
            return b.timestamp - a.timestamp
          })
          let recentPrice = this.computePrice(recent[0], this.assetId)
          let recentPrice2 = this.computePrice(recent[1], this.assetId)
          this.recentPrice = recentPrice
          this.recentChange = (((recentPrice - recentPrice2) / recentPrice2 * 100).toFixed(2))
        }
      } catch (error) {
        console.log(error)
      }
    },
    collect() {
      let index = this.collectedAssetId.indexOf(this.assetId)
      if (index > -1) {
        this.collectedAssetId.splice(index, 1)
      } else {
        this.collectedAssetId.push(this.assetId)
      }
      localStorage.setItem('collectedAssetId', JSON.stringify(this.collectedAssetId))
    },
    computePrice(dealInfo, assetId) {
      let price = 0
      if (dealInfo.assetId === assetId || dealInfo.otherAssetId === 0) {
        price = dealInfo.otherAmount / dealInfo.amount
      } else if (dealInfo.assetId === 0 || dealInfo.otherAssetId === assetId) {
        price = dealInfo.amount / dealInfo.otherAmount
      }
      return parseFloat(price).toFixed(8)
    },
    doCopy(text) {
      var _this = this
      this.$copyText(text).then(function (e) {
        console.log('复制成功！')
        _this.$toast(text)
      }, function (e) {
        console.log('复制失败！')
        _this.$toast('copy failed')
      })
    }
  },
  computed: {
    pair() {
      return this.assetInfo.name ? `${this.assetInfo.name}/MCF` : ''
    },
    isCollected() {
      return this.collectedAssetId.indexOf(this.assetId) > -1
    },
    total() {
      if (this.amount > 0 && this.price > 0) {
        return parseFloat(this.amount * this.price).toFixed(8)
      } else {
        return 0
      }
    },
    balanceMcf() {
      let balance = this.balances.filter(item => item.assetId === 0)
      return balance.length > 0 ? balance[0].balance : 0
    },
    balanceOther() {
      let balance = this.balances.filter(item => item.assetId == this.assetId)
      return balance.length > 0 ? balance[0].balance : 0
    }
  },
  mounted() {
    this.getAssetInfo()
    this.getRecent()
  },
}
</script>

<style lang="less" scoped>
::v-deep .van-nav-bar__text {
  color: black;
  font-weight: bold;
  font-size: 16px;
}

.container {
  padding-bottom: 50px;
  .deal {
    display: flex;
    background-color: white;
    .deal-left {
      flex-basis: 55%;
      box-sizing: border-box;
      padding: 10px 0;
      .van-button--small {
        padding: 0 10%;
      }
      .group {
        padding: 10px 5%;
        font-size: 12px;
        .group-item {
          margin: 20px 0;
          position: relative;
          &.flex {
            display: flex;
            span {
              &.label {
                flex-basis: 40px;
              }
              &:last-of-type {
                flex: 1;
                text-align: right;
              }
            }
          }
          input {
            box-sizing: border-box;
            box-shadow: 0 0 5px rgba(65, 63, 63, 0.3);
            padding: 5px 40px 5px 10px;
            border-radius: 5px;
            width: 100%;
            font-size: 14px;
            & + span {
              position: absolute;
              right: 5px;
              top: 50%;
              transform: translate(0, -50%);
            }
          }
        }
      }
    }
    .deal-right {
      flex: 1;
      font-size: 12px;
      padding-right: 3%;
      .list-title,
      .list-body li {
        margin: 5px 0;
        span {
          display: inline-block;
          &:first-of-type {
            width: 70%;
          }
          &:last-of-type {
            width: 30%;
            text-align: right;
          }
        }
      }
      .sell {
        span {
          &:first-of-type {
            color: red;
          }
        }
      }
      .buy {
        span {
          &:first-of-type {
            color: green;
          }
        }
      }
      .market {
        font-size: 15px;
        margin: 10px 0;
        box-sizing: border-box;
        span {
          display: inline-block;
        }
        .price {
          width: 65%;
          color: green;
        }
        .change {
          width: 30%;
          &.change-market-green {
            color: green;
          }
          &.change-market-red {
            color: red;
          }
        }
      }
    }
  }
  .record {
    margin-top: 10px;
    ::v-deep .van-tabs__nav--card {
      margin: 0 30%;
    }
    .list-item {
      margin-top: 10px;
      background-color: white;
      border-bottom: 1px solid rgba(102, 102, 102, 0.11);
      padding: 5px 5%;
      display: flex;
      position: relative;
      & > div {
        font-size: 14px;
        &:first-of-type {
          flex-basis: 60%;
          span {
            display: block;
            padding: 10px 0;
          }
        }
      }
      .time {
        flex: 1;
        text-align: right;
        padding-top: 10px;
        font-size: 12px;
      }
      .btn {
        position: absolute;
        right: 5%;
        bottom: 15px;
        padding: 0 20px;
      }
    }
  }
}
.asset-info {
  height: 92vh;
  margin-top: 8vh;
  overflow: scroll;
  .van-cell__title {
    flex: 0;
    flex-basis: 25%;
  }
  .left {
    text-align: left;
  }
  code {
    color: #5b85ff;
    border-bottom: 1px solid #5b85ff;
  }
}
</style>