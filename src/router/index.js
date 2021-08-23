import Vue from 'vue'
import VueRouter from 'vue-router'
import Market from '../views/Market.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Market',
    component: Market,
    meta: {
      title: 'market',
      showTabbar: true
    }
  },
  {
    path: '/trade',
    name: 'Trade',
    component: () => import(/* webpackChunkName: "app.mcf" */ '../views/Trade.vue'),
    meta: {
      showTabbar: true
    }
  },
  {
    path: '/user',
    name: 'User',
    component: () => import(/* webpackChunkName: "app.mcf" */ '../views/User.vue'),
    meta: {
      title: 'market',
      showTabbar: true
    }
  },
  {
    path: '/user/wallet',
    name: 'Wallet',
    component: () => import(/* webpackChunkName: "app.mcf" */ '../views/user/Wallet.vue'),
    meta: {
      title: 'myWallet',
      showBack: true,
      back: 'User'
    }
  },
  {
    path: '/user/wallet/create',
    name: 'Create',
    component: () => import(/* webpackChunkName: "app.mcf" */ '../views/user/wallet/Create.vue'),
    meta: {
      title: 'create',
      showBack: true
    }
  },
  {
    path: '/user/wallet/backup',
    name: 'Backup',
    component: () => import(/* webpackChunkName: "app.mcf" */ '../views/user/wallet/Backup.vue'),
    meta: {
      title: 'backupYourWallet',
      showBack: true
    }
  },
  {
    path: '/user/wallet/import',
    name: 'Import',
    component: () => import(/* webpackChunkName: "app.mcf" */ '../views/user/wallet/Import.vue'),
    meta: {
      title: 'importWallet',
      showBack: true
    }
  }, {
    path: '/user/wallet/assets',
    name: 'Assets',
    component: () => import(/* webpackChunkName: "app.mcf" */ '../views/user/wallet/Assets.vue'),
    meta: {
      title: 'myAsset',
      showBack: true,
      back: 'Wallet',
    }
  }, {
    path: '/user/wallet/record',
    name: 'Record',
    component: () => import(/* webpackChunkName: "app.mcf" */ '../views/user/wallet/Record.vue'),
    meta: {
      title: 'record',
      showBack: true,
      keepAlive: true
    }
  }, {
    path: '/user/wallet/detail',
    name: 'Detail',
    component: () => import(/* webpackChunkName: "app.mcf" */ '../views/user/wallet/Detail.vue'),
    meta: {
      title: 'details',
      showBack: true
    }
  }, {
    path: '/user/wallet/transfer',
    name: 'Transfer',
    component: () => import(/* webpackChunkName: "app.mcf" */ '../views/user/wallet/Transfer.vue'),
    meta: {
      title: 'transfer',
      showBack: true,
      back: 'Assets'
    }
  }, {
    path: '/user/wallet/contact',
    name: 'Contact',
    component: () => import(/* webpackChunkName: "app.mcf" */ '../views/user/wallet/Contact.vue'),
    meta: {
      title: 'contact',
      showBack: true
    }
  }, {
    path: '/user/wallet/scan',
    name: 'Scan',
    component: () => import(/* webpackChunkName: "app.mcf" */ '../views/user/wallet/Scan.vue'),
    meta: {
      title: 'scan',
      showBack: true
    }
  }, {
    path: '/user/message',
    name: 'Message',
    component: () => import(/* webpackChunkName: "app.mcf" */ '../views/user/Message.vue'),
    meta: {
      title: 'messages',
      showBack: true,
      keepAlive: true
    }
  }, {
    path: '/user/issue',
    name: 'Issue',
    component: () => import(/* webpackChunkName: "app.mcf" */ '../views/user/Issue.vue'),
    meta: {
      title: 'issue',
      showBack: true
    }
  }, {
    path: '/user/verify',
    name: 'Verify',
    component: () => import(/* webpackChunkName: "app.mcf" */ '../views/user/Verify.vue'),
    meta: {
      title: '审核列表',
      showBack: true
    }
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
