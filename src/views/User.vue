<template>
  <div>
    <van-cell-group>
      <van-cell :title="$t('user.myWallet')" is-link to="/user/wallet" />
      <van-cell :title="$t('user.myAsset')" is-link to="/user/wallet/assets" />
      <van-cell :title="$t('user.messages')" is-link to="/user/message" />
      <van-cell :title="$t('user.issueAsset')" is-link to="/user/issue" />
      <van-cell title="审核任务" is-link to="/user/verify" v-show="isAdmin" />
    </van-cell-group>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isAdmin: false,
    }
  },
  methods: {
    getAdmin() {
      this.$api.getAdmin().then(res => {
        let admin = res.data.members
        for (var key in admin) {
          if (admin[key].member === this.$mcf.getStorage('defaultAccount').address) {
            this.isAdmin = true
            break
          }
        }
      }).catch(err => {
        console.log(err)
      })
    },
    toAsset() {
      
    }
  },
  mounted() {
    this.getAdmin()
  },
}
</script>

<style lang="less" scoped>
</style>