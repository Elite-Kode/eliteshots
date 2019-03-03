import axios from 'axios'

const state = {
  authenticated: false
}
const mutations = {
  setAuthenticated (state, authenticated) {
    state.authenticated = authenticated
  }
}
const actions = {
  async checkAuthenticated ({ commit }) {
    let response = await axios.get('/auth/check')
    let isAuthenticated = response.data
    commit('setAuthenticated', isAuthenticated)
    return isAuthenticated
  }
}

export default {
  state,
  mutations,
  actions
}
