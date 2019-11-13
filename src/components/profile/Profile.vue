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
        <v-tab v-for="(tabItem, i) in tabItems" :key="i" :to="tabItem.link" exact>
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

export default {
  name: 'Profile',
  data () {
    return {
      tabItems: [{
        name: 'Profile',
        link: '/profile'
      }, {
        name: 'Images',
        link: '/profile/images'
      }, {
        name: 'Albums',
        link: '/profile/albums'
      }, {
        name: 'Likes',
        link: '/profile/likes'
      }, {
        name: 'Saves',
        link: '/profile/saves'
      }, {
        name: 'Views',
        link: '/profile/views'
      }]
    }
  },
  components: {
    'ed-toolbar': Toolbar
  }
}
</script>
