<template>
  <main>
    <Header />
    <div class="d-flex justify-content-center">
      <div v-if="items">
      <VideoListItem :data="video" v-for="(video, index) in items" :key="index" />
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
    axios.get('/items')
    .then(result => {
      this.items = result.data.videos;
    })
  },
  components: {
    Header,
    VideoListItem
  },
  data(){
    return({
      items: null
    })
  }
}
</script>
