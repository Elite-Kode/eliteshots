import Vue from 'vue'
import Router from 'vue-router'
import MainLayout from '@/components/MainLayout'
import Home from '@/components/Home'
import Popular from '@/components/Popular'
import Recents from '@/components/Recents'
import Curated from '@/components/Curated'
import Admin from '@/components/Admin'
import Profile from '@/components/Profile'
import About from '@/components/About'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          component: Home,
          children: [
            {
              path: '',
              component: Popular
            },
            {
              path: 'recents',
              component: Recents
            },
            {
              path: 'curated',
              component: Curated
            }
          ]
        },
        {
          path: '/admin',
          component: Admin
        },
        {
          path: '/profile',
          component: Profile
        },
        {
          path: '/about',
          component: About
        }
      ]
    }
  ],
  mode: 'history'
})
