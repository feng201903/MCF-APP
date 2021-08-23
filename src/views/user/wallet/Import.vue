<template>
  <div style="margin: 16px 0;">
    <van-form @submit="onSubmit">
      <van-field v-model=" mnemonic" name="mnemonic" rows="3" autosize :label="$t('user.import.mnemonic')" type="textarea" :placeholder="$t('user.import.enterMnemonic')" :rules="[
          { required: true },
          { validator: validateMnemonic, message: $t('user.import.mnemonicError') }
        ]" />
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
        <van-button round block type="info" native-type="submit">{{$t('user.import.btnImport')}}</van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
import { Mnemonic } from '@/assets/js/jsbip39'
export default {
  data() {
    return {
      mnemonic: '',
      password: '',
      password2: '',
      pwdHints: '',
      showPwd: false,
      pattern: /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-ZW_!.@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-zW_!.@#$%^&*`~()-+=]+$)(?![0-9W_!.@#$%^&*`~()-+=]+$)[a-zA-Z0-9W_!.@#$%^&*`~()-+=]{8,24}$/
    }
  },
  methods: {
    async onSubmit(values) {
      console.log(values)
      try {
        let accountList = this.$mcf.getStorage('accountList')
        let account = await this.$mcf.generateAddress(values.mnemonic)
        let code = this.$mcf.encryptPwd(account.privateKey, values.password)
        let accountInfo = {
          name: 'wallet',
          address: account.address,
          pwdHints: this.pwdHints,
          code: code
        }
        if (accountList.length === 0) {
          localStorage.setItem('defaultAccount', JSON.stringify(accountInfo))
        }
        for (let i = 0; i < accountList.length; i++) {
          if (accountList[i].address === accountInfo.address) {
            accountList.splice(i, 1)
          }
        }
        accountList.push(accountInfo)
        localStorage.setItem('accountList', JSON.stringify(accountList))
        this.$notify({ type: 'success', message: this.$t('user.import.success') })
        this.$router.replace({ path: '/user/wallet' })
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
</style>