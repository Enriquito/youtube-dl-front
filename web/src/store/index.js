import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    downloadOpen: true,
    settingsOpen: false,
    playlistSelectionOpen: false,
    isDownloading: false
  },
  mutations: {
    downloadOpen(state, value) {
      state.downloadOpen = value;
    },
    settingsOpen(state, value) {
      state.settingsOpen = value;
    },
    playlistSelectionOpen(state, value) {
      state.playlistSelectionOpen = value;
    },
    isDownloading(state, value){
        state.isDownloading = value;
    }
  },
  getters: {
    downloadOpen: state => {
      return state.downloadOpen;
    },
    settingsOpen: state => {
      return state.settingsOpen;
    },
    playlistSelectionOpen: state => {
      return state.playlistSelectionOpen;
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
