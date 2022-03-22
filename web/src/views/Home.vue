<template>
  <main>
    <Notification ref="notificationComp" />
    <SettingsWindow :open="this.$store.state.settingsOpen" />
    <PlaylistSelectionWindow :open="this.$store.state.playlistSelectionOpen" />
    <DownloadManager :open="this.$store.state.downloadOpen" />
    <header v-if="settings">
      <div class="d-flex justify-content-center">
        <!-- <img style="margin-top: 0px !important" v-if="searching" @click="() => {searching = false}" class="header-icon" src="@/assets/icons/close.svg" alt="search" /> -->
        <!-- <img class="header-icon" src="@/assets/icons/search.svg" alt="search" /> -->

        <!-- <SearchBar v-if="searching" @searchResults="searchResults" :items="items" /> -->
        <Header :defaultQuality="settings.defaultQuality" />
        <div class="d-flex justify-content-center align-self-center icon-group">

          <svg class="icon" version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px">
            <path d="M8 11C10.2091 11 12 9.20914 12 7C12 4.79086 10.2091 3 8 3C5.79086 3 4 4.79086 4 7C4 9.20914 5.79086 11 8 11ZM8 9C9.10457 9 10 8.10457 10 7C10 5.89543 9.10457 5 8 5C6.89543 5 6 5.89543 6 7C6 8.10457 6.89543 9 8 9Z" />
            <path d="M11 14C11.5523 14 12 14.4477 12 15V21H14V15C14 13.3431 12.6569 12 11 12H5C3.34315 12 2 13.3431 2 15V21H4V15C4 14.4477 4.44772 14 5 14H11Z" />
            <path d="M22 11H16V13H22V11Z" />
            <path d="M16 15H22V17H16V15Z"/>
            <path d="M22 7H16V9H22V7Z"/>
          </svg>

          <svg @click="toggleSettingsOpen" class="icon gear-icon" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
              width="512px" height="512px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
            <g>
              <path d="M411.1,256c0-23.9,14.8-42.8,36.9-55.8c-4-13.3-9.3-26.2-15.8-38.2c-24.9,6.5-45-3.2-62-20.2c-16.9-16.9-22.1-37.1-15.6-62
                C342.6,73.3,329.8,68,316.4,64c-13,22.2-36.4,36.9-60.4,36.9c-23.9,0-47.4-14.7-60.4-36.9c-13.4,4-26.2,9.3-38.2,15.8
                c6.5,24.9,1.3,45-15.6,62c-16.9,16.9-37.1,26.7-61.9,20.2C73.3,174,68,186.8,64,200.2c22.2,13,37,31.9,37,55.8
                c0,23.9-14.8,47.4-37,60.4c4,13.4,9.3,26.2,15.8,38.2c24.9-6.5,45-1.3,61.9,15.6c17,16.9,22.1,37.1,15.6,62
                c12.1,6.5,24.8,11.8,38.2,15.8c13-22.2,36.5-36.9,60.4-36.9c23.9,0,47.4,14.7,60.4,36.9c13.4-4,26.2-9.3,38.2-15.8
                c-6.5-24.9-1.3-45,15.6-62c16.9-16.9,37.1-26.7,62-20.2c6.5-12.1,11.8-24.9,15.8-38.2C425.8,298.8,411.1,279.9,411.1,256z
                M256,354.3c-54.2,0-98.3-44-98.3-98.3c0-54.3,44-98.3,98.3-98.3c54.3,0,98.3,44,98.3,98.3C354.3,310.3,310.3,354.3,256,354.3z"/>
            </g>
          </svg>

          <svg @click="toggleDownloadsOpen" :class="downloadIconStyle" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            width="512px" height="512px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
            <path d="M383.6,322.7L278.6,423c-5.8,6-13.7,9-22.4,9c-8.7,0-16.5-3-22.4-9L128.4,322.7c-12.5-11.9-12.5-31.3,0-43.2
            c12.5-11.9,32.7-11.9,45.2,0l50.4,48.2v-217c0-16.9,14.3-30.6,32-30.6c17.7,0,32,13.7,32,30.6v217l50.4-48.2
            c12.5-11.9,32.7-11.9,45.2,0C396.1,291.4,396.1,310.7,383.6,322.7z"/>
          </svg>

        </div>
      </div>
    </header>

    <div style="margin-top: 75px">
      <div class="d-flex justify-content-center">
        <div id="holder" v-if="items">
          <div v-if="items.length > 0">
            <VideoListItem @deleted="removeDeletedItem" :data="video" v-for="(video, index) in items" :key="index" />
          </div>
          <div v-else>
            <h2 style="text-align: center">No downloads</h2>
          </div>
        </div>
        <div v-else>
          <VideoSkeletonLoader />
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import Header from '@/components/Header.vue'
import VideoListItem from '@/components/VideoListItem.vue'
// import SearchBar from '@/components/SearchBar.vue'
import Notification from '@/components/Notification.vue'
import SettingsWindow from '@/components/SettingsWindow.vue'
import PlaylistSelectionWindow from '@/components/playlistSelection/Window.vue'
import DownloadManager from '@/components/DownloadManager.vue'
import VideoSkeletonLoader from '@/components/VideoSkeletonLoader.vue'

export default {
  name: 'Home',
  mounted(){
    this.sockets.subscribe('getVideos', (data) => {
        this.items = data;
    });

    this.sockets.subscribe('getSettings', (data) => {
      this.settings = data;
    });

    this.$socket.emit('getVideos');
  },
  components: {
    Header,
    VideoListItem,
    Notification,
    SettingsWindow,
    DownloadManager,
    PlaylistSelectionWindow,
    VideoSkeletonLoader
  },
  data(){
    return({
      items: [],
      // itemsToShow : [],
      searching: false,
      gearIcon: require('@/assets/icons/gear.svg'),
      settings: null
    })
  },
  methods:{
    toggleDownloadsOpen(){
      if(this.$store.state.downloadOpen)
        this.$store.commit('downloadOpen', false);
      else
        this.$store.commit('downloadOpen', true);
    },
    toggleSettingsOpen(){
      if(this.$store.state.settingsOpen)
        this.$store.commit('settingsOpen', false);
      else
        this.$store.commit('settingsOpen', true);
    },
    searchResults(){
      // if(results === null || results === undefined)
      //   this.itemsToShow = this.items;
      // else
      //   this.itemsToShow = results;
    },
    removeDeletedItem(value){
      this.items.forEach((el,index) => {
        if(el.id === value.id)
          this.items.splice(index, 1);
      });
    }
  },
  computed:{
    downloadIconStyle(){
      if(this.$store.state.isDownloading)
        return 'icon download-icon download-ani';
      else
        return 'icon download-icon';
    },
  }
}
</script>
<style scoped>
header .header-icon
{
    width: 25px;
    cursor: pointer;
    background: #FFF;
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
    height: 46px;
    margin-right: -2px;
}
header .icon
{
    width: 35px;
    height: 35px;
    fill: #FFF;
    cursor: pointer;
}
header .download-ani
{
  animation: download-animation  2s infinite;
}
@keyframes download-animation {
  0%{
    fill: #2ecc71;
  }
  50%{
    fill: #00ff9d;
  }
  100%{
    fill: #2ecc71;
  }
}
.icon-group
{
    position: absolute;
    right: 15px;
}

@media (max-width: 980px) {
  #holder
  {
    width: 100%;
    margin-bottom: 30px;
  }
  .icon-group
  {
    bottom: 0;
    right: 0 !important;
    position: fixed !important;
    width: 100%;
    background: #34495e;
    padding: 10px;
    justify-content: center;
    /* border-radius: 10px; */
  }
}
</style>
