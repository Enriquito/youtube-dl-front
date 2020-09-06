<template>
    <div id="search-bar">
        <input @input="search" placeholder="Search for a video.." type="search" v-model="searchQuery" />
    </div>
</template>
<script>
export default {
    name: "SearchBar",
    data: () => {
        return({
            searchQuery: null
        });
    },
    props:{
        items: Array
    },
    methods:{
        search(){
            const ar = [];

            if(this.searchQuery === null || this.searchQuery === "")
                this.$emit('searchResults', null);

            this.items.forEach(item => {
                if(item.title.includes(this.searchQuery))
                    ar.push(item);
                else if(item.title.toLowerCase().includes(this.searchQuery))
                    ar.push(item);
            });

            this.$emit('searchResults', ar);
        }
    }
}
</script>
<style scoped>
    #search-bar
    {
        min-width: 700px;
    }
    #search-bar input[type="search"]
    {
        width: 100%;
        padding: 11px 5px;
        border: none;
        outline: none;
        border-top-right-radius: 10px;
        border-bottom-right-radius: 10px;
    }
</style>