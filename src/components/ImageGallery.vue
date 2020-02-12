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
    <v-row dense ref="imageContainer" class="mx-0">
      <v-col cols=12 lg="3" md="4" sm="6" v-for="(imageItem, i) in imageItems" :key="i">
        <slot name="thumbnail" :imageItem="imageItem" :itemIndex="i" :clickThumbnail="clickThumbnail">
          <v-card>
            <v-hover v-slot="{ hover }">
              <v-img
                :src="imageItem.thumbnail_location"
                @click="clickThumbnail(i)"
                class="image-thumbnail"
                min-height="200px"
              >
                <h4 v-if="imageItem.curated && curationBanner" class="ribbon ribbon-curated">CURATED</h4>
                <template v-else-if="modStatusBanner">
                  <h4 v-if="imageItem.moderation_status==='ACCEPTED'" class="ribbon ribbon-accepted">ACCEPTED</h4>
                  <h4 v-else-if="imageItem.moderation_status==='REJECTED'" class="ribbon ribbon-rejected">REJECTED</h4>
                  <h4 v-else-if="imageItem.moderation_status==='PENDING'" class="ribbon ribbon-pending">PENDING</h4>
                </template>
                <v-expand-transition>
                  <v-row v-if="hover" class="mx-0 image-title-background">
                    <v-col class="text-truncate">
                      {{imageItem.title}}
                    </v-col>
                    <v-col class="flex-shrink-1 flex-grow-0 d-inline-flex">
                      <v-icon class="mr-1">favorite</v-icon>
                      {{imageItem.no_of_likes}}
                    </v-col>
                  </v-row>
                </v-expand-transition>
                <v-expand-transition v-if="!noUser">
                  <v-row v-if="hover" class="mx-0 image-title-background">
                    <v-col class="text-truncate">
                      CMDR {{imageItem.cmdr_name}}
                    </v-col>
                    <v-col class="flex-shrink-1 flex-grow-0 d-inline-flex">
                      <v-icon class="mr-1">remove_red_eye</v-icon>
                      {{imageItem.no_of_views + imageItem.anonymous_views}}
                    </v-col>
                  </v-row>
                </v-expand-transition>
              </v-img>
            </v-hover>
            <v-card-actions>
              <template v-if="shareLinks[i].status">
                <v-text-field dense
                              readonly
                              prepend-icon="clear"
                              @click:prepend="closeShare(i)"
                              class="share-link"
                              :value="shareLinks[i].link"/>
              </template>
              <template v-else>
                <v-btn icon :to="{ name: 'image-item', params:{imageId: imageItem._id}}" target="_blank">
                  <v-icon>launch</v-icon>
                </v-btn>
                <v-spacer/>
                <v-btn v-if="editable" icon @click="clickEdit(i)">
                  <v-icon>edit</v-icon>
                </v-btn>
                <v-btn v-if="deletable" icon @click="clickDelete(i)">
                  <v-icon>delete</v-icon>
                </v-btn>
                <v-btn v-if="authenticated" icon @click="clickLike(i)">
                  <v-icon v-if="imageItem.self_like" color="primary">favorite</v-icon>
                  <v-icon v-else>favorite_border</v-icon>
                </v-btn>
                <v-btn v-if="authenticated" icon @click="clickSave(i)">
                  <v-icon v-if="imageItem.self_save" color="primary">bookmark</v-icon>
                  <v-icon v-else>bookmark_border</v-icon>
                </v-btn>
                <v-btn icon @click="clickShare(i)">
                  <v-icon>share</v-icon>
                </v-btn>
              </template>
            </v-card-actions>
          </v-card>
        </slot>
      </v-col>
      <slot name="lightbox" :imageLinks="imageLinks" :selectedImageIndex="selectedImageIndex"
            :closeGallery="closeGallery">
        <gallery :images="imageLinks" :index="selectedImageIndex" @close="closeGallery()"/>
      </slot>
    </v-row>
    <mugen-scroll :handler="fetchImages" :should-handle="!loading && !end">
      <div v-if="end" class="my-2">
        No more images
      </div>
      <div v-else>
        loading...
      </div>
    </mugen-scroll>
  </div>
</template>

<script>
import vueGallery from 'vue-gallery'
import MugenScroll from 'vue-mugen-scroll'

export default {
  name: 'ImageGallery',
  components: {
    'gallery': vueGallery,
    'mugen-scroll': MugenScroll
  },
  props: {
    imageItems: {
      type: Array,
      default () {
        return []
      }
    },
    linkKey: {
      type: String,
      default: ''
    },
    authenticated: {
      type: Boolean,
      default: false
    },
    deletable: {
      type: Boolean,
      default: false
    },
    editable: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    end: {
      type: Boolean,
      default: false
    },
    noUser: {
      type: Boolean,
      default: false
    },
    curationBanner: {
      type: Boolean,
      default: false
    },
    modStatusBanner: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      selectedImageIndex: null,
      shareLinks: []
    }
  },
  computed: {
    imageLinks () {
      return this.imageItems.map(imageItem => {
        return imageItem.low_res_location
      })
    }
  },
  watch: {
    imageItems () {
      if (this.$refs.imageContainer.clientHeight < window.innerHeight && !this.end) {
        this.fetchImages()
      }
      this.shareLinks = this.imageItems.map(image => {
        return {
          link: image[this.linkKey],
          status: false
        }
      })
    }
  },
  methods: {
    clickThumbnail (index) {
      this.selectedImageIndex = index
      this.$emit('imageViewed', this.imageItems[index])
    },
    clickEdit (index) {
      this.$emit('imageEdited', this.imageItems[index])
    },
    clickDelete (index) {
      this.$emit('imageDeleted', this.imageItems[index])
    },
    clickLike (index) {
      this.$emit('imageLiked', this.imageItems[index])
    },
    clickSave (index) {
      this.$emit('imageSaved', this.imageItems[index])
    },
    clickShare (index) {
      this.shareLinks[index].status = true
    },
    closeShare (index) {
      this.shareLinks[index].status = false
    },
    closeGallery () {
      this.selectedImageIndex = null
    },
    fetchImages () {
      this.$emit('fetchImages')
    }
  }
}
</script>

<style scoped>
  .image-title-background {
    background-color: var(--v-primary-base);
    opacity: 0.85;
  }

  .image-thumbnail:hover {
    cursor: pointer;
  }

  .ribbon {
    margin: 0;
    padding: 0;
    position: absolute;
    top: 0;
    right: 0;
    transform: translateX(30%) translateY(0%) rotate(45deg);
    transform-origin: top left;
  }

  .ribbon:before,
  .ribbon:after {
    content: '';
    position: absolute;
    top: 0;
    margin: 0 -1px;
    width: 100%;
    height: 100%;
  }

  .ribbon:before {
    right: 100%;
  }

  .ribbon:after {
    left: 100%;
  }
</style>
<style scoped lang="sass">
  @import '~vuetify/src/styles/styles.sass'

  .ribbon-pending,
  .ribbon-pending:before,
  .ribbon-pending:after
    background-color: var(--v-secondary-base)
    color: map-get($material-dark, 'fg-color')

  .ribbon-accepted,
  .ribbon-accepted:before,
  .ribbon-accepted:after
    background-color: var(--v-success-base)
    color: map-get($material-dark, 'fg-color')

  .ribbon-rejected,
  .ribbon-rejected:before,
  .ribbon-rejected:after
    background-color: var(--v-error-base)
    color: map-get($material-dark, 'fg-color')

  .ribbon-curated,
  .ribbon-curated:before,
  .ribbon-curated:after
    background-color: var(--v-warning-base)
    color: map-get($material-light, 'fg-color')
</style>
<style>
  .share-link .v-text-field__details {
    display: none;
  }
</style>
