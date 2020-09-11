<template>
    <div class="d-flex justify-content-center" id="settings-holder">
        <div class="align-self-center d-flex" id="settings-window">
            <div>
                <h3>Settings</h3>
                <div>
                    <label for="port-number">Application port</label>
                    <input id="port-number" type="number" min="1" max="65535" />
                    <label for="default-quality">Default quality</label>
                    <select id="default-quality">
                        <option>144p</option>
                        <option>240p</option>
                        <option>360p</option>
                        <option>480p</option>
                        <option>720p</option>
                        <option>1080p</option>
                    </select>
                </div>
                <div id="settings-buttons" class="d-flex justify-content-space-between">
                    <button @click="() => {this.$emit('close')}">Close</button>
                    <button>Save</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: "SettingsWindow",
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
</style>