<template>
  <v-app>
    <v-theme-provider root>
      <router-view/>
    </v-theme-provider>
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
  },
  watch: {
    theme () {
      this.$vuetify.theme.dark = this.theme === this.themes[1]
    }
  },
  created () {
    this.$store.dispatch('checkAuthenticated')
    this.$store.dispatch('fetchAuthUser')
    this.$vuetify.theme.dark = this.theme === this.themes[1]
  }
}
</script>
