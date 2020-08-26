<template>
    <main>
        <header>
            <router-link :to="{name:'Home'}">
                <img src="@/assets/icons/arrowleft.svg" alt="Back" />
            </router-link>
        </header>
        <div v-if="this.item" class="d-flex justify-content-center" style="margin-top: 80px">
            <div style="width: 1024px;">
                <video v-if="this.item.extention != 'mp3'" :src="`/media/videos/${this.item.fileName}`" controls />
                <video v-else :style="`background: url(${item.thumbnails[4].url}); background-size:cover;`" :src="`${serverUrl}/media/music/${this.item.fileLocation}`" controls />
                <h3 style="margin-bottom: 0;">{{this.item.title}}</h3>
                <strong>{{this.item.uploader}}</strong>
                <p style="margin-top: 10px">{{this.item.description}}</p>
            </div>
        </div>
    </main>
</template>
<script>
import axios from 'axios';

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
            item: null
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