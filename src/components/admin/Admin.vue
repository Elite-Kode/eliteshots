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
    <ed-toolbar>
      <v-tabs
        slot="toolbar-tabs"
        color="accent"
        align-with-title
        slider-color="secondary"
        light
      >
        <v-tab v-for="(tabItem, i) in tabItems" :key="i" :to="tabItem.link" exact>
          {{tabItem.name}}
        </v-tab>
      </v-tabs>
    </ed-toolbar>
    <v-content>
      <v-container fluid grid-list-lg>
        <router-view></router-view>
      </v-container>
    </v-content>
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'

export default {
  name: 'Admin',
  data () {
    return {
      tabItems: [{
        name: 'Moderation Queue',
        link: '/admin/mod-queue'
      }, {
        name: 'Accepted',
        link: '/admin/accepted'
      }, {
        name: 'Rejected',
        link: '/admin/rejected'
      }, {
        name: 'Users',
        link: '/admin/users'
      }]
    }
  },
  components: {
    'ed-toolbar': Toolbar
  }
}
</script>

<style scoped>

</style>
