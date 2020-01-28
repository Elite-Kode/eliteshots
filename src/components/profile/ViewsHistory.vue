<!--
  - KodeBlox Copyright 2019 Sayak Mukhopadhyay
  -
  - Licensed under the Apache License, Version 2.0 (the "License");
  - you may not use this file except in compliance with the License.
  - You may obtain a copy of the License at
  -
  - http: //www.apache.org/licenses/LICENSE-2.0
  -
  - Unless required by applicable law or agreed to in writing, software
  - distributed under the License is distributed on an "AS IS" BASIS,
  - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  - See the License for the specific language governing permissions and
  - limitations under the License.
  -->

<template>
  <div>
    <div>View History</div>
    <v-timeline align-top>
      <v-timeline-item v-for="(view, i) in viewedImagesDeDuped"
                       :key="i">
        <template v-slot:opposite>
          <v-card>
            <v-img
              :src="view.thumbnail_location"
              @click="clickThumbnail(i)"
              class="image-thumbnail"
              min-height="200px">
              <router-link :to="{ name: 'image-item', params:{imageId: view._id}}" target="_blank">
                <v-btn icon @click.stop="">
                  <v-icon>launch</v-icon>
                </v-btn>
              </router-link>
            </v-img>
          </v-card>
        </template>
        <template v-slot:icon>
          <v-avatar>
            {{view.count}}
          </v-avatar>
        </template>
        <v-card class="chevron">
          <v-toolbar color="primary"
                     dense
                     dark>
            <v-toolbar-title class="text-truncate">
              <span>{{view.title}}</span>
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <p>{{view.description}}</p>
            <p>Viewed at: {{view.viewed_at_formatted}}</p>
          </v-card-text>
        </v-card>
      </v-timeline-item>
    </v-timeline>
    <gallery :images="imageLinks" :index="selectedImageIndex" @close="closeGallery()"/>
    <mugen-scroll :handler="fetchViews" :should-handle="!loading && !end">
      <div v-if="end">
        No more images
      </div>
      <div v-else>
        loading...
      </div>
    </mugen-scroll>
  </div>
</template>

<script>

import { mapState } from 'vuex'
import vueGallery from 'vue-gallery'
import MugenScroll from 'vue-mugen-scroll'
import moment from 'moment'

export default {
  name: 'ViewHistory',
  components: {
    'gallery': vueGallery,
    'mugen-scroll': MugenScroll
  },
  data () {
    return {
      selectedImageIndex: null,
      loading: false,
      end: false
    }
  },
  computed: {
    ...mapState({
      viewedImages: state => state.users.viewed
    }),
    viewedImagesDeDuped () {
      let deDuped = []
      let count = 0
      for (let i = 0; i < this.viewedImages.length;) {
        for (let j = i; j < this.viewedImages.length && this.viewedImages[i]._id === this.viewedImages[j]._id; j++) {
          count++
        }
        deDuped.push({
          ...this.viewedImages[i],
          count,
          viewed_at_formatted: moment(this.viewedImages[i].viewed_at).format('Do MMMM YYYY, h:mm:ss a')
        })
        i = i + count
        count = 0
      }
      return deDuped
    },
    imageLinks () {
      return this.viewedImages.map(view => {
        return view.low_res_location
      })
    }
  },
  created () {
    this.$store.dispatch('checkAuthenticated')
    this.$store.commit('terminateViewed')
  },
  methods: {
    clickThumbnail (index) {
      this.selectedImageIndex = index
      this.$store.dispatch('triggerUserImageViewed', this.viewedImages[index])
    },
    closeGallery () {
      this.selectedImageIndex = null
    },
    async fetchViews () {
      this.loading = true
      let views = []
      if (this.viewedImages && this.viewedImages.length > 0) {
        views = await this.$store.dispatch('fetchViewedImages', this.viewedImages[this.viewedImages.length - 1].viewed_at)
      } else {
        views = await this.$store.dispatch('fetchViewedImages', null)
      }
      this.end = views.length === 0
      this.loading = false
    }
  }
}
</script>

<style scoped>
  .chevron {
    border-color: var(--v-primary-base) !important;
  }
</style>
