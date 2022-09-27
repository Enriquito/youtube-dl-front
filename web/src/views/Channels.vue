<template>
  <BaseTemplate>
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
  </BaseTemplate>
</template>
<script>
import BaseTemplate from '@/components/BaseTemplate.vue'

export default {
  name: 'Channels',
  components: {
    BaseTemplate
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