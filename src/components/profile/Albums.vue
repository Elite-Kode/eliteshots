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
    <h1>My Albums</h1>
    <album-gallery :albumItems="albums"
                   @albumOpened="albumOpened"
                   @albumDeleted="albumDeleted"
                   :authenticated="authenticated" deletable/>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import AlbumGallery from '@/components/AlbumGallery'

export default {
  name: 'Albums',
  components: {
    'album-gallery': AlbumGallery
  },
  computed: {
    ...mapState({
      albums: state => state.self.albums,
      authenticated: state => state.auth.authenticated
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
    albumOpened (albumItem) {
      let params = {}
      if (albumItem._id) {
        params = { albumId: albumItem._id }
      } else {
        params = { albumId: 'default' }
      }
      this.$router.push({ name: 'album-images', params })
    },
    albumDeleted (albumItem) {
      this.$store.dispatch('deleteAlbum', albumItem._id)
    }
  }
}
</script>
