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
    <section class="p-3" style="margin-top: 70px">
      <h3>Channels</h3>
      <div v-if="channels" class="d-flex justify-content-center">
        <figure v-for="channel in channels" :key="channel.id" class="d-flex justify-content-center">
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
    </section>
  </main>
</template>
<script>
import Notification from '@/components/Notification.vue'

export default {
  name: 'Channels',
  components: {
    Notification
  },
  data() {
    return({
      channels: null
    })
  },
  mounted(){
    this.sockets.subscribe('getChannels', (data) => {
      this.channels = data;
    });

    this.$socket.emit('getChannels')
  },
  methods: {
    link(channelID) {
      this.$router.push({
        name: 'Channel',
        params: {id: channelID}
      });
    }
  }
}
</script>
<style scoped>
figure
{
  width: 200px;
}
figure figcaption strong:hover
{
  text-decoration: underline;
  cursor: pointer;
}
figure img
{
  width: 100px;
  height: 100px;
  border-radius: 50px;
  border: 1px solid rgba(0,0,0,0.1);
}
</style>