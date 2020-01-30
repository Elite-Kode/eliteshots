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
    <h1>Uploaded Images</h1>
    <image-gallery :imageItems="uploadedImages"
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
            </v-row>
          </v-card-title>
          <v-card-actions>
            <v-row dense>
              <v-col :cols="slotProps.imageItem.moderation_status !== 'REJECTED' ? 6 : 12"
                     v-if="slotProps.imageItem.moderation_status !== 'ACCEPTED'">
                <v-btn block color="success" @click.stop="acceptImage(slotProps.imageItem)"
                       :disabled="disableModActions">
                  Accept
                  <v-icon right>check</v-icon>
                </v-btn>
              </v-col>
              <v-col :cols="slotProps.imageItem.moderation_status !== 'ACCEPTED' ? 6 : 12"
                     v-if="slotProps.imageItem.moderation_status !== 'REJECTED'">
                <v-btn block outlined color="error" @click.stop="rejectImage(slotProps.imageItem)"
                       :disabled="disableModActions">
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

export default {
  name: 'UploadedImages',
  components: {
    'image-gallery': ImageGallery
  },
  props: {
    userId: {
      type: String,
      default: ''
    },
    disableModActions: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      loadingNewImages: false,
      imagesEnd: false
    }
  },
  computed: {
    ...mapState({
      uploadedImages: state => state.admin.uploadedImages,
      authenticated: state => state.auth.authenticated
    })
  },
  created () {
    this.$store.dispatch('checkAuthenticated')
    this.$store.commit('terminateUploadedImages')
  },
  methods: {
    async onFetchImages () {
      this.loadingNewImages = true
      let images = []
      if (this.uploadedImages && this.uploadedImages.length > 0) {
        images = await this.$store.dispatch('fetchUploaded', {
          last: this.uploadedImages[this.uploadedImages.length - 1].uploaded_at,
          userId: this.userId
        })
      } else {
        images = await this.$store.dispatch('fetchUploaded', {
          last: null,
          userId: this.userId
        })
      }
      this.imagesEnd = images.length === 0
      this.loadingNewImages = false
    },
    acceptImage (image) {
      this.$emit('accept', image)
    },
    rejectImage (image) {
      this.$emit('reject', image)
    }
  }
}
</script>
