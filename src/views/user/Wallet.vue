<template>
  <div>
    <!-- {{AccountList}} -->
    <div class="list">
      <list-item v-for="(item,key) in AccountDef" :key="key" :wallet="item" @setDefault="setDefault" @removeAddress="removeAddress" @toAssets="toAssets"></list-item>
    </div>
    <div class="btn">
      <button @click="addAccount('create')" class="mcf-btn-a btn-blue">{{$t('page.user.btnCreate')}}</button>
      <button @click="addAccount('import')" class="mcf-btn-a btn-blue">{{$t('page.user.btnImport')}}</button>
    </div>
  </div>
</template>

<script>
import ListItem from '@/components/user/WalletListItem'
export default {
  data () {
    return {
      AccountList: []
    }
  },
  computed: {
    AccountDef () {
      var a = this.AccountList
      return a.sort(function (a, b) {
        if (a.isDefault) {
          return -1
        }
      })
    }
  },
  methods: {
    addAccount (type) {
      if (this.AccountList.length >= 5) {
        this.$toast('钱包数量已达到上限')
      } else {
        this.$router.push(type)
      }
    },
    setDefault (address) {
      for (let i = 0; i < this.AccountList.length; i++) {
        this.AccountList[i].isDefault = false
        if (this.AccountList[i].address === address) {
          this.AccountList[i].isDefault = true
        }
      }
      localStorage.setItem('AccountList', JSON.stringify(this.AccountList))
    },
    removeAddress (address) {
      console.log(address)
      var AccountList = this.AccountList
      if (AccountList.length <= 1) {
        this.$toast('请至少保留一个钱包')
        return
      }
      for (let i = 0, len = AccountList.length; i < len; i++) {
        if (AccountList[i].address === address) {
          console.log(address)
          console.log(i)
          AccountList.splice(i, 1)
          break
        }
      }
      localStorage.setItem('AccountList', JSON.stringify(AccountList))
      localStorage.removeItem('assetIds-' + address)
    },
    toAssets (address) {
      this.$router.push({ path: '/user/assets', query: { address: address } })
    },
    getAccountBalance () {
      var urlAddress = ''
      var AccountList = JSON.parse(localStorage.getItem('AccountList')) || []
      for (let i = 0, len = AccountList.length; i < len; i++) {
        urlAddress += 'address=' + AccountList[i].address + '&'
      }
      this.axios.get('assets/balances?' + urlAddress + 'assetid=0&limit=0&reverse=true').then((response) => {
        // console.log(response.data)
        for (let i = 0, len = AccountList.length; i < len; i++) {
          for (let j = 0, len = response.data.length; j < len; j++) {
            if (AccountList[i].address === response.data[j].address) {
              AccountList[i].balance = response.data[j].balance
            }
          }
        }
        this.AccountList = AccountList
      }).catch((err) => {
        console.log(err)
      })
    }
  },
  created () {
    this.getAccountBalance()
  },
  components: {
    ListItem
  }
}
</script>

<style lang="less" scoped>
.list {
  margin-bottom: 70px;
}
.btn {
  position: fixed;
  bottom: 10px;
  width: 100%;
}
.btn button {
  width: 43%;
}
</style>
