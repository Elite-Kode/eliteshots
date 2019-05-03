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
    <h1>My Albums</h1>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Album'
  // data () {
  //   return {
  //     currentPage: 1
  //   }
  // },
  // computed: {
  //   ...mapState({
  //     popularImages: state => state.images.popular,
  //     auth: state => state.auth
  //   })
  // },
  // created () {
  //   if (this.$router.currentRoute.name === 'popular-page') {
  //     this.currentPage = parseInt(this.$router.currentRoute.params.pageNumber)
  //   }
  //   this.$store.dispatch('checkAuthenticated')
  //   this.$store.dispatch('fetchPopular', this.currentPage)
  // },
  // methods: {
  //   onPageChange (page) {
  //     this.$router.push({ name: 'popular-page', params: { pageNumber: page } })
  //     this.currentPage = page
  //     this.$store.dispatch('fetchPopular', this.currentPage)
  //   }
  // }
}
</script>
