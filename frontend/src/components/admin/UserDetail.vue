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
    <mod-action :action-target="modActionTarget"
                :mod-action="modActionType"
                :open-dialog="modActionDialog"
                :target-type="modActionTargetType"
                @cancelled="onCancelled"
                @confirmed="onConfirmed"/>
    <v-form>
      <v-row align="center">
        <v-col cols="3">
          <v-subheader>Commander Name</v-subheader>
        </v-col>
        <v-col cols="9">
          <v-text-field
            :value="userData.commander"
            dense
            readonly>
          </v-text-field>
        </v-col>
      </v-row>
      <v-row align="center">
        <v-col cols="3">
          <v-subheader>ID</v-subheader>
        </v-col>
        <v-col cols="3">
          <v-text-field
            :value="userData._id"
            dense
            readonly>
          </v-text-field>
        </v-col>
        <template v-if="authenticated && authUser.access === adminAccess">
          <v-col cols="3">
            <v-subheader>Frontier ID</v-subheader>
          </v-col>
          <v-col cols="3">
            <v-text-field
              :value="userData.frontier_id"
              dense
              readonly>
            </v-text-field>
          </v-col>
        </template>
      </v-row>
      <v-row align="center">
        <v-col cols="3">
          <v-subheader>Access</v-subheader>
        </v-col>
        <v-col cols="3">
          <v-text-field
            :value="userData.access"
            dense
            readonly/>
        </v-col>
        <v-col cols="3">
          <v-subheader>Trusted</v-subheader>
        </v-col>
        <v-col cols="3">
          <v-checkbox
            v-model="userData.trusted"
            dense
            readonly/>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="3">
          <v-btn v-if="userData.access!==bannedAccess" :disabled="!canBan" block color="error" outlined
                 @click="banUser">
            Ban
          </v-btn>
          <v-btn v-else :disabled="!canUnban" block color="success" outlined @click="unbanUser">Unban</v-btn>
        </v-col>
        <v-col cols="6" sm="3">
          <v-btn :disabled="!canDemote" block color="error" @click="demoteUser">Demote</v-btn>
        </v-col>
        <v-col cols="6" sm="3">
          <v-btn :disabled="!canPromote" block color="success" @click="promoteUser">Promote</v-btn>
        </v-col>
        <v-col cols="12" sm="3">
          <v-btn v-if="!userData.trusted" :disabled="!canTrust" block color="success" outlined @click="trustUser">
            Trust
          </v-btn>
          <v-btn v-else :disabled="!canTrust" block color="error" outlined @click="untrustUser">Untrust</v-btn>
        </v-col>
      </v-row>
    </v-form>
    <uploaded-images :disable-mod-actions="!canModImages"
                     :user-id="userId"
                     @accept="onAcceptImage"
                     @reject="onRejectImage"/>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import UploadedImages from '@/components/admin/UploadedImages'
import ModActionConfirmation from '@/components/admin/ModActionConfirmation'

export default {
  name: 'UserDetail',
  components: {
    'uploaded-images': UploadedImages,
    'mod-action': ModActionConfirmation
  },
  props: {
    userId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      userData: {},
      bannedAccess: 'BANNED',
      normalAccess: 'NORMAL',
      modAccess: 'MOD',
      adminAccess: 'ADMIN',
      modActionDialog: false,
      modActionType: '',
      modActionTargetType: '',
      modActionTarget: ''
    }
  },
  computed: {
    ...mapState({
      themes: state => state.themes.themes,
      theme: state => state.themes.theme,
      authenticated: state => state.auth.authenticated,
      authUser: state => state.auth.user
    }),
    canBan () {
      if (this.userData._id === this.authUser._id) {
        return false
      } else if (this.userData.access === this.normalAccess) {
        return true
      } else if (this.userData.access === this.modAccess) {
        return this.authUser.access === this.adminAccess
      } else {
        return false
      }
    },
    canUnban () {
      if (this.userData._id === this.authUser._id) {
        return false
      } else {
        return this.userData.access === this.bannedAccess
      }
    },
    canDemote () {
      return this.authUser.access === this.adminAccess && this.userData.access === this.modAccess
    },
    canPromote () {
      return this.authUser.access === this.adminAccess && this.userData.access === this.normalAccess
    },
    canTrust () {
      if (this.userData._id === this.authUser._id) {
        return false
      } else if (this.userData.access === this.normalAccess) {
        return true
      } else if (this.userData.access === this.bannedAccess) {
        return false
      } else if (this.userData.access === this.modAccess) {
        return this.authUser.access === this.adminAccess
      } else {
        return false
      }
    },
    canModImages () {
      return this.authUser._id !== this.userData._id
    }
  },
  created () {
    this.fetchUserDetail()
  },
  methods: {
    async fetchUserDetail () {
      this.userData = await this.$store.dispatch('fetchUser', this.userId)
    },
    banUser () {
      this.modActionType = 'BAN'
      this.modActionTargetType = 'USER'
      this.modActionTarget = this.userData._id
      this.modActionDialog = true
    },
    unbanUser () {
      this.modActionType = 'UNBAN'
      this.modActionTargetType = 'USER'
      this.modActionTarget = this.userData._id
      this.modActionDialog = true
    },
    demoteUser () {
      this.modActionType = 'DEMOTE'
      this.modActionTargetType = 'USER'
      this.modActionTarget = this.userData._id
      this.modActionDialog = true
    },
    promoteUser () {
      this.modActionType = 'PROMOTE'
      this.modActionTargetType = 'USER'
      this.modActionTarget = this.userData._id
      this.modActionDialog = true
    },
    trustUser () {
      this.modActionType = 'TRUST'
      this.modActionTargetType = 'USER'
      this.modActionTarget = this.userData._id
      this.modActionDialog = true
    },
    untrustUser () {
      this.modActionType = 'UNTRUST'
      this.modActionTargetType = 'USER'
      this.modActionTarget = this.userData._id
      this.modActionDialog = true
    },
    onAcceptImage (image) {
      this.modActionType = 'ACCEPT'
      this.modActionTargetType = 'IMAGE'
      this.modActionTarget = image._id
      this.modActionDialog = true
    },
    onRejectImage (image) {
      this.modActionType = 'REJECT'
      this.modActionTargetType = 'IMAGE'
      this.modActionTarget = image._id
      this.modActionDialog = true
    },
    onCancelled () {
      this.modActionDialog = false
    },
    async onConfirmed (comment) {
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
      this.fetchUserDetail()
    }
  }
}
</script>
