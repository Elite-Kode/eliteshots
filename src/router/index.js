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
      name: 'main',
      children: [
        {
          path: '',
          component: Home,
          name: 'home',
          children: [
            {
              path: '/',
              component: Popular,
              name: 'popular',
              children: [
                {
                  path: 'page',
                  redirect: {
                    name: 'popular'
                  }
                },
                {
                  path: 'page/:pageNumber',
                  component: Popular,
                  name: 'popular-page'
                }
              ]
            },
            {
              path: 'recents',
              component: Recents,
              name: 'recents',
              children: [
                {
                  path: 'page',
                  redirect: {
                    name: 'recents'
                  }
                },
                {
                  path: 'page/:pageNumber',
                  component: Recents,
                  name: 'recents-page'
                }
              ]
            },
            {
              path: 'curated',
              component: Curated,
              name: 'curated',
              children: [
                {
                  path: 'page',
                  redirect: {
                    name: 'curated'
                  }
                },
                {
                  path: 'page/:pageNumber',
                  component: Curated,
                  name: 'curated-page'
                }
              ]
            }
          ]
        },
        {
          path: '/admin',
          component: Admin,
          name: 'admin'
        },
        {
          path: '/profile',
          component: Profile,
          name: 'profile'
        },
        {
          path: '/about',
          component: About,
          name: 'about'
        }
      ]
    }
  ],
  mode: 'history'
})
