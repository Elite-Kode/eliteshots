import Vue from 'vue'
import Vuex from 'vuex'

import themes from '@/store/modules/themes'
import auth from '@/store/modules/auth'
import users from '@/store/modules/users'
import images from '@/store/modules/images'
import admin from '@/store/modules/admin'
import albums from '@/store/modules/albums'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    themes,
    auth,
    users,
    images,
    admin,
    albums
  }
})
