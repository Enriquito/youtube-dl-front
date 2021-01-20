<template>
    <div v-if="open" class="d-flex justify-content-center" id="settings-holder">
        <div class="align-self-center d-flex" id="settings-window">
            <div style="width: 100%;">
                  <h3>Playlist selection</h3>
                  <h6 v-if="this.playlistInfo">{{this.playlistInfo[0].playlist_title}} by: {{this.playlistInfo[0].playlist_uploader}}</h6>
                  
                  <div id="list-holder" style="width: 100%;">
                      <figure v-for="(item, index) in this.playlistInfo" :key="index">
                          <figcaption>
                              <div class="d-flex">
                                    <div class="item-index">
                                        <small>{{item.playlist_index}}</small>
                                        <input type="checkbox" />
                                    </div>
                                <div class="item-name">
                                    <strong>{{item.title}}</strong>
                                </div>
                              </div>
                        
                              <div class="item-uploader">
                                  <small>{{item.uploader}}</small>
                              </div>
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
    height: 350px;
}
#list-holder figure
{
    cursor: pointer;
}
#list-holder figure:hover
{
    background: rgba(28, 240, 35, 0.5);
    border-radius: 5px;
    /* color: rgb(119, 119, 119); */
}
#list-holder figure figcaption .item-index
{
    padding: 10px;
    /* padding-left: 0; */
}
#list-holder figure figcaption .item-name
{
    padding: 10px;
    max-width: 350px;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden !important;
    text-overflow: ellipsis;
}
#list-holder figure figcaption .item-uploader
{
    margin-left: 37px;
    margin-top: -15px;
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