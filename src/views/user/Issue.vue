<template>
  <div class="issue">
    <p>{{$t('user.issue.text1')}}</p>
    <p><span @click="doCopy">{{url}}</span></p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      url: 'http://www.mcfamily.io'
    }
  },
  methods: {
    doCopy() {
      var _this = this
      this.$copyText(this.url).then(function (e) {
        console.log('复制成功！')
        _this.$toast(_this.url)
      }, function (e) {
        console.log('复制失败！')
        _this.$toast('copy error')
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
    padding: 5px 0;
    span {
      color: #5b85ff;
      border-bottom: 1px solid #5b85ff;
    }
  }
}
</style>
