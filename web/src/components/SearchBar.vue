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
        padding: 10px 0;
    }
    #search-bar input[type="search"]
    {
        width: 100%;
        padding: 5px;
        border: 1px solid rgba(0,0,0,0.1);
        outline: none;
    }
    #search-bar input[type="search"]:focus
    {
        border: 1px solid #34495e;
    }
</style>