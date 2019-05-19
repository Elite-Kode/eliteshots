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
    <v-layout row wrap ref="imageContainer">
      <v-flex xs3 v-for="(imageItem, i) in imageItems" :key="i">
        <slot name="thumbnail" :imageItem="imageItem" :itemIdex="i" :clickThumbnail="clickThumbnail">
          <v-card>
            <v-hover>
              <v-img
                slot-scope="{ hover }"
                :src="imageItem.thumbnail_location"
                @click="clickThumbnail(i)"
                class="image-thumbnail"
              >
                <v-expand-transition>
                  <v-layout v-if="hover" ma-0 primary class="image-title-background">
                    <v-flex class="text-truncate">
                      {{imageItem.title}}
                    </v-flex>
                    <v-flex shrink d-inline-flex>
                      <v-icon class="mr-1">favorite</v-icon>
                      {{imageItem.no_of_likes}}
                    </v-flex>
                  </v-layout>
                </v-expand-transition>
              </v-img>
            </v-hover>
            <v-card-actions>
              <v-icon class="mr-1">remove_red_eye</v-icon>
              {{imageItem.no_of_views + imageItem.anonymous_views}}
              <v-spacer></v-spacer>
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
              <v-btn icon>
                <v-icon>share</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </slot>
      </v-flex>
      <slot name="lightbox" :imageLinks="imageLinks" :selectedImageIndex="selectedImageIndex"
            :closeGallery="closeGallery">
        <gallery :images="imageLinks" :index="selectedImageIndex" @close="closeGallery()"></gallery>
      </slot>
    </v-layout>
    <mugen-scroll :handler="fetchImages" :should-handle="!loading && !end">
      <div v-if="end">
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
    authenticated: {
      type: Boolean,
      default: false
    },
    deletable: {
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
    }
  },
  data () {
    return {
      selectedImageIndex: null
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
    }
  },
  methods: {
    clickThumbnail (index) {
      this.selectedImageIndex = index
      this.$emit('imageViewed', this.imageItems[index])
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
    opacity: 0.85;
  }

  .image-thumbnail:hover {
    cursor: pointer;
  }
</style>
