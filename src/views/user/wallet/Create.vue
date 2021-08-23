<template>
  <div class="create">
    <div class="tips">
      <p>{{$t('user.create.text1')}} <span class="warning">{{$t('user.create.text2')}}</span></p>
      <p>MCF <span class="warning">{{$t('user.create.text3')}}</span> {{$t('user.create.text4')}}</p>
    </div>
    <van-form @submit="onSubmit" style="margin-top:20px">
      <van-field v-model="name" name="name" :label="$t('user.create.walletName')" type="text" :placeholder="$t('user.create.enterName')" :rules="[{ required: true }]" />
      <van-field v-model="password" name="password" :type="showPwd?'text':'password'" :rules="[
          { required: true },
          { pattern, message: $t('user.create.error1') }
        ]" :label="$t('user.create.password')" right-icon="eye-o" @click-right-icon="showPwd=!showPwd" :placeholder="$t('user.create.enterPwd')" />
      <van-field v-model="password2" name="password2" type="password" :label="$t('user.create.repeatPassword')" :placeholder="$t('user.create.enterRepeatPwd')" :rules="[
          { required: true },
          { validator: validatePassword, message: $t('user.create.error2') }
        ]" />
      <van-field v-model="pwdHints" name="pwdHints" :label="$t('user.create.passwordReminder')" :placeholder="$t('user.create.enterPasswordReminder')" />
      <div style="margin: 16px;">
        <van-button round block type="info" native-type="submit">{{$t('user.create.btnCreate')}}</van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      password: '',
      password2: '',
      pwdHints: '',
      showPwd: false,
      pattern: /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-ZW_!.@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-zW_!.@#$%^&*`~()-+=]+$)(?![0-9W_!.@#$%^&*`~()-+=]+$)[a-zA-Z0-9W_!.@#$%^&*`~()-+=]{8,24}$/
    }
  },
  methods: {
    async onSubmit(values) {
      try {
        let account = await this.$mcf.generateAddress()
        let code = this.$mcf.encryptPwd(account.privateKey, values.password)
        let tempAccount = {
          ...values,
          ...account,
          code
        }
        console.log(tempAccount)
        localStorage.setItem('tempAccount', JSON.stringify(tempAccount))
        this.$router.push({ path: '/user/wallet/backup' })
      } catch (error) {
        console.log(error)
        if (error.err_message) {
          this.$notify({ type: 'danger', message: error.err_message })
        }
      }

    },
    validateMnemonic(value) {
      let mnemo = new Mnemonic("english")
      return mnemo.revertEntropy(value)
    },
    validatePassword() {
      return this.password === this.password2
    }
  },
}
</script>

<style lang="less" scoped>
.create {
  padding-top: 16px;
  .tips {
    position: relative;
    padding: 10px 0px 10px 8%;
    margin: 0 5%;
    font-size: 12px;
    border-radius: 10px;
    background-color: white;
    box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.1);
    &::before {
      content: "!";
      position: absolute;
      left: 0;
      padding-left: 3%;
      font-size: 35px;
      font-weight: bold;
      color: red;
      top: 50%;
      transform: translate(0, -50%);
    }
    p {
      margin: 10px 0;
      line-height: 13px;
      .warning {
        color: red;
      }
    }
  }
}
</style>