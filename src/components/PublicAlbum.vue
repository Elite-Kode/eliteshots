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
    <ed-toolbar/>
    <v-content>
      <v-container fluid>
        <h1>{{publicProfileAlbum.title}}</h1>
        <h3>CMDR {{ publicProfileUser.commander }}</h3>
        <image-gallery :imageItems="publicAlbumImages"
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
    </v-content>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ImageGallery from '@/components/ImageGallery'
import Toolbar from '@/components/Toolbar'

export default {
  name: 'PublicAlbum',
  components: {
    'ed-toolbar': Toolbar,
    'image-gallery': ImageGallery
  },
  props: {
    albumId: {
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
      publicAlbumImages: state => state.users.publicAlbumImages,
      publicProfileAlbum: state => state.users.publicProfileAlbum,
      publicProfileUser: state => state.users.publicProfileUser,
      authenticated: state => state.auth.authenticated
    })
  },
  async created () {
    this.$store.dispatch('checkAuthenticated')
    this.$store.commit('terminatePublicAlbumImages')
    await this.$store.dispatch('fetchPublicProfileAlbum', this.albumId)
    this.$store.dispatch('fetchPublicProfileUser', this.publicProfileAlbum.user_id)
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
      if (this.publicAlbumImages && this.publicAlbumImages.length > 0) {
        images = await this.$store.dispatch('fetchPublicAlbumImages', {
          albumId: this.albumId,
          last: this.publicAlbumImages[this.publicAlbumImages.length - 1].uploaded_at
        })
      } else {
        images = await this.$store.dispatch('fetchPublicAlbumImages', {
          albumId: this.albumId,
          last: null
        })
      }
      this.imagesEnd = images.length === 0
      this.loadingNewImages = false
    }
  }
}
</script>
