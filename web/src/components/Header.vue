<template>
    <header class="d-flex justify-content-center">
        <div style="position: relative;">
            <input @blur="getInfo" v-model="options.url" type="url" />
            <button @click="sendUrl">Download</button>
        </div>
        <select v-if="info">
            <option
            v-for="(format, index) in getFormats"
            :key="index"
            :value="format.ext"
            >{{format.format_note}}</option>
        </select>
        <select v-else>
            <option></option>
        </select>
        <input type="checkbox" v-model="options.playlist" />
        <label>Playlist</label>
    </header>
</template>
<script>
import axios from 'axios';

export default {
    name: "Header",
    data: () => {
        return({
            info: null,
            options : {
                playlist: false,
                url : "https://www.youtube.com/watch?v=koVHN6eO4Xg"
            },
            isDownloading: false
        });
    },
    methods: {
        sendUrl(){
            axios.post('/download',{
                url: this.options.url
            })
            .then(result => {
                this.$emit('clicked', result.data);
                this.isDownloading = true;
            });
        },
        getInfo(){
            let reg = this.options.url.match(/v=(\w+)/);
            const id = reg[1];

            axios.get(`/info/video/${id}`)
            .then(result => result.data)
            .then(result => {
                this.info = result;
            })
        }
    },
    computed: {
        getFormats(){
            let ar = [];

            this.info.formats.forEach(el => {
                if(el.ext == "mp4" && el.format_note != 'tiny'){
                    ar.push(el);
                }
            });

            ar = ar.filter((item, index) => {
                return ar.indexOf(item) === index
            });

            return ar;
        }
    }
}
</script>
<style scoped>
header
{
    text-align: center;
    padding: 10px;
    position: fixed;
    background: #34495e;
    width: 100%;
    top: 0;
}
input[type="url"]
{
    padding: 10px;
    width: 550px;
    padding-right: 90px;
}
select
{
    padding: 11px;
    margin-left: 5px;
}
button
{
    margin-left: 5px;
    padding: 10px;
    border: none;
    right: 1px;
    position: absolute;
    top: 2px;
}
</style>