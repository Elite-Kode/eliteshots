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
  <image-gallery :imageItems="popularImages"
                 :loading="loadingNewImages"
                 :end="imagesEnd"
                 link-key="image_location"
                 @imageViewed="onClickThumbnail"
                 @imageLiked="onClickLike"
                 @imageSaved="onClickSave"
                 @fetchImages="onFetchImages"
                 :authenticated="authenticated"
                 curation-banner/>
</template>

<script>
import ImageGallery from '@/components/ImageGallery'
import { mapState } from 'vuex'

export default {
  name: 'Popular',
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
      popularImages: state => state.images.popular,
      authenticated: state => state.auth.authenticated
    })
  },
  created () {
    this.$store.dispatch('checkAuthenticated')
    this.$store.commit('terminatePopular')
  },
  methods: {
    onClickThumbnail (image) {
      this.$store.dispatch('triggerImageViewed', image)
    },
    onClickLike (image) {
      this.$store.dispatch('triggerImageLiked', image)
    },
    onClickSave (image) {
      this.$store.dispatch('triggerImageSaved', image)
    },
    async onFetchImages () {
      this.loadingNewImages = true
      let images = []
      if (this.popularImages && this.popularImages.length > 0) {
        images = await this.$store.dispatch('fetchPopular', this.popularImages[this.popularImages.length - 1].score)
      } else {
        images = await this.$store.dispatch('fetchPopular', null)
      }
      this.imagesEnd = images.length === 0
      this.loadingNewImages = false
    }
  }
}
</script>
