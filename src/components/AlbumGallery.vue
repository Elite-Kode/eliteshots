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
    <v-row dense class="mx-0">
      <v-col cols=12 lg="2" md="4" sm="6" v-for="(albumItem, i) in albumItems" :key="i">
        <slot name="thumbnail" :albumItem="albumItem" :itemIdex="i" :clickThumbnail="clickThumbnail">
          <v-card>
            <v-img
              :src="albumItem.thumbnail_location"
              @click="clickThumbnail(i)"
              class="album-thumbnail"
              aspect-ratio="1"
            >
              <v-row class="mx-0 album-title-background">
                <v-col class="text-truncate">
                  {{albumItem.title}}
                </v-col>
              </v-row>
            </v-img>
            <v-card-actions>
              <v-icon class="mr-1">photo</v-icon>
              {{albumItem.no_of_images}}
              <v-spacer/>
              <v-btn v-if="editable && albumItem.title!==defaultAlbum" icon @click="clickEdit(i)">
                <v-icon>edit</v-icon>
              </v-btn>
              <v-btn v-if="deletable && albumItem.title!==defaultAlbum" icon @click="clickDelete(i)">
                <v-icon>delete</v-icon>
              </v-btn>
              <v-btn v-if="albumItem.title!==defaultAlbum" icon :to="{ name: 'public-album', params:{albumId: albumItem._id}}" target="_blank">
                <v-icon>share</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </slot>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'

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
    },
    editable: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      selectedAlbumIndex: null
    }
  },
  computed: {
    ...mapState({
      defaultAlbum: state => state.albums.defaultAlbum
    })
  },
  methods: {
    clickThumbnail (index) {
      this.selectedAlbumIndex = index
      this.$emit('albumOpened', this.albumItems[index])
    },
    clickEdit (index) {
      this.$emit('albumEdited', this.albumItems[index])
    },
    clickDelete (index) {
      this.$emit('albumDeleted', this.albumItems[index])
    }
  }
}
</script>

<style scoped>
  .album-title-background {
    background-color: var(--v-primary-base);
    opacity: 0.85;
  }

  .album-thumbnail:hover {
    cursor: pointer;
  }
</style>
