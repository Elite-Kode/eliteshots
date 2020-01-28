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
    <h1>Uploaded Images</h1>
    <v-dialog v-model="editDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Update Image {{editId}}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row dense>
              <v-col>
                <v-text-field label="Title (optional)" v-model="editTitle"/>
              </v-col>
            </v-row>
            <v-row dense>
              <v-col>
                <v-textarea label="Description (optional)" v-model="editDescription"/>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="error" text @click="clickEditCancel">Cancel</v-btn>
          <v-btn color="success" text @click="clickEditConfirm">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <image-gallery :imageItems="myImages"
                   :loading="loadingNewImages"
                   :end="imagesEnd"
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
import ImageGallery from '@/components/ImageGallery'
import { mapState } from 'vuex'

export default {
  name: 'Image',
  components: {
    'image-gallery': ImageGallery
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
    clickEditCancel () {
      this.editId = ''
      this.editTitle = ''
      this.editDescription = ''
      this.editDialog = false
    },
    clickEditConfirm () {
      this.$store.dispatch('triggerUserImageEdited', {
        imageId: this.editId,
        title: this.editTitle,
        description: this.editDescription
      })
      this.editId = ''
      this.editTitle = ''
      this.editDescription = ''
      this.editDialog = false
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
