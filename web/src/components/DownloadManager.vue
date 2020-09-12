<template>
    <div id="download-manager" :class="windowClass">
        <div class="d-flex justify-content-between">
            <h5 style="cursor:pointer;">Downloads</h5>
            <img @click="deleteList" class="icon" style="height: 20px !important;" src="@/assets/icons/trash.svg" alt="Download" />
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
        });
    },
    methods:{
        deleteList(){
            axios.delete('/download/status')
            .then(result => {
                if(result.status === 200){
                    this.$parent.$refs.notificationComp.open('Success','Download list has been deleted.');
                }
            })
        }
    },
    watch:{
        isDownloading(newVal){
            if(newVal){
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
        },
        open(newVal){
            if(newVal){
                this.windowClass = "close-manager"
            }
            else{
                this.windowClass = "open-manager";
            }
        }
    },
    props:{
        isDownloading: Boolean,
        open: Boolean
    },
    components:{
        DownloadItem
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
    width: 230px;
    height: 45px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: #FFF;
    padding: 10px;
    border-radius: 10px;
    z-index: 990;

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