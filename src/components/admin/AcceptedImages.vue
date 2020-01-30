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
    <h1>Accepted Images</h1>
    <mod-action :open-dialog="modActionDialog"
                :mod-action="modActionType"
                :target-type="modActionTargetType"
                :action-target="modActionTarget"
                @cancelled="onCancelled"
                @confirmed="onConfirmed"/>
    <image-gallery :imageItems="acceptedImages"
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
            <v-btn icon :to="{ name: 'image-item', params:{imageId: slotProps.imageItem._id}}" target="_blank">
              <v-icon>launch</v-icon>
            </v-btn>
          </v-img>
          <v-card-title class="px-2" style="width: 100%">
            <v-row dense>
              <v-col cols="12" class="headline py-0">{{slotProps.imageItem.title}}</v-col>
              <v-col cols="12" class="subheading py-0">{{slotProps.imageItem.description}}</v-col>
              <v-col cols="12" class="subheading py-0">
                <router-link :to="{ name: 'user-detail', params: { userId: slotProps.imageItem.user_id }}">
                  CMDR {{slotProps.imageItem.cmdr_name}}
                </router-link>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-actions>
            <v-row dense>
              <v-col cols="12">
                <v-btn block outlined color="error" @click.stop="rejectImage(slotProps.imageItem)"
                       :disabled="!canReject(slotProps.imageItem.user_id)">
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
  name: 'AcceptedImages',
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
      acceptedImages: state => state.admin.acceptedImages,
      authenticated: state => state.auth.authenticated,
      authUser: state => state.auth.user
    })
  },
  created () {
    this.$store.dispatch('checkAuthenticated')
    this.$store.commit('terminateAcceptedImages')
  },
  methods: {
    async onFetchImages () {
      this.loadingNewImages = true
      let images = []
      if (this.acceptedImages && this.acceptedImages.length > 0) {
        images = await this.$store.dispatch('fetchAccepted', this.acceptedImages[this.acceptedImages.length - 1].uploaded_at)
      } else {
        images = await this.$store.dispatch('fetchAccepted', null)
      }
      this.imagesEnd = images.length === 0
      this.loadingNewImages = false
    },
    canReject (userId) {
      return this.authUser._id !== userId
    },
    rejectImage (image) {
      this.modActionType = 'REJECT'
      this.modActionTargetType = 'IMAGE'
      this.modActionTarget = image._id
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
        if (this.modActionType === 'REJECT') {
          this.$store.dispatch('rejectImage', payload)
        }
      }
    }
  }
}
</script>
