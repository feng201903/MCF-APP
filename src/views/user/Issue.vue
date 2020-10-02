<template>
  <div class="issue">
    <p>批量转账、空投以及锁仓功能（锁仓功能在第二版本开放）</p>
    <p>请到<span @click="doCopy">{{url}}</span>操作</p>
  </div>
</template>

<script>
export default {
  data () {
    return {
      url: 'http://www.mcfamily.io'
    }
  },
  methods: {
    doCopy: function (text) {
      var _this = this
      this.$copyText(this.url).then(function (e) {
        console.log('复制成功！')
        _this.$toast('复制成功')
      }, function (e) {
        console.log('复制失败！')
        _this.$toast('复制失败')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.issue {
  padding-top: 100px;
  p {
    font-size: 14px;
    text-align: center;
    span {
      color: #5b85ff;
      border-bottom: 1px solid #5b85ff;
    }
  }
}
</style>
