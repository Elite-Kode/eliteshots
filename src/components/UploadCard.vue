<template>
  <v-layout column fill-height>
    <v-flex shrink>
      <v-toolbar dark color="primary">
        <v-btn icon @click="closeDialog">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title>Upload</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn icon @click="closeDialog">
            <v-icon>save</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
    </v-flex>
    <v-flex grow>
      <vue-dropzone ref="myVueDropzone" id="uploadDropzone" :options="dropzoneOptions"
                    v-bind:class="[{light: theme === themes[0]}, {dark: theme === themes[1]}]"
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

export default {
  name: 'UploadCard',
  components: {
    'vue-dropzone': vue2Dropzone
  },
  data () {
    return {
      dropzoneOptions: {
        url: '/frontend/upload',
        thumbnailWidth: 500,
        maxFilesize: 10,
        autoProcessQueue: false
      }
    }
  },
  computed: {
    ...mapState({
      theme: state => state.themes.theme,
      themes: state => state.themes.themes
    })
  },
  methods: {
    closeDialog () {
      this.$emit('close')
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
  .dz-message {
    flex-grow: 1;
    display: flex;
    justify-content: center;
  }

  .dropzone.dz-drag-hover {
    background-color: var(--v-accent-base);
  }

  .dropzone .dz-preview.dz-image-preview {
    flex: 0 1 auto !important;
    align-self: center;
  }

  .vue-dropzone .dz-preview .dz-details {
    background-color: var(--v-accent-base);
  }

  .vue-dropzone .dz-preview .dz-details .dz-size,
  .vue-dropzone .dz-preview .dz-details .dz-filename {
    display: flex;
  }

  .vue-dropzone .dz-preview .dz-details .dz-filename span,
  .vue-dropzone .dz-preview .dz-details .dz-size span {
    width: 100%;
    text-align: center;
  }

  .dropzone .dz-preview:not(.dz-processing) .dz-progress {
    bottom: 10px;
    width: 90%;
    left: 5%;
    top: unset;
    margin-left: unset;
  }
</style>
