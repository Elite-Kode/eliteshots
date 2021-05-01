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
    <v-row class="mx-0" dense>
      <v-col v-for="(albumItem, i) in albumItems" :key="i" cols="12" lg="2" md="4" sm="6">
        <slot :albumItem="albumItem" :clickThumbnail="clickThumbnail" :itemIdex="i" name="thumbnail">
          <v-card>
            <v-img
              :src="albumItem.thumbnail_location"
              aspect-ratio="1"
              class="album-thumbnail"
              @click="clickThumbnail(i)"
            >
              <v-row class="mx-0 album-title-background">
                <v-col class="text-truncate">
                  {{ albumItem.title }}
                </v-col>
              </v-row>
            </v-img>
            <v-card-actions>
              <v-icon class="mr-1">photo</v-icon>
              {{ albumItem.no_of_images }}
              <v-spacer />
              <v-btn v-if="editable && albumItem.title !== defaultAlbum" icon @click="clickEdit(i)">
                <v-icon>edit</v-icon>
              </v-btn>
              <v-btn v-if="deletable && albumItem.title !== defaultAlbum" icon @click="clickDelete(i)">
                <v-icon>delete</v-icon>
              </v-btn>
              <v-btn
                v-if="albumItem.title !== defaultAlbum"
                :to="{ name: 'public-album', params: { albumId: albumItem._id } }"
                icon
                target="_blank"
              >
                <v-icon>share</v-icon>
              </v-btn>
              <v-dialog v-if="albumItem.title === defaultAlbum" v-model="newAlbumDialog" max-width="600px" persistent>
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" color="primary">New Album</v-btn>
                </template>
                <v-card>
                  <v-card-title>
                    <span class="headline">New Album</span>
                  </v-card-title>
                  <v-card-text>
                    <v-container>
                      <v-row dense>
                        <v-col>
                          <v-text-field v-model="newAlbumTitle" label="Title" />
                        </v-col>
                      </v-row>
                      <v-row dense>
                        <v-col>
                          <v-textarea v-model="newAlbumDescription" label="Description (optional)" />
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn color="error" text @click="clickNewAlbumCancel">Cancel</v-btn>
                    <v-btn color="success" text @click="clickNewAlbumConfirm">Confirm</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
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
      default() {
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
  data() {
    return {
      selectedAlbumIndex: null,
      newAlbumDialog: false,
      newAlbumTitle: '',
      newAlbumDescription: ''
    }
  },
  computed: {
    ...mapState({
      defaultAlbum: (state) => state.albums.defaultAlbum
    })
  },
  methods: {
    clickThumbnail(index) {
      this.selectedAlbumIndex = index
      this.$emit('albumOpened', this.albumItems[index])
    },
    clickEdit(index) {
      this.$emit('albumEdited', this.albumItems[index])
    },
    clickDelete(index) {
      this.$emit('albumDeleted', this.albumItems[index])
    },
    clickNewAlbumConfirm() {
      this.newAlbumDialog = false
      this.$emit('albumCreated', {
        title: this.newAlbumTitle,
        description: this.newAlbumDescription
      })
      this.newAlbumTitle = ''
      this.newAlbumDescription = ''
    },
    clickNewAlbumCancel() {
      this.newAlbumDialog = false
      this.newAlbumTitle = ''
      this.newAlbumDescription = ''
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
