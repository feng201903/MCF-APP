/* eslint-disable */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    tempAccount: {}
  },
  mutations: {
    setTempAccount(state, obj) {
      state.tempAccount = obj
    }
  },
  getters: {
    salt() {
      if (localStorage.getItem('salt')) {
        return localStorage.getItem('salt')
      } else {
        nacl_factory.instantiate(function (nacl) {
          var salt = nacl.to_hex(nacl.crypto_secretbox_random_nonce())
          localStorage.setItem('salt', salt)
          return salt
        })
      }
    }
  },
  actions: {

  }
})
