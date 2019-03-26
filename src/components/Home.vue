<template>
  <div>
    <ed-toolbar>
      <v-tabs
        slot="toolbar-tabs"
        color="accent"
        align-with-title
        slider-color="secondary"
        light
      >
        <v-tab v-for="(tabItem, i) in tabItems" :key="i" :to="tabItem.link">
          {{tabItem.name}}
        </v-tab>
      </v-tabs>
    </ed-toolbar>
    <v-content>
      <v-container fluid grid-list-lg>
        <router-view></router-view>
      </v-container>
    </v-content>
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import { mapState } from 'vuex'

export default {
  name: 'Home',
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
