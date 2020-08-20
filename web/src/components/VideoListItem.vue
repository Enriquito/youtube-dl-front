<template>
    <figure class="d-flex">
        <img alt="image" :src="data.thumbnails[3].url">
        <figcaption>
            <div>
                <a target="_blank" :href="data.videoUrl">
                        <img class="icon" src="@/assets/icons/link.svg" alt="Link" />
                </a>
                <!-- <a target="_blank" :href="data.videoUrl">
                        <img class="icon" style="height: 20px !important;" src="@/assets/icons/download.svg" alt="Download" />
                </a> -->
                <strong>{{data.title}}</strong>
            </div>
            <div>
                <span>
                    <a target="_blank" :href="data.uploaderUrl">{{data.uploader}}</a>
                </span>
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
    color: #243342;
}
figure figcaption span:nth-child(even)
{
    margin-left: 5px;
}
</style>