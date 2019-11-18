<template>
  <v-layout column fill-height>
    <v-flex shrink>
      <v-toolbar dark dense color="primary">
        <v-btn icon @click="closeDialog">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title>Upload</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-combobox
            v-model="currentAlbumTitle"
            :items="albumTitles"
            clearable
            solo-inverted
            label="Select or Make a new Album"
            @input.native="currentAlbumTitle=$event.srcElement.value"
          ></v-combobox>
          <v-btn icon @click="removeUploads">
            <v-icon>delete</v-icon>
          </v-btn>
          <v-btn icon @click="startUpload">
            <v-icon>save</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
    </v-flex>
    <v-flex grow>
      <vue-dropzone ref="uploadDropzone" id="uploadDropzone" :options="dropzoneOptions" @vdropzone-sending="uploadEvent"
                    :class="[{light: theme === themes[0]}, {dark: theme === themes[1]}]"
                    class="fill-height outline d-flex justify-center" useCustomSlot>
        <div class="message">
          <h3 class="title">Drag and drop to upload content!</h3>
          <div class="subtitle">...or click to select a file from your computer</div>
        </div>
      </vue-dropzone>
    </v-flex>
  </v-layout>
</template>

<script>
import vue2Dropzone from 'vue2-dropzone'
import { mapState } from 'vuex'
import { defaultAlbumTitle } from '../../processVars'

export default {
  name: 'UploadCard',
  components: {
    'vue-dropzone': vue2Dropzone
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
        previewTemplate: this.template()
      },
      currentAlbumTitle: ''
    }
  },
  computed: {
    ...mapState({
      theme: state => state.themes.theme,
      themes: state => state.themes.themes,
      albums: state => state.users.albums
    }),
    albumTitles () {
      return [defaultAlbumTitle].concat(this.albums.map(album => {
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
    closeDialog () {
      this.value = false
      this.$emit('input', this.value)
    },
    removeUploads () {
      this.$refs.uploadDropzone.removeAllFiles()
    },
    startUpload () {
      this.$refs.uploadDropzone.processQueue()
    },
    uploadEvent (file, xhr, formData) {
      let title = file.previewElement.querySelector('input#image-title').value
      let description = file.previewElement.querySelector('input#image-description').value
      let isPublic = file.previewElement.querySelector('input#image-public').checked
      formData.append('imageTitle', title)
      formData.append('imageDescription', description)
      formData.append('isPublic', isPublic)
      if (this.currentAlbumTitle !== '' && this.currentAlbumTitle.toLowerCase() !== defaultAlbumTitle.toLowerCase()) {
        formData.append('albumTitle', this.currentAlbumTitle)
      }
    },
    template: function () {
      return `<div class="dz-preview dz-file-preview">
                <div class="dz-image">
                    <img data-dz-thumbnail />
                </div>
                <div class="dz-details">
                    <div class="dz-size"><span data-dz-size></span></div>
                    <div class="dz-filename"><span data-dz-name></span></div>
                    <input class="preview-input" type="text" id="image-title" placeholder="Image Title">
                    <input class="preview-input" type="text" id="image-description" placeholder="Image Description">
                    <div class="preview-input">
                       <label><input class="preview-input-checkbox" type="checkbox" id="image-public" value="true"> Public?</label>
                    </div>
                </div>
                <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
                <div class="dz-error-message"><span data-dz-errormessage></span></div>
                <div class="dz-success-mark"><i class="material-icons">check</i></div>
                <div class="dz-error-mark"><i class="material-icons">close</i></div>
                <a class="dz-remove" href="javascript:undefined;" data-dz-remove><i class="material-icons">close</i></a>
            </div>`
    }
  }
}
</script>

<style scoped lang="stylus">
  @import '~vuetify/src/stylus/theme';

  .dark
    background $body-bg-dark
    color $body-color-light
    outline-color $body-color-light

  .light
    background $body-bg-light
    color $body-color-dark
    outline-color $body-color-dark

  .vue-dropzone
    border unset
    flex-wrap wrap

  .outline
    outline 5px dashed
    outline-offset -20px

  .message
    align-self center
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
