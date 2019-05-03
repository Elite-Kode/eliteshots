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
    <h1>Saved Images</h1>
    <image-gallery :imageItems="savedImages.data" :page="currentPage"
                   :totalPages=savedImages.pageCount
                   @imageViewed="onClickThumbnail"
                   @imageLiked="onClickLike"
                   @imageSaved="onClickSave"
                   @pageChange="onPageChange"
                   :authenticated="auth.authenticated"></image-gallery>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ImageGallery from '@/components/ImageGallery'

export default {
  name: 'Like',
  components: {
    'image-gallery': ImageGallery
  },
  data () {
    return {
      currentPage: 1
    }
  },
  computed: {
    ...mapState({
      savedImages: state => state.users.saved,
      auth: state => state.auth
    })
  },
  created () {
    if (this.$router.currentRoute.name === 'images-page') {
      this.currentPage = parseInt(this.$router.currentRoute.params.pageNumber)
    }
    this.$store.dispatch('checkAuthenticated')
    this.$store.dispatch('fetchSavedImages', this.currentPage)
  },
  methods: {
    onPageChange (page) {
      this.$router.push({ name: 'saves-page', params: { pageNumber: page } })
      this.currentPage = page
      this.$store.dispatch('fetchSavedImages', this.currentPage)
    },
    onClickThumbnail (image) {
      this.$store.dispatch('triggerUserImageViewed', image)
    },
    onClickLike (image) {
      this.$store.dispatch('triggerUserImageLiked', image)
    },
    onClickSave (image) {
      this.$store.dispatch('triggerUserImageSaved', image)
    }
  }
}
</script>
