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
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <v-card>
      <v-card-title>
        <span class="headline">{{ modAction }} {{ targetType }} {{ actionTarget }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row dense>
            <v-col>
              <v-text-field v-model="comment" label="Comments (optional)" />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="error" text @click="clickCancel">Cancel</v-btn>
        <v-btn color="success" text @click="clickConfirm">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ModActionConfirmation',
  props: {
    modAction: {
      type: String,
      validator: (action) => {
        return ['', 'ACCEPT', 'REJECT', 'BAN', 'UNBAN'].indexOf(action) !== -1
      }
    },
    targetType: {
      type: String,
      validator: (action) => {
        return ['', 'IMAGE', 'USER'].indexOf(action) !== -1
      }
    },
    actionTarget: {
      type: String,
      default: ''
    },
    openDialog: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialog: false,
      comment: ''
    }
  },
  watch: {
    openDialog() {
      this.dialog = this.openDialog
    }
  },
  methods: {
    clickCancel() {
      this.dialog = false
      this.$emit('cancelled')
    },
    clickConfirm() {
      this.$emit('confirmed', this.comment)
    }
  }
}
</script>

<style scoped></style>
