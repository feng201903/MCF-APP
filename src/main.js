import Vue from 'vue'
import './cube-ui'
import App from './App.vue'
import router from './router'
import Vant from 'vant';
import VueClipboard from 'vue-clipboard2'
import VueI18n from 'vue-i18n'
import api from './api/api'
import mcf from '@/utils/mcf'

import 'vant/lib/index.css';
import '@/assets/css/iconfont/iconfont.css'
import '@/utils/appback.js'

Vue.use(Vant);
VueClipboard.config.autoSetContainer = true
Vue.use(VueClipboard)
Vue.use(VueI18n)
Vue.prototype.$api = api
Vue.prototype.$mcf = mcf
Vue.config.productionTip = false

const i18n = new VueI18n({
  locale: 'en',
  messages: {
    'zh': require('./lang/zh.js'),
    'en': require('./lang/en.js')
  }
})

window.vm = new Vue({
  i18n,
  router,
  render: h => h(App)
}).$mount('#app')
