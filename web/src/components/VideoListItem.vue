<template>
    <figure class="d-flex">
        <img style="height: 25px !important;" class="media-type-icon" v-if="data.extention == 'mp3'" src="@/assets/icons/note.svg" alt="Audio" />
        <img style="height: 25px !important;" class="media-type-icon" v-else src="@/assets/icons/videocamera.svg" alt="Video" />

        <img class="yt-image" alt="image" :src="data.thumbnails[3].url">
        <figcaption>
            <div class="d-flex">
                <strong>
                    <router-link :to="{name:'Watch', params:{id: data.id}}">
                        {{data.title}}
                    </router-link>
                </strong>
            </div>
            <div class="d-flex justify-content-between">
                <div>
                    <span>
                        <a target="_blank" :href="data.uploaderUrl">{{data.uploader}}</a>
                    </span>
                </div>
                <div>
                    <img @click="() => {deleteItem(data.id)}" class="icon" style="height: 20px !important;" src="@/assets/icons/trash.svg" alt="Download" />
                    <a target="_blank" :href="data.videoUrl">
                        <img class="icon" src="@/assets/icons/link.svg" alt="Link" />
                    </a>
                    <a target="_blank" :href="`${serverUrl}/file/${data.id}`">
                        <img class="icon" style="height: 20px !important;" src="@/assets/icons/download.svg" alt="Download" />
                    </a>
                </div>
            </div>
            <p>
                {{data.description}}
            </p>
        </figcaption>
    </figure>
</template>
<script>
import axios from 'axios';
export default {
    name: "VideoListItem",
    props: {
        data: Object
    },
    methods: {
        deleteItem(id){
            axios.delete(`${this.serverUrl}/items/${id}`)
            .then(() => {
                this.$emit('deleted', this.data);
            })
        }
    },
    computed:{
        serverUrl(){
            return process.env.VUE_APP_SERVER_ADDRESS;
        },
        imageLink(){
            return this.data.thumbnails[3].url.match(/(\w\B.+)\?sqp=/)[1];
        }
    }
}
</script>
<style scoped>
figure
{
    width: 700px;
    margin: 10px 0;
    position: relative;
    z-index: 1;
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
    padding: 0 10px;
    width: 100%;
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
</style>