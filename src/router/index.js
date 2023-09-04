import Vue from 'vue'
import VueRouter from 'vue-router'
// import { component } from 'vue/types/umd'



Vue.use(VueRouter)

const routes = [
  {
    path: '/screen',
    component: () => import('../views/screenPage.vue')
  },
  {
    path: '/test',
    component: () => import('../views/testPage.vue')
  },
  {
    path: '/mappage',
    component: () => import('../views/Map/MapPage.vue')
  },
  {
    path: '/tes',
    component: () => import('../components/TestCom.vue')
  },
  {
    path:'/set',
    component:() => import('../components/SettingCom.vue')
  }
  // {
  //   path: '/temperaturepage',
  //   component: () => import('../views/Temperature/TemperaturePage.vue')
  // },
  // {
  //   path: '/weightpage',
  //   component: () => import('../views/Weight/WeightPage.vue')
  // },
  // {
  //   path: '/quantitypage',
  //   component: () => import('../views/Quantity/QuantityPage.vue')
  // },
  // {
  //   path: '/tahavgpage',
  //   component: () => import('../views/Avg/TAHAvgPage.vue')
  // },
  // {
  //   path: '/quantityavgpage',
  //   component: () => import('../views/Avg/QuantityAvgPage.vue')
  // },
  // {
  //   path: '/mappage',
  //   component: () => import('../views/Map/MapPage.vue')
  // }
]

const router = new VueRouter({
  routes
})

export default router
