<template>
  <v-toolbar app color="primary" dark tabs>
    <v-toolbar-title class="headline text-uppercase">
      <v-btn icon large to="/" exact>
        <img
          :src="require('@/assets/EliteShotsv1.png')"
          alt="Elite Shots"
        >
      </v-btn>
      <span>Elite </span>
      <span class="font-weight-light">Shots</span>
    </v-toolbar-title>
    <v-spacer></v-spacer>

    <v-btn icon @click="switchTheme()">
      <v-icon v-if="theme === themes[0]">brightness_3</v-icon>
      <v-icon v-if="theme === themes[1]">wb_sunny</v-icon>
    </v-btn>
    <v-menu offset-y>
      <v-btn
        slot="activator" icon
        round>
        <img
          :src="require('@/assets/ED Avatar v2-inverse.png')"
          alt="User Icon"
        >
      </v-btn>
      <v-list>
        <v-list-tile to="/login">
          <v-list-tile-title>Login</v-list-tile-title>
        </v-list-tile>
        <v-list-tile to="/admin">
          <v-list-tile-title>Admin</v-list-tile-title>
        </v-list-tile>
        <v-list-tile to="/profile">
          <v-list-tile-title>Profile</v-list-tile-title>
        </v-list-tile>
        <v-list-tile to="/about">
          <v-list-tile-title>About</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>
    <slot name="toolbar-tabs" slot="extension"></slot>
  </v-toolbar>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Toolbar',
  computed: {
    ...mapState({
      themes: state => state.themes.themes
    }),
    theme: {
      get () {
        return this.$store.state.themes.theme
      },
      set (newTheme) {
        this.$store.commit('setTheme', newTheme)
      }
    }
  },
  methods: {
    switchTheme () {
      if (this.theme === this.themes[0]) {
        this.theme = this.themes[1]
      } else if (this.theme === this.themes[1]) {
        this.theme = this.themes[0]
      }
      localStorage.setItem('theme', this.theme)
    }
  }
}
</script>
