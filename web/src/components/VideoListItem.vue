<template>
    <figure class="d-flex">
        <img alt="image" :src="data.thumbnails[3].url">
        <figcaption>
            <div>

            </div>
            <div>
                <strong>{{data.title}}</strong>
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
                    <router-link :to="{name:'Watch', params:{id: data.id}}">
                        <img class="icon" style="height: 20px !important;" src="@/assets/icons/eye.svg" alt="Preview" />
                    </router-link>
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
            axios.delete(`/items/${id}`)
            .then(() => {
                this.$emit('deleted', this.data);
            })
        }
    },
    computed:{
        serverUrl(){
            return process.env.VUE_APP_SERVER_ADDRESS;
        }
    }
}
</script>
<style scoped>
figure
{
    width: 700px;
    margin: 10px 0;
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
figure figcaption p{
    max-height: 150px;
    overflow: scroll;
}
figure figcaption
{
    padding: 0 10px;
}
figure figcaption span a
{
    color: #243342ad;
}
figure figcaption span:nth-child(even)
{
    margin-left: 5px;
}
</style>