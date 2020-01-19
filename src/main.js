import Vue from 'vue'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import './plugins/bugsnag'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
