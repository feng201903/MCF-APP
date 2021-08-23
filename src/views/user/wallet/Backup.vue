<template>
  <div class="backup">
    <div class="step step1" v-show="step===1">
      <img src="@/assets/images/logo.png">
      <h3>{{$t('user.backup.text1')}}</h3>
      <p>{{$t('user.backup.text2')}}</p>
    </div>

    <div class="step step2" v-show="step===2">
      <h4>{{$t('user.backup.text4')}}</h4>
      <div class="tips">
        <p>{{$t('user.backup.text5')}}</p>
        <p><span class="warning">{{$t('user.backup.text6')}}</span>{{$t('user.backup.text7')}}</p>
      </div>
      <div class="words">{{tempAccount.mnemonic}}</div>
    </div>

    <div class="step step3" v-show="step===3">
      <h4>{{$t('user.backup.text10')}}</h4>
      <div class="words-box" id="str-mnemonic">{{strMnemonic}}</div>
      <div class="words-select-box">
        <div class="select-item" v-for="(item,index) in arrMnemonic" :key="index" @click="selectWord(item,index)">{{ item }}</div>
      </div>
    </div>

    <van-dialog v-model="show" :title="$t('mcf.enterPwd')" show-cancel-button @confirm="confirm" :confirmButtonText="$t('common.btnConfirm')" :cancelButtonText="$t('common.btnCancel')">
      <input type="password" class="password-input" v-model="password" />
    </van-dialog>

    <div class="btn">
      <van-button round block type="info" @click="resetWords" v-if="step===3" color="#FFBE4E" style="margin-bottom:10px">{{$t('user.backup.reset')}}</van-button>
      <van-button round block type="info" @click="nextStep">{{btnText}}</van-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      step: 1,
      show: false,
      password: '',
      btnText: this.$t('user.backup.startBackup'),
      tempAccount: this.$mcf.getStorage('tempAccount'),
      strMnemonic: '',
      arrMnemonic: []
    }
  },
  methods: {
    nextStep() {
      console.log(this.step)
      if (this.step === 1) {
        this.show = true
      } else if (this.step === 2) {
        this.step += 1
        this.btnText = this.$t('user.backup.ok')
      } else if (this.step === 3) {
        if (this.strMnemonic === this.tempAccount.mnemonic) {
          let accountList = this.$mcf.getStorage('accountList')
          let accountInfo = {
            name: this.tempAccount.name,
            address: this.tempAccount.address,
            pwdHints: this.tempAccount.pwdHints,
            code: this.tempAccount.code
          }
          if (accountList.length === 0) {
            localStorage.setItem('defaultAccount', JSON.stringify(accountInfo))
          }
          accountList.push(accountInfo)
          localStorage.setItem('accountList', JSON.stringify(accountList))
          localStorage.removeItem('tempAccount')
          this.$notify({ type: 'success', message: this.$t('user.backup.text8') })
          this.$router.push({ path: '/user/wallet' })
        } else {
          this.$notify({ type: 'danger', message: this.$t('user.backup.text9') })
        }
      }
    },
    subCreate() {

    },
    confirm() {
      if (this.password === this.tempAccount.password) {
        this.step += 1
        this.btnText = this.$t('user.backup.next')
        this.$dialog.alert({
          title: this.$t('user.backup.warning'),
          message: this.$t('user.backup.text3'),
          confirmButtonText: this.$t('common.btnConfirm')
        })
      } else {
        this.$notify({ type: 'danger', message: this.$t('mcf.pwdError') })
      }
    },
    resetWords() {
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
    selectWord(word, index) {
      document.getElementsByClassName('select-item')[index].disabled = true
      document.getElementsByClassName('select-item')[index].classList.add('select-item-disabled')
      if (this.strMnemonic.length === 0) {
        this.strMnemonic = word
      } else {
        this.strMnemonic += ' ' + word
      }
    },
  },
  created() {
    if (!this.tempAccount.address) {
      this.$router.push({ path: 'create' })
    } else {
      this.resetWords()
    }
  }
}
</script>

<style lang="less" scoped>
.backup {
  padding: 0 5%;
}
.step {
  margin-top: 16px;
  text-align: center;
}
h3,
h4 {
  margin: 20px;
}
.step1 {
  img {
    width: 40%;
  }

  p {
    font-size: 13px;
  }
}
.step2 {
  .words {
    text-align: left;
    margin-top: 20px;
    word-spacing: 10px;
    background-color: #fff9eb;
    box-shadow: 0 2px 5px #888888;
    padding: 10px;
    line-height: 30px;
  }
}
.step3 {
  .words-box {
    // word-spacing: 10px;
    border: 1px solid #888888;
    padding: 10px;
    line-height: 30px;
    min-height: 60px;
    border-radius: 3px;
    text-align: left;
  }
  .words-select-box {
    margin-top: 20px;
    background-color: #fff9eb;
    font-size: 13px;
    box-shadow: 0 2px 5px #888888;
    padding: 10px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    .select-item {
      width: 23%;
      height: 30px;
      margin: 1%;
      background-color: #5b85ff;
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-radius: 3px;
      &.select-item-disabled {
        background-color: #cecece;
      }
    }
  }
}
.btn {
  position: fixed;
  bottom: 20px;
  width: 90%;
}
.password-input {
  width: 76%;
  margin: 10px 10%;
  padding: 5px 2%;
  outline-style: none;
  border: 1px solid #ccc;
  border-radius: 3px;
}
.tips {
  position: relative;
  padding: 10px 0px 10px 8%;
  font-size: 12px;
  border-radius: 10px;
  text-align: left;
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
</style>