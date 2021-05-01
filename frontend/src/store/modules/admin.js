/*
 * KodeBlox Copyright 2020 Sayak Mukhopadhyay
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
  uploadedImages: [],
  users: [],
  modActions: []
}
const mutations = {
  setPendingImages(state, images) {
    state.pendingImages = images
  },
  setAcceptedImages(state, images) {
    state.acceptedImages = images
  },
  setRejectedImages(state, images) {
    state.rejectedImages = images
  },
  setUploadedImages(state, images) {
    state.uploadedImages = images
  },
  setModActions(state, modActions) {
    state.modActions = modActions
  },
  addPendingImages(state, images) {
    state.pendingImages.push(...images)
  },
  addAcceptedImages(state, images) {
    state.acceptedImages.push(...images)
  },
  addRejectedImages(state, images) {
    state.rejectedImages.push(...images)
  },
  addUploadedImages(state, images) {
    state.uploadedImages.push(...images)
  },
  addModActions(state, modActions) {
    state.modActions.push(...modActions)
  },
  terminatePendingImages(state) {
    state.pendingImages = []
  },
  terminateAcceptedImages(state) {
    state.acceptedImages = []
  },
  terminateRejectedImages(state) {
    state.rejectedImages = []
  },
  terminateUploadedImages(state) {
    state.uploadedImages = []
  },
  terminateModActions(state) {
    state.modActions = []
  },
  acceptImage(state, imageId) {
    let index = state.pendingImages.findIndex((image) => image._id === imageId)
    if (index >= 0) {
      state.pendingImages.splice(index, 1)
    }
    index = state.rejectedImages.findIndex((image) => image._id === imageId)
    if (index >= 0) {
      state.rejectedImages.splice(index, 1)
    }
    index = state.uploadedImages.findIndex((image) => image._id === imageId)
    if (index >= 0) {
      state.uploadedImages[index].moderation_status = 'ACCEPTED'
    }
  },
  rejectImage(state, imageId) {
    let index = state.pendingImages.findIndex((image) => image._id === imageId)
    if (index >= 0) {
      state.pendingImages.splice(index, 1)
    }
    index = state.acceptedImages.findIndex((image) => image._id === imageId)
    if (index >= 0) {
      state.acceptedImages.splice(index, 1)
    }
    index = state.uploadedImages.findIndex((image) => image._id === imageId)
    if (index >= 0) {
      state.uploadedImages[index].moderation_status = 'REJECTED'
    }
  },
  setUsers(state, users) {
    state.users = users
  }
}
const actions = {
  async fetchPending({ commit }, last) {
    let response = await axios.get('/frontend/admin/images/pending', { params: { last } })
    let images = response.data
    if (last) {
      commit('addPendingImages', images)
    } else {
      commit('setPendingImages', images)
    }
    return images
  },
  async fetchAccepted({ commit }, last) {
    let response = await axios.get('/frontend/admin/images/accepted', { params: { last } })
    let images = response.data
    if (last) {
      commit('addAcceptedImages', images)
    } else {
      commit('setAcceptedImages', images)
    }
    return images
  },
  async fetchRejected({ commit }, last) {
    let response = await axios.get('/frontend/admin/images/rejected', { params: { last } })
    let images = response.data
    if (last) {
      commit('addRejectedImages', images)
    } else {
      commit('setRejectedImages', images)
    }
    return images
  },
  async fetchUploaded({ commit }, { last, userId }) {
    let response = await axios.get(`/frontend/admin/users/${userId}/images`, { params: { last } })
    let images = response.data
    if (last) {
      commit('addUploadedImages', images)
    } else {
      commit('setUploadedImages', images)
    }
    return images
  },
  async acceptImage({ commit }, { target, comment }) {
    await axios.put(`/frontend/admin/images/${target}/accept`, { comment })
    commit('acceptImage', target)
  },
  async rejectImage({ commit }, { target, comment }) {
    await axios.put(`/frontend/admin/images/${target}/reject`, { comment })
    commit('rejectImage', target)
  },
  async curateImage(context, { target, comment }) {
    await axios.put(`/frontend/admin/images/${target}/curate`, { comment })
  },
  async banUser(context, { target, comment }) {
    await axios.put(`/frontend/admin/users/${target}/ban`, { comment })
  },
  async unbanUser(context, { target, comment }) {
    await axios.put(`/frontend/admin/users/${target}/unban`, { comment })
  },
  async demoteUser(context, { target, comment }) {
    await axios.put(`/frontend/admin/users/${target}/demote`, { comment })
  },
  async promoteUser(context, { target, comment }) {
    await axios.put(`/frontend/admin/users/${target}/promote`, { comment })
  },
  async trustUser(context, { target, comment }) {
    await axios.put(`/frontend/admin/users/${target}/trust`, { comment })
  },
  async untrustUser(context, { target, comment }) {
    await axios.put(`/frontend/admin/users/${target}/untrust`, { comment })
  },
  async fetchUsers({ commit }, { page }) {
    let response = await axios.get('/frontend/admin/users', { params: { page } })
    let usersPaginated = response.data
    commit('setUsers', usersPaginated.docs)
    return usersPaginated
  },
  async fetchUser(context, userId) {
    let response = await axios.get(`/frontend/admin/users/${userId}`)
    return response.data
  },
  async fetchModActions({ commit }, last) {
    let response = await axios.get('/frontend/admin/modActions', { params: { last } })
    let modActions = response.data
    if (last) {
      commit('addModActions', modActions)
    } else {
      commit('setModActions', modActions)
    }
    return modActions
  }
}

export default {
  state,
  mutations,
  actions
}
