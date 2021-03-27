<!--
  - KodeBlox Copyright 2020 Sayak Mukhopadhyay
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
    <div>Mod Action History</div>
    <v-timeline align-top>
      <v-timeline-item v-for="(modAction, i) in modActionsFormatted"
                       :key="i">
        <template v-slot:opposite>
          <v-card>
            <v-img
              v-if="modAction.images"
              :src="modAction.images.thumbnail_location"
              @click="clickThumbnail(i)"
              class="image-thumbnail"
              min-height="200px">
              <v-btn icon :to="{ name: 'image-item', params:{imageId: modAction.images._id}}" target="_blank"
                     @click.stop="">
                <v-icon>launch</v-icon>
              </v-btn>
            </v-img>
            <v-form v-else-if="modAction.users" class="mx-3">
              <v-row align="center">
                <v-col cols="3">
                  <v-subheader>Commander Name</v-subheader>
                </v-col>
                <v-col cols="9">
                  <v-text-field
                    :value="modAction.users.commander"
                    dense
                    readonly>
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row align="center">
                <v-col cols="3">
                  <v-subheader>ID</v-subheader>
                </v-col>
                <v-col cols="3">
                  <v-text-field
                    :value="modAction.users._id"
                    dense
                    readonly>
                  </v-text-field>
                </v-col>
                <template v-if="authenticated && authUser.access === adminAccess">
                  <v-col cols="3">
                    <v-subheader>Frontier ID</v-subheader>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      :value="modAction.users.frontier_id"
                      dense
                      readonly>
                    </v-text-field>
                  </v-col>
                </template>
              </v-row>
            </v-form>
          </v-card>
        </template>
        <v-card class="chevron">
          <v-toolbar color="primary"
                     dense
                     dark
                     class="px-3">
            <v-toolbar-title class="text-truncate">
              <span>{{modAction.action}}</span>
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <p>{{modAction.comments}}</p>
            <p>Action at: {{modAction.action_at_formatted}}</p>
            <p>Action by: {{modAction.mods.commander}}</p>
          </v-card-text>
        </v-card>
      </v-timeline-item>
    </v-timeline>
    <gallery :images="imageLinks" :index="selectedImageIndex" @close="closeGallery()"/>
    <mugen-scroll :handler="fetchModActions" :should-handle="!loading && !end">
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
import vueGallery from 'vue-gallery'
import MugenScroll from 'vue-mugen-scroll'
import { mapState } from 'vuex'
import moment from 'moment'

export default {
  name: 'ModActionHistory',
  components: {
    'gallery': vueGallery,
    'mugen-scroll': MugenScroll
  },
  data () {
    return {
      selectedImageIndex: null,
      loading: false,
      end: false,
      adminAccess: 'ADMIN'
    }
  },
  computed: {
    ...mapState({
      modActions: state => state.admin.modActions,
      authenticated: state => state.auth.authenticated,
      authUser: state => state.auth.user
    }),
    imageLinks () {
      return this.modActions.map(modAction => {
        if (modAction.images) {
          return modAction.images.low_res_location
        }
      })
    },
    modActionsFormatted () {
      return this.modActions.map(modAction => {
        return {
          ...modAction,
          action_at_formatted: moment(modAction.action_at).format('Do MMMM YYYY, h:mm:ss a')
        }
      })
    }
  },
  created () {
    this.$store.dispatch('checkAuthenticated')
    this.$store.commit('terminateModActions')
  },
  methods: {
    clickThumbnail (index) {
      this.selectedImageIndex = index
      this.$store.dispatch('triggerImageViewed', this.viewedImages[index])
    },
    closeGallery () {
      this.selectedImageIndex = null
    },
    async fetchModActions () {
      this.loading = true
      let modActions = []
      if (this.modActions && this.modActions.length > 0) {
        modActions = await this.$store.dispatch('fetchModActions', this.modActions[this.modActions.length - 1].action_at)
      } else {
        modActions = await this.$store.dispatch('fetchModActions', null)
      }
      this.end = modActions.length === 0
      this.loading = false
    }
  }
}
</script>

<style scoped>
  .chevron {
    border-color: var(--v-primary-base) !important;
  }

  .chevron:after {
    margin: 0 1px;
  }
</style>
