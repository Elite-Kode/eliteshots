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
    <v-layout row wrap>
      <v-flex xs2 v-for="(albumItem, i) in albumItems" :key="i">
        <slot name="thumbnail" :albumItem="albumItem" :itemIdex="i" :clickThumbnail="clickThumbnail">
          <v-card>
            <v-hover>
              <v-img
                slot-scope="{ hover }"
                :src="albumItem.thumbnail_location"
                @click="clickThumbnail(i)"
                class="album-thumbnail"
                aspect-ratio="1"
              >
                <v-expand-transition>
                  <v-layout v-if="hover" ma-0 primary class="album-title-background">
                    <v-flex class="text-truncate">
                      {{albumItem.title}}
                    </v-flex>
                  </v-layout>
                </v-expand-transition>
              </v-img>
            </v-hover>
            <v-card-actions>
              <v-icon class="mr-1">photo</v-icon>
              {{albumItem.no_of_images}}
              <v-spacer></v-spacer>
              <v-btn v-if="deletable && albumItem.title!==defaultAlbumTitle" icon @click="clickDelete(i)">
                <v-icon>delete</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </slot>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import { defaultAlbumTitle } from '../../processVars'

export default {
  name: 'AlbumGallery',
  props: {
    albumItems: {
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
    }
  },
  data () {
    return {
      selectedAlbumIndex: null,
      defaultAlbumTitle: defaultAlbumTitle
    }
  },
  methods: {
    clickThumbnail (index) {
      this.selectedAlbumIndex = index
      this.$emit('albumOpened', this.albumItems[index])
    },
    clickDelete (index) {
      this.$emit('albumDeleted', this.albumItems[index])
    }
  }
}
</script>

<style scoped>
  .album-title-background {
    opacity: 0.85;
  }

  .album-thumbnail:hover {
    cursor: pointer;
  }
</style>
