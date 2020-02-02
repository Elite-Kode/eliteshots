import axios from 'axios'

const state = {
  albums: [],
  images: [],
  liked: [],
  saved: [],
  viewed: []
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
  setViewed (state, images) {
    state.viewed = images
  },
  addImages (state, images) {
    state.images.push(...images)
  },
  addLiked (state, images) {
    state.liked.push(...images)
  },
  addSaved (state, images) {
    state.saved.push(...images)
  },
  addViewed (state, images) {
    state.viewed.push(...images)
  },
  terminateImages (state) {
    state.images = []
  },
  terminateLiked (state) {
    state.liked = []
  },
  terminateSaved (state) {
    state.saved = []
  },
  terminateViewed (state) {
    state.viewed = []
  },
  increaseViewCount (state, { imageItem, authenticated }) {
    let index = state.images ? state.images.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        state.images[index].no_of_views = ++state.images[index].no_of_views || 1
      } else {
        state.images[index].anonymous_views = ++state.images[index].anonymous_views || 1
      }
    }
    index = state.liked ? state.liked.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        state.liked[index].no_of_views = ++state.liked[index].no_of_views || 1
      } else {
        state.liked[index].anonymous_views = ++state.liked[index].anonymous_views || 1
      }
    }
    index = state.saved ? state.saved.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        state.saved[index].no_of_views = ++state.saved[index].no_of_views || 1
      } else {
        state.saved[index].anonymous_views = ++state.saved[index].anonymous_views || 1
      }
    }
  },
  likeImage (state, { imageItem, authenticated }) {
    let index = state.images ? state.images.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.images[index].self_like) {
          state.images[index].no_of_likes = --state.images[index].no_of_likes || 0
        } else {
          state.images[index].no_of_likes = ++state.images[index].no_of_likes || 1
        }
        state.images[index].self_like = !state.images[index].self_like
      }
    }
    index = state.liked ? state.liked.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.liked[index].self_like) {
          state.liked[index].no_of_likes = --state.liked[index].no_of_likes || 0
        } else {
          state.liked[index].no_of_likes = ++state.liked[index].no_of_likes || 1
        }
        state.liked[index].self_like = !state.liked[index].self_like
      }
    }
    index = state.saved ? state.saved.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.saved[index].self_like) {
          state.saved[index].no_of_likes = --state.saved[index].no_of_likes || 0
        } else {
          state.saved[index].no_of_likes = ++state.saved[index].no_of_likes || 1
        }
        state.saved[index].self_like = !state.saved[index].self_like
      }
    }
  },
  saveImage (state, { imageItem, authenticated }) {
    let index = state.images ? state.images.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.images[index].self_save) {
          state.images[index].no_of_saves = --state.images[index].no_of_saves || 0
        } else {
          state.images[index].no_of_saves = ++state.images[index].no_of_saves || 1
        }
        state.images[index].self_save = !state.images[index].self_save
      }
    }
    index = state.liked ? state.liked.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.liked[index].self_save) {
          state.liked[index].no_of_saves = --state.liked[index].no_of_saves || 0
        } else {
          state.liked[index].no_of_saves = ++state.liked[index].no_of_saves || 1
        }
        state.liked[index].self_save = !state.liked[index].self_save
      }
    }
    index = state.saved ? state.saved.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.saved[index].self_save) {
          state.saved[index].no_of_saves = --state.saved[index].no_of_saves || 0
        } else {
          state.saved[index].no_of_saves = ++state.saved[index].no_of_saves || 1
        }
        state.saved[index].self_save = !state.saved[index].self_save
      }
    }
  },
  editImage (state, { imageId, title, description, authenticated }) {
    let index = state.images ? state.images.findIndex(image => {
      return image._id === imageId
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        state.images[index].title = title
        state.images[index].title_lower = title.toLowerCase()
        state.images[index].description = description
        state.images[index].description_lower = description.toLowerCase()
      }
    }
    index = state.liked ? state.liked.findIndex(image => {
      return image._id === imageId
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        state.liked[index].title = title
        state.liked[index].title_lower = title.toLowerCase()
        state.liked[index].description = description
        state.liked[index].description_lower = description.toLowerCase()
      }
    }
    index = state.saved ? state.saved.findIndex(image => {
      return image._id === imageId
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        state.saved[index].title = title
        state.saved[index].title_lower = title.toLowerCase()
        state.saved[index].description = description
        state.saved[index].description_lower = description.toLowerCase()
      }
    }
  },
  deleteImage (state, { imageItem, authenticated }) {
    let index = state.images ? state.images.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        state.images.splice(index, 1)
      }
    }
    index = state.liked ? state.liked.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        state.liked.splice(index, 1)
      }
    }
    index = state.saved ? state.saved.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        state.saved.splice(index, 1)
      }
    }
  }
}
const actions = {
  async retryUpload (context, { title, description, album, file }) {
    let formData = new FormData()
    formData.append('screenshot', file)
    formData.append('imageTitle', title)
    formData.append('imageDescription', description)

    if (album) {
      formData.append('albumTitle', album)
    }
    return axios.post('/frontend/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  async fetchAlbums ({ commit }) {
    let response = await axios.get('/frontend/albums/self')
    let albums = response.data
    commit('setAlbums', albums)
    return albums
  },
  async fetchImages ({ commit }, last) {
    let response = await axios.get('/frontend/images/self', { params: { last } })
    let images = response.data
    if (last) {
      commit('addImages', images)
    } else {
      commit('setImages', images)
    }
    return images
  },
  async fetchLikedImages ({ commit }, last) {
    let response = await axios.get('/frontend/images/self/liked', { params: { last } })
    let images = response.data
    if (last) {
      commit('addLiked', images)
    } else {
      commit('setLiked', images)
    }
    return images
  },
  async fetchSavedImages ({ commit }, last) {
    let response = await axios.get('/frontend/images/self/saved', { params: { last } })
    let images = response.data
    if (last) {
      commit('addSaved', images)
    } else {
      commit('setSaved', images)
    }
    return images
  },
  async fetchViewedImages ({ commit }, last) {
    let response = await axios.get('/frontend/images/self/viewed', { params: { last } })
    let images = response.data
    if (last) {
      commit('addViewed', images)
    } else {
      commit('setViewed', images)
    }
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
  async triggerUserImageEdited ({ commit, rootState }, { imageId, title, description }) {
    await axios.put(`/frontend/images/${imageId}/edit`, { title, description })
    commit('editImage', { imageId, title, description, authenticated: rootState.auth.authenticated })
  },
  async triggerUserImageDeleted ({ commit, rootState }, imageItem) {
    await axios.delete(`/frontend/images/${imageItem._id}`)
    commit('deleteImage', { imageItem, authenticated: rootState.auth.authenticated })
  }
}

export default {
  state,
  mutations,
  actions
}
