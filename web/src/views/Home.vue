<template>
  <main>
    <Notification ref="notificationComp" />
    <header class="d-flex justify-content-center">
      <img style="margin-top: 0px !important" v-if="searching" @click="() => {searching = false}" class="header-icon" src="@/assets/icons/close.svg" alt="search" />
      <img v-else @click="() => {searching = true}" class="header-icon" src="@/assets/icons/search.svg" alt="search" />

      <SearchBar v-if="searching" @searchResults="searchResults" :items="items" />
      <Header v-else @clicked="getNewItem" />
    </header>

    <div style="margin-top: 75px">
      <div class="d-flex justify-content-center">
        <div v-if="items.length > 0">
          <VideoListItem @deleted="removeDeletedItem" :data="video" v-for="(video, index) in itemsToShow" :key="index" />
        </div>
        <div v-else>
          <h2>No downloads here</h2>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
// @ is an alias to /src
import Header from '@/components/Header.vue'
import VideoListItem from '@/components/VideoListItem.vue'
import SearchBar from '@/components/SearchBar.vue'
import Notification from '@/components/Notification.vue'
import axios from 'axios';

export default {
  name: 'Home',
  mounted(){
    this.loadData();
    // this.$refs.notificationComp.open('testa','hoihoi');
  },
  components: {
    Header,
    VideoListItem,
    SearchBar,
    Notification
  },
  data(){
    return({
      items: [],
      itemsToShow : [],
      searching: false,
    })
  },
  methods:{
    searchResults(results){
      if(results === null || results === undefined)
        this.itemsToShow = this.items;
      else
        this.itemsToShow = results;
    },
    getNewItem(){
      this.loadData();
    },
    loadData(){
      axios.get('/items')
      .then(result => {
        this.items = result.data.videos;
        this.items.reverse();
        this.searchResults(null);
      })
      .catch(error => {
        console.error(error);
        this.$refs.notificationComp.open('Error','Could not fetch data from database. Please try again later.');
      });
    },
    removeDeletedItem(value){
      this.items.forEach((el,index) => {
        if(el.id === value.id)
          this.items.splice(index, 1);
      });
    }
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
</style>
