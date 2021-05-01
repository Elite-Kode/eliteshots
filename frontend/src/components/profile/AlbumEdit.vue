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
  <v-dialog v-model="dialogState" max-width="600px" persistent>
    <v-card>
      <v-card-title>
        <span class="headline">Update Album {{ editId }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row dense>
            <v-col>
              <v-text-field v-model="editTitleNew" label="Title (optional)" />
            </v-col>
          </v-row>
          <v-row dense>
            <v-col>
              <v-textarea v-model="editDescriptionNew" label="Description (optional)" />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="error" text @click="clickEditCancel">Cancel</v-btn>
        <v-btn color="success" text @click="clickEditConfirm">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'AlbumEdit',
  props: {
    editId: {
      type: String,
      default: ''
    },
    editTitle: {
      type: String,
      default: ''
    },
    editDescription: {
      type: String,
      default: ''
    },
    editDialog: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogState: false,
      editTitleNew: '',
      editDescriptionNew: ''
    }
  },
  computed: {
    ...mapState({
      authenticated: (state) => state.auth.authenticated
    })
  },
  watch: {
    editDialog() {
      this.dialogState = this.editDialog
      this.editTitleNew = this.editTitle
      this.editDescriptionNew = this.editDescription
    }
  },
  created() {
    this.$store.dispatch('checkAuthenticated')
    this.dialogState = this.editDialog
    this.editTitleNew = this.editTitle
    this.editDescriptionNew = this.editDescription
  },
  methods: {
    clickEditCancel() {
      this.editTitleNew = ''
      this.editDescriptionNew = ''
      this.$emit('cancel')
      this.dialogState = false
    },
    clickEditConfirm() {
      this.$emit('confirm', {
        title: this.editTitleNew,
        description: this.editDescriptionNew
      })
      this.editTitleNew = ''
      this.editDescriptionNew = ''
      this.dialogState = false
    }
  }
}
</script>
