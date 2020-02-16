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
    <image-edit :editId="editId"
                :edit-title="editTitle"
                :edit-description="editDescription"
                :editDialog="editDialog"
                @cancel="onEditCancel"
                @confim="onEditConfirm"/>
    <image-gallery :imageItems="albumImages"
                   :loading="loadingNewImages"
                   :end="imagesEnd"
                   link-key="image_location"
                   @imageViewed="onClickThumbnail"
                   @imageEdited="onClickEdit"
                   @imageDeleted="onClickDelete"
                   @imageLiked="onClickLike"
                   @imageSaved="onClickSave"
                   @fetchImages="onFetchImages"
                   :authenticated="authenticated"
                   deletable
                   editable
                   no-user
                   curation-banner
                   mod-status-banner/>
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
  data () {
    return {
      albumImages: [],
      loadingNewImages: false,
      imagesEnd: false,
      editDialog: false,
      editId: '',
      editTitle: '',
      editDescription: ''
    }
  },
  computed: {
    ...mapState({
      authenticated: state => state.auth.authenticated
    })
  },
  created () {
    this.$store.dispatch('checkAuthenticated')
  },
  methods: {
    onClickThumbnail (image) {
      this.$store.dispatch('triggerSelfImageViewed', image)
    },
    onClickEdit (image) {
      this.editId = image._id
      this.editTitle = image.title
      this.editDescription = image.description
      this.editDialog = true
    },
    onClickDelete (image) {
      this.$store.dispatch('triggerSelfImageDeleted', image)
    },
    onClickLike (image) {
      this.$store.dispatch('triggerSelfImageLiked', image)
    },
    onClickSave (image) {
      this.$store.dispatch('triggerSelfImageSaved', image)
    },
    onEditCancel () {
      this.editDialog = false
    },
    onEditConfirm ({ title, description }) {
      this.editDialog = false
      this.$store.dispatch('triggerSelfImageEdited', {
        imageId: this.editId,
        title,
        description
      })
    },
    async onFetchImages () {
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
