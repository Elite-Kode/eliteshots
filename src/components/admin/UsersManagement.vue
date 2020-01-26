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
    <h1>User Management</h1>
    <v-data-table
      :headers="headers"
      :items="users"
      :page.sync="page"
      :server-items-length="totalUsers"
      :items-per-page="10"
      :footer-props="tableFooter"
      :loading="loading">
      <template v-slot:item.trusted="{ item }">
        <v-checkbox
          v-model="item.trusted"
          disabled
        />
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'UsersManagement',
  data () {
    return {
      headers: [{
        text: 'User Id',
        value: '_id'
      }, {
        text: 'CMDR Name',
        value: 'commander'
      }, {
        text: 'Trust',
        value: 'trusted'
      }, {
        text: 'Access Level',
        value: 'access'
      }],
      tableFooter: {
        disableItemsPerPage: true,
        showFirstLastPage: true,
        showCurrentPage: true
      },
      page: 1,
      totalUsers: 0,
      loading: false
    }
  },
  computed: {
    ...mapState({
      users: state => state.admin.users
    })
  },
  watch: {
    page () {
      this.fetchUsers()
    }
  },
  created () {
    this.fetchUsers()
  },
  methods: {
    async fetchUsers () {
      this.loading = true
      let usersPaginated = await this.$store.dispatch('fetchUsers', { page: this.page })
      this.totalUsers = usersPaginated.totalDocs
      this.loading = false
    }
  }
}
</script>
