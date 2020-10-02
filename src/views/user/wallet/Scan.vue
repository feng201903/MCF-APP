<template>
  <div class="scan">
    <div id="bcid">
      <!-- <div style="height:40%"></div>
      <p class="tip">...载入中...</p> -->
    </div>
  </div>
</template>

<script>
let scan = null
export default {
  data () {
    return {
      creator: this.$route.query.creator
    }
  },
  methods: {

    // 创建扫描控件
    startRecognize () {
      let that = this
      // that.$router.replace({ path: '/user/transfer', query: { creator: that.creator, recipient: 123 } })
      if (!window.plus) return

      scan = new window.plus.barcode.Barcode('bcid')
      scan.onmarked = onmarked
      that.startScan()
      function onmarked (type, result, file) {
        switch (type) {
          case window.plus.barcode.QR:
            type = 'QR'
            break
          case window.plus.barcode.EAN13:
            type = 'EAN13'
            break
          case window.plus.barcode.EAN8:
            type = 'EAN8'
            break
          default:
            type = '其它' + type
            break
        }
        result = result.replace(/\n/g, '')
        try {
          let codeInfo = JSON.parse(result)
          if (codeInfo.type === 'trans') {
            that.closeScan()
            that.$router.replace({ path: '/user/transfer', query: { creator: that.creator, recipient: codeInfo.address } })
          }
        } catch (e) {
          console.log('error：' + result + '!!!' + e)
          that.cancelScan()
          alert('扫码失败，请重试')
          that.startScan()
        }
      }
    },
    // 开始扫描
    startScan () {
      if (!window.plus) return
      scan.start()
    },
    // 关闭扫描
    cancelScan () {
      if (!window.plus) return
      scan.cancel()
    },
    // 关闭条码识别控件
    closeScan () {
      if (!window.plus) return
      scan.close()
    }
  },
  mounted () {
    this.startRecognize()
  },
  beforeDestroy () {
    this.closeScan()
  }
}
</script>
<style lang="less">
.scan {
  height: 100%;
  #bcid {
    width: 100%;
    position: absolute;
    left: 0;
    right: 0;
    top: 40px;
    bottom: 0;
    // bottom: 3rem;
    text-align: center;
    color: #fff;
    background: #ccc;
  }
  footer {
    position: absolute;
    left: 0;
    bottom: 1rem;
    height: 2rem;
    line-height: 2rem;
    z-index: 2;
  }
}
</style>
