import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Watch from '../views/Watch.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/watch/:id',
    name: 'Watch',
    component: Watch
  }
]

const router = new VueRouter({
  routes
})

export default router
