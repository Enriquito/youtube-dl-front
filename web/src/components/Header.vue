<template>
    <header class="d-flex justify-content-center">
        <div style="position: relative;">
            <input placeholder="Youtube url here" @blur="getInfo" v-model="options.url" type="url" />
            <button v-if="isDownloading && canDownload" disabled>Downloading..</button>
            <button v-else-if="canDownload && !isDownloading" @click="sendUrl">Download</button>
            <button v-else-if="isFetchingInfo" disabled>Loading..</button>
            <button v-else-if="!canDownload" disabled>Download</button>
        </div>
        <div>
            <button @click="selectAudioOnly" v-if="audioOnly" class="audio-button" id="audio-button-active">Audio</button>
            <button @click="selectAudioOnly" v-else class="audio-button">Audio</button>
        </div>
        <select v-if="info" v-model="options.quality">
            <option disabled selected>Quality</option>
            <option
            v-for="(format, index) in getFormats"
            :key="index"
            :value="format.format_id"
            >{{format.format_note}}</option>
        </select>
        <select v-else v-model="options.quality">
            <option disabled selected>Quality</option>
        </select>
        <!-- <input type="checkbox" v-model="options.playlist" /> -->
        <!-- <label>Playlist</label> -->
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
                url : "",
                quality: "Quality"
            },
            isDownloading: false,
            canDownload: false,
            isFetchingInfo: false,
            audioOnly: false
        });
    },
    methods: {
        sendUrl(){
            this.isDownloading = true;

            axios.post('/download',this.options)
            .then(result => {
                this.$emit('clicked', result.data);
                this.isDownloading = false;
                this.options.url = "";
            });
        },
        getInfo(){
            if(this.options.url === "")
                return;

            try{
                this.isFetchingInfo = true;
                let reg = this.options.url.match(/v=([0-9a-zA-Z$-_.+!*'(),]+)/);
                const id = reg[1];

                axios.get(`/info/video/${id}`)
                .then(result => result.data)
                .then(result => {
                    this.info = result;
                    this.isFetchingInfo = false;
                    this.canDownload = true;
                })
                .catch(error => {
                    console.log(error);
                    this.canDownload = true;
                    this.isFetchingInfo = false;
                });
            }
            catch(error){
                alert('invalid youtube url');
                this.isFetchingInfo = false;
                console.warn(error);
            }
        },
        selectAudioOnly(){
            if(this.audioOnly)
                this.audioOnly = false;
            else
                this.audioOnly = true;
        }
    },
    computed: {
        getFormats(){
            let ar = [];

            this.info.formats.forEach(el => {
                if(this.audioOnly){
                    if(el.ext == "mp4" || el.ext == "webm" && el.vcodec == "none"){
                        ar.push(el);
                    }
                }
                else{
                    if(el.acodec != "none" && el.vcodec != "none"){
                        ar.push(el);
                    }
                }
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
    min-height: 50px;
}
input[type="url"]
{
    padding: 10px;
    width: 400px;
    outline: none;
}
select
{
    padding: 11px;
    margin-left: 5px;
    min-width: 90px;
}
button
{
    padding: 11px;
    border: none;
    margin-left: -1px;
    outline: none;
    min-width: 127px;
}
.audio-button
{
    margin-top: 1px;
    min-width: 70px;
    user-select: none;
}
#audio-button-active
{
    -webkit-box-shadow: inset -1px 2px 24px 2px rgba(0,0,0,0.2);
    -moz-box-shadow: inset -1px 2px 24px 2px rgba(0,0,0,0.2);
    box-shadow: inset -1px 2px 5px 2px rgba(0,0,0,0.2);
    background: #2ecc71;
    color: white;

}
</style>