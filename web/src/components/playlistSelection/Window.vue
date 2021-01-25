<template>
    <div v-if="open" class="d-flex justify-content-center" id="settings-holder">
        <div class="align-self-center d-flex" id="settings-window">
            <div style="width: 100%;">
                  <h3>Playlist selection</h3>
                  <div v-if="this.playlistInfo" class="d-flex align-items-center">
                      <strong class="item-uploader" style="max-width: 1110px">{{this.playlistInfo[0].playlist_uploader}}</strong>
                      <span style="margin: 0 5px">-</span>
                      <small class="item-uploader" style="max-width: 250px">{{this.playlistInfo[0].playlist_title}}</small><small>({{this.playlistInfo.length}})</small>
                  </div>
                  <div v-else class="d-flex align-items-center">
                      <div style="width: 30%;" class="title-skeleton"></div>
                      <div style="width: 50%;" class="title-skeleton"></div>
                  </div>
                  
                             
                  <div id="list-holder" style="width: 100%;">
                      <div v-if="playlistInfo">
                            <div v-for="(item, index) in this.playlistInfo" :key="index">
                                <PlaylistItem :item="item" />
                            </div>
                      </div>
                      <div v-else>
                          <div v-for="index in 5" :key="index" class="item-skeleton">
                              <div class="item-skeleton-text" :style="`width: ${Math.floor(Math.random() * Math.floor(10)) * 10}%; animation-delay: ${5 * index}s;`"></div>
                              <div class="item-skeleton-text" :style="`width: ${Math.floor(Math.random() * Math.floor(6)) * 10}%; animation-delay: ${1 * index}s;`"></div>
                          </div>
                      </div>
                  </div>
                  <div id="settings-buttons" class="d-flex justify-content-space-between">
                        <button @click="close">Close</button>
                        <button @click="download">Download</button>
                    </div>
            </div>
        </div>
    </div>
</template>
<script>
import PlaylistItem from '@/components/playlistSelection/Item.vue';

export default {
    name: "PlaylistSelection",
    components:{
        PlaylistItem
    },
    mounted(){
        this.sockets.subscribe('getPlaylist', data => {
            this.playlistInfo = data;

            data.forEach(obj => {
                obj.selected = true;
            });
        });
    },
    data(){
            return({playlistInfo: null});
    },
    props:{
        open: Boolean,
    },
    methods:{
        selectToggle(index){
            const item = this.playlistInfo[index];

            if(item.selected)
                item.selected = false;
            else
                item.selected = true;
        },
        close(){
            this.$store.commit('playlistSelectionOpen', false);
            this.playlistInfo = null;
        },
        download(){
            const items = [];

            this.playlistInfo.forEach(item => {
                if(item.selected){
                    items.push({
                        url: item.webpage_url,
                        playlist: true,
                        videoQuality: null,
                        soundQuality: null,
                        audioOnly: false
                    });
                }
            });

            if(items.length > 0){
                this.$socket.emit('download',{list: items});
                this.$store.commit('isDownloading', true);
                this.close();
            }
            else{
                this.$parent.$refs.notificationComp.open('Warning','No items selected.');
            }
        }
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
.item-uploader, .item-playlist-name
{
      display: inline-block;
      white-space: nowrap;
      overflow: hidden !important;
      text-overflow: ellipsis;
}

#list-holder
{
    height: 350px;
    overflow: scroll;
}

#settings-window div #settings-buttons
{
    position: absolute;
    bottom: 20px;
    justify-content: center;
    width: 90%;
}
#settings-window div #settings-buttons button
{
    width: 100px;
    border-radius: 10px;
    margin: 0 10px;
    font-weight: bold;
    outline: none;
}
#settings-window div #settings-buttons button
{
    background: #FFF;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    padding: 5px 10px;
}
#list-holder figure figcaption .item-uploader
{
    margin-left: 37px;
    margin-top: -15px;
}

#settings-window::-webkit-scrollbar, #list-holder::-webkit-scrollbar
{
  display: none;
}
#settings-window, #list-holder
{
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.title-skeleton
{
    background: grey;
    border-radius: 10px;
    height: 10px;
    animation: skeleton-loader 2s infinite;
    margin-bottom: 5px;
    margin-left: 5px;
}

.item-skeleton
{
    background: grey;
    border-radius: 10px;
    height: 50px;
    animation: skeleton-loader 2s infinite;
    margin: -8px 0px;
}
.item-skeleton .item-skeleton-text
{
    background: grey;
    border-radius: 10px;
    height: 5px;
    margin-top: 10px;
    top: 10px;
    left: 10px;
    position: relative;
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