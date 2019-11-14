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
    <image-gallery :imageItems="pendingImages"
                   :loading="loadingNewImages"
                   :end="imagesEnd"
                   @imageViewed="onClickThumbnail"
                   @imageLiked="onClickLike"
                   @imageSaved="onClickSave"
                   @fetchImages="onFetchImages"
                   :authenticated="auth.authenticated">
      <v-card slot="thumbnail" slot-scope="slotProps">
        <v-img
          :src="slotProps.imageItem.thumbnail_location"
          @click="slotProps.clickThumbnail(i)"
          class="image-thumbnail"
          min-height="200px"
        ></v-img>
        <v-card-title primary-title>
          <div>
            <div class="headline">{{slotProps.imageItem.title}}</div>
            <span class="subheading">{{slotProps.imageItem.description}}</span>
          </div>
        </v-card-title>
        <v-card-actions>
          <v-layout>
            <v-flex xs-6>
              <v-btn block color="success" @click="acceptImage(slotProps.imageItem)">
                Accept
                <v-icon right>check</v-icon>
              </v-btn>
            </v-flex>
            <v-flex xs-6>
              <v-btn block outline color="error" @click="rejectImage(slotProps.imageItem)">
                Reject
                <v-icon right>clear</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-card-actions>
      </v-card>
    </image-gallery>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ImageGallery from '@/components/ImageGallery'

export default {
  name: 'ModQueue',
  components: {
    'image-gallery': ImageGallery
  },
  data () {
    return {
      loadingNewImages: false,
      imagesEnd: false
    }
  },
  computed: {
    ...mapState({
      pendingImages: state => state.admin.pendingImages,
      auth: state => state.auth
    })
  },
  created () {
    this.$store.dispatch('checkAuthenticated')
  },
  methods: {
    onClickThumbnail (image) {
      this.$store.dispatch('triggerUserImageViewed', image)
    },
    onClickLike (image) {
      this.$store.dispatch('triggerUserImageLiked', image)
    },
    onClickSave (image) {
      this.$store.dispatch('triggerUserImageSaved', image)
    },
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
      this.$store.dispatch('acceptImage', image)
    },
    rejectImage (image) {
      this.$store.dispatch('rejectImage', image)
    }
  }
}
</script>
