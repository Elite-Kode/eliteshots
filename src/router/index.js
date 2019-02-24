import Vue from 'vue'
import Router from 'vue-router'
import MainLayout from '@/components/MainLayout'
import Home from '@/components/Home'
import Popular from '@/components/Popular'
import Recents from '@/components/Recents'
import Curated from '@/components/Curated'
import Login from '@/components/Login'

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
          path: '/login',
          component: Login
        }
      ]
    }
  ],
  mode: 'history'
})
