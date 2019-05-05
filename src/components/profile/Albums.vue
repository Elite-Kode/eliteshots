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
    <h1>My Albums</h1>
    <album-gallery :albumItems="albums"
                   @albumOpened="onClickThumbnail"
                   @albumDeleted="onClickDelete"
                   :authenticated="auth.authenticated" deletable></album-gallery>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import AlbumGallery from '@/components/AlbumGallery'

export default {
  name: 'Album',
  components: {
    'album-gallery': AlbumGallery
  },
  computed: {
    ...mapState({
      albums: state => state.users.albums,
      auth: state => state.auth
    })
  },
  created () {
    if (this.$router.currentRoute.name === 'images-page') {
      this.currentPage = parseInt(this.$router.currentRoute.params.pageNumber)
    }
    this.$store.dispatch('checkAuthenticated')
    this.$store.dispatch('fetchAlbums', this.currentPage)
  },
  methods: {
    onClickThumbnail (image) {
      this.$store.dispatch('triggerUserImageViewed', image)
    },
    onClickDelete (image) {
      this.$store.dispatch('triggerUserImageDeleted', image)
    }
  }
}
</script>
