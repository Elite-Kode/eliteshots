import Vue from 'vue'
import Router from 'vue-router'
import MainLayout from '@/components/MainLayout'
import Home from '@/components/home/Home'
import Popular from '@/components/home/Popular'
import Recents from '@/components/home/Recents'
import Curated from '@/components/home/Curated'
import Admin from '@/components/Admin'
import Profile from '@/components/profile/Profile'
import About from '@/components/About'
import Data from '@/components/profile/Data'
import Images from '@/components/profile/Images'
import Albums from '@/components/profile/Albums'
import Likes from '@/components/profile/Likes'
import Saves from '@/components/profile/Saves'
import Views from '@/components/profile/Views'

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
              name: 'popular'
            },
            {
              path: 'recents',
              component: Recents,
              name: 'recents'
            },
            {
              path: 'curated',
              component: Curated,
              name: 'curated'
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
          name: 'profile',
          children: [
            {
              path: '/',
              component: Data,
              name: 'data'
            },
            {
              path: 'images',
              component: Images,
              name: 'images',
              children: [
                {
                  path: 'page',
                  redirect: {
                    name: 'images'
                  }
                },
                {
                  path: 'page/:pageNumber',
                  component: Images,
                  name: 'images-page'
                }
              ]
            },
            {
              path: 'albums',
              component: Albums,
              name: 'albums'
            },
            {
              path: 'likes',
              component: Likes,
              name: 'likes',
              children: [
                {
                  path: 'page',
                  redirect: {
                    name: 'likes'
                  }
                },
                {
                  path: 'page/:pageNumber',
                  component: Likes,
                  name: 'likes-page'
                }
              ]
            },
            {
              path: 'saves',
              component: Saves,
              name: 'saves',
              children: [
                {
                  path: 'page',
                  redirect: {
                    name: 'saves'
                  }
                },
                {
                  path: 'page/:pageNumber',
                  component: Saves,
                  name: 'saves-page'
                }
              ]
            },
            {
              path: 'views',
              component: Views,
              name: 'views'
            }
          ]
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
