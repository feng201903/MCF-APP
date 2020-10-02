<template>
  <div>
    <mt-header fixed :title="$t('title')[$route.meta.title]">
      <mt-button icon="back" @click="goBack" slot="left" v-show="!$route.meta.hiddenBack"></mt-button>
    </mt-header>
    <router-view />
  </div>
</template>

<script>
export default {
  methods: {
    goBack () {
      // window.history.length > 1
      //   ? this.$router.go(-1)
      //   : this.$router.push(user)
      this.$route.meta.back ? this.$router.push({ name: this.$route.meta.back }) : this.$router.go(-1)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
