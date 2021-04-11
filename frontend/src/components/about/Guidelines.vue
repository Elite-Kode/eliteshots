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
    <ed-toolbar>
    </ed-toolbar>
    <v-main>
      <v-container fluid>
        <h2 class="mb-5">Submission Guidelines</h2>
        <h3>All submissions made in Elite Shots are moderated by a team of moderators. Here are some rules and
          guidelines to follow while submitting a content.</h3>
        <ul>
          <li>All submissions must be screenshots taken in game from Elite Dangerous.</li>
          <li>Submissions may be post processed.</li>
          <li>Submissions must not be NSFW(Not Safe for Work).</li>
        </ul>
        <h3 class="mt-4">Submissions that does not meet the above criteria can be rejected by the moderators in which
          case the submission won't be available for public. In case of submissions which violate out Terms and
          Conditions, they can be outright deleted and will not be recoverable.</h3>
      </v-container>
    </v-main>
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'

export default {
  name: 'Guidelines',
  components: {
    'ed-toolbar': Toolbar
  }
}
</script>

<style scoped>

</style>
