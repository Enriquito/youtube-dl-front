<template>
    <div v-if="open" class="d-flex justify-content-center" id="settings-holder">
        <div class="align-self-center d-flex" id="settings-window">
            <div v-if="settings">
                <h3>Settings</h3>
                <div>
                    <label for="port-number">Application port</label>
                    <input id="port-number" v-model="settings.port" type="number" min="1" max="65535" />
                    <label for="default-quality">Default quality</label>
                    <select v-model="settings.defaultQuality" id="default-quality">
                        <option>144p</option>
                        <option>240p</option>
                        <option>360p</option>
                        <option>480p</option>
                        <option>720p</option>
                        <option>1080p</option>
                    </select>
                    <label>Output location</label>
                    <input v-model="settings.outputLocation" type="text" />
                </div>
                <div id="settings-buttons" class="d-flex justify-content-space-between">
                    <button @click="close">Close</button>
                    <button @click="update">Save</button>
                </div>
            </div>
            <div v-else>
                <h3>Settings</h3>
                <div>
                    <div style="width: 150px" class="skeleton-label"></div>
                    <div style="width: 250px" class="skeleton-input"></div>
                    <div style="width: 110px" class="skeleton-label"></div>
                    <div style="width: 200px" class="skeleton-input"></div>
                    <div style="width: 150px" class="skeleton-label"></div>
                    <div style="width: 250px" class="skeleton-input"></div>
                </div>
                <div id="settings-buttons" class="d-flex justify-content-space-between">
                    <button @click="close">Close</button>
                    <button disabled>Save</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import axios from 'axios'

export default {
    name: "SettingsWindow",
    methods:{
        update(){
            axios.put('/settings',{
                port: this.settings.port,
                defaultQuality: this.settings.defaultQuality,
                outputLocation: this.settings.outputLocation
            })
            .then(result => {
                if(result.status === 200)
                    this.$parent.$refs.notificationComp.open('Information',
                    'Settings has been updated');
            })
            .catch(error => {
                console.error(error);
                this.$parent.$refs.notificationComp.open('Error','The server encountered an error while updating the settings. Please try again.');
            });
        },
        close(){
            this.$store.commit('settingsOpen', false);
        }
    },
    props:{
        open: Boolean,
        settings: Object
    }
}
</script>
<style scoped>
#settings-holder
{
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    position: fixed;
    top: 0;
    z-index: 999;
}
#settings-window
{
    width: 400px;
    height: 500px;
    background: #fff;
    border-radius: 10px;
    padding: 20px;
    position: relative;
}
#settings-window div #settings-buttons
{
    position: absolute;
    bottom: 20px;
    justify-content: center;
    width: 90%;
}
#settings-window div #settings-buttons button
{
    padding: 10px;
    width: 100px;
    border-radius: 10px;
    border: none;
    margin: 0 10px;
    font-weight: bold;
    outline: none;
}
#settings-window div div label,input, select
{
    display:block;
    width: 200px;
}
#settings-window div div .skeleton-label
{
    height: 10px;
    background: grey;
    border-radius: 10px;
    width: 150px;
    margin-bottom: 10px;
    animation: skeleton-loader 2s infinite;
}
#settings-window div div .skeleton-input
{
    height: 15px;
    background: grey;
    border-radius: 10px;
    width: 250px;
    margin-bottom: 10px;
    animation-delay: 1s;
    animation: skeleton-loader 2s infinite;
}
@keyframes skeleton-loader {
    0%{
        background: grey;
    }
    50%{
        background: rgb(168, 168, 168);
    }
    100%{
        background: grey;
    }
}
</style>