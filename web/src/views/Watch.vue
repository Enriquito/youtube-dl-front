<template>
    <BaseTemplate>
        <div v-if="this.item" class="d-flex justify-content-center" style="margin-top: 80px">
            <div id="content" style="">
                <video v-if="this.item.extention != 'mp3'" :src="`/media/${this.item.fileName}.${this.item.extention}`" controls />
                <video v-else :style="`background: url(${getBestThumbnailUrl}); background-size:cover;`" :src="`/media/${this.item.fileName}.${this.item.extention}`" controls />

                <h3 style="margin-bottom: 0;">{{this.item.title}}</h3>
                <div class="d-flex">
                  <a target="_blank" :href="this.item.url">
                    <img class="icon" style="height: 20px !important;" src="@/assets/icons/link.svg" alt="Link" />
                  </a>
                  <a target="_blank" :href="`/file/${this.item.id}`">
                    <img class="icon" style="height: 20px !important;" src="@/assets/icons/download.svg" alt="Download" />
                  </a>
                </div>
                <strong>{{this.item.uploader}}</strong>
                <p style="margin-top: 10px">{{this.item.description}}</p>
            </div>
        </div>
    </BaseTemplate>
</template>
<script>
import arrowLeft from '@/assets/icons/arrowleft.svg';
import BaseTemplate from '@/components/BaseTemplate.vue'

export default {
    name: "Watch",
    components:{
        BaseTemplate
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