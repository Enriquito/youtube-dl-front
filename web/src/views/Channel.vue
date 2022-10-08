<template>
  <BaseTemplate>
    <section v-if="channel">
      <div style="height: 283px; background-color: gray;" class="w-full">
        <img style="background-size: cover; width: 100%; height: 100%;" referrerpolicy="no-referrer" :src="channel.banner">
      </div>

      <div id="channel-header" style="height: 0;" class="d-flex justify-content-center">
        <div>
          <figure class="d-flex justify-content-center">
            <div>
              <div class="d-flex justify-content-center">
                <img referrerpolicy="no-referrer" :src="channel.avatar" :style="`background-color: #FFF;`">
              </div>
              <figcaption class="mt-2 text-center">
                <strong @click="() => {link(channel.id)}" class="d-inline-block">{{ channel.name }}</strong>
                <small class="d-block">{{formatSubscriberCount}} subscribers</small>
              </figcaption>
            </div>
          </figure>
        </div>
      </div>
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

export default {
  name: 'Channel',
  components: {
    BaseTemplate,
    ChannelVideoItem
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
  },
  computed: {
    formatSubscriberCount() {
        let subscriptionString = '';

        if (this.channel.followerCount > 100000) { 
          subscriptionString = (this.channel.followerCount / 1000);
        }
        else if (this.channel.followerCount > 10000) { 
          subscriptionString = (this.channel.followerCount / 1000).toFixed(1);
        } 
        else if (this.channel.followerCount > 1000) {
            subscriptionString = (this.channel.followerCount / 1000).toFixed(2);
        }
        
        return `${subscriptionString}K`.replace(',','.');
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
#channel-header figure
{
  width: 200px;
  position: relative;
  top: -120px;
  margin: 0;
}
#channel-header figure img
{
  width: 150px;
  height: 150px;
  border-radius: 100px;
  /*border: 1px solid rgba(0,0,0,0.1);*/
  box-shadow: 1px 1px 12px #00000061;
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