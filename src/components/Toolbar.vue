<template>
  <v-toolbar
    app
    :color="toolbarColor"
    dark
    tabs
    :class="{'custom-dark': theme === themes[1]}">
    <v-toolbar-title class="headline text-uppercase">
      <v-btn icon large to="/" exact>
        <v-img
          :src="require('@/assets/EliteShotsv1.png')"
          alt="Elite Shots"
        ></v-img>
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
      <login-card></login-card>
    </v-dialog>

    <v-dialog v-model="uploadDialog" v-if="auth.authenticated && auth.user.access !== 2" fullscreen hide-overlay
              transition="dialog-bottom-transition">
      <!--<v-dialog v-model="uploadDialog" fullscreen hide-overlay-->
      <!--transition="dialog-bottom-transition">-->
      <v-btn slot="activator" icon>
        <v-icon>fas fa-upload</v-icon>
      </v-btn>
      <upload-card v-model="uploadDialog"></upload-card>
    </v-dialog>
    <v-btn icon @click="switchTheme()">
      <v-icon v-if="theme === themes[0]">brightness_3</v-icon>
      <v-icon v-if="theme === themes[1]">wb_sunny</v-icon>
    </v-btn>
    <v-btn v-if="auth.authenticated && auth.user.access === 0" icon :to="{name: 'mod-queue'}" exact>
      <v-icon>fas fa-user-secret</v-icon>
    </v-btn>
    <v-btn icon to="/about" exact>
      <v-icon>info</v-icon>
    </v-btn>
    <v-btn v-if="auth.authenticated" icon to="/profile">
      <!--<v-img
        :src="require('@/assets/ED Avatar v2-inverse.png')"
        alt="User Icon"
      ></v-img>-->
      <v-icon>person</v-icon>
    </v-btn>
    <slot name="toolbar-tabs" slot="extension"></slot>
  </v-toolbar>
</template>

<script>
import { mapState } from 'vuex'
import LoginCard from '@/components/LoginCard'
import UploadCard from '@/components/UploadCard'

export default {
  name: 'Toolbar',
  components: {
    'login-card': LoginCard,
    'upload-card': UploadCard
  },
  data () {
    return {
      uploadDialog: false
    }
  },
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
    },
    toolbarColor () {
      return this.theme === this.themes[0] ? 'primary' : ''
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

<style scoped>
  .custom-dark, .custom-dark .theme--dark.v-btn {
    color: var(--v-primary-base);
  }
</style>
