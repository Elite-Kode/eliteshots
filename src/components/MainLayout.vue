<template>
  <v-app :dark="theme === themes[1]">
    <ed-toolbar></ed-toolbar>
    <v-content>
      <v-container fluid grid-list-lg>
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import { mapState } from 'vuex'

export default {
  name: 'MainLayout',
  components: {
    'ed-toolbar': Toolbar
  },
  computed: {
    ...mapState({
      theme: state => state.themes.theme,
      themes: state => state.themes.themes
    })
  }
}
</script>
