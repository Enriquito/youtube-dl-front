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
        <div v-if="this.item" class="d-flex justify-content-center" style="margin-top: 80px">
            <div id="content" style="">
                <video v-if="this.item.extention != 'mp3'" :src="`/media/${this.item.fileName}.${this.item.extention}`" controls />
                <video v-else :style="`background: url(${getBestThumbnailUrl}); background-size:cover;`" :src="`/media/${this.item.fileName}.${this.item.extention}`" controls />
                <h3 style="margin-bottom: 0;">{{this.item.title}}</h3>
                <strong>{{this.item.uploader}}</strong>
                <p style="margin-top: 10px">{{this.item.description}}</p>
            </div>
        </div>
    </main>
</template>
<script>
import arrowLeft from '@/assets/icons/arrowleft.svg';
import Notification from '@/components/Notification.vue'

export default {
    name: "Watch",
    components:{
        Notification
    },
    mounted(){
        this.sockets.subscribe('item', (data) => {
            this.item = data;
        });

        this.$socket.emit('getVideo',this.$route.params.id);
    },
    data(){
        return({
            item: null,
            arrowLeftIcon: arrowLeft
        });
    },
    computed:{
        getBestThumbnailUrl(){
            return this.item.thumbnails[this.item.thumbnails.length - 1].url;
        }
    }
}
</script>
<style scoped>

video
{
    width: 1024px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    outline: none;
}
#content
{
    width: 1024px;
}
@media (max-width: 720px)
{
    video
    {
        width: 100% !important;
    }
    #content
    {
        width: 100% !important;
    }
    #content h3, strong, p
    {
        padding: 10px
    }
}
</style>