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
  addPopular (state, popular) {
    state.popular.push(...popular)
  },
  addRecents (state, recents) {
    state.recents.push(...recents)
  },
  addCurated (state, curated) {
    state.curated.push(...curated)
  },
  terminatePopular (state) {
    state.popular = []
  },
  terminateRecents (state) {
    state.recents = []
  },
  terminateCurated (state) {
    state.curated = []
  },
  increaseViewCount (state, { imageItem, authenticated }) {
    let index = state.popular ? state.popular.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        state.popular[index].no_of_views = ++state.popular[index].no_of_views || 1
      } else {
        state.popular[index].anonymous_views = ++state.popular[index].anonymous_views || 1
      }
    }
    index = state.recents ? state.recents.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        state.recents[index].no_of_views = ++state.recents[index].no_of_views || 1
      } else {
        state.recents[index].anonymous_views = ++state.recents[index].anonymous_views || 1
      }
    }
    index = state.curated ? state.curated.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        state.curated[index].no_of_views = ++state.curated[index].no_of_views || 1
      } else {
        state.curated[index].anonymous_views = ++state.curated[index].anonymous_views || 1
      }
    }
  },
  likeImage (state, { imageItem, authenticated }) {
    let index = state.popular ? state.popular.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.popular[index].self_like) {
          state.popular[index].no_of_likes = --state.popular[index].no_of_likes || 0
        } else {
          state.popular[index].no_of_likes = ++state.popular[index].no_of_likes || 1
        }
        state.popular[index].self_like = !state.popular[index].self_like
      }
    }
    index = state.recents ? state.recents.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.recents[index].self_like) {
          state.recents[index].no_of_likes = --state.recents[index].no_of_likes || 0
        } else {
          state.recents[index].no_of_likes = ++state.recents[index].no_of_likes || 1
        }
        state.recents[index].self_like = !state.recents[index].self_like
      }
    }
    index = state.curated ? state.curated.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.curated[index].self_like) {
          state.curated[index].no_of_likes = --state.curated[index].no_of_likes || 0
        } else {
          state.curated[index].no_of_likes = ++state.curated[index].no_of_likes || 1
        }
        state.curated[index].self_like = !state.curated[index].self_like
      }
    }
  },
  saveImage (state, { imageItem, authenticated }) {
    let index = state.popular ? state.popular.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.popular[index].self_save) {
          state.popular[index].no_of_saves = --state.popular[index].no_of_saves || 0
        } else {
          state.popular[index].no_of_saves = ++state.popular[index].no_of_saves || 1
        }
        state.popular[index].self_save = !state.popular[index].self_save
      }
    }
    index = state.recents ? state.recents.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.recents[index].self_save) {
          state.recents[index].no_of_saves = --state.recents[index].no_of_saves || 0
        } else {
          state.recents[index].no_of_saves = ++state.recents[index].no_of_saves || 1
        }
        state.recents[index].self_save = !state.recents[index].self_save
      }
    }
    index = state.curated ? state.curated.findIndex(image => {
      return image._id === imageItem._id
    }) : -1
    if (index !== -1) {
      if (authenticated) {
        if (state.curated[index].self_save) {
          state.curated[index].no_of_saves = --state.curated[index].no_of_saves || 0
        } else {
          state.curated[index].no_of_saves = ++state.curated[index].no_of_saves || 1
        }
        state.curated[index].self_save = !state.curated[index].self_save
      }
    }
  }
}
const actions = {
  async fetchPopular ({ commit }, last) {
    let response = await axios.get('/frontend/images/popular', { params: { last } })
    let popular = response.data
    if (last) {
      commit('addPopular', popular)
    } else {
      commit('setPopular', popular)
    }
    return popular
  },
  async fetchRecents ({ commit }, last) {
    let response = await axios.get('/frontend/images/recents', { params: { last } })
    let recents = response.data
    if (last) {
      commit('addRecents', recents)
    } else {
      commit('setRecents', recents)
    }
    return recents
  },
  async fetchCurated ({ commit }, last) {
    let response = await axios.get('/frontend/images/curated', { params: { last } })
    let curated = response.data
    if (last) {
      commit('addCurated', curated)
    } else {
      commit('setCurated', curated)
    }
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
