<template>
  <div>
    <mt-tab-container v-model="active">
      <mt-tab-container-item id="step1">
        <div class="step step1">
          <img src="@/assets/images/logo.png">
          <h3>{{$t('page.user.BackupText1')}}</h3>
          <p>{{$t('page.user.BackupText2')}}</p>
          <div class="btn-group">
            <button class="mcf-btn btn-blue" @click="backup">{{$t('page.user.btnBackup')}}</button>
          </div>
        </div>
      </mt-tab-container-item>

      <mt-tab-container-item id="step2">
        <div class="step step2">
          <h4>{{$t('page.user.BackupText3')}}</h4>
          <div class="warning">
            <div class="mark">
              <div>
                <div>!</div>
              </div>
            </div>
            <div class="text">
              <p>{{$t('page.user.BackupText4')}}</p>
              <p><span>{{$t('page.user.BackupText5')}}</span>{{$t('page.user.BackupText6')}}</p>
            </div>
          </div>
          <div class="words">{{mnemonic}}</div>
          <div class="btn-group">
            <button class="mcf-btn btn-blue" @click="step = 3">{{$t('page.user.btnNext')}}</button>
          </div>
        </div>
      </mt-tab-container-item>

      <mt-tab-container-item id="step3">
        <div class="step step3">
          <h4>{{$t('page.user.BackupText8')}}</h4>
          <div class="words-box" id="str-mnemonic">{{strMnemonic}}</div>
          <div class="words-select-box">
            <button class="select-item" v-for="(item,index) in arrMnemonic" :key="index" @click="selectWord(item,index)">{{ item }}</button>
          </div>
          <div class="btn-group">
            <button class="mcf-btn btn-blue" @click="subCreate">{{$t('page.trade.btnConfirm')}}</button>
            <button class="mcf-btn btn-orange" @click="upsetWords">{{$t('page.user.btnReset')}}</button>
          </div>
        </div>
      </mt-tab-container-item>
    </mt-tab-container>
  </div>
</template>

<script>
import { encryptPwd } from '@/assets/js/utils.js'
export default {
  data () {
    return {
      step: 1,
      active: 'step1',
      mnemonic: '',
      arrMnemonic: '',
      strMnemonic: ''
    }
  },
  methods: {
    backup () {
      this.$messagebox.prompt(' ', this.$t('page.trade.promptTitle'), { inputType: 'password', confirmButtonText: this.$t('page.trade.btnConfirm'), cancelButtonText: this.$t('page.trade.btnCancel') }).then(({ value, action }) => {
        if (this.tempAccount.pwd === value) {
          this.step = 2
          this.mnemonic = this.tempAccount.mnemonic
        } else {
          this.$toast(this.$t('page.trade.toast2'))
        }
      })
    },
    upsetWords () {
      this.strMnemonic = ''
      if (this.tempAccount.mnemonic) {
        this.arrMnemonic = this.tempAccount.mnemonic.trim().split(' ').sort(function () {
          return 0.5 - Math.random()
        })
      }
      var x = document.getElementsByClassName('select-item')
      for (let i = 0; i < x.length; i++) {
        x[i].disabled = false
        x[i].classList.remove('select-item-disabled')
      }
    },
    selectWord (word, index) {
      document.getElementsByClassName('select-item')[index].disabled = true
      document.getElementsByClassName('select-item')[index].classList.add('select-item-disabled')
      if (this.strMnemonic.length === 0) {
        this.strMnemonic = word
      } else {
        this.strMnemonic += ' ' + word
      }
    },
    subCreate () {
      let mnemonic = document.getElementById('str-mnemonic').innerHTML
      // console.log(mnemonic)
      // console.log(this.tempAccount.mnemonic)
      if (mnemonic === this.tempAccount.mnemonic) {
        this.$messagebox.confirm(this.$t('page.user.BackupText11'), this.$t('page.user.BackupText12'), { showCancelButton: false, confirmButtonText: this.$t('page.trade.btnConfirm') }).then(action => {
          var isDefault = false
          var code = encryptPwd(this.tempAccount.privateKey, this.tempAccount.pwd, this.salt)
          var AccountList = JSON.parse(localStorage.getItem('AccountList')) || []
          if (AccountList.length === 0) {
            isDefault = true
          }
          var addressInfo = {
            name: this.tempAccount.name,
            address: this.tempAccount.address,
            pt: this.tempAccount.pt,
            code: code,
            isDefault: isDefault
          }
          // console.log(addressInfo)
          AccountList.push(addressInfo)
          // console.log(AccountList)
          localStorage.setItem('AccountList', JSON.stringify(AccountList))
          this.$router.replace({ path: 'wallet' })
        })
      } else {
        this.upsetWords()
        this.$messagebox.alert(this.$t('page.user.BackupText10'), this.$t('page.user.BackupText9'), { confirmButtonText: this.$t('page.trade.btnConfirm') })
      }
    }
  },
  computed: {
    tempAccount () {
      return this.$store.state.tempAccount
    },
    salt () {
      return this.$store.getters.salt
    }
  },
  watch: {
    step (newValue, oldValue) {
      this.active = 'step' + newValue
      if (newValue === 2) {
        this.$messagebox.confirm(this.$t('page.user.BackupText7'), this.$t('page.user.warning'), { showCancelButton: false, confirmButtonText: this.$t('page.trade.btnConfirm') }).then(action => {

        })
      }
    }
  },
  created () {
    if (!this.tempAccount.address) {
      this.$router.push({ path: 'create' })
    } else {
      this.upsetWords()
    }
  }
}
</script>

<style lang="less" scoped>
.step {
  padding: 20px 10px;
  .btn-group {
    width: 50%;
    position: fixed;
    bottom: 50px;
    left: 25%;
  }
  .mcf-btn {
    width: 100%;
    margin-top: 20px;
  }
  h3,
  h4 {
    color: #888888;
    text-align: center;
  }
  &.step1 {
    text-align: center;
    img {
      width: 50%;
    }
    p {
      font-size: 13px;
      span {
        color: #d64f4f;
      }
    }
  }
  &.step2 {
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
    .words {
      text-align: left;
      margin-top: 20px;
      word-spacing: 10px;
      background-color: #fff9eb;
      box-shadow: 0 0 5px #888888;
      padding: 10px;
      line-height: 30px;
    }
  }
  &.step3 {
    .words-box {
      word-spacing: 10px;
      border: 1px solid #888888;
      padding: 10px;
      line-height: 30px;
      height: 90px;
    }
    .words-select-box {
      margin-top: 20px;
      background-color: #fff9eb;
      box-shadow: 0 0 5px #888888;
      padding: 10px;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      .select-item {
        width: 23%;
        height: 30px;
        background-color: #5b85ff;
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin: 1%;
        border: 0px;
        &.select-item-disabled {
          background-color: #cecece;
        }
      }
    }
  }
}

// .words-select-box {
//   margin-top: 20px;
//   background-color: #fff9eb;
//   box-shadow: 0 0 5px #888888;
//   padding: 10px;
//   display: flex;
//   flex-wrap: wrap;
//   justify-content: center;
//   align-items: center;
// }
</style>
