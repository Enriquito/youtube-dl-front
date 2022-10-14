<template>
    <div>
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
    </div>
    
</template>
<script>
export default {
    name: 'ChannelHeader',
    props: {
        channel: {
            type: Object,
            required: true
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
figure
{
  width: 200px;
  position: relative;
  top: -120px;
  margin: 0;
}
figure img
{
  width: 150px;
  height: 150px;
  border-radius: 100px;
  /*border: 1px solid rgba(0,0,0,0.1);*/
  box-shadow: 1px 1px 12px #00000061;
}
</style>