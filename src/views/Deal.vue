<template>
  <div class="deal">
    <mt-header fixed :title="$t('title.trade')">
      <mt-button class="header-btn" slot="left" @click="$router.push({ path: '/market', query: { tab: '2'}})">{{assetInfo.name}}/MCF</mt-button>
      <mt-button slot="right" @click="doFavorite"><i class="iconfont icon-shoucang" :class="isFavorited?'shoucang-orange':''"></i></mt-button>
      <mt-button slot="right" @click="detail"><i class="iconfont icon-menu-open-copy"></i></mt-button>
    </mt-header>
    <div class="mpage">
      <mt-navbar v-model="navbar1">
        <mt-tab-item id="1">{{$t('page.trade.buy')}}</mt-tab-item>
        <mt-tab-item id="2">{{$t('page.trade.sell')}}</mt-tab-item>
        <mt-tab-item id="3">{{$t('page.trade.unfulfilled')}}</mt-tab-item>
        <mt-tab-item id="4">{{$t('page.trade.fulfilled')}}</mt-tab-item>
      </mt-navbar>

      <!-- tab-container -->
      <mt-tab-container v-model="navbar1">
        <!-- 一级-买入 -->
        <mt-tab-container-item id="1">
          <div class="tab">
            <div class="deal-panel">
              <div class="input-box">
                <input type="text" :placeholder="$t('page.trade.price')" v-model="buyPrice" @keyup="onInput('buy','decimal')">
                <span>MCF</span>
              </div>
              <div class="input-box">
                <input type="text" :placeholder="$t('page.trade.amount')" v-model="buyAmount" @keyup="onInput('buy','integer')">
                <span>{{assetInfo.name}}</span>
              </div>
              <p>{{$t('page.trade.buyable')}}<span>{{canBuy}} {{assetInfo.name}}</span></p>
              <p>{{$t('page.trade.volume')}}<span>{{buyTradeValue}} MCF</span></p>
              <p>{{$t('page.trade.fee')}}<span>0.00001 MCF</span></p>
              <button class="btn-blue" @click="deal('buy')">{{$t('page.trade.buy')}}</button>
              <p>{{$t('page.trade.available')}}<span>{{parseInt(mcfBalance*100)/100}} MCF</span></p>
              <p>{{$t('page.trade.available')}}<span>{{parseInt(otherBalance*100)/100}} {{assetInfo.name}}</span></p>
            </div>
            <div class="deal-list">
              <div class="list-title"><span>{{$t('page.trade.price')}}</span><span>{{$t('page.trade.amount')}}</span></div>
              <ul class="list-red">
                <li v-for="(item,index) in sellList" :key="index"><span>{{10-index}}</span><span>{{item.price}}</span><span>{{parseInt(item.unfulfilled)}}</span></li>
              </ul>
              <div class="list-market"><span>{{recentPrice}}</span><span :class="recentPercent>=0?'list-market-green':'list-market-red'">{{recentPercent>=0?'+':''}}{{recentPercent}}%</span></div>
              <div class="list-title"><span>{{$t('page.trade.price')}}</span><span>{{$t('page.trade.amount')}}</span></div>
              <ul class="list-green">
                <li v-for="(item,index) in buyList" :key="index"><span>{{index+1}}</span><span>{{item.price}}</span><span>{{parseInt(item.unfulfilled)}}</span></li>
              </ul>
            </div>
          </div>
        </mt-tab-container-item>
        <!-- 一级-卖出 -->
        <mt-tab-container-item id="2">
          <div class="tab">
            <div class="deal-panel">
              <div class="input-box">
                <input type="text" :placeholder="$t('page.trade.price')" v-model="sellPrice" @keyup="onInput('sell','decimal')">
                <span>MCF</span>
              </div>
              <div class="input-box">
                <input type="text" :placeholder="$t('page.trade.amount')" v-model="sellAmount" @keyup="onInput('sell','integer')">
                <span>{{assetInfo.name}}</span>
              </div>
              <p>{{$t('page.trade.sellable')}}<span>{{parseInt(otherBalance*100)/100}} {{assetInfo.name}}</span></p>
              <p>{{$t('page.trade.volume')}}<span>{{sellTradeValue}} MCF</span></p>
              <p>{{$t('page.trade.fee')}}<span>0.00001 MCF</span></p>
              <button class="btn-orange" @click="deal('sell')">{{$t('page.trade.sell')}}</button>
              <p>{{$t('page.trade.available')}}<span>{{parseInt(mcfBalance*100)/100}} MCF</span></p>
              <p>{{$t('page.trade.available')}}<span>{{parseInt(otherBalance*100)/100}} {{assetInfo.name}}</span></p>
            </div>
            <div class="deal-list">
              <div class="list-title"><span>{{$t('page.trade.price')}}</span><span>{{$t('page.trade.amount')}}</span></div>
              <ul class="list-red">
                <li v-for="(item,index) in sellList" :key="index"><span>{{10-index}}</span><span>{{item.price}}</span><span>{{parseInt(item.unfulfilled)}}</span></li>
              </ul>
              <div class="list-market"><span>{{recentPrice}}</span><span :class="recentPercent>=0?'list-market-green':'list-market-red'">{{recentPercent>=0?'+':''}}{{recentPercent}}%</span></div>
              <div class="list-title"><span>{{$t('page.trade.price')}}</span><span>{{$t('page.trade.amount')}}</span></div>
              <ul class="list-green">
                <li v-for="(item,index) in buyList" :key="index"><span>{{index+1}}</span><span>{{item.price}}</span><span>{{parseInt(item.unfulfilled)}}</span></li>
              </ul>
            </div>
          </div>
        </mt-tab-container-item>
        <mt-tab-container-item id="3">
          <mt-navbar v-model="navbar2">
            <mt-tab-item id="1">{{$t('page.trade.buy')}}</mt-tab-item>
            <mt-tab-item id="2">{{$t('page.trade.sell')}}</mt-tab-item>
          </mt-navbar>
          <mt-tab-container v-model="navbar2">
            <mt-tab-container-item id="1">
              <!-- 未完成买入 -->
              <div class="tab">
                <mt-loadmore :top-method="loadTopBuy" :auto-fill="false" ref="loadmoreBuy">
                  <ul class="record-list" v-infinite-scroll="loadMoreBuy" infinite-scroll-disabled="allLoadedBuy" infinite-scroll-distance="1" infinite-scroll-immediate-check="false">
                    <li v-for="(item,index) in unfinishedBuy" :key="index">
                      <p class="list-head">{{item.amountAssetName}}/MCF<span>{{item.timestamp}}</span></p>
                      <div class="con">
                        <div class="percent-circle percent-circle-left">
                          <div class="left-content" :style="{transform: 'rotate('+pLeft (item.percent)+'deg)'}"></div>
                        </div>
                        <div class="percent-circle percent-circle-right">
                          <div class="right-content" :style="{transform: 'rotate('+pRight (item.percent)+'deg)'}"></div>
                        </div>
                        <div class=" text-circle">{{item.percent}}%</div>
                      </div>
                      <div class="list-price">
                        <p>{{$t('page.trade.amount')}}：{{parseFloat(item.fulfilled).toFixed(4)}}/{{parseFloat(item.amount).toFixed(4)}}</p>
                        <p>{{$t('page.trade.price')}}：{{item.price}}</p>
                      </div>
                      <button @click="del(item.orderId)">{{$t('page.trade.cancel')}}</button>
                    </li>
                  </ul>
                  <div class="loading-box tc" v-if="isLoadingBuy">
                    <mt-spinner :size="20" type="snake" class="loading-more"></mt-spinner>
                    <span class="loading-more-txt">{{$t('page.trade.loading')}}...</span>
                  </div>
                  <div class="no-more" v-show="allLoadedBuy">{{$t('page.trade.noMore')}}~</div>
                </mt-loadmore>
              </div>
            </mt-tab-container-item>
            <mt-tab-container-item id="2">
              <!-- 未完成卖出 -->
              <div class="tab">
                <mt-loadmore :top-method="loadTopSell" :auto-fill="false" ref="loadmoreSell">
                  <ul class="record-list" v-infinite-scroll="loadMoreSell" infinite-scroll-disabled="allLoadedSell" infinite-scroll-distance="1" infinite-scroll-immediate-check="false">
                    <li v-for="(item,index) in unfinishedSell" :key="index">
                      <p class="list-head">{{item.amountAssetName}}/MCF<span>{{item.timestamp}}</span></p>
                      <div class="con">
                        <div class="percent-circle percent-circle-left">
                          <div class="left-content" :style="{transform: 'rotate('+pLeft (item.percent)+'deg)'}"></div>
                        </div>
                        <div class="percent-circle percent-circle-right">
                          <div class="right-content" :style="{transform: 'rotate('+pRight (item.percent)+'deg)'}"></div>
                        </div>
                        <div class=" text-circle">{{item.percent}}%</div>
                      </div>
                      <div class="list-price">
                        <p>{{$t('page.trade.amount')}}：{{parseFloat(item.fulfilled).toFixed(4)}}/{{parseFloat(item.amount).toFixed(4)}}</p>
                        <p>{{$t('page.trade.price')}}：{{item.price}}</p>
                      </div>
                      <button @click="del(item.orderId)">{{$t('page.trade.cancel')}}</button>
                    </li>
                  </ul>
                  <div class="loading-box tc" v-if="isLoadingBuy">
                    <mt-spinner :size="20" type="snake" class="loading-more"></mt-spinner>
                    <span class="loading-more-txt">{{$t('page.trade.loading')}}...</span>
                  </div>
                  <div class="no-more" v-show="allLoadedSell">{{$t('page.trade.noMore')}}~</div>
                </mt-loadmore>
              </div>
            </mt-tab-container-item>
          </mt-tab-container>
        </mt-tab-container-item>
        <mt-tab-container-item id="4">
          <mt-navbar v-model="navbar3">
            <mt-tab-item id="1">{{$t('page.trade.buy')}}</mt-tab-item>
            <mt-tab-item id="2">{{$t('page.trade.sell')}}</mt-tab-item>
          </mt-navbar>
          <mt-tab-container v-model="navbar3" class="tab4">
            <mt-tab-container-item id="1">
              <!-- 已完成买入 -->
              <div class="tab">
                <ul class="record-list">
                  <li v-for="(item,index) in finishedBuy" :key="index">
                    <p class="list-head">{{item.amountAssetName}}/MCF<span>{{item.timestamp}}</span></p>
                    <div class="con">
                      <div class="percent-circle percent-circle-left">
                        <div class="left-content" :style="{transform: 'rotate('+pLeft (item.percent)+'deg)'}"></div>
                      </div>
                      <div class="percent-circle percent-circle-right">
                        <div class="right-content" :style="{transform: 'rotate('+pRight (item.percent)+'deg)'}"></div>
                      </div>
                      <div class=" text-circle">{{item.percent}}%</div>
                    </div>
                    <div class="list-price">
                      <p>{{$t('page.trade.amount')}}：{{parseFloat(item.fulfilled).toFixed(4)}}/{{parseFloat(item.amount).toFixed(4)}}</p>
                      <p>{{$t('page.trade.price')}}：{{item.price}}</p>
                    </div>
                  </li>
                </ul>
              </div>
            </mt-tab-container-item>
            <mt-tab-container-item id="2">
              <!-- 已完成卖出 -->
              <div class="tab">
                <ul class="record-list">
                  <li v-for="(item,index) in finishedSell" :key="index">
                    <p class="list-head">{{item.amountAssetName}}/MCF<span>{{item.timestamp}}</span></p>
                    <div class="con">
                      <div class="percent-circle percent-circle-left">
                        <div class="left-content" :style="{transform: 'rotate('+pLeft (item.percent)+'deg)'}"></div>
                      </div>
                      <div class="percent-circle percent-circle-right">
                        <div class="right-content" :style="{transform: 'rotate('+pRight (item.percent)+'deg)'}"></div>
                      </div>
                      <div class=" text-circle">{{item.percent}}%</div>
                    </div>
                    <div class="list-price">
                      <p>{{$t('page.trade.amount')}}：{{parseFloat(item.fulfilled).toFixed(4)}}/{{parseFloat(item.amount).toFixed(4)}}</p>
                      <p>{{$t('page.trade.price')}}：{{item.price}}</p>
                    </div>
                  </li>
                </ul>
              </div>
            </mt-tab-container-item>
            <div class="tips" style="position: fixed;">
              {{$t('page.trade.text1')}}<span class="line" @click="doCopy('http://www.mcfamily.io')">http://www.mcfamily.io</span>
            </div>
          </mt-tab-container>
        </mt-tab-container-item>
      </mt-tab-container>
    </div>
    <mt-popup v-model="popupVisible" position="right" class="mint-popup-3" :modal="false">
      <mt-header fixed :title="assetInfo.name+'/MCF'">
        <mt-button icon="back" @click.native="popupVisible = false" slot="left"></mt-button>
      </mt-header>
      <div class="detail">
        <p class="head"><span>{{$t('page.market.price')}}：</span><span>{{recentPrice}}</span><span>{{$t('page.market.change')}}：</span><span :class="recentPercent>=0?'list-market-green':'list-market-red'">{{recentPercent}}%</span></p>
        <div class="info">
          <h2>{{$t('page.trade.assetInfo')}}</h2>
          <p><span>{{$t('page.trade.assetCode')}}：</span><span>{{assetInfo.name}}</span></p>
          <p><span>{{$t('page.trade.assetFullName')}}：</span><span>{{decodeURIComponent(assetInfo.data.full)}}</span></p>
          <p><span>{{$t('page.trade.assetChineseName')}}：</span><span>{{decodeURIComponent(assetInfo.description)}}</span></p>
          <p><span>{{$t('page.trade.tatalIssuance')}}：</span><span>{{assetInfo.quantity}}</span></p>
          <p>{{$t('page.trade.productUrl')}}</p>
          <p class="line" @click="doCopy(assetInfo.data.url)">{{assetInfo.data.url}}</p>
          <p>{{$t('page.trade.websiteUrl')}}</p>
          <p class="line" @click="doCopy(assetInfo.data.web)">{{assetInfo.data.web}}</p>
          <h2>{{$t('page.trade.introduction')}}</h2>
          <p>{{decodeURIComponent(assetInfo.data.content)}}</p>
        </div>
      </div>
    </mt-popup>
  </div>
</template>

<script>
import { createDeal, delOrder, decryptPwd, format } from '@/assets/js/utils.js'
export default {
  data () {
    return {
      navbar1: '1',
      navbar2: '1',
      navbar3: '1',
      AccountList: JSON.parse(localStorage.getItem('AccountList')) || [],
      assetId: this.$route.query.assetid || 1,
      mcfBalance: 0,
      otherBalance: 0,
      buyPrice: '',
      buyAmount: '',
      sellPrice: '',
      sellAmount: '',
      buyList: '',
      sellList: '',
      recentPrice: '--',
      recentPercent: 0.00,
      pageBuy: 1,
      pageSell: 1,
      unfinishedBuy: [],
      unfinishedSell: [],
      finishedBuy: [],
      finishedSell: [],
      isLoadingBuy: false,
      isLoadingSell: false,
      allLoadedBuy: false,
      allLoadedSell: false,
      getRecordType: 'buy',
      favorite: JSON.parse(localStorage.getItem('favorite')) || [],
      popupVisible: false
    }
  },
  computed: {
    defaultAccount () {
      var AccountList = this.AccountList
      var aInfo
      for (let i = 0, len = AccountList.length; i < len; i++) {
        if (AccountList[i].isDefault === true) {
          aInfo = AccountList[i]
          break
        }
      }
      return aInfo
    },
    assetInfo () {
      let allAsset = JSON.parse(localStorage.getItem('allAsset')) || []
      let info = allAsset.filter(item => {
        return item.assetId === parseInt(this.assetId)
      })
      info[0].data = JSON.parse(info[0].data)
      return info[0]
    },
    canBuy () {
      return this.buyPrice > 0 ? parseInt(this.mcfBalance / this.buyPrice * 100) / 100 : 0
    },
    buyTradeValue () {
      return this.buyAmount > 0 ? parseInt(this.buyAmount * this.buyPrice * 100) / 100 : 0
    },
    sellTradeValue () {
      return this.sellAmount > 0 ? parseInt(this.sellAmount * this.sellPrice * 100) / 100 : 0
    },
    isFavorited () {
      return this.favorite.indexOf(this.assetId) > -1
    }
  },
  methods: {
    getBalance () {
      if (!this.defaultAccount) {
        console.log('尚未创建钱包')
        return
      }
      this.axios.get('assets/balances?address=' + this.defaultAccount.address + '&assetid=0&assetid=' + this.assetId + '&limit=2').then((response) => {
        // console.log(response.data)
        this.mcfBalance = response.data[0].balance
        this.otherBalance = response.data[1].balance
      }).catch(function (error) {
        console.log(error)
      })
    },
    getBuyList () {
      this.axios.get('assets/orderbook/0/' + this.assetId + '?limit=10&reverse=true').then((response) => {
        this.sellPrice = response.data[0] ? response.data[0].price : ''
        this.buyList = response.data
      }).catch(function (error) {
        console.log(error)
      })
    },
    getSellList () {
      this.axios.get('assets/orderbook/' + this.assetId + '/0?limit=10&reverse=false').then((response) => {
        this.buyPrice = response.data[0] ? response.data[0].price : ''
        this.sellList = response.data.reverse()
      }).catch(function (error) {
        console.log(error)
      })
    },
    getRecent () {
      let _this = this
      let result1 = this.axios.get('assets/trades/recent?assetid=' + this.assetId + '&otherassetid=0&limit=0')
      let result2 = this.axios.get('assets/trades/recent?assetid=0&otherassetid=' + this.assetId + '&limit=0')
      this.axios.all([result1, result2])
        .then(this.axios.spread(function (res1, res2) {
          let recent = res1.data.concat(res2.data)
          // console.table(recent)
          if (recent.length === 1) {
            _this.recentPrice = _this.computePrice(recent[0], _this.assetId)
          } else if (recent.length >= 2) {
            recent.sort(function (a, b) {
              return b.timestamp - a.timestamp
            })
            let recentPrice = _this.computePrice(recent[0], _this.assetId)
            let recentPrice2 = _this.computePrice(recent[1], _this.assetId)
            _this.recentPrice = recentPrice
            _this.recentPercent = (((recentPrice - recentPrice2) / recentPrice2 * 100).toFixed(2))
          }
        }))
    },
    loadTopBuy () {
      // console.log('下拉刷新buy')
      this.unfinishedBuy = []
      this.pageBuy = 1
      this.allLoadedBuy = false
      this.setUnfinished('buy')
      this.$refs.loadmoreBuy.onTopLoaded()
    },
    loadMoreBuy () {
      // console.log('加载更多buy')
      if (this.isLoadingBuy) {
        console.log('等待上次加载结束')
      } else {
        this.setUnfinished('buy')
      }
    },
    loadTopSell () {
      // console.log('下拉刷新sell')
      this.unfinishedSell = []
      this.pageSell = 1
      this.allLoadedSell = false
      this.setUnfinished('sell')
      this.$refs.loadmoreBSell.onTopLoaded()
    },
    loadMoreSell () {
      // console.log('加载更多sell')
      if (this.isLoadingSell) {
        console.log('等待上次加载结束')
      } else {
        this.setUnfinished('sell')
      }
    },
    async setUnfinished (type) {
      if (!this.defaultAccount) {
        return
      }
      let page = type === 'buy' ? this.pageBuy : this.pageSell
      // console.log('开始查询' + type + '第' + page + '页')
      this.isLoadingBuy = true
      try {
        var result = await this.getUnfinished(type, page)
        result.forEach((item, index, arr) => {
          arr[index].timestamp = format(parseInt(item.timestamp))
          arr[index].percent = parseInt((item.fulfilled / item.amount) * 100)
        })
        // console.log(result)
        var nextPage = await this.getUnfinished(type, page + 1)
        if (type === 'buy') {
          this.unfinishedBuy = this.unfinishedBuy.concat(result)
          if (nextPage.length <= 0) {
            // console.log('buy没有更多数据')
            this.allLoadedBuy = true
          }
          this.pageBuy++
        } else {
          this.unfinishedSell = this.unfinishedSell.concat(result)
          if (nextPage.length <= 0) {
            // console.log('sell没有更多数据')
            this.allLoadedSell = true
          }
          this.pageSell++
        }
      } catch (error) {
        console.log(error)
        if (error.message === 'account address does not exist') {
          this.allLoadedBuy = true
          this.allLoadedSell = true
        }
      }
      this.isLoadingBuy = false
    },
    getUnfinished (type, page) {
      return new Promise((resolve, reject) => {
        let url
        let limit = 10
        let offset = (page - 1) * limit
        if (type === 'buy') {
          url = 'assets/orders/' + this.defaultAccount.address + '/0/' + this.assetId + '?isClosed=false&isFulfilled=false&limit=' + limit + '&offset=' + offset + '&reverse=true'
        } else {
          url = 'assets/orders/' + this.defaultAccount.address + '/' + this.assetId + '/0?isClosed=false&isFulfilled=false&limit=' + limit + '&offset=' + offset + '&reverse=true'
        }
        this.axios.get(url).then((response) => {
          // console.log(response.data)
          resolve(response.data)
        }).catch(function (error) {
          //  console.log(error)
          if (error.response) {
            reject(error.response.data)
          }
        })
      })
    },
    getFinished () {
      if (!this.defaultAccount) {
        return
      }
      let _this = this
      let result1 = this.axios.get('assets/orders/' + this.defaultAccount.address + '/0/' + this.assetId + '?isFulfilled=true&limit=5&reverse=true')
      let result2 = this.axios.get('assets/orders/' + this.defaultAccount.address + '/' + this.assetId + '/0?isFulfilled=true&limit=5&reverse=true')
      this.axios.all([result1, result2])
        .then(this.axios.spread(function (res1, res2) {
          // console.log(res1.data)
          // console.log(res2.data)
          res1.data.forEach((item, index, arr) => {
            arr[index].timestamp = format(parseInt(item.timestamp))
            arr[index].percent = parseInt((item.fulfilled / item.amount) * 100)
          })
          res2.data.forEach((item, index, arr) => {
            arr[index].timestamp = format(parseInt(item.timestamp))
            arr[index].percent = parseInt((item.fulfilled / item.amount) * 100)
          })
          _this.finishedBuy = res1.data
          _this.finishedSell = res2.data
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
    },
    deal (type) {
      if (!this.defaultAccount) {
        this.$toast(this.$t('page.trade.toast3'))
        return
      }
      let haveAssetId
      let wantAssetId
      let price
      let amount
      if (type === 'buy') {
        haveAssetId = 0
        wantAssetId = this.assetId
        price = this.buyPrice
        amount = this.buyAmount
      } else {
        haveAssetId = this.assetId
        wantAssetId = 0
        price = this.sellPrice
        amount = this.sellAmount
      }
      if (amount === '' || price === '') {
        this.$toast(this.$t('page.trade.toast1'))
        return
      }
      let salt = this.$store.getters.salt
      this.$messagebox.prompt(' ', this.$t('page.trade.promptTitle'), { inputType: 'password', confirmButtonText: this.$t('page.trade.btnConfirm'), cancelButtonText: this.$t('page.trade.btnCancel') }).then(async ({ value, action }) => {
        var privateKey = decryptPwd(this.defaultAccount.code, value, salt)
        if (!privateKey) {
          this.$toast(this.$t('page.trade.toast2'))
          return
        }
        let creatorInfo = {
          address: this.defaultAccount.address,
          privateKey: privateKey
        }
        let dealInfo = {
          price: price,
          amount: amount,
          haveAssetId: haveAssetId,
          wantAssetId: wantAssetId
        }
        try {
          var result = await createDeal(creatorInfo, dealInfo)
          // console.log(result)
          if (result.data === true) {
            this.$toast(this.$t('page.trade.createSucceed'))
          }
        } catch (error) {
          console.log(error)
          this.$toast(this.$t('page.trade.createFailed') + error.message)
        }
      }).catch(() => {
        this.$toast(this.$t('page.trade.operationCancel'))
      })
    },
    del (orderId) {
      if (!this.defaultAccount) {
        this.$toast(this.$t('page.trade.toast3'))
        return
      }
      let salt = this.$store.getters.salt
      this.$messagebox.prompt(' ', this.$t('page.trade.promptTitle'), { inputType: 'password', confirmButtonText: this.$t('page.trade.btnConfirm'), cancelButtonText: this.$t('page.trade.btnCancel') }).then(async ({ value, action }) => {
        var privateKey = decryptPwd(this.defaultAccount.code, value, salt)
        if (!privateKey) {
          this.$toast(this.$t('page.trade.toast2'))
          return
        }
        let creatorInfo = {
          address: this.defaultAccount.address,
          privateKey: privateKey
        }
        try {
          var result = await delOrder(creatorInfo, orderId)
          // console.log(result)
          if (result.data === true) {
            this.$toast(this.$t('page.trade.cancelSucceed'))
          }
        } catch (error) {
          console.log(error)
          this.$toast(this.$t('page.trade.cancelFailed') + error.message)
        }
      }).catch(() => {
        this.$toast(this.$t('page.trade.operationCancel'))
      })
    },
    doFavorite () {
      console.log(this.assetId)
      if (this.isFavorited) {
        this.favorite.splice(this.favorite.indexOf(this.assetId), 1)
        // this.favorite.indexOf(item.assetId)
      } else {
        this.favorite.push(this.assetId)
      }
      localStorage.setItem('favorite', JSON.stringify(this.favorite))
    },
    detail () {
      this.popupVisible = true
    },
    pLeft (pe) {
      let left = 180
      if (pe < 50) {
        left = 360 * pe / 100
      }
      return left
    },
    pRight (pe) {
      let right = 0
      if (pe > 50) {
        right = 360 * (pe - 50) / 100
      }
      return right
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
    },
    onInput (dealType, ruleType) {
      let re
      var len = 8
      if (dealType === 'buy') {
        if (ruleType === 'decimal') {
          this.buyPrice = this.buyPrice.replace(/[^\d.]/g, '')
          this.buyPrice = this.buyPrice.replace(/^\./g, '')
          this.buyPrice = this.buyPrice.replace(/\.{2,}/g, '.')
          this.buyPrice = this.buyPrice.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
          re = new RegExp('^(\\-)*(\\d+)\\.(\\d{' + len + '}).*$')
          this.buyPrice = this.buyPrice.replace(re, '$1$2.$3')
        } else {
          if (this.buyAmount.length === 1) {
            this.buyAmount = this.buyAmount.replace(/[^1-9]/g, '')
          } else {
            this.buyAmount = this.buyAmount.replace(/\D/g, '')
          }
        }
      } else {
        if (ruleType === 'decimal') {
          this.sellPrice = this.sellPrice.replace(/[^\d.]/g, '')
          this.sellPrice = this.sellPrice.replace(/^\./g, '')
          this.sellPrice = this.sellPrice.replace(/\.{2,}/g, '.')
          this.sellPrice = this.sellPrice.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
          re = new RegExp('^(\\-)*(\\d+)\\.(\\d{' + len + '}).*$')
          this.sellPrice = this.sellPrice.replace(re, '$1$2.$3')
        } else {
          if (this.sellAmount.length === 1) {
            this.sellAmount = this.sellAmount.replace(/[^1-9]/g, '')
          } else {
            this.sellAmount = this.sellAmount.replace(/\D/g, '')
          }
        }
      }
    },
    onBrowserBack () {
      // 这里写点击返回键时候的事件
      this.popupVisible = false
    }
  },
  mounted () {
    // 按需使用：A→B→C就需要页面一进来的时候，就添加一个历史记录
    window.history.pushState(null, null, document.URL)
    // 给window添加一个popstate事件，拦截返回键，执行this.onBrowserBack事件，addEventListener需要指向一个方法
    window.addEventListener('popstate', this.onBrowserBack, false)
    this.getBalance()
    this.getBuyList()
    this.getSellList()
    this.getRecent()
    this.setUnfinished('buy')
    this.setUnfinished('sell')
    this.getFinished()
  },
  destroyed () {
    // 当页面销毁必须要移除这个事件，vue不刷新页面，不移除会重复执行这个事件
    window.removeEventListener('popstate', this.onBrowserBack, false)
  },
  watch: {
    // 弹框监听，当弹框显示的时候，pushState添加一个历史，供返回键使用
    popupVisible: {
      handler (newVal, oldVal) {
        if (newVal === true) {
          window.history.pushState(null, null, document.URL)
        }
      },
      deep: true
    }
  }
}
</script>

<style lang="less" scoped>
.deal {
  .mint-header {
    .header-btn {
      padding: 3px;
      border: 2px solid white;
      height: 25px;
      border-radius: 0px;
    }
    .is-right {
      button {
        margin-left: 10px;
      }
    }
    .shoucang-orange {
      color: #ffbe4e;
    }
  }
  .mpage {
    .mint-navbar {
      border-bottom: 1px solid #dddddd;
      .mint-tab-item {
        padding: 12px 0px;
      }
    }
    .mint-tab-container {
      // background-color: #cc85d9;
      width: 100%;
      position: absolute;
      top: 79px;
      bottom: 55px;
      left: 0px;
      right: 0px;
      .mint-tab-container {
        // background-color: aquamarine;
        top: 39px;
        bottom: 0px;
        &.tab4 {
          bottom: 80px;
        }
      }
    }
    .tab {
      ul {
        // background-color: cornflowerblue;
        list-style: none;
        padding: 5px;
        margin: 0px;
      }
      position: absolute;
      height: 100%;
      width: 100%;
      box-sizing: border-box;
      overflow-x: hidden;
      overflow-y: scroll;
      padding: 5px 10px;
      margin-bottom: 40px;
      font-size: 12px;
      .deal-panel {
        // background-color: green;
        float: left;
        border-radius: 4px;
        box-shadow: #666 0px 0px 6px;
        width: 45%;
        box-sizing: border-box;
        padding: 0px 5px;
        .input-box {
          margin-top: 10px;
          position: relative;
          input {
            box-sizing: border-box;
            width: 100%;
            height: 30px;
            padding-right: 40px;
          }
          span {
            width: 35px;
            height: 50%;
            font-size: 14px;
            margin: auto;
            position: absolute;
            top: 0;
            bottom: 0;
            right: 3px;
            overflow: hidden;
          }
        }
        p {
          span {
            float: right;
            padding: 0px 5px;
          }
        }
        button {
          width: 90%;
          margin-left: 5%;
          border: 0px;
          height: 30px;
          border-radius: 3px;
        }
      }
      .deal-list {
        width: 53%;
        float: right;
        ul {
          &.list-red {
            color: red;
          }
          &.list-green {
            color: #6ce9b3;
          }
          li {
            margin-bottom: 7px;
            span {
              display: inline-block;
            }
            :nth-child(1) {
              text-align: center;
              width: 18px;
            }
            :nth-child(2) {
              margin-left: 6%;
            }
            :nth-child(3) {
              float: right;
              color: #666;
              opacity: 0.8;
            }
          }
        }
        .list-title {
          span {
            display: inline-block;
            text-align: center;
          }
          :nth-child(1) {
            width: 60%;
          }
          :nth-child(2) {
            width: 40%;
            float: right;
          }
        }
        .list-market {
          margin: 10px 0px;
          span {
            display: inline-block;
            text-align: center;
            font-size: 15px;
            &.list-market-red {
              color: red;
            }
            &.list-market-green {
              color: #6ce9b3;
            }
          }
          :nth-child(1) {
            width: 60%;
            color: #6ce9b3;
          }
          :nth-child(2) {
            width: 40%;
            float: right;
          }
        }
      }
      .record-list {
        li {
          position: relative;
          box-shadow: #666 0px 0px 6px;
          margin-bottom: 10px;
          // background-color: yellow;
          height: 85px;
          padding: 5px;
          font-size: 13px;
          p {
            margin: 10px 0px;
          }
          .list-head {
            span {
              float: right;
            }
          }
          .con {
            float: left;
          }
          .list-price {
            margin-left: 50px;
            p {
              margin: 0px;
            }
          }
          button {
            float: right;
            position: absolute;
            right: 10px;
            bottom: 15px;
            background-color: #ffbe4e;
            border: 0px;
            padding: 5px 20px;
            color: white;
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
  .tips {
    position: fixed;
    padding: 10px;
    font-size: 13px;
    bottom: 60px;
    color: #6c6c6c;
    opacity: 0.7;
  }
  .mint-popup-3 {
    width: 100%;
    height: 100%;
    background-color: #fff;
    .detail {
      font-size: 13px;
      margin-top: 40px;
      .head {
        border-bottom: 1px solid rgba(0, 0, 0, 0.3);
        padding: 10px 20px;
        span {
          display: inline-block;
          width: 25%;
          text-align: center;
          &.list-market-red {
            color: red;
          }
          &.list-market-green {
            color: #6ce9b3;
          }
        }
      }
      .info {
        padding: 0px 20px;
        h2 {
          color: #6c6c6c;
        }
        p {
          margin: 5px 0px;
          :nth-child(1) {
            display: inline-block;
            width: 150px;
          }
          :nth-child(2) {
            margin-left: 10px;
          }
        }
      }
    }
  }
  .line {
    display: inline-block;
    color: #5b85ff;
    border-bottom: 1px solid #5b85ff;
  }
}
</style>
