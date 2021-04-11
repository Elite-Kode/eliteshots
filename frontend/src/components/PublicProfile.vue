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
    <profile-toolbar/>
    <v-main>
      <v-container fluid>
        <h1>CMDR {{ publicProfileUser.commander }}</h1>
        <image-gallery :imageItems="publicProfileImages"
                       :loading="loadingNewImages"
                       :end="imagesEnd"
                       link-key="image_location"
                       @imageViewed="onClickThumbnail"
                       @imageLiked="onClickLike"
                       @imageSaved="onClickSave"
                       @fetchImages="onFetchImages"
                       :authenticated="authenticated"
                       no-user
                       curation-banner/>
      </v-container>
    </v-main>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ImageGallery from '@/components/ImageGallery'
import ProfileToolbar from '@/components/profile/ProfileToolbar'

export default {
  name: 'PublicProfile',
  components: {
    'profile-toolbar': ProfileToolbar,
    'image-gallery': ImageGallery
  },
  props: {
    userId: {
      type: String,
      default: ''
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
      publicProfileImages: state => state.users.publicProfileImages,
      publicProfileUser: state => state.users.publicProfileUser,
      authenticated: state => state.auth.authenticated
    })
  },
  created () {
    this.$store.dispatch('checkAuthenticated')
    this.$store.commit('terminatePublicProfileImages')
    this.$store.dispatch('fetchPublicProfileUser', this.userId)
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
      if (this.publicProfileImages && this.publicProfileImages.length > 0) {
        images = await this.$store.dispatch('fetchPublicProfileImages', {
          userId: this.userId,
          last: this.publicProfileImages[this.publicProfileImages.length - 1].uploaded_at
        })
      } else {
        images = await this.$store.dispatch('fetchPublicProfileImages', {
          userId: this.userId,
          last: null
        })
      }
      this.imagesEnd = images.length === 0
      this.loadingNewImages = false
    }
  }
}
</script>
