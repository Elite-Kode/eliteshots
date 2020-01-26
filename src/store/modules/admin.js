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
  pendingImages: [],
  acceptedImages: [],
  rejectedImages: [],
  users: []
}
const mutations = {
  setPendingImages (state, images) {
    state.pendingImages = images
  },
  setAcceptedImages (state, images) {
    state.acceptedImages = images
  },
  setRejectedImages (state, images) {
    state.rejectedImages = images
  },
  addPendingImages (state, images) {
    state.pendingImages.push(...images)
  },
  addAcceptedImages (state, images) {
    state.acceptedImages.push(...images)
  },
  addRejectedImages (state, images) {
    state.rejectedImages.push(...images)
  },
  terminatePendingImages (state) {
    state.pendingImages = []
  },
  terminateAcceptedImages (state) {
    state.acceptedImages = []
  },
  terminateRejectedImages (state) {
    state.rejectedImages = []
  },
  acceptImage (state, imageId) {
    let index = state.pendingImages.findIndex(image => image._id === imageId)
    if (index >= 0) {
      state.pendingImages.splice(index, 1)
    }
    index = state.rejectedImages.findIndex(image => image._id === imageId)
    if (index >= 0) {
      state.rejectedImages.splice(index, 1)
    }
  },
  rejectImage (state, imageId) {
    let index = state.pendingImages.findIndex(image => image._id === imageId)
    if (index >= 0) {
      state.pendingImages.splice(index, 1)
    }
    index = state.acceptedImages.findIndex(image => image._id === imageId)
    if (index >= 0) {
      state.acceptedImages.splice(index, 1)
    }
  },
  setUsers (state, users) {
    state.users = users
  }
}
const actions = {
  async fetchPending ({ commit }, last) {
    let response = await axios.get('/frontend/admin/images/pending', { params: { last } })
    let images = response.data
    if (last) {
      commit('addPendingImages', images)
    } else {
      commit('setPendingImages', images)
    }
    return images
  },
  async fetchAccepted ({ commit }, last) {
    let response = await axios.get('/frontend/admin/images/accepted', { params: { last } })
    let images = response.data
    if (last) {
      commit('addAcceptedImages', images)
    } else {
      commit('setAcceptedImages', images)
    }
    return images
  },
  async fetchRejected ({ commit }, last) {
    let response = await axios.get('/frontend/admin/images/rejected', { params: { last } })
    let images = response.data
    if (last) {
      commit('addRejectedImages', images)
    } else {
      commit('setRejectedImages', images)
    }
    return images
  },
  async acceptImage ({ commit }, { target, comment }) {
    await axios.put(`/frontend/admin/images/${target}/accept`, { comment })
    commit('acceptImage', target)
  },
  async rejectImage ({ commit }, { target, comment }) {
    await axios.put(`/frontend/admin/images/${target}/reject`, { comment })
    commit('rejectImage', target)
  },
  async banUser ({ commit }, { target, comment }) {
    await axios.put(`/frontend/admin/ban/${target}`, { comment })
  },
  async unbanUser ({ commit }, { target, comment }) {
    await axios.put(`/frontend/admin/unban/${target}`, { comment })
  },
  async fetchUsers ({ commit }, { page }) {
    let response = await axios.get('/frontend/admin/users', { params: { page } })
    let usersPaginated = response.data
    commit('setUsers', usersPaginated.docs)
    return usersPaginated
  }
}

export default {
  state,
  mutations,
  actions
}
