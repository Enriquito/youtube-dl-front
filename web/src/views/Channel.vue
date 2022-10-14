<template>
  <BaseTemplate>
    <section v-if="channel">
      <ChannelHeader :channel="channel" />
      
      <div style="height: 130px" class="w-full d-flex align-items-center px-3 button-bar">
        <button @click="scanChannel" v-if="!channel.isScanning" class="border">Scan</button>
        <button v-else class="border enabled">Scanning...</button>

        <button @click="enableAutomaticDownload" class="enabled" v-if="channel.autoDownloadAfterScan">Auto download after scan</button>
        <button @click="enableAutomaticDownload" v-else>Auto download after scan</button>
        <button @click="goToChannel">Visit on youtube</button>
      </div>
      <div v-if="videos" class="d-flex justify-content-center">
         <div style="max-width: 785px" class="d-flex flex-wrap justify-content-center">
           <ChannelVideoItem v-for="video in videos" :key="video.id" :data="video" />
         </div>
      </div>
    </section>
  </BaseTemplate>
</template>
<script>
import BaseTemplate from '@/components/BaseTemplate.vue'
import ChannelVideoItem from "@/components/Channel/ChannelVideoItem";
import ChannelHeader from "@/components/Channel/Header";

export default {
  name: 'Channel',
  components: {
    BaseTemplate,
    ChannelVideoItem,
    ChannelHeader
  },
  data() {
    return {
      channel: null,
      videos: null
    }
  },
  mounted(){
    this.sockets.subscribe('getChannel', (data) => {
      this.channel = data;
      this.channel.autoDownloadAfterScan = Boolean(this.channel.autoDownloadAfterScan);
      this.$socket.emit('getVideosByChannelID', this.channel.id);
    });

    this.sockets.subscribe('getVideosByChannelID', (videos) => {
      this.videos = videos;
    });

    this.sockets.subscribe('toggleAutoDownloadAfterScan', (success) => {
      this.channel.autoDownloadAfterScan = success;
    });

    this.sockets.subscribe('scanChannel', () => {
      this.$socket.emit('getVideosByChannelID', this.$route.params.id);
    });

    this.sockets.subscribe('isChannelScanning', (result) => {
      this.channel.isScanning = result;
    });

    this.sockets.subscribe('videoDownloaded', () => {
      this.$socket.emit('getVideosByChannelID', this.channel.id);
    });

    this.$socket.emit('getChannel', this.$route.params.id);
  },
  methods: {
    enableAutomaticDownload() {
      this.$socket.emit('toggleAutoDownloadAfterScan', this.channel.id);
    },
    scanChannel() {
      this.$socket.emit('scanChannel', this.channel.id);
    },
    goToChannel() {
      window.open(this.channel.url, "_blank");
    }
  }
}
</script>
<style scoped>
section
{
  position: relative;
  top: 69px;
}
button
{
  border: 1px solid rgba(0,0,0,0.1);
  padding: 10px 20px;
  margin: 5px;
  background: #FFF;
  border-radius: 50px;
}
@media (max-width: 1200px) {
  .button-bar {
    margin-top: 100px;
        justify-content: center !important;
    display: flex;
  }
}
@media (max-width: 720px) {
  .button-bar {
    margin-top: 100px;

  }
}
</style>
<style>
.enabled {
  background: #2ecc71 !important;
  color: #FFF;
}
</style>