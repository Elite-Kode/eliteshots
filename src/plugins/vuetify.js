import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import colors from 'vuetify/es5/util/colors'

Vue.use(Vuetify, {
  theme: {
    primary: colors.deepOrange.base,
    secondary: colors.lightBlue.base,
    accent: colors.orange.base,
    error: colors.red.base,
    warning: colors.yellow.base,
    info: colors.indigo.base,
    success: colors.green.base
  },
  options: {
    customProperties: true
  }
})

export default new Vuetify({})
