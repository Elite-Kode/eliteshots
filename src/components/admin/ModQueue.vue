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
    <h1>Moderation Queue</h1>
    <mod-action :open-dialog="modActionDialog"
                :mod-action="modActionType"
                :target-type="modActionTargetType"
                :action-target="modActionTarget"
                @cancelled="onCancelled"
                @confirmed="onConfirmed"/>
    <image-gallery :imageItems="pendingImages"
                   :loading="loadingNewImages"
                   :end="imagesEnd"
                   @fetchImages="onFetchImages"
                   :authenticated="authenticated">
      <template v-slot:thumbnail="slotProps">
        <v-card>
          <v-img
            :src="slotProps.imageItem.thumbnail_location"
            @click="slotProps.clickThumbnail(slotProps.itemIndex)"
            class="image-thumbnail"
            min-height="200px"
          >
            <router-link :to="{ name: 'image-item', params:{imageId: slotProps.imageItem._id}}" target="_blank">
              <v-btn icon @click.stop="">
                <v-icon>launch</v-icon>
              </v-btn>
            </router-link>
          </v-img>
          <v-card-title class="px-2" style="width: 100%">
            <v-row dense>
              <v-col cols="12" class="headline py-0">{{slotProps.imageItem.title}}</v-col>
              <v-col cols="12" class="subheading py-0">{{slotProps.imageItem.description}}</v-col>
              <v-col cols="6" class="subheading py-0">CMDR {{slotProps.imageItem.cmdr_name}}</v-col>
              <v-col cols="6" class="py-0">
                <v-btn block color="error" @click.stop="banUser(slotProps.imageItem.user_id)">
                  Ban User
                  <v-icon right>gavel</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-actions>
            <v-row dense>
              <v-col cols="6">
                <v-btn block color="success" @click.stop="acceptImage(slotProps.imageItem)">
                  Accept
                  <v-icon right>check</v-icon>
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn block outlined color="error" @click.stop="rejectImage(slotProps.imageItem)">
                  Reject
                  <v-icon right>clear</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </template>
    </image-gallery>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ImageGallery from '@/components/ImageGallery'
import ModActionConfirmation from '@/components/admin/ModActionConfirmation'

export default {
  name: 'ModQueue',
  components: {
    'image-gallery': ImageGallery,
    'mod-action': ModActionConfirmation
  },
  data () {
    return {
      loadingNewImages: false,
      imagesEnd: false,
      modActionDialog: false,
      modActionType: '',
      modActionTargetType: '',
      modActionTarget: ''
    }
  },
  computed: {
    ...mapState({
      pendingImages: state => state.admin.pendingImages,
      authenticated: state => state.auth.authenticated
    })
  },
  created () {
    this.$store.dispatch('checkAuthenticated')
    this.$store.commit('terminatePendingImages')
  },
  methods: {
    async onFetchImages () {
      this.loadingNewImages = true
      let images = []
      if (this.pendingImages && this.pendingImages.length > 0) {
        images = await this.$store.dispatch('fetchPending', this.pendingImages[this.pendingImages.length - 1].uploaded_at)
      } else {
        images = await this.$store.dispatch('fetchPending', null)
      }
      this.imagesEnd = images.length === 0
      this.loadingNewImages = false
    },
    acceptImage (image) {
      this.modActionType = 'ACCEPT'
      this.modActionTargetType = 'IMAGE'
      this.modActionTarget = image._id
      this.modActionDialog = true
    },
    rejectImage (image) {
      this.modActionType = 'REJECT'
      this.modActionTargetType = 'IMAGE'
      this.modActionTarget = image._id
      this.modActionDialog = true
    },
    banUser (userID) {
      this.modActionType = 'BAN'
      this.modActionTargetType = 'USER'
      this.modActionTarget = userID
      this.modActionDialog = true
    },
    onCancelled () {
      this.modActionDialog = false
    },
    onConfirmed (comment) {
      this.modActionDialog = false
      let payload = {
        target: this.modActionTarget,
        comment: comment
      }
      if (this.modActionTargetType === 'IMAGE') {
        if (this.modActionType === 'ACCEPT') {
          this.$store.dispatch('acceptImage', payload)
        } else if (this.modActionType === 'REJECT') {
          this.$store.dispatch('rejectImage', payload)
        }
      } else if (this.modActionTargetType === 'USER') {
        if (this.modActionType === 'BAN') {
          this.$store.dispatch('banUser', payload)
        } else if (this.modActionType === 'UNBAN') {
          this.$store.dispatch('unbanUser', payload)
        }
      }
    }
  }
}
</script>
