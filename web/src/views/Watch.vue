<template>
    <main>
        <header>
            <router-link :to="{name:'Home'}">
                <!-- <img src="@/assets/icons/arrowleft.svg" alt="Back" /> -->
                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                    width="512px" height="512px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512; width: 25px; height: 25px; fill:#FFF" xml:space="preserve">
                    <polygon points="64.5,256.5 256.5,448.5 256.5,336.5 448.5,336.5 448.5,176.5 256.5,176.5 256.5,64.5 "/>
                </svg>
            </router-link>
        </header>
        <div v-if="this.item" class="d-flex justify-content-center" style="margin-top: 80px">
            <div style="width: 1024px;">
                <video v-if="this.item.extention != 'mp3'" :src="`/media/videos/${this.item.fileName}`" controls />
                <video v-else :style="`background: url(${item.thumbnails[4].url}); background-size:cover;`" :src="`media/music/${this.item.fileName}`" controls />
                <h3 style="margin-bottom: 0;">{{this.item.title}}</h3>
                <strong>{{this.item.uploader}}</strong>
                <p style="margin-top: 10px">{{this.item.description}}</p>
            </div>
        </div>
    </main>
</template>
<script>
import axios from 'axios';
import arrowLeft from '@/assets/icons/arrowleft.svg';

export default {
    name: "Watch",
    mounted(){
        axios.get(`/items/${this.$route.params.id}`)
        .then(result => {
            this.item = result.data;
        });
    },
    data(){
        return({
            item: null,
            arrowLeftIcon: arrowLeft
        });
    }
}
</script>
<style scoped>
header
{
    padding: 10px;
    position: fixed;
    background: #34495e;
    width: 100%;
    top: 0;
    min-height: 50px;
}
img
{
    height: 25px !important;
    margin-right: 5px;
}
video
{
    width: 1024px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    outline: none;
}
</style>