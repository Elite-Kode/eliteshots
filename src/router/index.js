import Vue from 'vue'
import Router from 'vue-router'
import MainLayout from '@/components/MainLayout'
import Popular from '@/components/Popular'
import Recents from '@/components/Recents'
import Curated from '@/components/Curated'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: MainLayout,
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
    }
  ],
  mode: 'history'
})
