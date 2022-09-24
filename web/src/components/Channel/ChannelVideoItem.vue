<template>
  <figure>
<!--    <img style="height: 25px !important;" class="media-type-icon" v-if="data.extention == 'mp3'" src="@/assets/icons/note.svg" alt="Audio" />-->
<!--    <img style="height: 25px !important;" class="media-type-icon" v-else src="@/assets/icons/videocamera.svg" alt="Video" />-->

    <img class="yt-image" alt="image" :src="data.thumbnail">
    <figcaption>
      <span class="duration">
        {{duration}}
      </span>
      <div class="d-flex">
        <strong>
          <router-link :to="{name:'Watch', params:{id: data.id}}">
            {{data.title}}
          </router-link>
        </strong>
      </div>
      <div v-if="showActions" class="d-flex justify-content-between">
        <div>
          <img @click="deleteItem" class="icon" style="height: 20px !important;" src="@/assets/icons/trash.svg" alt="Download" />
          <a target="_blank" :href="data.url">
            <img class="icon" src="@/assets/icons/link.svg" alt="Link" />
          </a>
          <a target="_blank" :href="`/file/${data.id}`">
            <img class="icon" style="height: 20px !important;" src="@/assets/icons/download.svg" alt="Download" />
          </a>
        </div>
      </div>
    </figcaption>
  </figure>
</template>
<script>
// import axios from 'axios';

export default {
  name: "ChannelVideoItem",
  props: {
    data: Object
  },
  data() {
    return {
      showActions: false
    }
  },
  methods: {
    deleteItem(){
      this.$socket.emit('deleteVideo',this.data);
      this.$emit('deleted', this.data);
    }
  },
  computed:{
    imageLink(){
      let bestImage = null;

      if(this.data.thumbnails.length === 0)
        bestImage = "@/assets/no-image.png";
      else{
        this.data.thumbnails.forEach(el => {
          bestImage = el.url;
        });
      }

      return bestImage;
    },
    duration() {
      const timeInMinutes = Math.floor(this.data.duration / 60);
      const timeInSeconds = this.data.duration % 60;


      return `${timeInMinutes}:${String(timeInSeconds).padStart(2, '0')}`;
    }
  }
}
</script>
<style scoped>
figure
{
  margin: 5px;
  position: relative;
  z-index: 1;
}
figure .icon
{
  height: 25px !important;
  margin-right: 5px;
}
figure img
{
  height: 138px;
  border: 1px solid black;
  border: none;
  cursor: pointer;
}
figure img.yt-image
{
  min-width: 250px;
  min-height: 140px;
}
figure figcaption p{
  max-height: 100px;
  overflow: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
figure figcaption p::-webkit-scrollbar {
  display: none;
}
figure figcaption
{
  margin-top: 7px;
  width: 100%;
  max-width: 450px;
}
figure figcaption span a
{
  color: #243342ad;
}
figure figcaption span:nth-child(even)
{
  margin-left: 5px;
}
figure figcaption strong a
{
  color: #2c3e50 !important;
}
.duration
{
  background: rgba(0, 0, 0, 0.75);
  color: #FFF;
  border-radius: 5px;
  padding: 0 5px;
  position: absolute;
  bottom: 35px;
  right: 5px;
  font-size: smaller;
}
.media-type-icon
{
  height: 25px !important;
  margin-right: 5px;
  position: absolute;
  left: 0;
  background: #ffffff;
  padding: 5px;
  border-bottom-right-radius: 5px;
  cursor: inherit;
}
@media (max-width: 720px) {
  figure
  {
    width: auto;
    padding: 10px;
    display: block !important;
  }
  figure .yt-image
  {
    width: 100% !important;
    height: inherit !important;
  }
  .media-type-icon
  {
    left: auto !important;
  }
}
</style>