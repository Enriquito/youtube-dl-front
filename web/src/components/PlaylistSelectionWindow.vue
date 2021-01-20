<template>
    <div v-if="open" class="d-flex justify-content-center" id="settings-holder">
        <div class="align-self-center d-flex" id="settings-window">
            <div style="width: 100%;">
                  <h3>Playlist selection</h3>
                  <h6 v-if="this.playlistInfo">{{this.playlistInfo[0].playlist_title}}</h6>
                  
                  <div id="list-holder" style="width: 100%;">
                      <figure>
                          <figcaption class="d-flex" v-for="(item, index) in this.playlistInfo" :key="index">
                              <small>{{index + 1}}</small>
                              <strong>{{item.title}}</strong>
                          </figcaption>
                      </figure>
                  </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: "PlaylistSelection",
    mounted(){
        this.sockets.subscribe('getPlaylist', data => {
            this.playlistInfo = data;
        });
    },
    data(){
            return({
                  playlistInfo: null
            });
      },
      props:{
            open: Boolean,
    },
    methods:{

    }
}
</script>
<style scoped>
#settings-holder
{
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    position: fixed;
    top: 0;
    z-index: 999;
}
#settings-window
{
    width: 400px;
    height: 500px;
    background: #fff;
    border-radius: 10px;
    padding: 20px;
    position: relative;
    overflow: scroll;
}

#list-holder
{
    border: 1px solid black;
    height: 350px;
   
}
#settings-window::-webkit-scrollbar
{
  display: none;
}
#settings-window
{
  -ms-overflow-style: none;
  scrollbar-width: none;
}

#settings-window div div .skeleton-label
{
    height: 10px;
    background: grey;
    border-radius: 10px;
    width: 150px;
    margin-bottom: 10px;
    animation: skeleton-loader 2s infinite;
}
#settings-window div div .skeleton-input
{
    height: 15px;
    background: grey;
    border-radius: 10px;
    width: 250px;
    margin-bottom: 10px;
    animation-delay: 1s;
    animation: skeleton-loader 2s infinite;
}
@keyframes skeleton-loader {
    0%{
        background: grey;
    }
    50%{
        background: rgb(168, 168, 168);
    }
    100%{
        background: grey;
    }
}
</style>