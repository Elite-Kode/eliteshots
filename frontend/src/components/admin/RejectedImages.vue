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
    <h1>Rejected Images</h1>
    <mod-action
      :action-target="modActionTarget"
      :mod-action="modActionType"
      :open-dialog="modActionDialog"
      :target-type="modActionTargetType"
      @cancelled="onCancelled"
      @confirmed="onConfirmed"
    />
    <image-gallery
      :authenticated="authenticated"
      :end="imagesEnd"
      :imageItems="rejectedImages"
      :loading="loadingNewImages"
      @fetchImages="onFetchImages"
    >
      <template v-slot:thumbnail="slotProps">
        <v-card>
          <v-img
            :aspect-ratio="1"
            :src="slotProps.imageItem.thumbnail_location"
            class="image-thumbnail"
            min-height="200px"
            @click="slotProps.clickThumbnail(slotProps.itemIndex)"
          >
            <v-btn :to="{ name: 'image-item', params: { imageId: slotProps.imageItem._id } }" icon target="_blank">
              <v-icon>launch</v-icon>
            </v-btn>
          </v-img>
          <v-card-title class="px-2" style="width: 100%">
            <v-row dense>
              <v-col class="headline py-0" cols="12">{{ slotProps.imageItem.title }}</v-col>
              <v-col class="subheading py-0" cols="12">{{ slotProps.imageItem.description }}</v-col>
              <v-col class="subheading py-0" cols="12">
                <router-link :to="{ name: 'user-detail', params: { userId: slotProps.imageItem.user_id } }">
                  CMDR {{ slotProps.imageItem.cmdr_name }}
                </router-link>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-actions>
            <v-row dense>
              <v-col cols="12">
                <v-btn
                  :disabled="!canAccept(slotProps.imageItem.user_id)"
                  block
                  color="success"
                  @click.stop="acceptImage(slotProps.imageItem)"
                >
                  Accept
                  <v-icon right>check</v-icon>
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
  name: 'RejectedImages',
  components: {
    'image-gallery': ImageGallery,
    'mod-action': ModActionConfirmation
  },
  data() {
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
      rejectedImages: (state) => state.admin.rejectedImages,
      authenticated: (state) => state.auth.authenticated,
      authUser: (state) => state.auth.user
    })
  },
  created() {
    this.$store.dispatch('checkAuthenticated')
    this.$store.commit('terminateRejectedImages')
  },
  methods: {
    async onFetchImages() {
      this.loadingNewImages = true
      let images = []
      if (this.rejectedImages && this.rejectedImages.length > 0) {
        images = await this.$store.dispatch(
          'fetchRejected',
          this.rejectedImages[this.rejectedImages.length - 1].uploaded_at
        )
      } else {
        images = await this.$store.dispatch('fetchRejected', null)
      }
      this.imagesEnd = images.length === 0
      this.loadingNewImages = false
    },
    canAccept(userId) {
      return this.authUser._id !== userId
    },
    acceptImage(image) {
      this.modActionType = 'ACCEPT'
      this.modActionTargetType = 'IMAGE'
      this.modActionTarget = image._id
      this.modActionDialog = true
    },
    onCancelled() {
      this.modActionDialog = false
    },
    onConfirmed(comment) {
      this.modActionDialog = false
      let payload = {
        target: this.modActionTarget,
        comment: comment
      }
      if (this.modActionTargetType === 'IMAGE') {
        if (this.modActionType === 'ACCEPT') {
          this.$store.dispatch('acceptImage', payload)
        }
      }
    }
  }
}
</script>
