import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import VueSocketIO from 'vue-socket.io'

Vue.use(new VueSocketIO({
  debug: process.env.NODE_ENV === 'development' ? true : false,
  connection: '/',
}))

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
