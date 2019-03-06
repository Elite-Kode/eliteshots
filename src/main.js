import Vue from 'vue'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import './plugins/bugsnag'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
