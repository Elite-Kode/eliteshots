<template>
  <div>
    <ed-toolbar>
    </ed-toolbar>
    <v-content>
      <v-container fluid grid-list-lg>
        <h1>Profile</h1>
      </v-container>
    </v-content>
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'

export default {
  name: 'Profile',
  components: {
    'ed-toolbar': Toolbar
  }
}
</script>

<style scoped>

</style>
