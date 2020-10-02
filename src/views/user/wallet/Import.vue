<template>
  <div class="contain">
    <h3>{{ $t('page.user.mnemonic') }}</h3>
    <textarea rows="3" :placeholder="$t('page.user.importText1')" v-model="mnemonic"></textarea>
    <h3>{{ $t('page.user.setPassword') }}</h3>
    <mt-field :placeholder="$t('page.user.password')" :type="inputType" v-model="pwd" disableClear><i class="iconfont icon-yanjing" @click="changeShowPwd"></i></mt-field>
    <p>{{ $t('page.user.passwordText') }}</p>
    <mt-field :placeholder="$t('page.user.repeatPassword')" type="password" v-model="pwd2" disableClear></mt-field>
    <mt-field :placeholder="$t('page.user.passwordReminder')" type="text" v-model="pt" disableClear></mt-field>
    <button class="mcf-btn btn-blue" @click="importAcc">{{ $t('page.user.btnImport2') }}</button>
    <div class="btn-group">

    </div>
  </div>
</template>

<script>
import { getAddress, encryptPwd } from '@/assets/js/utils.js'
export default {
  data () {
    return {
      // mnemonic: 'success sibling anger together demise coach benefit bench visit fall muscle kit',
      mnemonic: '',
      pwd: '',
      pwd2: '',
      pt: '',
      showPwd: false
    }
  },
  computed: {
    inputType () {
      return this.showPwd ? 'text' : 'password'
    },
    salt () {
      return this.$store.getters.salt
    }
  },
  methods: {
    changeShowPwd () {
      this.showPwd = !this.showPwd
    },
    importAcc () {
      var _this = this
      var regex = new RegExp(
        '^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-ZW_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-zW_!@#$%^&*`~()-+=]+$)(?![0-9W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9W_!@#$%^&*`~()-+=]{8,24}$'
      )
      if (this.pwd === '' || this.pwd2 === '') {
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
      getAddress(_this.mnemonic).then(function (res) {
        var isDefault = false
        var code = encryptPwd(res.privateKey, _this.pwd, _this.salt)
        var AccountList = JSON.parse(localStorage.getItem('AccountList')) || []
        for (let i = 0; i < AccountList.length; i++) {
          if (AccountList[i].address === res.address) {
            isDefault = AccountList[i].isDefault
            AccountList.splice(i, 1)
          }
        }
        if (AccountList.length === 0) {
          isDefault = true
        }
        var addressInfo = {
          name: '新钱包',
          address: res.address,
          pt: _this.pt,
          code: code,
          isDefault: isDefault
        }
        console.log(addressInfo)
        AccountList.push(addressInfo)
        console.log(AccountList)
        localStorage.setItem('AccountList', JSON.stringify(AccountList))
        _this.$toast('导入成功')
        _this.$router.push({ path: 'wallet' })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.contain {
  padding: 20px 10px;
}
textarea {
  padding: 15px 5%;
  width: 90%;
  font-size: 15px;
}
/deep/ .mint-cell-wrapper {
  border: 1px solid #888888;
  border-radius: 3px;
  margin-top: 20px;
}
/deep/ .mint-field-other {
  font-size: 12px;
}
.form .iconfont::before {
  font-size: 16px;
  color: #888888;
}
p {
  color: #d64f4f;
  font-size: 10px;
}
.btn-group {
  width: 50%;
  position: fixed;
  bottom: 50px;
  left: 25%;
}
.mcf-btn {
  width: 50%;
  margin: 50px 25% 0;
}
</style>
