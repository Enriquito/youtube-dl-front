<template>
    <figure @click="selectToggle" v-if="item.selected" class="item-selected">
            <figcaption>
                  <div class="d-flex">
                        <div class="item-index">
                              <small>{{item.playlist_index}}</small>
                        </div>
                        <div class="item-name">
                              <strong>{{item.title}}</strong>
                        </div>
                  </div>
                  
                  <div class="item-uploader">
                        <small>{{item.uploader}}</small>
                  </div>
            </figcaption>
      </figure>
      <figure @click="selectToggle" v-else>
            <figcaption>
                  <div class="d-flex">
                        <div class="item-index">
                              <small>{{item.playlist_index}}</small>
                        </div>
                        <div class="item-name">
                              <strong>{{item.title}}</strong>
                        </div>
                  </div>
                  
                  <div class="item-uploader">
                        <small>{{item.uploader}}</small>
                  </div>
            </figcaption>
      </figure>
</template>
<script>
export default {
    name: "PlaylistItem",
    props:{
        item: Object,
    },
    methods:{
      selectToggle(){
            if(this.item.selected)
                  this.item.selected = false;
            else
                  this.item.selected = true;
            
            this.$forceUpdate(); 
      }
    }
}
</script>
<style scoped>
#list-holder figure
{
    cursor: pointer;
    margin-bottom: 1px;
    color: #2c3e505c;
}

#list-holder .item-selected
{
    color: inherit !important;
    border-radius: 5px;
}
#list-holder figure figcaption .item-index
{
    padding: 10px;
}
#list-holder figure figcaption .item-name
{
    padding: 10px;
    max-width: 350px;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden !important;
    text-overflow: ellipsis;
}

#list-holder figure figcaption .item-uploader
{
    margin-left: 37px;
    margin-top: -15px;
}
</style>