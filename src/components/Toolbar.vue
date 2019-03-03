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

    <v-btn v-if="auth.authenticated" href="/auth/logout" icon>
      <v-icon>fas fa-sign-out-alt</v-icon>
    </v-btn>
    <v-dialog v-else width="360">

      <v-btn slot="activator" icon>
        <v-icon>fas fa-sign-in-alt</v-icon>
      </v-btn>

      <v-card>
        <v-card-title primary-title class="title text-uppercase">
          Login
        </v-card-title>

        <v-card-text>
          Login using your Frontier credentials for a seamless integration
        </v-card-text>

        <v-card-actions>
          <v-btn block color="primary" href="/auth/frontier" class="login-button">
            Login with <img :src="require('@/assets/Frontier-invert.svg')">
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-btn icon @click="switchTheme()">
      <v-icon v-if="theme === themes[0]">brightness_3</v-icon>
      <v-icon v-if="theme === themes[1]">wb_sunny</v-icon>
    </v-btn>
    <v-btn v-if="auth.user.access === 0" icon to="/admin" exact>
      <v-icon>fas fa-user-secret</v-icon>
    </v-btn>
    <v-btn icon to="/about" exact>
      <v-icon>info</v-icon>
    </v-btn>
    <v-btn v-if="auth.authenticated" icon to="/profile" exact round>
      <img
        :src="require('@/assets/ED Avatar v2-inverse.png')"
        alt="User Icon"
      >
    </v-btn>
    <slot name="toolbar-tabs" slot="extension"></slot>
  </v-toolbar>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Toolbar',
  computed: {
    ...mapState({
      themes: state => state.themes.themes,
      auth: state => state.auth
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
  created () {
    this.$store.dispatch('checkAuthenticated')
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

<style>
  .login-button img {
    height: 24px;
    padding-left: 4px;
  }
</style>
