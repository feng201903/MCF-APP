<template>
  <div class="wallet-list-item" @click="toAssets">
    <div class="item-left">
      <div class="name">{{wallet.name}}</div>
      <div class="addr">{{cutAddr}}</div>
    </div>
    <div class="item-right def" v-if="wallet.isDefault">
      {{$t('page.user.CTW')}}
    </div>
    <div class="item-right" v-else @click.stop="setDefault">
      {{$t('page.user.SCTW')}}
    </div>
    <div class="item-bottom">
      <span @click.stop="removeAddress">{{$t('page.user.btnDelete')}}</span>
      <span class="balance">{{wallet.balance}} MCF</span>
    </div>
    <div class="default" v-if="wallet.isDefault">
      <img src="@/assets/images/default-tags.png">
    </div>
  </div>
</template>

<script>
export default {
  props: ['wallet'],
  computed: {
    cutAddr () {
      return this.wallet.address.slice(0, 10) + '...' + this.wallet.address.slice(-10)
    }
  },
  methods: {
    setDefault () {
      this.$emit('setDefault', this.wallet.address)
    },
    removeAddress () {
      this.$emit('removeAddress', this.wallet.address)
    },
    toAssets () {
      this.$emit('toAssets', this.wallet.address)
    }
  }
}
</script>

<style lang="less" scoped>
.wallet-list-item {
  position: relative;
  height: 120px;
  box-shadow: 0 0 5px #888888;
  margin: 15px auto;
  border-radius: 3px;
}
.item-left {
  padding: 10px 5%;
  width: 45%;
  float: left;
  height: 60px;
  line-height: 25px;
}
.item-right {
  width: 45%;
  float: left;
  height: 70px;
  line-height: 70px;
  font-size: 12px;
  color: #888888;
}
.item-bottom {
  width: 90%;
  background-color: #ffbe4e;
  float: left;
  height: 30px;
  line-height: 30px;
  color: white;
  padding: 0px 5%;
  border-radius: 3px;
}
.addr {
  font-size: 12px;
}
.balance {
  float: right;
}
.default {
  position: absolute;
  right: 0px;
}
.default img {
  width: 50px;
}
.def {
  color: #5b85ff;
}
</style>
