import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    downloadOpen: true,
    isDownloading: false
  },
  mutations: {
    downloadOpen(state, value) {
      state.downloadOpen = value;
    },
    isDownloading(state, value){
        state.isDownloading = value;
    }
  },
  getters: {
    downloadOpen: state => {
      return state.downloadOpen;
    },
    isDownloading: state => {
        return state.isDownloading;
      },
  },
  actions: {
  },
  modules: {
  }
})
