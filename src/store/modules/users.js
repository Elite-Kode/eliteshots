import axios from 'axios'

const state = {
  albums: [],
  images: []
}
const mutations = {
  setAlbums (state, albums) {
    state.albums = albums
  },
  setImages (state, images) {
    state.images = images
  }
}
const actions = {
  async fetchAlbums ({ commit }) {
    let response = await axios.get('/frontend/albums/self')
    let albums = response.data
    commit('setAlbums', albums)
    return albums
  },
  async fetchImages ({ commit }) {
    let response = await axios.get('/frontend/images/self')
    let images = response.data
    commit('setImages', images)
    return images
  }
}

export default {
  state,
  mutations,
  actions
}
