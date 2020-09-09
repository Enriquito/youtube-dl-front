<template>
    <div class="item-holder">
        <span>{{title}}</span>
        <progress :value="progressValue" max="100"></progress>
    </div>
</template>
<script>
export default {
    name: "DownloadManager",
    props:{
        title: String,
        progressValue: Number
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
</style>