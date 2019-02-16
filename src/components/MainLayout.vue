<template>
  <v-app>
    <ed-toolbar></ed-toolbar>
    <v-content>
      <v-container fluid grid-list-lg :style="containerStyle" :fill-height="fillHeight">
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import Toolbar from '@/components/Toolbar'

export default {
  name: 'MainLayout',
  components: {
    'ed-toolbar': Toolbar
  }
}
</script>
