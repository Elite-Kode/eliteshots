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
    <h1>Album Images</h1>
    <image-edit
      :all-albums="albums"
      :edit-album="editAlbum"
      :edit-description="editDescription"
      :edit-title="editTitle"
      :editDialog="editDialog"
      :editId="editId"
      @cancel="onEditCancel"
      @confirm="onEditConfirm"
    />
    <image-gallery
      :authenticated="authenticated"
      :end="imagesEnd"
      :imageItems="albumImages"
      :loading="loadingNewImages"
      curation-banner
      deletable
      editable
      link-key="image_location"
      mod-status-banner
      no-user
      @fetchImages="onFetchImages"
      @imageDeleted="onClickDelete"
      @imageEdited="onClickEdit"
      @imageLiked="onClickLike"
      @imageSaved="onClickSave"
      @imageViewed="onClickThumbnail"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ImageGallery from '@/components/ImageGallery'
import ImageEdit from '@/components/profile/ImageEdit'

export default {
  name: 'AlbumImages',
  components: {
    'image-gallery': ImageGallery,
    'image-edit': ImageEdit
  },
  props: {
    albumId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      albumImages: [],
      loadingNewImages: false,
      imagesEnd: false,
      editDialog: false,
      editId: '',
      editTitle: '',
      editDescription: '',
      editAlbum: ''
    }
  },
  computed: {
    ...mapState({
      albums: (state) => state.self.albums,
      authenticated: (state) => state.auth.authenticated
    })
  },
  created() {
    this.$store.dispatch('checkAuthenticated')
    this.$store.dispatch('fetchAlbums')
  },
  methods: {
    onClickThumbnail(image) {
      this.$store.dispatch('triggerSelfImageViewed', image)
    },
    onClickEdit(image) {
      this.editId = image._id
      this.editTitle = image.title
      this.editDescription = image.description
      this.editAlbum = image.album_id ? image.album_id : '0'
      this.editDialog = true
    },
    onClickDelete(image) {
      this.$store.dispatch('triggerSelfImageDeleted', image)
    },
    onClickLike(image) {
      this.$store.dispatch('triggerSelfImageLiked', image)
    },
    onClickSave(image) {
      this.$store.dispatch('triggerSelfImageSaved', image)
    },
    onEditCancel() {
      this.editDialog = false
    },
    onEditConfirm({ title, description, album }) {
      this.editDialog = false
      this.$store.dispatch('triggerSelfImageEdited', {
        imageId: this.editId,
        title,
        description,
        album
      })
    },
    async onFetchImages() {
      this.loadingNewImages = true
      let images = []
      if (this.albumImages && this.albumImages.length > 0) {
        images = await this.$store.dispatch('fetchAlbumImages', {
          last: this.albumImages[this.albumImages.length - 1].uploaded_at,
          albumId: this.albumId
        })
        this.albumImages.push(...images)
      } else {
        images = await this.$store.dispatch('fetchAlbumImages', {
          last: null,
          albumId: this.albumId
        })
        this.albumImages = images
      }
      this.imagesEnd = images.length === 0
      this.loadingNewImages = false
    }
  }
}
</script>
