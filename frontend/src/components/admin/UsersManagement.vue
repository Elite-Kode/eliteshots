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
    <h1>User Management</h1>
    <v-data-table
      :headers="headers"
      :items="users"
      :page.sync="page"
      :server-items-length="totalUsers"
      :items-per-page="10"
      :footer-props="tableFooter"
      dense
      class="elevation-1"
      :loading="loading">
      <template v-slot:item._id="{item}">
        <router-link :to="{ name: 'user-detail', params: { userId: item._id }}">{{ item._id }}</router-link>
      </template>
      <template v-slot:item.trusted="{ item }">
        <v-simple-checkbox
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
      authUser: state => state.auth.user,
      users: state => state.admin.users
    }),
    headers () {
      let normalHeaders = [{
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
      }]
      if (this.authUser.access === 'ADMIN') {
        normalHeaders.splice(2, 0, {
          text: 'Frontier Id',
          value: 'frontier_id'
        })
      }
      return normalHeaders
    }
  },
  watch: {
    page () {
      this.fetchUsers()
    }
  },
  created () {
    this.$store.dispatch('checkAuthenticated')
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
