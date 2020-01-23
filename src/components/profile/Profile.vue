<template>
  <div>
    <ed-toolbar>
      <template v-slot:toolbar-tabs>
        <v-tabs
          background-color="accent"
          align-with-title
          slider-color="secondary"
          light
        >
          <v-tab v-for="(tabItem, i) in tabItems" :key="i" :to="tabItem.link" exact>
            {{tabItem.name}}
          </v-tab>
        </v-tabs>
      </template>
    </ed-toolbar>
    <v-content>
      <v-container fluid>
        <router-view/>
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

<style scoped lang="sass">
  @import '~vuetify/src/styles/styles.sass'

  a.v-tab--active.v-tab
    color: map-deep-get($material-light, 'text', 'primary')
</style>
