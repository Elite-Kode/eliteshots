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
    <h1>Uploaded Images</h1>
    <image-edit :editId="editId"
                :edit-title="editTitle"
                :edit-description="editDescription"
                :editDialog="editDialog"
                @cancel="onEditCancel"
                @confim="onEditConfirm"/>
    <image-gallery :imageItems="myImages"
                   :loading="loadingNewImages"
                   :end="imagesEnd"
                   link-key="image_location"
                   @imageViewed="onClickThumbnail"
                   @imageEdited="onClickEdit"
                   @imageDeleted="onClickDelete"
                   @imageLiked="onClickLike"
                   @imageSaved="onClickSave"
                   @fetchImages="onFetchImages"
                   :authenticated="authenticated" deletable editable no-user/>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ImageGallery from '@/components/ImageGallery'
import ImageEdit from '@/components/profile/ImageEdit'

export default {
  name: 'Image',
  components: {
    'image-gallery': ImageGallery,
    'image-edit': ImageEdit
  },
  data () {
    return {
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
      myImages: state => state.users.images,
      authenticated: state => state.auth.authenticated
    })
  },
  created () {
    this.$store.dispatch('checkAuthenticated')
    this.$store.commit('terminateImages')
  },
  methods: {
    onClickThumbnail (image) {
      this.$store.dispatch('triggerImageViewed', image)
    },
    onClickEdit (image) {
      this.editId = image._id
      this.editTitle = image.title
      this.editDescription = image.description
      this.editDialog = true
    },
    onClickDelete (image) {
      this.$store.dispatch('triggerUserImageDeleted', image)
    },
    onClickLike (image) {
      this.$store.dispatch('triggerUserImageLiked', image)
    },
    onClickSave (image) {
      this.$store.dispatch('triggerUserImageSaved', image)
    },
    onEditCancel () {
      this.editDialog = false
    },
    onEditConfirm ({ title, description }) {
      this.editDialog = false
      this.$store.dispatch('triggerUserImageEdited', {
        imageId: this.editId,
        title,
        description
      })
    },
    async onFetchImages () {
      this.loadingNewImages = true
      let images = []
      if (this.myImages && this.myImages.length > 0) {
        images = await this.$store.dispatch('fetchImages', this.myImages[this.myImages.length - 1].uploaded_at)
      } else {
        images = await this.$store.dispatch('fetchImages', null)
      }
      this.imagesEnd = images.length === 0
      this.loadingNewImages = false
    }
  }
}
</script>
