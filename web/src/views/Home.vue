<template>
  <BaseTemplate>
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
  </BaseTemplate>
</template>

<script>
import VideoListItem from '@/components/VideoListItem.vue'
// import SearchBar from '@/components/SearchBar.vue'
import VideoSkeletonLoader from '@/components/VideoSkeletonLoader.vue'
import BaseTemplate from '@/components/BaseTemplate.vue'

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
    VideoListItem,
    VideoSkeletonLoader,
    BaseTemplate
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
