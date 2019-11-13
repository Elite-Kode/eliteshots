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
  rejectedImages: []
}
const mutations = {
  setPendingImages (state, images) {
    state.pendingImages.push(...images)
  },
  setAcceptedImages (state, images) {
    state.acceptedImages.push(...images)
  },
  setRejectedImages (state, images) {
    state.rejectedImages.push(...images)
  }
}
const actions = {
  async fetchPending ({ commit }, last) {
    let response = await axios.get('/frontend/admin/images/pending', { params: { last } })
    let images = response.data
    commit('setPendingImages', images)
    return images
  },
  async fetchAccepted ({ commit }, last) {
    let response = await axios.get('/frontend/admin/images/accepted', { params: { last } })
    let images = response.data
    commit('setAcceptedImages', images)
    return images
  },
  async fetchRejected ({ commit }, last) {
    let response = await axios.get('/frontend/admin/images/rejected', { params: { last } })
    let images = response.data
    commit('setRejectedImages', images)
    return images
  }
}

export default {
  state,
  mutations,
  actions
}
