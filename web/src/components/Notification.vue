<template>
    <div @click="() => {this.close()}" :class="divClass">
        <div>
            <strong>{{title}}</strong>
            <span>{{messages}}</span>
        </div>
    </div>
</template>
<script>
export default {
    name: 'Notification',
    mounted(){
        this.sockets.subscribe('systemMessages', (data) => {
            this.open(data.type, data.messages);
        });
    },
    data(){
        return({
            divClass: "notification-holder",
            isOpen: false,
            title: "",
            messages: "",
            timeout: null
        });
    },
    methods:{
        open(title, messages){
            this.isOpen = true;

            this.timeout = setTimeout(() => {
                this.close()
            }, 5000);

            this.title = title;
            this.messages = messages;

            this.divClass = "notification-holder in";
        },
        close(){
            this.isOpen = false;
            this.divClass = "notification-holder out";
        }
    }
}
</script>
<style scoped>

.notification-holder
{
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    width: 400px;
    height: auto;
    position: fixed;
    z-index: 999;
    padding: 5px 10px;
    right: -500px;
    top: 60px;
    background: #fff;
    cursor: pointer;
    display: none;
}
.notification-holder div strong, span
{
    display: block;
}
.in
{
    animation: slideIn 1s forwards;
    display: block;
}
.out
{
    animation: slideOut 0.7s forwards;
    display: block;
}
@keyframes slideIn
{
  0% {right: -500px;}
  60% {right: 40px;}
  100% {right: 10px;}
}
@keyframes slideOut
{
  0% {right: 10px;}
  30% {right: 40px;}
  100% {right: -500px;}
}
</style>