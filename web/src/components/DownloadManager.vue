<template>
    <div id="download-manager" :class="windowClass">
        <div class="d-flex justify-content-between">
            <h5 style="cursor:pointer;">Downloads</h5>
        </div>
        <div v-for="item in data" :key="item.id">
            <ul v-if="item.status == 'downloading'">
                <li>
                    <DownloadItem :showProgress="true" :item="item" />
                </li>
            </ul>
        </div>
        <div>
            <ul v-if="pausedOrStoppedItems.length > 0">
                <li v-for="(item, index) in pausedOrStoppedItems" :key="item.id">
                    <DownloadItem v-if="index <= 10" :showProgress="true" :item="item" />
                </li>
            </ul>
            <ul v-if="queueItems.length > 0">
                <li v-for="(item, index) in queueItems" :key="item.id">
                    <DownloadItem v-if="index <= 10" :showProgress="false" :item="item" />
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
import DownloadItem from '@/components/DownloadItem.vue'

export default {
    name: "DownloadManager",
    mounted() {
        this.sockets.subscribe('downloadStatus', (data) => {
            this.data = data.downloads;
            this.checkIfFinished();

            if(data === null)
                return;

            data.downloads.forEach(el => {
                if(el.status === 'downloading'){
                    this.isDownloading = true;
                    this.item = el;
                }
            });
        });

        setInterval(() => {
            this.$socket.emit('downloadStatus');
        }, 1000);
    },
    data(){
        return({
            data: [],
            isDownloading: false,
            item: null,
            windowClass: ""
        });
    },
    methods:{
        checkIfFinished(){
            if(this.item === null)
                return;

            this.data.forEach(el => {
                if(this.item.id === el.id && el.status === 'finished'){
                    this.isDownloading = false;
                    this.$store.commit('isDownloading', false);
                }
            });
        }
    },
    watch:{
        open(newVal){
            if(newVal){
                this.windowClass = "close-manager"
            }
            else{
                this.windowClass = "open-manager";
                this.$socket.emit('downloadStatus');
            }
        }
    },
    props:{
        open: Boolean
    },
    components:{
        DownloadItem
    },
    computed:{
        queueItems(){
            const q = [];

            this.data.forEach(el => {
                if(el.status === 'queued'){
                    q.push(el);
                }
            });

            return q;
        },
        pausedOrStoppedItems(){
            const q = [];

            this.data.forEach(el => {
                if(el.status === 'stopped' || el.status === 'paused'){
                    q.push(el);
                }
            });

            return q;
        },
        finishedItems(){
            const q = [];

            this.data.forEach(el => {
                if(el.status === 'finished'){
                    q.push(el);
                }
            });

            return q;
        }
    }
}
</script>
<style scoped>
@keyframes close{
    0%{
        left: 10px;
    }
    50%{
        left: 35px;
    }
    100%{
        left: -1000;
    }
}
@keyframes openm{
    0%{
        left: -1000;
    }
    50%{
        left: 35px;
    }
    100%{
        left: 10px;
        height: auto;
    }
}
.close-manager{
    animation: close forwards 0.5s;
}
.open-manager{
    animation: openm forwards 0.5s;
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
    left: -1000px;
    width: 250px;
    height: 45px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: #FFF;
    padding: 10px;
    border-radius: 10px;
    z-index: 990;

}
#download-manager:hover{
    width: 350px;
}
#download-manager progress
{
    border-radius: 0;
}
#download-manager ul{
    margin: 0;
    padding: 0 10px;
}
#download-manager ul li{
    list-style-type: none;
    padding: 10px 0;
}
</style>