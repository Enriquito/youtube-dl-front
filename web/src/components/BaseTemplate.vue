<template>
    <main v-if="healthCheck">
      <Notification ref="notificationComp" />
      <SettingsWindow :open="this.$store.state.settingsOpen" />
      <PlaylistSelectionWindow :open="this.$store.state.playlistSelectionOpen" />
      <DownloadManager :open="this.$store.state.downloadOpen" />
      <header v-if="settings">
        <div class="d-flex justify-content-center">
            <div v-if="$route.name != 'Home'">
                <router-link :to="{name:'Home'}" class="arrow-icon">
                    <ArrowIcon />
                </router-link>
            </div>
          <!-- <img style="margin-top: 0px !important" v-if="searching" @click="() => {searching = false}" class="header-icon" src="@/assets/icons/close.svg" alt="search" /> -->
          <!-- <img class="header-icon" src="@/assets/icons/search.svg" alt="search" /> -->
  
          <!-- <SearchBar v-if="searching" @searchResults="searchResults" :items="items" /> -->
          <Header :defaultQuality="settings.defaultQuality" />
          <div class="d-flex justify-content-center align-self-center icon-group">
  
            <RouterLink :to="{name: 'Channels'}">
              <ChannelIcon />
            </RouterLink>
  
            <SettingsIcon @customclick="toggleSettingsOpen" />
            <DownloadIcon @customclick="toggleDownloadsOpen" :downloadIconStyle="downloadIconStyle" />
          </div>
        </div>
      </header>
      <slot>

      </slot>
    </main>
    <main style="height=100%" v-else>
     <div class="d-flex justify-content-center align-items-center">
        <div class="text-center">
          <h1>No connection with the server.</h1> 
          <h2>Please restart your server instance and try again.</h2> 
        </div>
     </div>
    </main>
  </template>
  
  <script>
  import Header from '@/components/Header.vue'
  // import SearchBar from '@/components/SearchBar.vue'
  import Notification from '@/components/Notification.vue'
  import SettingsWindow from '@/components/SettingsWindow.vue'
  import PlaylistSelectionWindow from '@/components/playlistSelection/Window.vue'
  import DownloadManager from '@/components/DownloadManager.vue'
  import ChannelIcon from '../components/icons/ChannelIcon.vue'
  import SettingsIcon from '../components/icons/SettingsIcon.vue'
  import DownloadIcon from '../components/icons/DownloadIcon.vue'
  import ArrowIcon from '../components/icons/ArrowIcon.vue'
  
  export default {
    name: 'BaseTemplate',
    mounted(){
      this.sockets.subscribe('healthCheck', (check) => {
          this.healthCheck = check;
      });
  
      this.sockets.subscribe('getSettings', (data) => {
        this.settings = data;
      });
      
      this.$socket.emit('healthCheck');
    },
    components: {
      Header,
      Notification,
      SettingsWindow,
      DownloadManager,
      PlaylistSelectionWindow,
      ChannelIcon,
      SettingsIcon,
      DownloadIcon,
      ArrowIcon
  },
    data(){
      return({
        healthCheck: false,
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
    .arrow-icon
    {
        position: absolute;
        left: 10px;
        top: 22px;
    }
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
  