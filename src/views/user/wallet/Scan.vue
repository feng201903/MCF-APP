<template>
  <div class="scan">
    <div id="bcid">
      <!-- <div style="height:40%"></div>
      <p class="tip">...载入中...</p> -->
    </div>
  </div>
</template>

<script>
let scan = null;
export default {
  data() {
    return {
      creator: this.$route.query.creator,
    };
  },
  methods: {
    // 创建扫描控件
    startRecognize() {
      if (!window.plus) return;
      scan = new window.plus.barcode.Barcode("bcid");
      scan.onmarked = async (type, result) => {
        const res = (await this.$api.addressesValidate(result)).data;
        if (type === window.plus.barcode.QR && res) {
          this.closeScan();
          this.$router.replace({
            path: "/user/wallet/transfer",
            query: { creator: this.creator, recipient: result },
          });
        } else {
          alert("扫码失败,请重试! ");
          this.cancelScan();
          this.startScan();
        }
      };
      this.startScan();
    },
    // 开始扫描
    startScan() {
      if (!window.plus) return;
      scan.start();
    },
    // 关闭扫描
    cancelScan() {
      if (!window.plus) return;
      scan.cancel();
    },
    // 关闭条码识别控件
    closeScan() {
      if (!window.plus) return;
      scan.close();
    },
  },
  mounted() {
    this.startRecognize();
  },
  beforeDestroy() {
    this.closeScan();
  },
};
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
