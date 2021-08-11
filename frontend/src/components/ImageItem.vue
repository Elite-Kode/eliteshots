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
    <ed-toolbar scroll-of-screen scroll-threshold="64" />
    <mod-action
      :action-target="modActionTarget"
      :mod-action="modActionType"
      :open-dialog="modActionDialog"
      :target-type="modActionTargetType"
      @cancelled="onCancelled"
      @confirmed="onConfirmed"
    />
    <image-edit
      :all-albums="albums"
      :edit-album="editAlbum"
      :edit-description="editDescription"
      :edit-title="editTitle"
      :editDialog="editDialog"
      :editId="editId"
      @cancel="onEditCancel"
      @confirm="onEditConfirm"
    />
    <v-main>
      <v-container class="pa-0" fluid>
        <v-card>
          <v-img :src="imageItem.image_location" class="image-fit" />
          <v-card-title class="d-block">
            <v-row dense>
              <v-col v-if="isMod" cols="12" lg="9">
                <v-row class="flex-md-nowrap" dense>
                  <v-col>
                    <v-btn :disabled="!canAccept" block color="success" @click="acceptImage">
                      Accept
                      <v-icon right>check</v-icon>
                    </v-btn>
                  </v-col>
                  <v-col>
                    <v-btn :disabled="!canReject" block color="error" outlined @click="rejectImage">
                      Reject
                      <v-icon right>clear</v-icon>
                    </v-btn>
                  </v-col>
                  <v-col>
                    <v-btn :disabled="!canCurate" block color="primary" @click="curateImage">
                      Curate
                      <v-icon right>mdi-image-frame</v-icon>
                    </v-btn>
                  </v-col>
                  <v-col>
                    <v-btn
                      v-if="imageItem.user_access !== bannedAccess"
                      :disabled="!canBan"
                      block
                      color="error"
                      outlined
                      @click="banUser"
                    >
                      Ban
                    </v-btn>
                    <v-btn v-else :disabled="!canUnban" block color="success" outlined @click="unbanUser">Unban</v-btn>
                  </v-col>
                  <v-col>
                    <v-btn :disabled="!canDemote" block color="error" @click="demoteUser">Demote</v-btn>
                  </v-col>
                  <v-col>
                    <v-btn :disabled="!canPromote" block color="success" @click="promoteUser">Promote</v-btn>
                  </v-col>
                  <v-col>
                    <v-btn
                      v-if="!imageItem.user_trusted"
                      :disabled="!canTrust"
                      block
                      color="success"
                      outlined
                      @click="trustUser"
                    >
                      Trust
                    </v-btn>
                    <v-btn v-else :disabled="!canTrust" block color="error" outlined @click="untrustUser"
                      >Untrust
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
              <v-col :lg="isMod ? 3 : 12" cols="12">
                <v-row class="flex-md-nowrap" dense>
                  <v-col v-if="canEdit" class="d-flex justify-center">
                    <v-btn icon @click="editImage">
                      <v-icon>edit</v-icon>
                    </v-btn>
                  </v-col>
                  <v-col v-if="canDelete" class="d-flex justify-center">
                    <v-btn icon @click="deleteImage">
                      <v-icon>delete</v-icon>
                    </v-btn>
                  </v-col>
                  <v-col v-if="authenticated" class="d-flex justify-center">
                    <v-btn icon @click="likeImage">
                      <v-icon v-if="imageItem.self_like" color="primary">favorite</v-icon>
                      <v-icon v-else>favorite_border</v-icon>
                    </v-btn>
                  </v-col>
                  <v-col v-if="authenticated" class="d-flex justify-center">
                    <v-btn icon @click="saveImage">
                      <v-icon v-if="imageItem.self_save" color="primary">bookmark</v-icon>
                      <v-icon v-else>bookmark_border</v-icon>
                    </v-btn>
                  </v-col>
                  <v-col class="d-flex justify-center">
                    <v-btn icon>
                      <v-icon>share</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row>
              <div>
                <h3 class="headline">{{ imageItem.title }}</h3>
                <div>{{ imageItem.description }}</div>
                <div>
                  Image link : <a target="_blank" :href="imageItem.image_location">{{ imageItem.image_location }}</a>
                  <v-icon>launch</v-icon>
                </div>
              </div>
            </v-row>
          </v-card-title>
        </v-card>
      </v-container>
    </v-main>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Toolbar from '@/components/Toolbar'
import ModActionConfirmation from '@/components/admin/ModActionConfirmation'
import ImageEdit from '@/components/profile/ImageEdit'

export default {
  name: 'ImageItem',
  components: {
    'ed-toolbar': Toolbar,
    'mod-action': ModActionConfirmation,
    'image-edit': ImageEdit
  },
  props: {
    imageId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      imageItem: {},
      bannedAccess: 'BANNED',
      normalAccess: 'NORMAL',
      modAccess: 'MOD',
      adminAccess: 'ADMIN',
      modActionDialog: false,
      modActionType: '',
      modActionTargetType: '',
      modActionTarget: '',
      editDialog: false,
      editId: '',
      editTitle: '',
      editDescription: '',
      editAlbum: ''
    }
  },
  computed: {
    ...mapState({
      albums: (state) => state.self.albums,
      authenticated: (state) => state.auth.authenticated,
      authUser: (state) => state.auth.user
    }),
    isMod() {
      return this.authUser.access === this.modAccess || this.authUser.access === this.adminAccess
    },
    canAccept() {
      return this.authUser._id !== this.imageItem.user_id && this.imageItem.moderation_status !== 'ACCEPTED'
    },
    canReject() {
      return this.authUser._id !== this.imageItem.user_id && this.imageItem.moderation_status !== 'REJECTED'
    },
    canCurate() {
      return this.authUser._id !== this.imageItem.user_id && !this.imageItem.curated
    },
    canBan() {
      if (this.imageItem.user_id === this.authUser._id) {
        return false
      } else if (this.imageItem.user_access === this.normalAccess) {
        return true
      } else if (this.imageItem.user_access === this.modAccess) {
        return this.imageItem.user_access === this.adminAccess
      } else {
        return false
      }
    },
    canUnban() {
      if (this.imageItem.user_id === this.authUser._id) {
        return false
      } else {
        return this.imageItem.user_access === this.bannedAccess
      }
    },
    canDemote() {
      return this.authUser.access === this.adminAccess && this.imageItem.user_access === this.modAccess
    },
    canPromote() {
      return this.authUser.access === this.adminAccess && this.imageItem.user_access === this.normalAccess
    },
    canTrust() {
      if (this.imageItem.user_id === this.authUser._id) {
        return false
      } else if (this.imageItem.user_access === this.normalAccess) {
        return true
      } else if (this.imageItem.user_access === this.bannedAccess) {
        return false
      } else if (this.imageItem.user_access === this.modAccess) {
        return this.authUser.user_access === this.adminAccess
      } else {
        return false
      }
    },
    canEdit() {
      return this.authUser._id === this.imageItem.user_id
    },
    canDelete() {
      return this.authUser._id === this.imageItem.user_id
    }
  },
  async created() {
    this.$store.dispatch('checkAuthenticated')
    this.$store.dispatch('fetchAlbums')
    await this.fetchUseImageDetail()
    this.$store.dispatch('triggerImageViewed', this.imageItem)
  },
  methods: {
    async fetchUseImageDetail() {
      this.imageItem = await this.$store.dispatch('fetchImage', this.imageId)
    },
    acceptImage() {
      this.modActionType = 'ACCEPT'
      this.modActionTargetType = 'IMAGE'
      this.modActionTarget = this.imageItem._id
      this.modActionDialog = true
    },
    rejectImage() {
      this.modActionType = 'REJECT'
      this.modActionTargetType = 'IMAGE'
      this.modActionTarget = this.imageItem._id
      this.modActionDialog = true
    },
    curateImage() {
      this.modActionType = 'CURATE'
      this.modActionTargetType = 'IMAGE'
      this.modActionTarget = this.imageItem._id
      this.modActionDialog = true
    },
    banUser() {
      this.modActionType = 'BAN'
      this.modActionTargetType = 'USER'
      this.modActionTarget = this.imageItem.user_id
      this.modActionDialog = true
    },
    unbanUser() {
      this.modActionType = 'UNBAN'
      this.modActionTargetType = 'USER'
      this.modActionTarget = this.imageItem.user_id
      this.modActionDialog = true
    },
    demoteUser() {
      this.modActionType = 'DEMOTE'
      this.modActionTargetType = 'USER'
      this.modActionTarget = this.imageItem.user_id
      this.modActionDialog = true
    },
    promoteUser() {
      this.modActionType = 'PROMOTE'
      this.modActionTargetType = 'USER'
      this.modActionTarget = this.imageItem.user_id
      this.modActionDialog = true
    },
    trustUser() {
      this.modActionType = 'TRUST'
      this.modActionTargetType = 'USER'
      this.modActionTarget = this.imageItem.user_id
      this.modActionDialog = true
    },
    untrustUser() {
      this.modActionType = 'UNTRUST'
      this.modActionTargetType = 'USER'
      this.modActionTarget = this.imageItem.user_id
      this.modActionDialog = true
    },
    editImage() {
      this.editId = this.imageItem._id
      this.editTitle = this.imageItem.title
      this.editDescription = this.imageItem.description
      this.editAlbum = this.imageItem.album_id ? this.imageItem.album_id : '0'
      this.editDialog = true
    },
    deleteImage() {
      this.$store.dispatch('triggerSelfImageDeleted', this.imageItem)
    },
    likeImage() {
      this.$store.dispatch('triggerImageLiked', this.imageItem)
    },
    saveImage() {
      this.$store.dispatch('triggerImageSaved', this.imageItem)
    },
    onEditCancel() {
      this.editDialog = false
    },
    onEditConfirm({ title, description, album }) {
      this.editDialog = false
      this.$store.dispatch('triggerSelfImageEdited', {
        imageId: this.editId,
        title,
        description,
        album
      })
    },
    onCancelled() {
      this.modActionDialog = false
    },
    async onConfirmed(comment) {
      this.modActionDialog = false
      let payload = {
        target: this.modActionTarget,
        comment: comment
      }
      if (this.modActionTargetType === 'IMAGE') {
        if (this.modActionType === 'ACCEPT') {
          await this.$store.dispatch('acceptImage', payload)
        } else if (this.modActionType === 'REJECT') {
          await this.$store.dispatch('rejectImage', payload)
        } else if (this.modActionType === 'CURATE') {
          await this.$store.dispatch('curateImage', payload)
        }
      } else if (this.modActionTargetType === 'USER') {
        if (this.modActionType === 'BAN') {
          await this.$store.dispatch('banUser', payload)
        } else if (this.modActionType === 'UNBAN') {
          await this.$store.dispatch('unbanUser', payload)
        } else if (this.modActionType === 'DEMOTE') {
          await this.$store.dispatch('demoteUser', payload)
        } else if (this.modActionType === 'PROMOTE') {
          await this.$store.dispatch('promoteUser', payload)
        } else if (this.modActionType === 'TRUST') {
          await this.$store.dispatch('trustUser', payload)
        } else if (this.modActionType === 'UNTRUST') {
          await this.$store.dispatch('untrustUser', payload)
        }
      }
      this.fetchUseImageDetail()
    }
  }
}
</script>

<style scoped>
.image-fit {
  width: max-content;
  margin: auto;
}
</style>
