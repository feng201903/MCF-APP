<template>
  <div class="list">
    <ul>
      <li v-for="item in newVerify" :key="item.signature">
        <p>{{cutAddr(item.owner)}}发行了以下资产</p>
        <p>资产简称：{{item.assetName}}</p>
        <p>资产全称：{{decodeURIComponent(item.data.full)}}</p>
        <p>资产中文名：{{decodeURIComponent(item.description)}}</p>
        <p>发行总量：{{item.quantity}}</p>
        <p>可分割：{{item.isDivisible?'可分割':'不可分割'}}</p>
        <p>url：{{item.data.url}}</p>
        <p>web：{{item.data.web}}</p>
        <p>logo：{{item.assetName}}</p>
        <p>简介：{{decodeURIComponent(item.data.content)}}</p>
        <p><button @click="doVerify(item.signature)">通过</button></p>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      verify: null
    }
  },
  computed: {
    newVerify() {
      return this.verify ? this.verify.map(el => {
        el.data = JSON.parse(el.data)
        return el
      }) : []
    }
  },
  methods: {
    getVerify() {
      this.$api.getVerify().then(res => {
        this.verify = res.data
      }).catch(error => {
        console.log(error)
      })
    },
    doVerify(signature) {
      let account = this.$mcf.getAccountByStorage(this.$mcf.getStorage('defaultAccount').address)
      let config = {
        creator: this.$mcf.getStorage('defaultAccount').address,
        signature: signature,
      }
      this.$mcf.transactions('GROUP_APPROVAL', { ...config, ...account }).then(res => {
        if (res.data) {
          this.$notify({ type: 'success', message: '审核提交成功' })
        }
      }).catch(error => {
        console.log(error)
        this.$notify({ type: 'danger', message: '审核提交失败' })
      })
    },
    cutAddr(address) {
      return address.slice(0, 10) + '...' + address.slice(-10)
    }
  },
  mounted() {
    this.getVerify()
  }
}
</script>

<style lang="less" scoped>
.list {
  ul {
    list-style: none;
    padding: 0px;
    font-size: 14px;
    li {
      border: 1px solid slategray;
      padding: 0px 10px;
      margin-top: 10px;
      p {
        margin: 5px 0px;
        width: 100%;
        word-break: break-all;
      }
    }
  }
}
</style>
