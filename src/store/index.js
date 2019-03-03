import Vue from 'vue'
import Vuex from 'vuex'

import themes from '@/store/modules/themes'
import auth from '@/store/modules/auth'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    themes,
    auth
  }
})
