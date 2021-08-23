<template>
  <div class="wallet">
    <van-empty v-show="accountList.length===0" :description="$t('common.noData')" />
    <div class="card" v-for="item in accountList" :key="item.address" @click="toAssets(item.address)">
      <div class="card-header">
        <span class="card-header-name">{{item.name}}</span>
        <span class="card-header-mark" v-if="item.address===defaultAccount.address">{{$t('user.wallet.CTW')}}</span>
        <span class="card-header-mark" v-else @click.stop="setDefault(item)">{{$t('user.wallet.SCTW')}}</span>
      </div>
      <p class="card-body"><code>{{item.address}}</code></p>
      <div class="card-footer">
        {{accountBalance(item.address)}} MCF
        <van-icon name="delete-o" color="red" @click.stop="remove(item)" size="20" />
      </div>
      <img src="@/assets/images/default-tags.png" v-if="item.address===defaultAccount.address">
    </div>

    <div class="btn">
      <van-button color="#5B85FF" @click="addAccount('wallet/create')">{{$t('user.wallet.create')}}</van-button>
      <van-button color="#5B85FF" @click="addAccount('wallet/import')">{{$t('user.wallet.import')}}</van-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      accountList: this.$mcf.getStorage('accountList'),
      defaultAccount: this.$mcf.getStorage('defaultAccount'),
      balance: []
    }
  },
  methods: {
    addAccount(type) {
      let accountList = this.$mcf.getStorage('accountList')
      if (accountList.length < 5) {
        this.$router.push(type)
      } else {
        this.$notify({ type: 'danger', message: this.$t('user.wallet.pleaseRemove') })
      }
    },
    setDefault(account) {
      this.defaultAccount = account
      localStorage.setItem('defaultAccount', JSON.stringify(account))
    },
    remove(account) {
      this.$dialog.confirm({
        title: this.$t('user.wallet.removeIt'),
        message: account.address + this.$t('user.wallet.remove'),
        confirmButtonText: this.$t('common.btnConfirm'),
        cancelButtonText: this.$t('common.btnCancel')
      })
        .then(() => {
          let accountList = this.accountList
          for (let i = 0; i < accountList.length; i++) {
            if (accountList[i].address === account.address) {
              accountList.splice(i, 1)
              if (account.address === this.defaultAccount.address) {
                this.defaultAccount = accountList.length > 0 ? accountList[0] : {}
              }
              break;
            }
          }
          localStorage.setItem('defaultAccount', JSON.stringify(this.defaultAccount))
          localStorage.setItem('accountList', JSON.stringify(accountList))
        }).catch(() => {
          console.log("cancel")
        });
    },
    getBalance() {
      console.log(this.accountList)
      if (this.accountList.length > 0) {
        this.$api.getAssetsBalances({ data: this.accountList }).then(res => {
          // console.log(res)
          this.balance = res.data
        })
      }
    },
    accountBalance(address) {
      let res = this.balance.filter(item => {
        return item.address === address
      })
      // console.log(res)
      return res.length === 1 ? res[0].balance : 0
    },
    toAssets(address) {
      this.$router.push({ path: '/user/wallet/assets', query: { address: address } })
    }
  },
  mounted() {
    this.getBalance();
  },
}
</script>

<style lang="less" scoped>
.wallet {
  overflow: scroll;
  margin-top: 5px;
  margin-bottom: 60px;
  .card {
    position: relative;
    margin: 0 5% 15px;
    padding: 10px 5%;
    box-shadow: 2px 2px 3px 2px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    background-color: white;
    .card-header {
      span {
        display: inline-block;
        &.card-header-name {
          width: 50%;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        &.card-header-mark {
          font-size: 12px;
          color: #5b85ff;
          position: absolute;
          right: 7%;
        }
      }
    }
    .card-body {
      font-size: 12px;
      padding: 15px 0;
    }
    .card-footer {
      font-size: 14px;
      color: #ffbe4eb9;
      margin: 0 -5%;
      padding: 5px 5%;
      text-align: right;
      position: relative;
      .van-icon {
        position: absolute;
        left: 4%;
        top: 50%;
        transform: translate(0, -50%);
      }
    }
    img {
      border-radius: 0 5px 0 0;
      width: 30px;
      position: absolute;
      top: 0;
      right: 0;
    }
  }
  .btn {
    position: fixed;
    display: flex;
    justify-content: space-around;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 10px 10%;
    // background-color: rgba(255, 255, 255, 1);
  }
}
</style>