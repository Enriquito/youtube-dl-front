<template>
    <div class="item-holder">
        <div class="d-flex">
            <span class="video-title">{{item.title}}</span>
            <!-- <img @click="stopDownload" class="icon" style="height: 20px !important;" src="@/assets/icons/trash.svg" alt="Download" /> -->
        </div>
        <progress v-if="showProgress" :value="item.downloadStatus" max="100"></progress>
    </div>
</template>
<script>
export default {
    name: "DownloadManager",
    props:{
        item: Object,
        showProgress: Boolean
    },
    methods:{
        stopDownload(){
             this.$socket.emit('stopDownload', this.item.id);
             document.querySelector('.video-title').style.textDecoration = "line-through";
             alert('Werkt nog niet. Afmaken.');
        }
    }
}
</script>
<style scoped>
@keyframes slideIn{
    0%{
        position: relative;
        left: -328px;
    }
    100%{
        left: auto;
    }
}
.item-holder{
    animation: slideIn forwards 0.5s;
    translate: all;
}
progress {
    padding: 10px;
    width: 100%;
}
span{
    display: block;
    max-width: 230px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
img{
    cursor: pointer;
}
</style>