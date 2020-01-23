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
    <ed-toolbar scroll-of-screen scroll-threshold="64">
    </ed-toolbar>
    <v-content>
      <v-container fluid class="pa-0">
        <v-card>
          <v-img :src="imageItem.image_location"/>
          <v-card-title>
            <div>
              <h3 class="headline">{{ imageItem.title }}</h3>
              <div>{{ imageItem.description }}</div>
            </div>
          </v-card-title>
        </v-card>
      </v-container>
    </v-content>
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'

export default {
  name: 'ImageItem',
  props: {
    imageId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      imageItem: {}
    }
  },
  async created () {
    this.imageItem = await this.$store.dispatch('fetchImage', this.imageId)
  },
  components: {
    'ed-toolbar': Toolbar
  }
}
</script>

<style scoped>
</style>
