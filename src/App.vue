<template>
  <div id="app">
    <!-- <van-nav-bar :title="$route.meta.title" :left-arrow="$route.meta.showBack" @click-left="onClickLeft" fixed :placeholder=true v-if='$route.meta.title' /> -->
    <van-nav-bar :title="$t(`nav.${$route.meta.title}`)" :left-arrow="$route.meta.showBack" @click-left="onClickLeft" fixed :placeholder=true v-if='$route.meta.title' />

    <keep-alive :include="keepAlive">
      <router-view :allKnownAssets="allKnownAssets" @updateAssetsInfo="updateAssetsInfo" @setKeepAlive="setKeepAlive" />
    </keep-alive>

    <!-- <router-view v-if="!$route.meta.keepAlive" :allKnownAssets="allKnownAssets" @updateAssetsInfo="updateAssetsInfo" /> -->
    <van-tabbar v-show="$route.meta.showTabbar" route>
      <van-tabbar-item to="/" icon="chart-trending-o">{{$t('tab.market')}}</van-tabbar-item>
      <van-tabbar-item to="/trade" icon="balance-list-o">{{$t('tab.trade')}}</van-tabbar-item>
      <van-tabbar-item to="/user" icon="user-o">{{$t('tab.user')}}</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
import nacl_factory from '@/assets/js/nacl_factory.min.js'
export default {
  data() {
    return {
      allKnownAssets: [],
      keepAlive: []
    }
  },
  methods: {
    getAllKnownAssets() {
      this.$api.getAllKnownAssets().then(res => {
        this.allKnownAssets = res.data
      })
    },
    updateAssetsInfo(config) {
      // console.log(config)
      this.$set(this.allKnownAssets, config.index + 1, config.item)
    },
    onClickLeft() {
      if (this.$route.meta.back) {
        let query = {}
        switch (this.$route.meta.back) {
          case 'Assets':
            query = { address: this.$route.query.creator }
        }
        this.$router.push({ name: this.$route.meta.back, query })
      } else {
        this.$router.go(-1)
      }
    },
    setKeepAlive(name, type) {
      let index = this.keepAlive.indexOf(name)
      if (type === 'push') {
        if (index === -1) {
          this.keepAlive.push(name)
        }
      } else {
        if (index > -1) {
          this.keepAlive.splice(index, 1)
        }
      }
    }
  },
  created() {
    this.getAllKnownAssets()
    localStorage.removeItem('tempAccount')
    if (!localStorage.getItem('salt')) {
      nacl_factory.instantiate(function (nacl) {
        var salt = nacl.to_hex(nacl.crypto_secretbox_random_nonce())
        localStorage.setItem('salt', salt)
      })
    }
  },
  beforeCreate() {
    document.querySelector('body').setAttribute('style', 'background-color:rgba(250, 250, 250, 0.1)')
  }
}
</script>

<style scoped>
::v-deep .van-nav-bar .van-icon {
  color: black;
}
</style>
