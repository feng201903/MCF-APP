const base = {
    baseUrl: 'http://127.0.0.1:9888',
    getAllKnownAssets: '/assets?includeData=true&limit=0&offset=0&reverse=false',
    getAssetsTradesRecentSell: '/assets/trades/recent?otherassetid=0&limit=0&reverse=false',
    getAssetsTradesRecentBuy: '/assets/trades/recent?assetid=0&limit=0&reverse=false',
    getAssetsBalances: '/assets/balances?assetid=0&limit=0&reverse=true',
    getAllBalancesByAddress: '/assets/balances?ordering=ASSET_BALANCE_ACCOUNT&limit=0&address=',
    getAddresses: '/addresses/',
    transactionsProcess: '/transactions/process',
    addressesValidate: '/addresses/validate/',
    getMessage: '/transactions/search?txType=PAYMENT&txType=ISSUE_ASSET&txType=TRANSFER_ASSET&confirmationStatus=CONFIRMED&reverse=true&address=',
    getTransferRecordMcf: '/transactions/search?txType=PAYMENT&confirmationStatus=CONFIRMED&reverse=true&address=',
    getTransferRecordOther: '/assets/transfers/',
    transactionsSignature: '/transactions/signature/',
    addressesValidate: '/addresses/validate/'
}
export default base