<template>
  <v-container fill-height>
    <ed-toolbar>
    </ed-toolbar>
    <v-content>
      <v-container fluid grid-list-lg>
        <h1>Login</h1>
      </v-container>
    </v-content>
  </v-container>
</template>

<script>
import Toolbar from '@/components/Toolbar'

export default {
  name: 'Login',
  components: {
    'ed-toolbar': Toolbar
  }
}
</script>

<style scoped>

</style>
