<template>
  <v-toolbar app color="primary" dark tabs>
    <v-toolbar-title class="headline text-uppercase" @click="goToHome()">
      <v-btn icon large>
        <img
          class="eliteshots-topband-logo"
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
    <v-tabs
      slot="extension"
      color="accent"
      align-with-title
      slider-color="secondary"
      light
    >
      <v-tab v-for="(tabItem, i) in tabItems" :key="i" :to="tabItem.link" exact>
        {{tabItem.name}}
      </v-tab>
    </v-tabs>
  </v-toolbar>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Toolbar',
  data () {
    return {
      tabItems: [{
        name: 'Popular',
        link: '/'
      }, {
        name: 'Recents',
        link: '/recents'
      }, {
        name: 'Curated',
        link: '/curated'
      }]
    }
  },
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
    },
    goToHome () {
      this.$router.push({ name: 'home' })
    }
  }
}
</script>
