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
    <album-edit :editId="editId"
                :edit-title="editTitle"
                :edit-description="editDescription"
                :editDialog="editDialog"
                @cancel="onEditCancel"
                @confirm="onEditConfirm"/>
    <album-gallery :albumItems="albums"
                   @albumOpened="onClickOpen"
                   @albumDeleted="onClickDelete"
                   @albumEdited="onClickEdit"
                   @albumCreated="onClickCreate"
                   :authenticated="authenticated"
                   deletable
                   editable/>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import AlbumGallery from '@/components/AlbumGallery'
import AlbumEdit from '@/components/profile/AlbumEdit'

export default {
  name: 'Albums',
  components: {
    AlbumEdit,
    'album-gallery': AlbumGallery
  },
  data () {
    return {
      editDialog: false,
      editId: '',
      editTitle: '',
      editDescription: ''
    }
  },
  computed: {
    ...mapState({
      albums: state => state.self.albums,
      authenticated: state => state.auth.authenticated
    })
  },
  created () {
    this.$store.dispatch('checkAuthenticated')
    this.$store.dispatch('fetchAlbums')
  },
  methods: {
    onClickOpen (albumItem) {
      let params = {}
      if (albumItem._id) {
        params = { albumId: albumItem._id }
      } else {
        params = { albumId: 'default' }
      }
      this.$router.push({ name: 'album-images', params })
    },
    onClickEdit (albumItem) {
      this.editId = albumItem._id
      this.editTitle = albumItem.title
      this.editDescription = albumItem.description
      this.editDialog = true
    },
    onClickCreate ({ title, description }) {
      this.$store.dispatch('createAlbum', { title, description })
    },
    onClickDelete (albumItem) {
      this.$store.dispatch('deleteAlbum', albumItem._id)
    },
    onEditCancel () {
      this.editDialog = false
    },
    onEditConfirm ({ title, description }) {
      this.editDialog = false
      this.$store.dispatch('triggerSelfAlbumEdited', {
        albumId: this.editId,
        title,
        description
      })
    }
  }
}
</script>
