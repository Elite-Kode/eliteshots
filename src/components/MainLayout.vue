<template>
  <v-app :dark="theme === themes[1]">
    <router-view></router-view>
  </v-app>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'MainLayout',
  computed: {
    ...mapState({
      theme: state => state.themes.theme,
      themes: state => state.themes.themes
    })
  }
}
</script>
