<template>
    <figure class="d-flex">
        <img alt="image" :src="data.thumbnails[3].url">
        <figcaption>
            <div>
                <strong>{{data.title}}</strong>
            </div>
            <div>
                <span>
                    <a target="_blank" :href="data.uploaderUrl">{{data.uploader}}</a>
                </span> 
                <span>
                    <a target="_blank" :href="data.videoUrl">Link</a>
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