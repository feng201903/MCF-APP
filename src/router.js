/* eslint-disable */
import Vue from 'vue'
import Router from 'vue-router'
import Market from './views/Market.vue'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [{
    path: '/',
    redirect: '/market'
  },
  {
    path: '/market',
    name: 'market',
    component: Market,
    meta: {
      showTabbar: true
    }
  },
  {
    path: '/deal',
    name: 'deal',
    component: () => import( /* webpackChunkName: "deal" */ './views/Deal.vue'),
    meta: {
      showTabbar: true
    }
  },
  {
    path: '/search',
    name: 'search',
    component: () => import( /* webpackChunkName: "deal" */ './views/market/Search.vue'),
    meta: {
      title: 'myProfile'
    }
  },
  {
    path: '/user',
    redirect: '/user/menu',
    component: () => import( /* webpackChunkName: "page" */ './views/User.vue'),
    children: [{
      path: 'menu',
      name: 'user',
      component: () => import( /* webpackChunkName: "page" */ './views/user/Menu.vue'),
      meta: {
        title: 'myProfile',
        hiddenBack: true,
        showTabbar: true
      }
    }, {
      path: 'wallet',
      name: 'wallet',
      component: () => import( /* webpackChunkName: "page" */ './views/user/Wallet.vue'),
      meta: {
        title: 'myWallet',
        back: 'user'
      }
    }, {
      path: 'message',
      name: 'message',
      component: () => import( /* webpackChunkName: "page" */ './views/user/Message.vue'),
      meta: {
        title: '消息中心'
      }
    }, {
      path: 'issue',
      name: 'issue',
      component: () => import( /* webpackChunkName: "page" */ './views/user/Issue.vue'),
      meta: {
        title: '发行资产/批量转资产'
      }
    }, {
      path: 'verify',
      name: 'verify',
      component: () => import( /* webpackChunkName: "page" */ './views/user/Verify.vue'),
      meta: {
        title: '审核任务'
      }
    }, {
      path: 'create',
      name: 'create',
      component: () => import( /* webpackChunkName: "page" */ './views/user/wallet/Create.vue'),
      meta: {
        title: 'create'
      }
    }, {
      path: 'import',
      name: 'import',
      component: () => import( /* webpackChunkName: "page" */ './views/user/wallet/Import.vue'),
      meta: {
        title: 'importWallet'
      }
    }, {
      path: 'backup',
      name: 'backup',
      component: () => import( /* webpackChunkName: "page" */ './views/user/wallet/Backup.vue'),
      meta: {
        title: 'backupYourWallet'
      }
    }, {
      path: 'assets',
      name: 'assets',
      component: () => import( /* webpackChunkName: "page" */ './views/user/wallet/Assets.vue'),
      meta: {
        title: 'myAsset',
        back: 'wallet'
      }
    }, {
      path: 'addasset',
      name: 'addasset',
      component: () => import( /* webpackChunkName: "page" */ './views/user/wallet/AddAsset.vue'),
      meta: {
        title: '添加资产'
      }
    }, {
      path: 'scan',
      name: 'scan',
      component: () => import( /* webpackChunkName: "page" */ './views/user/wallet/Scan.vue'),
      meta: {
        title: '扫一扫'
      }
    }, {
      path: 'transfer',
      name: 'transfer',
      component: () => import( /* webpackChunkName: "page" */ './views/user/wallet/Transfer.vue'),
      meta: {
        title: '转账'
      }
    }, {
      path: 'trecord',
      name: 'trecord',
      component: () => import( /* webpackChunkName: "page" */ './views/user/wallet/TransferRecord.vue'),
      meta: {
        title: '转账记录'
      }
    }, {
      path: 'tdetail',
      name: 'tdetail',
      component: () => import( /* webpackChunkName: "page" */ './views/user/wallet/TransferDetail.vue'),
      meta: {
        title: '转账详情'
      }
    }]
  }
  ]
})
