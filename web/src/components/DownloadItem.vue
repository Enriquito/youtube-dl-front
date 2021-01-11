<template>
    <div class="item-holder">
        <div class="d-flex">
            <span class="video-title">{{item.title}}</span>
        </div>
        <div class="d-flex align-items-center">
            <progress v-if="showProgress" :value="item.downloadStatus" max="100"></progress>
            <div class="d-flex justify-content-end">
                <svg @click="stopDownload" v-if="item.status != 'stopped' && item.status != 'queued'" class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 7H17V17H7V7Z" fill="#000" />
                </svg>
                <svg @click="resumeDownload" v-if="item.status == 'stopped'" class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 12.3301L9 16.6603L9 8L15 12.3301Z" fill="#000" />
                </svg>
                <svg @click="removeDownload" v-if="item.status == 'stopped'" class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M17 5V4C17 2.89543 16.1046 2 15 2H9C7.89543 2 7 2.89543 7 4V5H4C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H5V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H17ZM15 4H9V5H15V4ZM17 7H7V18C7 18.5523 7.44772 19 8 19H16C16.5523 19 17 18.5523 17 18V7Z" fill="#000" />
                    <path d="M9 9H11V17H9V9Z" fill="currentColor" />
                    <path d="M13 9H15V17H13V9Z" fill="currentColor" />
                </svg>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: "DownloadItem",
    props:{
        item: Object,
        showProgress: Boolean
    },
    methods:{
        stopDownload(){
            this.$socket.emit('stopDownload', this.item.processId);
            this.item.status = 'stopped';
            document.querySelector('.video-title').style.textDecoration = "line-through";
        },
        resumeDownload(){
            this.$socket.emit('resumeDownload', this.item.id);
            this.item.status = 'queued';
            document.querySelector('.video-title').style.textDecoration = "inherit";
        },
        removeDownload(){
            this.$socket.emit('removeDownload', this.item.id);
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
    max-width: 250px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
.icon{
    cursor: pointer;
    width: 20px;
    height: 20px;
}
</style>