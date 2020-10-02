<template>
  <div>
    <mt-cell :title="$t('page.user.myWallet')" :to="{ name: 'wallet'}" is-link></mt-cell>
    <mt-cell :title="$t('page.user.myAsset')" :to="{ name: 'assets'}" is-link></mt-cell>
    <mt-cell :title="$t('page.user.news')" :to="{ name: 'message'}" is-link>
      <mt-badge type="error" size="small" v-show="showBadge">&nbsp;</mt-badge>
    </mt-cell>
    <mt-cell title="发行资产/批量转资产" :to="{ name: 'issue'}" is-link></mt-cell>
    <!-- <div @click="updata">
      <mt-cell title="版本更新" is-link></mt-cell>
    </div> -->
    <mt-cell title="审核任务" :to="{ name: 'verify'}" v-show="isAdmin" is-link></mt-cell>
  </div>
</template>

<script>
export default {
  data () {
    return {
      messageInfo: [],
      AccountList: JSON.parse(localStorage.getItem('AccountList')) || [],
      isAdmin: false
    }
  },
  methods: {
    updata () {
      console.log('updata')
    },
    getNewMessage () {
      if (this.defaultAccount !== null) {
        this.axios.get('transactions/search?txType=PAYMENT&txType=ISSUE_ASSET&txType=TRANSFER_ASSET&address=' + this.defaultAccount.address + '&confirmationStatus=CONFIRMED&limit=1&reverse=true').then((response) => {
          // console.log(response.data)
          this.messageInfo = response.data[0]
        }).catch(function (error) {
          console.log(error)
        })
      }
    },
    checkAdmin () {
      if (this.defaultAccount !== null) {
        this.axios.get('groups/members/2?onlyAdmins=true&limit=0').then((response) => {
          // console.log(response.data.members)
          let admin = response.data.members
          for (var key in admin) {
            if (admin[key].member === this.defaultAccount.address) {
              this.isAdmin = true
              break
            }
          }
        }).catch(function (error) {
          console.log(error)
        })
      }
    }
  },
  computed: {
    showBadge () {
      let time = this.messageInfo.timestamp || 0
      return (new Date().getTime() - time) / 1000 < 600
    },
    defaultAccount () {
      let AccountList = this.AccountList
      let defaultA = null
      for (let i = 0, len = AccountList.length; i < len; i++) {
        if (AccountList[i].isDefault === true) {
          defaultA = AccountList[i]
          break
        }
      }
      return defaultA
    }
  },
  mounted () {
    this.getNewMessage()
    this.checkAdmin()
    this.timer = setInterval(this.getNewMessage, 600 * 1000)
  },
  beforeDestroy () {
    clearInterval(this.timer)
  },
  beforeRouteLeave (to, from, next) {
    var AccountList = this.AccountList
    if ((to.name === 'assets' || to.name === 'message') && AccountList.length <= 0) {
      this.$toast('尚未创建钱包')
    } else {
      next()
    }
  }
}
</script>

<style lang="less" scoped>
.mint-cell:last-child {
  background-size: 100% 0px;
}
</style>
