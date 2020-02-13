<template>
  <div class="fill-height">
    <ed-toolbar>
      <template v-slot:toolbar-tabs>
        <v-toolbar light dense color="accent">
          <v-spacer/>
          <v-toolbar-items>
            <v-combobox
              v-model="currentAlbumTitle"
              :items="albumTitles"
              clearable
              solo-inverted
              label="Select or Make a new Album"
              @input.native="currentAlbumTitle=$event.target.value"
            />
            <v-btn icon @click="removeUploads">
              <v-icon>delete</v-icon>
            </v-btn>
            <v-btn icon @click="startUpload">
              <v-icon>save</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
      </template>
    </ed-toolbar>
    <v-content class="fill-height">
      <v-container fluid class="fill-height pa-0">
        <v-row class="flex-column mx-0 fill-height flex-nowrap">
          <v-col class="flex-grow-1 pa-0 uploaderColumn">
            <vue-dropzone ref="uploadDropzone" id="uploadDropzone" :options="dropzoneOptions"
                          @vdropzone-sending="onImageSending"
                          @vdropzone-thumbnail="onImageUploaded"
                          @vdropzone-success="onImageUploadSuccess"
                          @vdropzone-error="onImageUploadError"
                          :class="[{light: theme === themes[0]}, {dark: theme === themes[1]}]"
                          class="fill-height outline d-flex justify-center" useCustomSlot>
              <div class="message">
                <h3 class="title">Drag and drop to upload content!</h3>
                <div class="subtitle">...or click to select a file from your computer</div>
              </div>
            </vue-dropzone>
          </v-col>
          <v-col class="flex-grow-0" v-if="uploadedImages.length">
            <v-card v-for="(uploadImage, i) in uploadedImages" :key="i" class="my-2">
              <v-row class="mx-0">
                <v-col cols="6" class="d-flex" align-self="center">
                  <v-img :src="uploadImage.thumbnail">
                    <div class="d-flex fill-height justify-center align-center image-overlay">
                      <v-btn icon @click="removeImage(i)" v-if="uploadImage.file.status === 'queued'">
                        <v-icon x-large>cancel</v-icon>
                      </v-btn>
                      <v-icon x-large
                              v-else-if="uploadImage.file.status === 'success' || uploadImage.status === 'SUCCESS'">
                        check
                      </v-icon>
                      <v-btn icon @click="retryUpload(i)"
                             v-else-if="uploadImage.file.status === 'error' || uploadImage.file.status === 'canceled' || uploadImage.status === 'FAILED' || uploadImage.status === 'ERROR'">
                        <v-icon x-large>refresh</v-icon>
                      </v-btn>
                      <v-progress-circular v-else indeterminate/>
                    </div>
                  </v-img>
                </v-col>
                <v-col cols="6">
                  <v-form>
                    <v-row align="center">
                      <v-col cols="3">
                        <v-subheader>Title</v-subheader>
                      </v-col>
                      <v-col cols="9">
                        <v-text-field
                          v-model="uploadImage.title"
                          dense/>
                      </v-col>
                    </v-row>
                    <v-row align="center">
                      <v-col cols="3">
                        <v-subheader>Description</v-subheader>
                      </v-col>
                      <v-col cols="9">
                        <v-textarea
                          v-model="uploadImage.description"
                          dense/>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </div>
</template>

<script>
import vue2Dropzone from 'vue2-dropzone'
import Toolbar from '@/components/Toolbar'
import { mapState } from 'vuex'

export default {
  name: 'UploadCard',
  components: {
    'vue-dropzone': vue2Dropzone,
    'ed-toolbar': Toolbar
  },
  props: {
    'value': Boolean
  },
  data () {
    return {
      dropzoneOptions: {
        url: '/frontend/upload',
        thumbnailWidth: 500,
        maxFilesize: 10,
        acceptedFiles: 'image/jpeg,image/png,image.bmp',
        paramName: 'screenshot',
        autoProcessQueue: false,
        previewsContainer: false
      },
      currentAlbumTitle: '',
      uploadedImages: []
    }
  },
  computed: {
    ...mapState({
      theme: state => state.themes.theme,
      themes: state => state.themes.themes,
      albums: state => state.users.albums,
      defaultAlbum: state => state.albums.defaultAlbum
    }),
    albumTitles () {
      return [this.defaultAlbum].concat(this.albums.map(album => {
        return album.title
      }))
    }
  },
  watch: {
    value (newValue) {
      if (newValue === true) {
        this.$store.dispatch('fetchAlbums')
      }
    }
  },
  created () {
    this.$store.dispatch('fetchAlbums')
  },
  methods: {
    removeUploads () {
      this.$refs.uploadDropzone.removeAllFiles()
      this.uploadedImages = []
    },
    startUpload () {
      this.$refs.uploadDropzone.processQueue()
    },
    onImageUploaded (file, thumbnail) {
      this.uploadedImages.push({ file, thumbnail })
    },
    removeImage (index) {
      let removedImages = this.uploadedImages.splice(index, 1)
      for (let removedImage of removedImages) {
        this.$refs.uploadDropzone.removeFile(removedImage.file)
      }
    },
    async retryUpload (index) {
      let image = this.uploadedImages[index]
      try {
        let uploadBody = {
          title: image.title,
          description: image.description,
          file: image.file
        }
        if (this.currentAlbumTitle !== '' && this.currentAlbumTitle.toLowerCase() !== this.defaultAlbum.toLowerCase()) {
          uploadBody.album = this.currentAlbumTitle
        }
        try {
          await this.$store.dispatch('retryUpload', uploadBody)
          this.onImageUploadSuccess(image.file)
        } catch (e) {
          this.onImageUploadError(image.file, e.message, e)
        }
      } catch (e) {
        this.onImageUploadError(image.file, e.message)
      }
    },
    onImageSending (file, xhr, formData) {
      let index = this.uploadedImages.findIndex(image => {
        return image.file === file
      })
      let image = this.uploadedImages[index]
      this.uploadedImages.splice(index, 1, {
        ...image,
        status: 'SENDING'
      })
      if (!image.title) {
        image.title = ''
      }
      if (!image.description) {
        image.description = ''
      }
      formData.append('imageTitle', image.title)
      formData.append('imageDescription', image.description)
      if (this.currentAlbumTitle !== '' && this.currentAlbumTitle.toLowerCase() !== this.defaultAlbum.toLowerCase()) {
        formData.append('albumTitle', this.currentAlbumTitle)
      }
    },
    onImageUploadSuccess (file) {
      let index = this.uploadedImages.findIndex(image => {
        return image.file === file
      })
      let image = this.uploadedImages[index]
      this.uploadedImages.splice(index, 1, {
        ...image,
        status: 'SUCCESS'
      })
    },
    onImageUploadError (file, message, xhr) {
      let index = this.uploadedImages.findIndex(image => {
        return image.file === file
      })
      let image = this.uploadedImages[index]
      if (xhr) {
        this.uploadedImages.splice(index, 1, {
          ...image,
          status: 'FAILED'
        })
      } else {
        this.uploadedImages.splice(index, 1, {
          ...image,
          status: 'ERROR'
        })
      }
    }
  }
}
</script>

<style scoped lang="sass">
  @import '~vuetify/src/styles/styles.sass'

  .dark
    background: map-get($material-dark, 'bg-color')
    color: map-get($material-dark, 'fg-color')
    outline-color: map-get($material-dark, 'fg-color')

  .light
    background: map-get($material-light, 'bg-color')
    color: map-get($material-light, 'fg-color')
    outline-color: map-get($material-light, 'fg-color')

  .vue-dropzone
    border: unset
    flex-wrap: wrap

  .uploaderColumn
    min-height: 300px

  .outline
    outline: 5px dashed
    outline-offset: -20px

  .message
    align-self: center

  .image-overlay
    transition: 500ms

  .image-overlay:hover
    background-color: var(--v-primary-base)
    opacity: 0.85
    transition: 500ms
</style>
<style>
  #uploadDropzone.dropzone .dz-message {
    flex-grow: 1;
    display: flex;
    justify-content: center;
  }

  #uploadDropzone.dropzone.dz-started .dz-message {
    display: none;
  }

  #uploadDropzone.dropzone.dz-drag-hover {
    background-color: var(--v-accent-base);
  }

  #uploadDropzone.dropzone .dz-preview.dz-image-preview {
    flex: 0 1 auto !important;
    align-self: center;
  }

  #uploadDropzone.dropzone .dz-preview.dz-file-preview {
    flex: 0 1 auto !important;
    align-self: center;
  }

  #uploadDropzone.vue-dropzone .dz-preview .dz-details {
    background-color: var(--v-accent-base);
  }

  #uploadDropzone.vue-dropzone .dz-preview .dz-details .dz-size,
  #uploadDropzone.vue-dropzone .dz-preview .dz-details .dz-filename,
  #uploadDropzone.vue-dropzone .dz-preview .dz-details .preview-input {
    margin-bottom: 0.75em;
    display: flex;
  }

  #uploadDropzone.vue-dropzone .dz-preview .dz-details .preview-input {
    width: 100%;
    text-align: center;
    cursor: text;
  }

  #uploadDropzone.vue-dropzone .dz-preview .dz-details .preview-input label {
    width: 100%;
  }

  #uploadDropzone.vue-dropzone .dz-preview .dz-details .preview-input .preview-input-checkbox {
    cursor: pointer;
  }

  #uploadDropzone.vue-dropzone .dz-preview .dz-details .dz-filename span,
  #uploadDropzone.vue-dropzone .dz-preview .dz-details .dz-size span {
    width: 100%;
    text-align: center;
  }

  #uploadDropzone.dropzone .dz-preview .dz-progress {
    bottom: 10px;
    width: 90%;
    left: 5%;
    top: unset;
    margin-left: unset;
  }

  #uploadDropzone.vue-dropzone .dz-preview .dz-progress .dz-upload {
    background-color: var(--v-secondary-base);
  }

  #uploadDropzone.dropzone .dz-preview .dz-remove:hover {
    border: 2px white solid;
  }

  #uploadDropzone.vue-dropzone .dz-preview .dz-remove {
    line-height: 0;
    top: 15px;
    bottom: inherit;
    border: unset;
  }

  #uploadDropzone.dropzone.dz-clickable .dz-remove i {
    cursor: pointer;
    color: unset;
  }

  #uploadDropzone.vue-dropzone .dz-preview .dz-success-mark i,
  #uploadDropzone.vue-dropzone .dz-preview .dz-error-mark i {
    margin-left: auto;
    margin-right: auto;
    font-size: 54px;
    display: block;
    width: 54px;
    background-color: var(--v-secondary-base);
    border-radius: 27px;
  }

  #uploadDropzone.vue-dropzone .dz-preview .dz-error-message {
    left: 5%;
    width: 90%;
    top: unset;
    bottom: 15px;
    right: 5%;
  }

  #uploadDropzone.dropzone .dz-preview .dz-error-message {
    background: unset;
    background-color: var(--v-error-base);
  }

  #uploadDropzone.vue-dropzone .dz-preview .dz-error-message::after {
    content: none;
  }
</style>
