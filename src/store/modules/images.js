/*
 * KodeBlox Copyright 2019 Sayak Mukhopadhyay
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http: //www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import axios from 'axios'

const state = {
  popular: [],
  recents: [],
  curated: []
}
const mutations = {
  setPopular (state, popular) {
    state.popular = popular
  },
  setRecents (state, recents) {
    state.recents = recents
  },
  setCurated (state, curated) {
    state.curated = curated
  },
  increaseViewCount (state, { imageItem, authenticated }) {
    let index = state.popular.data ? state.popular.data.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        state.popular.data[index].no_of_views = ++state.popular.data[index].no_of_views || 1
      } else {
        state.popular.data[index].anonymous_views = ++state.popular.data[index].anonymous_views || 1
      }
    }
    index = state.recents.data ? state.recents.data.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        state.recents.data[index].no_of_views = ++state.recents.data[index].no_of_views || 1
      } else {
        state.recents.data[index].anonymous_views = ++state.recents.data[index].anonymous_views || 1
      }
    }
    index = state.curated.data ? state.curated.data.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        state.curated.data[index].no_of_views = ++state.curated.data[index].no_of_views || 1
      } else {
        state.curated.data[index].anonymous_views = ++state.curated.data[index].anonymous_views || 1
      }
    }
  },
  likeImage (state, { imageItem, authenticated }) {
    let index = state.popular.data ? state.popular.data.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.popular.data[index].self_like) {
          state.popular.data[index].no_of_likes = --state.popular.data[index].no_of_likes || 0
        } else {
          state.popular.data[index].no_of_likes = ++state.popular.data[index].no_of_likes || 1
        }
        state.popular.data[index].self_like = !state.popular.data[index].self_like
      }
    }
    index = state.recents.data ? state.recents.data.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.recents.data[index].self_like) {
          state.recents.data[index].no_of_likes = --state.recents.data[index].no_of_likes || 0
        } else {
          state.recents.data[index].no_of_likes = ++state.recents.data[index].no_of_likes || 1
        }
        state.recents.data[index].self_like = !state.recents.data[index].self_like
      }
    }
    index = state.curated.data ? state.curated.data.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.curated.data[index].self_like) {
          state.curated.data[index].no_of_likes = --state.curated.data[index].no_of_likes || 0
        } else {
          state.curated.data[index].no_of_likes = ++state.curated.data[index].no_of_likes || 1
        }
        state.curated.data[index].self_like = !state.curated.data[index].self_like
      }
    }
  },
  saveImage (state, { imageItem, authenticated }) {
    let index = state.popular.data ? state.popular.data.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.popular.data[index].self_save) {
          state.popular.data[index].no_of_saves = --state.popular.data[index].no_of_saves || 0
        } else {
          state.popular.data[index].no_of_saves = ++state.popular.data[index].no_of_saves || 1
        }
        state.popular.data[index].self_save = !state.popular.data[index].self_save
      }
    }
    index = state.recents.data ? state.recents.data.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.recents.data[index].self_save) {
          state.recents.data[index].no_of_saves = --state.recents.data[index].no_of_saves || 0
        } else {
          state.recents.data[index].no_of_saves = ++state.recents.data[index].no_of_saves || 1
        }
        state.recents.data[index].self_save = !state.recents.data[index].self_save
      }
    }
    index = state.curated.data ? state.curated.data.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.curated.data[index].self_save) {
          state.curated.data[index].no_of_saves = --state.curated.data[index].no_of_saves || 0
        } else {
          state.curated.data[index].no_of_saves = ++state.curated.data[index].no_of_saves || 1
        }
        state.curated.data[index].self_save = !state.curated.data[index].self_save
      }
    }
  }
}
const actions = {
  async fetchPopular ({ commit }, page) {
    let response = await axios.get('/frontend/images/popular', { params: { page } })
    let popular = response.data
    commit('setPopular', popular)
    return popular
  },
  async fetchRecents ({ commit }, page) {
    let response = await axios.get('/frontend/images/recents', { params: { page } })
    let recents = response.data
    commit('setRecents', recents)
    return recents
  },
  async fetchCurated ({ commit }, page) {
    let response = await axios.get('/frontend/images/curated', { params: { page } })
    let curated = response.data
    commit('setCurated', curated)
    return curated
  },
  async triggerImageViewed ({ commit, rootState }, imageItem) {
    await axios.put(`/frontend/images/${imageItem._id}/view`)
    commit('increaseViewCount', { imageItem, authenticated: rootState.auth.authenticated })
  },
  async triggerImageLiked ({ commit, rootState }, imageItem) {
    await axios.put(`/frontend/images/${imageItem._id}/like`)
    commit('likeImage', { imageItem, authenticated: rootState.auth.authenticated })
  },
  async triggerImageSaved ({ commit, rootState }, imageItem) {
    await axios.put(`/frontend/images/${imageItem._id}/save`)
    commit('saveImage', { imageItem, authenticated: rootState.auth.authenticated })
  }
}

export default {
  state,
  mutations,
  actions
}
