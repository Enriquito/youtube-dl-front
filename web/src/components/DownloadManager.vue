<template>
    <div id="download-manager" :class="windowClass">
        <div @click="toggle" class="d-flex justify-content-between">
            <h5>Downloads</h5>
            <img class="icon" style="height: 20px !important;" src="@/assets/icons/trash.svg" alt="Download" />
        </div>
        <ul v-if="data">
            <li v-for="(item, index) in data" :key="item.id">
                <DownloadItem v-if="index <= 10 " :title="item.title" :progressValue="item.downloadStatus" />
            </li>
        </ul>
    </div>
</template>
<script>
import axios from 'axios';
import DownloadItem from '@/components/DownloadItem.vue'

export default {
    name: "DownloadManager",
    created(){
        axios.get(`/download/status`)
        .then(result => result.data)
        .then(result => {
            this.data = result;
            this.data.reverse();
        })
        .catch(error => {
            console.error(error);
        });
    },
    data(){
        return({
            data: null,
            fetchInterval: null,
            windowClass: "close-manager",
            open: false
        });
    },
    methods:{
        toggle(){
            if(this.open){
                this.windowClass = "close-manager"
                this.open = false;
            }
            else{
                this.windowClass = "open-manager";
                this.open = true;
            }
        }
    },
    watch:{
        isDownloading(){
            if(this.isDownloading){
                this.fetchInterval = setInterval(() => {
                    axios.get(`/download/status`)
                    .then(result => result.data)
                    .then(result => {
                        this.data = result;
                        this.data.reverse();
                    })
                    .catch(error => {
                        console.error(error);
                    });
                }, 1000)
            }
        }
    },
    props:{
        isDownloading: Boolean
    },
    components:{
        DownloadItem
    }
}
</script>
<style scoped>
@keyframes close{
    0%{
        height: auto;
    }
    50%{

    }
    100%{
        width: 175px;
        height: 45px;
    }
}
@keyframes open{
    0%{
        width: 175px;
        height: 45px;
    }
    50%{
        width: 230px;
    }
    100%{
        height: auto;
    }
}
.close-manager{
    animation: close forwards 0.5s;
}
.open-manager{
    animation: open forwards 0.5s;
}
.icon
{
    height: 25px !important;
    margin-right: 5px;
    cursor: pointer;
}
#download-manager
{
    transition: all 0.5s;
    -webkit-transition: all 0.5s;
    overflow: hidden;
    position: fixed;
    top: 10px;
    left: 10px;
    width: 175px;
    height: 45px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: #FFF;
    padding: 10px;
    border-radius: 10px;
}
#download-manager:hover{
    width: 300px;
}
#download-manager progress
{
    border-radius: 0;
}
#download-manager ul{
    margin: 0;
    padding: 10px;
}
#download-manager ul li{
    list-style-type: none;
}
</style>