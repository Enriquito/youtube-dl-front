<template>
  <figure>
    <img class="yt-image" alt="image" :src="data.thumbnail">
    <figcaption>
      <span v-if="data.downloaded_at" class="duration">
        {{duration}}
      </span>
      <button @click="downloadVideo" v-if="!data.downloaded_at" class="download-button enabled">{{downloadButtonText}}</button>
      <div class="d-flex">
        <strong class="title" v-if="data.id">
          <router-link :to="{name:'Watch', params:{id: data.id}}">
            {{data.title}}
          </router-link>
        </strong>
        <strong class="title" v-else>
          {{data.title}}
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

export default {
  name: "ChannelVideoItem",
  props: {
    data: Object
  },
  data() {
    return {
      showActions: false,
      downloadButtonText: "Download"
    }
  },
  methods: {
    deleteItem(){
      this.$socket.emit('deleteVideo',this.data);
      this.$emit('deleted', this.data);
    },
    downloadVideo() {
      this.$socket.emit('download',{list: [{url: this.data.video_url}]});
      this.downloadButtonText = "Downloading";
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
      let timeInMinutes = Math.floor(this.data.duration / 60);
      const timeInSeconds = this.data.duration % 60;
      let hours = null;

      if (timeInMinutes >= 60) {
        hours = Math.floor(timeInMinutes / 60);
        timeInMinutes = Math.floor(timeInMinutes - (hours * 60));
      }

      if (hours) {
        return `${hours}:${String(timeInMinutes).padStart(2, '0')}:${String(timeInSeconds).padStart(2, '0')}`;
      }

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
  width: 250px;
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
figure figcaption strong.title
{
  overflow: hidden;
  -webkit-line-clamp: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  white-space: normal;
}
.duration
{
  background: rgba(0, 0, 0, 0.75);
  color: #FFF;
  border-radius: 5px;
  padding: 0 5px;
  position: absolute;
  top: 115px;
  right: 5px;
  font-size: smaller;
  font-weight: bold;
}
.download-button
{
  background: rgba(0, 0, 0, 0.75);
  color: #FFF;
  border-radius: 5px;
  padding: 0 5px;
  position: absolute;
  top: 115px;
  left: 5px;
  font-size: smaller;
  font-weight: bold;
  border: none;
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
  .duration {
    bottom: 75px !important;
    right: 20px !important;
    top: unset;
  }
  .download-button {
    bottom: 75px !important;
    left: 20px !important;
    top: unset;
  }
}
</style>