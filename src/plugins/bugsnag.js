import Vue from 'vue'
import bugsnag from '@bugsnag/js'
import bugsnagVue from '@bugsnag/plugin-vue'
import token from '../../secrets'
import version from '../version'

const bugsnagClient = bugsnag({
  apiKey: token.bugsnag_token_vue,
  notifyReleaseStages: ['development', 'production'],
  collectUserIp: false,
  appVersion: version
})
bugsnagClient.use(bugsnagVue, Vue)
