import axios from 'axios'

const state = {
  albums: [],
  images: [],
  liked: [],
  saved: []
}
const mutations = {
  setAlbums (state, albums) {
    state.albums = albums
  },
  setImages (state, images) {
    state.images = images
  },
  setLiked (state, images) {
    state.liked = images
  },
  setSaved (state, images) {
    state.saved = images
  },
  increaseViewCount (state, { imageItem, authenticated }) {
    let index = state.images.data ? state.images.data.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        state.images.data[index].no_of_views = ++state.images.data[index].no_of_views || 1
      } else {
        state.images.data[index].anonymous_views = ++state.images.data[index].anonymous_views || 1
      }
    }
    index = state.liked.data ? state.liked.data.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        state.liked.data[index].no_of_views = ++state.liked.data[index].no_of_views || 1
      } else {
        state.liked.data[index].anonymous_views = ++state.liked.data[index].anonymous_views || 1
      }
    }
    index = state.saved.data ? state.saved.data.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        state.saved.data[index].no_of_views = ++state.saved.data[index].no_of_views || 1
      } else {
        state.saved.data[index].anonymous_views = ++state.saved.data[index].anonymous_views || 1
      }
    }
  },
  likeImage (state, { imageItem, authenticated }) {
    let index = state.images.data ? state.images.data.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.images.data[index].self_like) {
          state.images.data[index].no_of_likes = --state.images.data[index].no_of_likes || 0
        } else {
          state.images.data[index].no_of_likes = ++state.images.data[index].no_of_likes || 1
        }
        state.images.data[index].self_like = !state.images.data[index].self_like
      }
    }
    index = state.liked.data ? state.liked.data.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.liked.data[index].self_like) {
          state.liked.data[index].no_of_likes = --state.liked.data[index].no_of_likes || 0
        } else {
          state.liked.data[index].no_of_likes = ++state.liked.data[index].no_of_likes || 1
        }
        state.liked.data[index].self_like = !state.liked.data[index].self_like
      }
    }
    index = state.saved.data ? state.saved.data.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.saved.data[index].self_like) {
          state.saved.data[index].no_of_likes = --state.saved.data[index].no_of_likes || 0
        } else {
          state.saved.data[index].no_of_likes = ++state.saved.data[index].no_of_likes || 1
        }
        state.saved.data[index].self_like = !state.saved.data[index].self_like
      }
    }
  },
  saveImage (state, { imageItem, authenticated }) {
    let index = state.images.data ? state.images.data.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.images.data[index].self_save) {
          state.images.data[index].no_of_saves = --state.images.data[index].no_of_saves || 0
        } else {
          state.images.data[index].no_of_saves = ++state.images.data[index].no_of_saves || 1
        }
        state.images.data[index].self_save = !state.images.data[index].self_save
      }
    }
    index = state.liked.data ? state.liked.data.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.liked.data[index].self_save) {
          state.liked.data[index].no_of_saves = --state.liked.data[index].no_of_saves || 0
        } else {
          state.liked.data[index].no_of_saves = ++state.liked.data[index].no_of_saves || 1
        }
        state.liked.data[index].self_save = !state.liked.data[index].self_save
      }
    }
    index = state.saved.data ? state.saved.data.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.saved.data[index].self_save) {
          state.saved.data[index].no_of_saves = --state.saved.data[index].no_of_saves || 0
        } else {
          state.saved.data[index].no_of_saves = ++state.saved.data[index].no_of_saves || 1
        }
        state.saved.data[index].self_save = !state.saved.data[index].self_save
      }
    }
  }
}
const actions = {
  async fetchAlbums ({ commit }) {
    let response = await axios.get('/frontend/albums/self')
    let albums = response.data
    commit('setAlbums', albums)
    return albums
  },
  async fetchImages ({ commit }, page) {
    let response = await axios.get('/frontend/images/self', { params: { page } })
    let images = response.data
    commit('setImages', images)
    return images
  },
  async fetchLikedImages ({ commit }, page) {
    let response = await axios.get('/frontend/images/self/liked', { params: { page } })
    let images = response.data
    commit('setLiked', images)
    return images
  },
  async fetchSavedImages ({ commit }, page) {
    let response = await axios.get('/frontend/images/self/saved', { params: { page } })
    let images = response.data
    commit('setSaved', images)
    return images
  },
  async triggerUserImageViewed ({ commit, rootState }, imageItem) {
    await axios.put(`/frontend/images/${imageItem._id}/view`)
    commit('increaseViewCount', { imageItem, authenticated: rootState.auth.authenticated })
  },
  async triggerUserImageLiked ({ commit, rootState }, imageItem) {
    await axios.put(`/frontend/images/${imageItem._id}/like`)
    commit('likeImage', { imageItem, authenticated: rootState.auth.authenticated })
  },
  async triggerUserImageSaved ({ commit, rootState }, imageItem) {
    await axios.put(`/frontend/images/${imageItem._id}/save`)
    commit('saveImage', { imageItem, authenticated: rootState.auth.authenticated })
  },
  async triggerUserImageDeleted ({ commit, rootState }, imageItem) {
    await axios.delete(`/frontend/images/${imageItem._id}`)
    commit('saveImage', { imageItem, authenticated: rootState.auth.authenticated })
  }
}

export default {
  state,
  mutations,
  actions
}
