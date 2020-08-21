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
                    <a target="_blank" :href="data.videoUrl">
                        <img class="icon" src="@/assets/icons/link.svg" alt="Link" />
                    </a>
                    <a target="_blank" :href="`/file/${data.id}`">
                        <img class="icon" style="height: 20px !important;" src="@/assets/icons/eye.svg" alt="Preview" />
                    </a>
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
export default {
    name: "VideoListItem",
    props: {
        data: Object
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