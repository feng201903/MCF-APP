<template>
  <div id="app">
    <!-- <header>标题</header> -->
    <section class="content">
      <router-view />
    </section>
    <mt-tabbar v-model="selected" :fixed='true' v-show="$route.meta.showTabbar">
      <mt-tab-item id="market">
        <div class="mint-tab-item-icon">
          <i class="iconfont icon-hangqing-copy"></i>
        </div>
        {{$t("tab.tab1")}}
      </mt-tab-item>
      <mt-tab-item id="deal">
        <div class="mint-tab-item-icon">
          <i class="iconfont icon-jiaoyi"></i>
        </div>
        {{$t("tab.tab2")}}
      </mt-tab-item>
      <mt-tab-item id="user">
        <div class="mint-tab-item-icon">
          <i class="iconfont icon-gerenzhongxin"></i>
        </div>
        {{$t("tab.tab3")}}
      </mt-tab-item>
    </mt-tabbar>
  </div>
</template>

<script>
export default {
  data () {
    return {
      selected: 'market'
    }
  },
  methods: {
    getAllAsset () {
      // console.log('获取全部资产')
      this.axios.get('assets?includeData=true&limit=0&offset=0&reverse=false').then((response) => {
        // console.log(response.data)
        localStorage.setItem('allAsset', JSON.stringify(response.data))
      }).catch((err) => {
        console.log(err)
      })
    }
  },
  created () {
    this.getAllAsset()
  },
  watch: {
    $route () {
      this.selected = this.$route.name
    },
    selected (newValue, oldValue) {
      if (this.$route.name !== newValue) {
        this.$router.push({ name: newValue })
      }
    }
  }
}
</script>

<style lang="less">
.iconfont::before {
  font-size: 24px;
}
</style>
