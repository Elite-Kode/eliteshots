import axios from 'axios'

const state = {
  publicProfileImages: [],
  publicProfileUser: {}
}
const mutations = {
  setPublicProfileImages (state, publicProfileImages) {
    state.publicProfileImages = publicProfileImages
  },
  setPublicProfileUser (state, publicProfileUser) {
    state.publicProfileUser = publicProfileUser
  },
  addPublicProfileImages (state, publicProfileImages) {
    state.publicProfileImages.push(...publicProfileImages)
  },
  terminatePublicProfileImages (state) {
    state.publicProfileImages = []
  },
  increaseViewCount (state, { imageItem, authenticated }) {
    let index = state.publicProfileImages ? state.publicProfileImages.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        state.publicProfileImages[index].no_of_views = ++state.publicProfileImages[index].no_of_views || 1
      } else {
        state.publicProfileImages[index].anonymous_views = ++state.publicProfileImages[index].anonymous_views || 1
      }
    }
  },
  likeImage (state, { imageItem, authenticated }) {
    let index = state.publicProfileImages ? state.publicProfileImages.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.publicProfileImages[index].self_like) {
          state.publicProfileImages[index].no_of_likes = --state.publicProfileImages[index].no_of_likes || 0
        } else {
          state.publicProfileImages[index].no_of_likes = ++state.publicProfileImages[index].no_of_likes || 1
        }
        state.publicProfileImages[index].self_like = !state.publicProfileImages[index].self_like
      }
    }
  },
  saveImage (state, { imageItem, authenticated }) {
    let index = state.publicProfileImages ? state.publicProfileImages.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.publicProfileImages[index].self_save) {
          state.publicProfileImages[index].no_of_saves = --state.publicProfileImages[index].no_of_saves || 0
        } else {
          state.publicProfileImages[index].no_of_saves = ++state.publicProfileImages[index].no_of_saves || 1
        }
        state.publicProfileImages[index].self_save = !state.publicProfileImages[index].self_save
      }
    }
  }
}
const actions = {
  async fetchPublicProfileImages ({ commit }, { userId, last }) {
    let response = await axios.get(`/frontend/users/${userId}/images`, { params: { last } })
    let images = response.data
    if (last) {
      commit('addPublicProfileImages', images)
    } else {
      commit('setPublicProfileImages', images)
    }
    return images
  },
  async fetchPublicProfileUser ({ commit }, userId) {
    let response = await axios.get(`/frontend/users/${userId}`)
    let user = response.data
    commit('setPublicProfileUser', user)
    return user
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
  }
}

export default {
  state,
  mutations,
  actions
}
