<template>
  <div class="box">
    <!-- {{tempAccount}} -->
    <div class="warning">
      <div class="mark">
        <div>
          <div>!</div>
        </div>
      </div>
      <div class="text">
        <p>{{$t('page.user.createText1')}} <span>{{$t('page.user.createText2')}}</span></p>
        <p>MCF <span>{{$t('page.user.createText3')}}</span>{{$t('page.user.createText4')}}</p>
      </div>
    </div>
    <div class="form">
      <mt-field :placeholder="$t('page.user.walletName')" type="text" v-model="name" disableClear></mt-field>
      <mt-field :placeholder="$t('page.user.password')" :type="inputType" v-model="pwd" disableClear><i class="iconfont icon-yanjing" @click="changeShowPwd"></i></mt-field>
      <p>{{$t('page.user.passwordText')}}</p>
      <mt-field :placeholder="$t('page.user.repeatPassword')" type="password" v-model="pwd2" disableClear></mt-field>
      <mt-field :placeholder="$t('page.user.passwordReminder')" type="text" v-model="pt" disableClear></mt-field>
      <button @click="create" class="mcf-btn btn-blue">{{$t('page.user.btnCreate')}}</button>
    </div>
  </div>
</template>

<script>
import { getAddress } from '@/assets/js/utils.js'
export default {
  data () {
    return {
      name: '',
      pwd: '',
      pwd2: '',
      pt: '',
      showPwd: false
    }
  },
  computed: {
    tempAccount () {
      return this.$store.state.tempAccount
    },
    inputType () {
      return this.showPwd ? 'text' : 'password'
    }
  },
  methods: {
    changeShowPwd () {
      this.showPwd = !this.showPwd
    },
    create () {
      var _this = this
      var regex = new RegExp('^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-ZW_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-zW_!@#$%^&*`~()-+=]+$)(?![0-9W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9W_!@#$%^&*`~()-+=]{8,24}$')
      if (this.name === '' || this.pwd === '' || this.pwd2 === '') {
        this.$toast(this.$t('page.user.createToast1'))
        return
      }
      if (!regex.test(this.pwd)) {
        this.$toast(this.$t('page.user.createToast2'))
        return
      }
      if (this.pwd !== this.pwd2) {
        this.$toast(this.$t('page.user.createToast3'))
        return false
      }
      getAddress().then(function (res) {
        // console.log(res)
        let tempAccount = {
          address: res.address,
          mnemonic: res.mnemonic,
          privateKey: res.privateKey,
          pwd: _this.pwd,
          name: _this.name,
          pt: _this.pt
        }
        // console.log(tempAccount)
        _this.$store.commit('setTempAccount', tempAccount)
        _this.$router.replace({ path: 'backup' })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.box {
  width: 94%;
  margin: auto;
  .warning {
    // height: 60px;
    border-radius: 3px;
    box-shadow: 0 0 5px #888888;
    margin-top: 30px;
    position: relative;
    .mark {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 20px;
      background-color: #d64f4f;
      border-radius: 3px;
      div {
        text-align: center;
        width: 100%;
        height: 100%;
        display: table;
        div {
          font-size: 30px;
          color: white;
          display: table-cell;
          vertical-align: middle;
        }
      }
    }
    .text {
      font-size: 12px;
      padding: 5px 5px 5px 30px;
      p {
        margin: 10px 0;
        line-height: 13px;
        span {
          color: #d64f4f;
          font-weight: 600;
        }
      }
    }
  }
  .form {
    margin-top: 30px;
    button {
      width: 50%;
      margin: 50px 25% 0;
    }
    p {
      color: #d64f4f;
      font-size: 10px;
    }
    /deep/.mint-cell-wrapper {
      border: 1px solid #888888;
      border-radius: 3px;
      margin-top: 20px;
    }
    /deep/.mint-field-other {
      font-size: 12px;
    }
    .iconfont::before {
      font-size: 16px;
      color: #888888;
    }
  }
}
</style>
