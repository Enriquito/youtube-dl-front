<template>
    <figure class="d-flex"> 
        <div class="image-holder"></div>
        <figcaption>
            <div class="d-flex">
                <strong>
                    
                </strong>
            </div>
            <div class="d-flex justify-content-between">
                <div>
                    <span></span>
                </div>
                <div class="d-flex">
                    <div class="round-image"></div>
                    <div class="round-image"></div>
                    <div class="round-image"></div>
                </div>
            </div>
            <p>
                
            </p>
        </figcaption>
    </figure>
</template>
<script>
export default {
    name: "VideoSkeletonLoader",
}
</script>
<style scoped>
.image-holder
{
      background: #34495e7a;
      border-radius: 5px;
      height: 165px;
      width: 15px;
      margin: 5px;
      min-width: 250px;
}
.round-image
{
      background: #FFF;
      border-radius: 50px;
      height: 15px;
      width: 15px;
      margin: 5px 3px;
}
figure
{
    width: 700px;
    margin: 10px 0;
    position: relative;
    z-index: 1;
}

figure figcaption p{
    height: 100px;
    overflow: scroll;
    -ms-overflow-style: none;
    scrollbar-width: none;
    background: #FFF;
    border-radius: 5px;
    padding: 5px;
}
figure figcaption p::-webkit-scrollbar {
  display: none;
}
figure figcaption
{
      padding: 10px;
      width: 100%;
      max-width: 450px;
      background: #34495e7a;
      border-radius: 10px;
}
figure figcaption span
{
    background: #FFF;
    border-radius: 5px;
    width: 200px;
    display: block;
    height: 10px;
    margin-top: 5px;
}
figure figcaption span:nth-child(even)
{
    margin-left: 5px;
}
figure figcaption strong
{
      background: #FFF;
      border-radius: 5px;
      width: 100%;
      display: block;
      height: 10px;
      margin-top: 5px;
}
</style>