<template>
  <div>
    <v-app-bar
      app
      color="toolbar"
      dark
      :scroll-off-screen="scrollOfScreen"
      :scroll-threshold="scrollThreshold"
      :class="{'custom-dark': theme === themes[1]}">
      <v-btn icon large to="/" exact class="ml-4">
        <v-avatar>
          <v-img
            :src="require('@/assets/EliteShotsV1.svg')"
            alt="Elite Shots"
          />
        </v-avatar>
      </v-btn>
      <v-toolbar-title class="headline text-uppercase">
        <span>Elite </span>
        <span class="font-weight-light">Shots</span>
      </v-toolbar-title>
      <v-spacer/>

      <template v-if="$vuetify.breakpoint.mdAndUp">
        <v-btn text to="/donate">
          Support Elite Shots
        </v-btn>
        <!--        <v-btn v-if="authenticated" href="/auth/logout" icon>
                  <v-icon>fas fa-sign-out-alt</v-icon>
                </v-btn>
                <v-btn v-else icon @click="onClickLogin">
                  <v-icon>fas fa-sign-in-alt</v-icon>
                </v-btn>-->
        <v-btn icon to="/upload">
          <v-icon>fas fa-upload</v-icon>
        </v-btn>
        <v-btn icon @click="switchTheme()">
          <v-icon v-if="theme === themes[0]">brightness_3</v-icon>
          <v-icon v-if="theme === themes[1]">wb_sunny</v-icon>
        </v-btn>
        <v-btn v-if="authenticated && (authUser.access === modAccess || authUser.access === adminAccess)"
               icon :to="{name: 'mod-queue'}" exact>
          <v-icon>fas fa-user-secret</v-icon>
        </v-btn>
        <v-btn icon to="/about" exact>
          <v-icon>info</v-icon>
        </v-btn>
      </template>
      <v-menu bottom left v-if="authenticated">
        <template v-slot:activator="{ on }">
          <v-btn v-if="authenticated"
                 icon
                 v-on="on"
                 :class="{'mr-4':$vuetify.breakpoint.mdAndUp}">
            <v-icon>person</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item v-if="authenticated"
                       href="/auth/logout"
                       :ripple="false">
            <v-list-item-icon class="mr-0">
              <v-icon>power_settings_new</v-icon>
            </v-list-item-icon>
          </v-list-item>
          <v-list-item v-if="authenticated"
                       to="/profile"
                       :ripple="false">
            <v-list-item-icon class="mr-0">
              <v-icon>person</v-icon>
            </v-list-item-icon>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn v-else
             icon
             @click="onClickLogin"
             :class="{'mr-4':$vuetify.breakpoint.mdAndUp}">
        <v-icon>person</v-icon>
      </v-btn>
      <v-menu bottom left v-if="!$vuetify.breakpoint.mdAndUp">
        <template v-slot:activator="{ on }">
          <v-btn
            dark
            icon
            v-on="on"
            class="mr-4"
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item to="/upload"
                       :ripple="false">
            <v-list-item-icon class="mr-0">
              <v-icon>fas fa-upload</v-icon>
            </v-list-item-icon>
          </v-list-item>
          <v-list-item @click="switchTheme()"
                       :ripple="false">
            <v-list-item-icon class="mr-0">
              <v-icon v-if="theme === themes[0]">brightness_3</v-icon>
              <v-icon v-if="theme === themes[1]">wb_sunny</v-icon>
            </v-list-item-icon>
          </v-list-item>
          <v-list-item v-if="authenticated && (authUser.access === modAccess || authUser.access === adminAccess)"
                       :to="{name: 'mod-queue'}"
                       exact
                       :ripple="false">
            <v-list-item-icon class="mr-0">
              <v-icon>fas fa-user-secret</v-icon>
            </v-list-item-icon>
          </v-list-item>
          <v-list-item to="/about"
                       exact
                       :ripple="false">
            <v-list-item-icon class="mr-0">
              <v-icon>info</v-icon>
            </v-list-item-icon>
          </v-list-item>
          <v-list-item to="/donate"
                       :ripple="false">
            <v-list-item-icon class="mr-0">
              <v-icon>attach_money</v-icon>
            </v-list-item-icon>
          </v-list-item>
        </v-list>
      </v-menu>
      <template v-slot:extension v-if="hasToolbarTabs">
        <slot name="toolbar-tabs"/>
      </template>
    </v-app-bar>
    <v-dialog v-model="loginDialog" width="360">
      <login-card/>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import LoginCard from '@/components/LoginCard'

export default {
  name: 'Toolbar',
  props: {
    scrollOfScreen: {
      type: Boolean,
      default: false
    },
    scrollThreshold: {
      default: 300
    }
  },
  components: {
    'login-card': LoginCard
  },
  data () {
    return {
      bannedAccess: 'BANNED',
      normalAccess: 'NORMAL',
      modAccess: 'MOD',
      adminAccess: 'ADMIN',
      loginDialog: false
    }
  },
  computed: {
    ...mapState({
      themes: state => state.themes.themes,
      authenticated: state => state.auth.authenticated,
      authUser: state => state.auth.user
    }),
    theme: {
      get () {
        return this.$store.state.themes.theme
      },
      set (newTheme) {
        this.$store.commit('setTheme', newTheme)
      }
    },
    hasToolbarTabs () {
      return this.$slots['toolbar-tabs']
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
    },
    onClickLogin () {
      this.loginDialog = true
    }
  }
}
</script>

<style scoped>
  .custom-dark, .custom-dark .theme--dark.v-btn {
    color: var(--v-primary-base);
  }
</style>

<style>
  .v-toolbar__content, .v-toolbar__extension {
    padding: 0 !important;
  }
</style>
