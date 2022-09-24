<template>
  <main>
    <Notification ref="notificationComp" />
    <header class="d-flex align-items-center">
      <router-link :to="{name:'Home'}">
        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
             width="512px" height="512px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512; width: 25px; height: 25px; fill:#FFF" xml:space="preserve">
                    <polygon points="64.5,256.5 256.5,448.5 256.5,336.5 448.5,336.5 448.5,176.5 256.5,176.5 256.5,64.5 "/>
                </svg>
      </router-link>
    </header>
    <section v-if="channel">
      <div :style="`background: url(${channel.banner}); background-size: cover; height: 283px;`" class="w-full">
      </div>

      <div id="channel-header" style="height: 0;" class="d-flex justify-content-center">
        <div>
          <figure class="d-flex justify-content-center">
            <div>
              <div class="d-flex justify-content-center">
                <img :src="channel.avatar" :style="`background: ${channel.avatar}; background-size: cover`">
              </div>
              <figcaption class="mt-2 text-center">
                <strong @click="() => {link(channel.id)}" class="d-inline-block">{{ channel.name }}</strong>
                <small class="d-block">{{channel.followerCount}} Subscribers</small>
              </figcaption>
            </div>
          </figure>
        </div>
      </div>
      <div style="height: 100px" class="w-full d-flex align-items-center px-3">
        <button class="border">Scan</button>

        <button class="enabled" v-if="channel.autoDownloadAfterScan">Auto download</button>
        <button v-else>Auto download</button>
      </div>
      <div v-if="videos" class="d-flex justify-content-center">
         <div style="max-width: 785px" class="d-flex flex-wrap justify-content-center">
           <ChannelVideoItem v-for="video in videos" :key="video.id" :data="video" />
         </div>
      </div>
    </section>
  </main>
</template>
<script>
import Notification from '@/components/Notification.vue'
import ChannelVideoItem from "@/components/Channel/ChannelVideoItem";

export default {
  name: 'Channel',
  components: {
    Notification,
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
    });

    this.sockets.subscribe('getVideosByChannelID', (videos) => {
      this.videos = videos;
    });

    this.$socket.emit('getChannel', this.$route.params.id);
    this.$socket.emit('getVideosByChannelID', this.$route.params.id);
  },
  computed: {
    bannerBackground() {
      return ``
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
button.enabled {
  background: #2ecc71 !important;
  color: #FFF;
}
</style>