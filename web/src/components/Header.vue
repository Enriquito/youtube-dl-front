<template>
    <div class="d-flex justify-content-center">
        <div style="position: relative;">
            <input placeholder="Paste video or playlist url" @blur="getInfo" v-model="options.url" type="url" />
            <button v-if="canDownload && !options.playlist" @click="sendUrl">Download</button>
            <button v-else-if="canDownload && options.playlist" @click="selectPlaylistItems">Select items</button>
            <button v-else-if="isFetchingInfo" disabled>Loading..</button>
            <button v-else-if="!canDownload" disabled>Download</button>
        </div>
        <div>
            <button @click="selectAudioOnly" v-if="options.audioOnly" class="audio-button" id="audio-button-active">Audio</button>
            <button @click="selectAudioOnly" v-if="!options.audioOnly" class="audio-button">Audio</button>
        </div>
        <select v-if="info && !options.audioOnly" v-model="options.videoQuality">
            <option disabled selected>Quality</option>
            <option
            v-for="(format, index) in getFormats"
            :key="index"
            :value="format.formatId"
            >{{format.formatNote}}</option>
        </select>
        <select v-else disabled v-model="options.videoQuality">
            <option disabled selected>Quality</option>
        </select>
    </div>
</template>
<script>

export default {
    name: "Header",
    mounted(){
         this.sockets.subscribe('videoInfo', (data) => {
            this.info = data;
            this.isFetchingInfo = false;
            this.canDownload = true;
        });
    },
    data(){
        return({
            info: null,
            options : {
                playlist: false,
                url : "",
                videoQuality: "Quality",
                soundQuality: null,
                audioOnly: false,
                target: ""
            },
            canDownload: false,
            isFetchingInfo: false
        });
    },
    props:{
        defaultQuality: String
    },
    methods: {
        stopDownload(){
            this.info = null;
            this.canDownload = true;
            this.options.url = "";
        },
        selectPlaylistItems(){
            this.$socket.emit('getPlaylist',this.options.url);
            this.$store.commit('playlistSelectionOpen', true);
            this.options.url = "";
            this.canDownload = false;
            this.isFetchingInfo = false;
        },
        sendUrl(){
            this.$store.commit('isDownloading', true);
            let SearchingDefaultQuality = true;

            if(this.options.videoQuality === "Quality" && !this.options.audioOnly){
              this.options.soundQuality = this.getBestAudio;

                const qualities = [
                    '144p',
                    '240p',
                    '360p',
                    '480p',
                    '720p',
                    '1080p'
                ];

                let qualityIndex;

                qualities.forEach((el, i) => {
                    if(qualities[i] === this.defaultQuality){
                        qualityIndex = i;
                    }
                });

                let round = 0;

                do{
                    for(let i = 0; i < this.getFormats.length; i++){
                        const el = this.getFormats[i];

                        if(el.formatNote === qualities[(qualityIndex - round)]){
                            this.options.videoQuality = el.formatId;
                            console.log(`Downloading quality: ${el.formatNote}`);
                            SearchingDefaultQuality = false;
                            break;
                        }
                    }
                    if(!SearchingDefaultQuality)
                        break;
                    else if(round < this.getFormats.length)
                        round++;
                    else
                        break;
                }
                while(SearchingDefaultQuality)

                if(SearchingDefaultQuality){
                    if(this.options.playlist){
                        console.log('Downloading max quality');
                    }
                    else{
                        this.$parent.$refs.notificationComp.open('Error','Error finding default quality. Please select manualy.');
                        this.$store.commit('isDownloading', false);
                        return;
                    }
                }
                else
                    console.info(`Downloading quality: ${qualities[(qualityIndex - round)]}`)
            }

            this.$socket.emit('download',{list: [this.options]});
            this.stopDownload();
        },
        getInfo(){
            try{
                if(this.isPlaylist(this.options.url)){
                    this.canDownload = true;
                    this.options.playlist = true;
                    return;
                }
                
                this.isFetchingInfo = true;

                if(this.options.url === ""){
                    this.canDownload = false;
                    return;
                }
                else if(this.options.audioOnly){
                    this.canDownload = true;
                    return
                }

                this.canDownload = false;
                this.$socket.emit('getVideoInfo',this.options.url);
            }
            catch(error){
                this.isFetchingInfo = false;
                console.error(error);
            }
        },
        selectAudioOnly(){
            if(this.options.audioOnly)
                this.options.audioOnly = false;
            else
                this.options.audioOnly = true;
        },
        isPlaylist(url){
            return RegExp(/list=([0-9a-zA-Z$-_.+!*'(),]+)/).test(url);
        }
    },
    computed: {
        getBestAudio(){
            let bestAudioID = null;

            try{
                for(let i = 0; i < this.info.formats.length; i++){
                    const format = this.info.formats[i];

                    if(format.ext == "m4a"){
                        bestAudioID = format.format_id;
                    }
                }
            }
            catch(error){
                console.log(error);
            }

            return bestAudioID;
        },
        getFormats(){
            const formats = [];

            if(this.isPlaylist(this.options.url))
                return;

            try{
                for(let i = 0; i < this.info.formats.length; i++){
                    const format = this.info.formats[i];

                    if(format.ext == "mp4"){

                        if(formats.length === 0){
                            formats.push({
                                formatNote: format.format_note,
                                tbr: format.tbr,
                                formatId: format.format_id
                            });
                        }

                        let found = false;

                        for(let x = 0; x < formats.length; x++){
                            if(format.format_note === formats[x].formatNote){
                                found = true;

                                if(format.tbr > formats[x].tbr){
                                    formats.splice(x, 1, {
                                        formatNote: format.format_note,
                                        tbr: format.tbr,
                                        formatId: format.format_id
                                    });
                                }
                                break;
                            }
                        }

                        if(!found){
                            formats.push({
                                formatNote: format.format_note,
                                tbr: format.tbr,
                                formatId: format.format_id
                            });
                        }
                    }
                }
            }
            catch(error){
                console.log(error);
            }

            return formats;
        }
    }
}
</script>
<style scoped>
input[type="url"]
{
    padding: 11px;
    width: 411px;
    outline: none;
    border: none;
}
select
{
    padding: 11px;
    -webkit-appearance: button;
    border-radius: 0px;
    border: none;
    height: 46px;
    outline: none;
}
select:disabled
{
    border-color: rgba(118, 118, 118, 0.3);
    color: -internal-light-dark(graytext, rgb(170, 170, 170));
    background-color: rgb(194, 194, 194);
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
    min-width: 70px;
    user-select: none;
    background: #FFF;
}
#audio-button-active
{
    -webkit-box-shadow: inset -1px 2px 24px 2px rgba(0,0,0,0.2);
    -moz-box-shadow: inset -1px 2px 24px 2px rgba(0,0,0,0.2);
    box-shadow: inset -1px 2px 5px 2px rgba(0,0,0,0.2);
    background: #2ecc71;
    color: white;
}
#audio-disabled-button
{
    border-color: rgba(118, 118, 118, 0.3);
    color: -internal-light-dark(graytext, rgb(170, 170, 170));
    background-color: -internal-light-dark(rgb(255, 255, 255), rgb(59, 59, 59));
}
@media (max-width: 740px) {
    input[type="url"]
    {
        width: auto !important;
    }
    button
    {
        width: auto;
        min-width: auto;
    }
    .audio-button
    {
        display: none;
    }
    select
    {
        display: none;
    }
}
</style>