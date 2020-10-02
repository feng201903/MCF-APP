import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Mint from 'mint-ui'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueClipboard from 'vue-clipboard2'
import VueI18n from 'vue-i18n'

import 'mint-ui/lib/style.css'
// import '@/assets/css/iconfont/iconfont.css'
import '@/assets/css/base.css'

VueClipboard.config.autoSetContainer = true
axios.defaults.baseURL = 'http://node7.mcfamily.io:9888/'

Vue.use(VueClipboard)
Vue.use(Mint)
Vue.use(VueAxios, axios)
Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: 'zh',
  messages: {
    'zh': require('./lang/zh.js'),
    'en': require('./lang/en.js')
  }
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
