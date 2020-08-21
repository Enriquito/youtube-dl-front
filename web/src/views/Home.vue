<template>
  <main>
    <Header @clicked="getNewItem" />
    <div style="margin-top: 75px" class="d-flex justify-content-center">
      <div v-if="items.length > 0">
        <VideoListItem @deleted="removeDeletedItem" :data="video" v-for="(video, index) in items" :key="index" />
      </div>
      <div v-else>
        <h2>No downloads here</h2>
      </div>
    </div>
  </main>
</template>

<script>
// @ is an alias to /src
import Header from '@/components/Header.vue'
import VideoListItem from '@/components/VideoListItem.vue'
import axios from 'axios';

export default {
  name: 'Home',
  mounted(){
    this.loadData();
  },
  components: {
    Header,
    VideoListItem
  },
  data(){
    return({
      items: [],
      sortedItems: []
    })
  },
  methods:{
    getNewItem(value){
      this.loadData();
      console.log(value);
    },
    loadData(){
      axios.get('/items')
      .then(result => {
        this.items = result.data.videos;
        this.items.reverse();
      });
    },
    removeDeletedItem(value){
      console.log(value.id);
      this.items.forEach((el,index) => {
        if(el.id === value.id)
          this.items.splice(index, 1);
      });
    }
  }
}
</script>
