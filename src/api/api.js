import base from './base';
import axios from '../utils/http';

const api = {
    //链上已知代币
    getAllKnownAssets() {
        return axios.get(base.baseUrl + base.getAllKnownAssets)
    },
    //资产交易卖出记录
    getAssetsTradesRecentSell(params) {
        let str, data = params.data
        for (let key in data) {
            str += "&assetid=" + data[key].assetId
        }
        return axios.get(base.baseUrl + base.getAssetsTradesRecentSell + str)
    },
    //资产交易买入记录
    getAssetsTradesRecentBuy(params) {
        let str, data = params.data
        for (let key in data) {
            str += "&otherassetid=" + data[key].assetId
        }
        return axios.get(base.baseUrl + base.getAssetsTradesRecentBuy + str)
    },
    //获取多个地址MCF余额
    getAssetsBalances(params) {
        let str, data = params.data
        for (let key in data) {
            str += "&address=" + data[key].address
        }
        return axios.get(base.baseUrl + base.getAssetsBalances + str)
    },
    //获取单地址所有资产余额
    getAllBalancesByAddress(params) {
        return axios.get(base.baseUrl + base.getAllBalancesByAddress + params)
    },
    //获取地址详情
    getAddresses(params, config) {
        return axios.get(base.baseUrl + base.getAddresses + params, config)
    },
    //提交交易哈希
    transactionsProcess(params, config) {
        return axios.post(base.baseUrl + base.transactionsProcess, params, config)
    },
    //检验地址
    addressesValidate(params) {
        return axios.get(base.baseUrl + base.addressesValidate + params)
    },
    //获取消息
    getMessage(params) {
        let limit = params.limit || 20
        let page = params.page || 1
        let offset = (page - 1) * limit
        return axios.get(base.baseUrl + base.getMessage + params.data + "&offset=" + offset + "&limit=" + limit)
    },
    //获取地址MCF转账记录
    getTransferRecordMcf(params) {
        let limit = params.limit || 20
        let page = params.page || 1
        let offset = (page - 1) * limit
        return axios.get(base.baseUrl + base.getTransferRecordMcf + params.address + "&offset=" + offset + "&limit=" + limit)
    },
    //获取地址其他资产转账记录
    getTransferRecordOther(params) {
        let limit = params.limit || 20
        let page = params.page || 1
        let offset = (page - 1) * limit
        return axios.get(base.baseUrl + base.getTransferRecordOther + params.assetId + "?address=" + params.address + "&offset=" + offset + "&limit=" + limit + '&reverse=true')
    },

    //admin
    getAdmin() {
        return axios.get(base.baseUrl + '/groups/members/2?onlyAdmins=true&limit=0')
    },
    //审核列表
    getVerify() {
        return axios.get(base.baseUrl + '/transactions/pending?txGroupId=2&limit=0')
    },


    //获取最新区块高度
    getBlocksHeight(config) {
        return axios.get(base.baseUrl + '/blocks/height', config)
    },
    //指定高度获取块
    getBlocksRange(params = {}, config) {
        let limit = params.limit || 20
        return axios.get(base.baseUrl + '/blocks/range/' + params.startHeight + '?count=' + limit, config)
    },
    //块详情
    getBlockByHeight(params) {
        return axios.get(base.baseUrl + '/blocks/byheight/' + params)
    },
    //查询MCF转账记录
    getTxMcf(params = {}) {
        let limit = params.limit || 20
        let page = params.page || 1
        let offset = (page - 1) * limit
        let url = base.baseUrl + '/transactions/search?txType=PAYMENT&confirmationStatus=CONFIRMED&reverse=true&limit=' + limit + '&offset=' + offset
        if (params.address) {
            url += '&address=' + params.address
        }
        return axios.get(url)
    },
    //查询其他token转账记录
    getTxTokens(params = {}) {
        let limit = params.limit || 20
        let page = params.page || 1
        let offset = (page - 1) * limit
        let url = base.baseUrl + '/transactions/search?txType=TRANSFER_ASSET&confirmationStatus=CONFIRMED&reverse=true&limit=' + limit + '&offset=' + offset
        return axios.get(url)
    },
    //根据哈希获取详情
    getTxBySignature(params) {
        return axios.get(base.baseUrl + base.transactionsSignature + params)
    },
    //根据名称获取token详情
    getAssetsByName(params) {
        return axios.get(base.baseUrl + '/assets/info?assetName=' + params)
    },
    //根据ID获取token详情
    getAssetsById(params) {
        return axios.get(base.baseUrl + '/assets/info?assetId=' + params)
    },
    //根据资产id查询转账记录
    getTxByAsset(params = {}) {
        let limit = params.limit || 20
        let page = params.page || 1
        let offset = (page - 1) * limit
        let url = base.baseUrl + '/assets/transfers/' + params.assetId + '?reverse=true&limit=' + limit + '&offset=' + offset
        if (params.address) {
            url += '&address=' + params.address
        }
        return axios.get(url)
    },
    //获取资产持有量排行
    getHolders(params = {}) {
        let limit = params.limit || 20
        let page = params.page || 1
        let offset = (page - 1) * limit
        if (params.assetId === 0) {
            offset = (page - 1) * limit + 1
        }
        return axios.get(base.baseUrl + '/assets/balances?assetid=' + params.assetId + '&ordering=ASSET_BALANCE_ACCOUNT&reverse=true&limit=' + limit + '&offset=' + offset)
    },
    //获取资产余额
    getBalance(params = {}) {
        return axios.get(base.baseUrl + '/assets/balances?address=' + params.address + '&assetid=' + params.assetId + '&ordering=ASSET_BALANCE_ACCOUNT&limit=1')
    },

    /**
     * 查询资产交易
     * params type : 1=>buy 2=>sell
     */
    getExchange(params = {}) {
        let limit = params.limit || 20
        let page = params.page || 1
        let offset = (page - 1) * limit
        let url = params.type === 2
            ? '/assets/trades/' + params.assetId + '/0?limit=' + limit + '&offset=' + offset + '&reverse=true'
            : '/assets/trades/0/' + params.assetId + '?limit=' + limit + '&offset=' + offset + '&reverse=true'
        return axios.get(base.baseUrl + url)
    },
    //token买单
    getAssetsOrderbookBuy(params) {
        return axios.get(base.baseUrl + '/assets/orderbook/' + params + '/0?limit=10&reverse=false')
    },
    //token卖单
    getAssetsOrderbookSell(params) {
        return axios.get(base.baseUrl + '/assets/orderbook/0/' + params + '?limit=10&reverse=true')
    },
    //资产交易买入记录
    getTradesRecentBuy(params) {
        return axios.get(base.baseUrl + '/assets/trades/recent?assetid=0&otherassetid=' + params + '&limit=0')
    },
    //资产交易卖出记录
    getTradesRecentSell(params) {
        return axios.get(base.baseUrl + '/assets/trades/recent?assetid=' + params + '&otherassetid=0&limit=0')
    },
    //获取地址token未成交订单
    getUnfinishedByAddress(params = {}) {
        let limit = params.limit || 20
        let page = params.page || 1
        let offset = (page - 1) * limit
        let url
        if (params.type === 'buy') {
            url = '/assets/orders/' + params.address + '/0/' + params.assetId + '?isClosed=false&isFulfilled=false&limit=' + limit + '&offset=' + offset + '&reverse=true'
        } else {
            url = '/assets/orders/' + params.address + '/' + params.assetId + '/0?isClosed=false&isFulfilled=false&limit=' + limit + '&offset=' + offset + '&reverse=true'
        }
        // console.log(base.baseUrl + url)
        return axios.get(base.baseUrl + url)
    },
    //获取地址token未成交订单
    getFinishedByAddress(params = {}) {
        let limit = params.limit || 20
        let page = params.page || 1
        let offset = (page - 1) * limit
        let url
        if (params.type === 'buy') {
            url = '/assets/orders/' + params.address + '/0/' + params.assetId + '?&isFulfilled=true&limit=' + limit + '&offset=' + offset + '&reverse=true'
        } else {
            url = '/assets/orders/' + params.address + '/' + params.assetId + '/0?&isFulfilled=true&limit=' + limit + '&offset=' + offset + '&reverse=true'
        }
        // console.log(base.baseUrl + url)
        return axios.get(base.baseUrl + url)
    }
}

export default api