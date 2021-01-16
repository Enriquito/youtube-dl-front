<template>
    <div v-if="open" class="d-flex justify-content-center" id="settings-holder">
        <div class="align-self-center d-flex" id="settings-window">
            <div style="width: 100%;" v-if="settings">
                <h3>Settings</h3>
                <div style="width: 100%;">
                    <label for="port-number">Application port **</label>
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
                    <label for="output-location">Output location **</label>
                    <input id="output-location" v-model="settings.outputLocation" type="text" />
                    <label>Empty database</label>
                    <button id="empty-database-button" @click="emptyDatabase">Empty</button>
                </div>
                <div>
                    <div style="position: absolute; bottom: 60px;">
                        <small>** Restart of application required.</small>
                        <small style="display: block; margin-left: 15px; margin-top: -5px;">Non docker instances only.</small>
                    </div>
                    <div id="settings-buttons" class="d-flex justify-content-space-between">
                        <button @click="close">Close</button>
                        <button @click="update">Save</button>
                    </div>
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
                <div>
                    <div>
                        <small>** Restart of application required. Non docker instances only.</small>
                    </div>
                    <div id="settings-buttons" class="d-flex justify-content-space-between">
                        <button @click="close">Close</button>
                        <button disabled>Save</button>
                    </div>
                </div>
                
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: "SettingsWindow",
    mounted(){
        this.sockets.subscribe('getSettings', data => {
            this.settings = data;
        });

        this.$socket.emit('getSettings');
    },
    methods:{
        update(){
            this.$socket.emit('updateSettings',{
                port: this.settings.port,
                defaultQuality: this.settings.defaultQuality,
                outputLocation: this.settings.outputLocation
            });
        },
        emptyDatabase(){
            const result = confirm("Are you sure you want to empty your database?");

            if(!result)
                return;

            this.$socket.emit('emptyDatabase');
        },
        close(){
            this.$store.commit('settingsOpen', false);
        }
    },
    data(){
        return({
            settings: null
        });
    },
    props:{
        open: Boolean,
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
    width: 100px;
    border-radius: 10px;
    margin: 0 10px;
    font-weight: bold;
    outline: none;
}
#settings-window div div label,input, select, #empty-database-button
{
    display:block;
    width: 100%;
}
#settings-window div div label
{
    margin: .5rem;
}
#settings-window div div input, select, #settings-window div #settings-buttons button
{
    background: #FFF;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    padding: 5px 10px;
}
#empty-database-button
{
    border-radius: 5px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    color: #FFF;
    background: tomato;
    padding: 5px 10px;
    font-weight: bold;
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