(function(t){function e(e){for(var o,s,r=e[0],l=e[1],c=e[2],d=0,f=[];d<r.length;d++)s=r[d],Object.prototype.hasOwnProperty.call(i,s)&&i[s]&&f.push(i[s][0]),i[s]=0;for(o in l)Object.prototype.hasOwnProperty.call(l,o)&&(t[o]=l[o]);u&&u(e);while(f.length)f.shift()();return a.push.apply(a,c||[]),n()}function n(){for(var t,e=0;e<a.length;e++){for(var n=a[e],o=!0,r=1;r<n.length;r++){var l=n[r];0!==i[l]&&(o=!1)}o&&(a.splice(e--,1),t=s(s.s=n[0]))}return t}var o={},i={app:0},a=[];function s(e){if(o[e])return o[e].exports;var n=o[e]={i:e,l:!1,exports:{}};return t[e].call(n.exports,n,n.exports,s),n.l=!0,n.exports}s.m=t,s.c=o,s.d=function(t,e,n){s.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},s.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},s.t=function(t,e){if(1&e&&(t=s(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(s.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)s.d(n,o,function(e){return t[e]}.bind(null,o));return n},s.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return s.d(e,"a",e),e},s.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},s.p="/";var r=window["webpackJsonp"]=window["webpackJsonp"]||[],l=r.push.bind(r);r.push=e,r=r.slice();for(var c=0;c<r.length;c++)e(r[c]);var u=l;a.push([0,"chunk-vendors"]),n()})({0:function(t,e,n){t.exports=n("56d7")},"034f":function(t,e,n){"use strict";var o=n("85ec"),i=n.n(o);i.a},"1c64":function(t,e,n){"use strict";var o=n("ca0c"),i=n.n(o);i.a},"40a1":function(t,e,n){t.exports=n.p+"img/link.67f04a65.svg"},4582:function(t,e,n){"use strict";var o=n("ccc5"),i=n.n(o);i.a},"551b":function(t,e,n){"use strict";var o=n("f4fe"),i=n.n(o);i.a},"56d7":function(t,e,n){"use strict";n.r(e);n("e260"),n("e6cf"),n("cca6"),n("a79d");var o=n("2b0e"),i=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{attrs:{id:"app"}},[n("router-view")],1)},a=[],s=(n("034f"),n("2877")),r={},l=Object(s["a"])(r,i,a,!1,null,null,null),c=l.exports,u=n("8c4f"),d=function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("main",[o("Notification",{ref:"notificationComp"}),o("header",[o("div",{staticClass:"d-flex justify-content-center"},[t.searching?o("img",{staticClass:"header-icon",staticStyle:{"margin-top":"0px !important"},attrs:{src:n("8b1b"),alt:"search"},on:{click:function(){t.searching=!1}}}):o("img",{staticClass:"header-icon",attrs:{src:n("d103"),alt:"search"},on:{click:function(){t.searching=!0}}}),t.searching?o("SearchBar",{attrs:{items:t.items},on:{searchResults:t.searchResults}}):o("Header",{on:{clicked:t.getNewItem}})],1)]),o("div",{staticStyle:{"margin-top":"75px"}},[o("div",{staticClass:"d-flex justify-content-center"},[t.items.length>0?o("div",t._l(t.itemsToShow,(function(e,n){return o("VideoListItem",{key:n,attrs:{data:e},on:{deleted:t.removeDeletedItem}})})),1):o("div",[o("h2",[t._v("No downloads here")])])])])],1)},f=[],p=(n("4160"),n("a434"),n("159b"),function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"d-flex justify-content-center"},[n("DownloadManager",{attrs:{isDownloading:this.isDownloading}}),n("div",{staticStyle:{position:"relative"}},[n("input",{directives:[{name:"model",rawName:"v-model",value:t.options.url,expression:"options.url"}],attrs:{placeholder:"Paste video url",type:"url"},domProps:{value:t.options.url},on:{blur:t.getInfo,input:function(e){e.target.composing||t.$set(t.options,"url",e.target.value)}}}),t.canDownload?n("button",{on:{click:t.sendUrl}},[t._v("Download")]):t.isFetchingInfo?n("button",{attrs:{disabled:""}},[t._v("Loading..")]):t.canDownload?t._e():n("button",{attrs:{disabled:""}},[t._v("Download")])]),n("div",[t.options.audioOnly&&!t.isDownloading?n("button",{staticClass:"audio-button",attrs:{id:"audio-button-active"},on:{click:t.selectAudioOnly}},[t._v("Audio")]):t.options.audioOnly||!t.options.audioOnly&&t.isDownloading?n("button",{staticClass:"audio-button",attrs:{id:"audio-disabled-button",disabled:""}},[t._v("Audio")]):t._e(),t.options.audioOnly||t.isDownloading?t._e():n("button",{staticClass:"audio-button",on:{click:t.selectAudioOnly}},[t._v("Audio")])]),!t.info||t.isDownloading||t.options.audioOnly?n("select",{directives:[{name:"model",rawName:"v-model",value:t.options.videoQuality,expression:"options.videoQuality"}],attrs:{disabled:""},on:{change:function(e){var n=Array.prototype.filter.call(e.target.options,(function(t){return t.selected})).map((function(t){var e="_value"in t?t._value:t.value;return e}));t.$set(t.options,"videoQuality",e.target.multiple?n:n[0])}}},[n("option",{attrs:{disabled:"",selected:""}},[t._v("Quality")])]):n("select",{directives:[{name:"model",rawName:"v-model",value:t.options.videoQuality,expression:"options.videoQuality"}],on:{change:function(e){var n=Array.prototype.filter.call(e.target.options,(function(t){return t.selected})).map((function(t){var e="_value"in t?t._value:t.value;return e}));t.$set(t.options,"videoQuality",e.target.multiple?n:n[0])}}},[n("option",{attrs:{disabled:"",selected:""}},[t._v("Quality")]),t._l(t.getFormats,(function(e,o){return n("option",{key:o,domProps:{value:e.formatId}},[t._v(t._s(e.formatNote))])}))],2)],1)}),h=[],m=(n("4d63"),n("ac1f"),n("25f0"),n("466d"),n("bc3a")),v=n.n(m),g=function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("div",{class:t.windowClass,attrs:{id:"download-manager"}},[o("div",{staticClass:"d-flex justify-content-between",on:{click:t.toggle}},[o("h5",[t._v("Downloads")]),o("img",{staticClass:"icon",staticStyle:{height:"20px !important"},attrs:{src:n("af22"),alt:"Download"}})]),t.data?o("ul",t._l(t.data,(function(e,n){return o("li",{key:e.id},[n<=10?o("DownloadItem",{attrs:{title:e.title,progressValue:e.downloadStatus}}):t._e()],1)})),0):t._e()])},y=[],b=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"item-holder"},[n("span",[t._v(t._s(t.title))]),n("progress",{attrs:{max:"100"},domProps:{value:t.progressValue}})])},w=[],_=(n("a9e3"),{name:"DownloadManager",props:{title:String,progressValue:Number}}),x=_,C=(n("b1de"),Object(s["a"])(x,b,w,!1,null,"94f87cb4",null)),D=C.exports,O={name:"DownloadManager",created:function(){var t=this;v.a.get("/download/status").then((function(t){return t.data})).then((function(e){t.data=e,t.data.reverse()})).catch((function(t){console.error(t)}))},data:function(){return{data:null,fetchInterval:null,windowClass:"close-manager",open:!1}},methods:{toggle:function(){this.open?(this.windowClass="close-manager",this.open=!1):(this.windowClass="open-manager",this.open=!0)}},watch:{isDownloading:function(){var t=this;this.isDownloading&&(this.fetchInterval=setInterval((function(){v.a.get("/download/status").then((function(t){return t.data})).then((function(e){t.data=e,t.data.reverse()})).catch((function(t){console.error(t)}))}),1e3))}},props:{isDownloading:Boolean},components:{DownloadItem:D}},$=O,k=(n("cca9"),Object(s["a"])($,g,y,!1,null,"6e409ae8",null)),I=k.exports,S={name:"Header",components:{DownloadManager:I},data:function(){return{info:null,options:{playlist:!1,url:"",videoQuality:"Quality",soundQuality:null,audioOnly:!1,target:""},isDownloading:!1,canDownload:!1,isFetchingInfo:!1}},methods:{sendUrl:function(){var t=this;this.isDownloading=!0,"Quality"===this.options.videoQuality&&(this.options.videoQuality=""),this.options.audioOnly||this.options.playlist||(this.options.soundQuality=this.getBestAudio),this.$parent.$refs.notificationComp.open("Information","Download has been started"),v.a.post("/download",this.options).then((function(e){t.$emit("clicked",e.data),t.isDownloading=!1,t.info=null,t.canDownload=!1,t.options.url=""})).catch((function(e){t.canDownload=!0,t.isDownloading=!1,t.$parent.$refs.notificationComp.open("Error","Could not download video info. Please try again later."),console.error(e)}))},getInfo:function(){var t=this;if(""!==this.options.url)if(this.options.audioOnly)this.canDownload=!0;else try{var e=null;if(RegExp(/((https:\/\/www\.reddit.com))/).test(this.options.url))return this.options.target="Reddit",void alert("s");if(RegExp(/v=([0-9a-zA-Z$-_.+!*'(),]+)/).test(this.options.url)){this.options.target="Youtube",this.isFetchingInfo=!0;var n=this.options.url.match(/v=([0-9a-zA-Z$-_.+!*'(),]+)/);e=n[1]}if(this.isPlaylist(this.options.url))return this.options.playlist=!0,this.canDownload=!1,this.options.url="",void this.$parent.$refs.notificationComp.open("Information","Playlists downloads are not available. (yet)");v.a.get("/info/".concat(e)).then((function(t){return t.data})).then((function(e){t.info=e,t.isFetchingInfo=!1,t.canDownload=!0})).catch((function(e){console.error(e),t.canDownload=!1,t.isFetchingInfo=!1,t.$parent.$refs.notificationComp.open("Error","Could not fetch video info. Check your url and try again.")}))}catch(o){this.isFetchingInfo=!1,this.$parent.$refs.notificationComp.open("Error","Something went wrong. Please try again later."),console.error(o)}else this.canDownload=!1},selectAudioOnly:function(){this.options.audioOnly?this.options.audioOnly=!1:this.options.audioOnly=!0},isPlaylist:function(t){return RegExp(/list=([0-9a-zA-Z$-_.+!*'(),]+)/).test(t)}},computed:{getBestAudio:function(){for(var t=null,e=0;e<this.info.formats.length;e++){var n=this.info.formats[e];"m4a"==n.ext&&(t=n.format_id)}return t},getFormats:function(){for(var t=[],e=0;e<this.info.formats.length;e++){var n=this.info.formats[e];if("mp4"==n.ext){0===t.length&&t.push({formatNote:n.format_note,tbr:n.tbr,formatId:n.format_id});for(var o=!1,i=0;i<t.length;i++)if(n.format_note===t[i].formatNote){o=!0,n.tbr>t[i].tbr&&t.splice(i,1,{formatNote:n.format_note,tbr:n.tbr,formatId:n.format_id});break}o||t.push({formatNote:n.format_note,tbr:n.tbr,formatId:n.format_id})}}return console.log(this.bestAudioID),t}}},j=S,Q=(n("c2ed"),Object(s["a"])(j,p,h,!1,null,"681e8c26",null)),E=Q.exports,N=function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("figure",{staticClass:"d-flex"},["mp3"==t.data.extention?o("img",{staticClass:"media-type-icon",staticStyle:{height:"25px !important"},attrs:{src:n("f079"),alt:"Audio"}}):o("img",{staticClass:"media-type-icon",staticStyle:{height:"25px !important"},attrs:{src:n("f3b6"),alt:"Video"}}),o("img",{staticClass:"yt-image",attrs:{alt:"image",src:t.imageLink}}),o("figcaption",[o("div",{staticClass:"d-flex"},[o("strong",[o("router-link",{attrs:{to:{name:"Watch",params:{id:t.data.id}}}},[t._v(" "+t._s(t.data.title)+" ")])],1)]),o("div",{staticClass:"d-flex justify-content-between"},[o("div",[o("span",[o("a",{attrs:{target:"_blank",href:t.data.uploaderUrl}},[t._v(t._s(t.data.uploader))])])]),o("div",[o("img",{staticClass:"icon",staticStyle:{height:"20px !important"},attrs:{src:n("af22"),alt:"Download"},on:{click:function(){t.deleteItem(t.data.id)}}}),o("a",{attrs:{target:"_blank",href:t.data.videoUrl}},[o("img",{staticClass:"icon",attrs:{src:n("40a1"),alt:"Link"}})]),o("a",{attrs:{target:"_blank",href:"/file/"+t.data.id}},[o("img",{staticClass:"icon",staticStyle:{height:"20px !important"},attrs:{src:n("f28e"),alt:"Download"}})])])]),o("p",[t._v(" "+t._s(t.data.description)+" ")])])])},P=[],A={name:"VideoListItem",props:{data:Object},methods:{deleteItem:function(t){var e=this;v.a.delete("/items/".concat(t)).then((function(){e.$emit("deleted",e.data)}))}},computed:{imageLink:function(){var t=null;return 0===this.data.thumbnails.length?t="@/assets/no-image.png":this.data.thumbnails.forEach((function(e){t=e.url})),t}}},F=A,L=(n("c4d3"),Object(s["a"])(F,N,P,!1,null,"96e89270",null)),R=L.exports,M=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{attrs:{id:"search-bar"}},[n("input",{directives:[{name:"model",rawName:"v-model",value:t.searchQuery,expression:"searchQuery"}],attrs:{placeholder:"Search for a video..",type:"search"},domProps:{value:t.searchQuery},on:{input:[function(e){e.target.composing||(t.searchQuery=e.target.value)},t.search]}})])},B=[],T=(n("caad"),n("2532"),{name:"SearchBar",data:function(){return{searchQuery:null}},props:{items:Array},methods:{search:function(){var t=this,e=[];null!==this.searchQuery&&""!==this.searchQuery||this.$emit("searchResults",null),this.items.forEach((function(n){(n.title.includes(t.searchQuery)||n.title.toLowerCase().includes(t.searchQuery))&&e.push(n)})),this.$emit("searchResults",e)}}}),V=T,H=(n("1c64"),Object(s["a"])(V,M,B,!1,null,"2af6cad6",null)),z=H.exports,U=function(){var t=this,e=this,n=e.$createElement,o=e._self._c||n;return o("div",{class:e.divClass,on:{click:function(){t.close()}}},[o("div",[o("strong",[e._v(e._s(e.title))]),o("span",[e._v(e._s(e.messages))])])])},W=[],Z={name:"Notification",data:function(){return{divClass:"notification-holder",isOpen:!1,title:"",messages:"",timeout:null}},methods:{open:function(t,e){var n=this;this.isOpen=!0,this.timeout=setTimeout((function(){n.close()}),5e3),this.title=t,this.messages=e,this.divClass="notification-holder in"},close:function(){this.isOpen=!1,this.divClass="notification-holder out"}}},J=Z,Y=(n("caff"),Object(s["a"])(J,U,W,!1,null,"6b644474",null)),q=Y.exports,G={name:"Home",mounted:function(){this.loadData()},components:{Header:E,VideoListItem:R,SearchBar:z,Notification:q},data:function(){return{items:[],itemsToShow:[],searching:!1}},methods:{searchResults:function(t){this.itemsToShow=null===t||void 0===t?this.items:t},getNewItem:function(){this.loadData()},loadData:function(){var t=this;v.a.get("/items").then((function(e){t.items=e.data.videos,t.items.reverse(),t.searchResults(null)})).catch((function(e){console.error(e),t.$refs.notificationComp.open("Error","Could not fetch data from database. Please try again later.")}))},removeDeletedItem:function(t){var e=this;this.items.forEach((function(n,o){n.id===t.id&&e.items.splice(o,1)}))}}},K=G,X=(n("551b"),Object(s["a"])(K,d,f,!1,null,"71154784",null)),tt=X.exports,et=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("main",[n("Notification",{ref:"notificationComp"}),n("header",{staticClass:"d-flex align-items-center"},[n("router-link",{attrs:{to:{name:"Home"}}},[n("svg",{staticStyle:{"enable-background":"new 0 0 512 512",width:"25px",height:"25px",fill:"#FFF"},attrs:{version:"1.1",id:"Layer_1",xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",x:"0px",y:"0px",width:"512px",height:"512px",viewBox:"0 0 512 512","xml:space":"preserve"}},[n("polygon",{attrs:{points:"64.5,256.5 256.5,448.5 256.5,336.5 448.5,336.5 448.5,176.5 256.5,176.5 256.5,64.5 "}})])])],1),this.item?n("div",{staticClass:"d-flex justify-content-center",staticStyle:{"margin-top":"80px"}},[n("div",{staticStyle:{width:"1024px"}},["mp3"!=this.item.extention?n("video",{attrs:{src:"/media/videos/"+this.item.fileName,controls:""}}):n("video",{style:"background: url("+t.item.thumbnails[4].url+"); background-size:cover;",attrs:{src:"media/music/"+this.item.fileName,controls:""}}),n("h3",{staticStyle:{"margin-bottom":"0"}},[t._v(t._s(this.item.title))]),n("strong",[t._v(t._s(this.item.uploader))]),n("p",{staticStyle:{"margin-top":"10px"}},[t._v(t._s(this.item.description))])])]):t._e()],1)},nt=[],ot=n("a38b"),it=n.n(ot),at={name:"Watch",components:{Notification:q},mounted:function(){var t=this;v.a.get("/items/".concat(this.$route.params.id)).then((function(e){t.item=e.data})).catch((function(e){console.error(e),t.$refs.notificationComp.open("Error","Could not media data from database. Please try again later.")}))},data:function(){return{item:null,arrowLeftIcon:it.a}}},st=at,rt=(n("4582"),Object(s["a"])(st,et,nt,!1,null,"f09852e0",null)),lt=rt.exports;o["a"].use(u["a"]);var ct=[{path:"/",name:"Home",component:tt},{path:"/watch/:id",name:"Watch",component:lt}],ut=new u["a"]({routes:ct}),dt=ut;o["a"].config.productionTip=!1,new o["a"]({router:dt,render:function(t){return t(c)}}).$mount("#app")},"733c":function(t,e,n){},"85ec":function(t,e,n){},"8b1b":function(t,e,n){t.exports=n.p+"img/close.1ee79cbd.svg"},a38b:function(t,e,n){t.exports=n.p+"img/arrowleft.612cbcbd.svg"},af22:function(t,e,n){t.exports=n.p+"img/trash.46df62da.svg"},b1de:function(t,e,n){"use strict";var o=n("cc0d"),i=n.n(o);i.a},bc8c:function(t,e,n){},c2ed:function(t,e,n){"use strict";var o=n("733c"),i=n.n(o);i.a},c4d3:function(t,e,n){"use strict";var o=n("d05c"),i=n.n(o);i.a},ca0c:function(t,e,n){},caff:function(t,e,n){"use strict";var o=n("d3d5"),i=n.n(o);i.a},cc0d:function(t,e,n){},cca9:function(t,e,n){"use strict";var o=n("bc8c"),i=n.n(o);i.a},ccc5:function(t,e,n){},d05c:function(t,e,n){},d103:function(t,e,n){t.exports=n.p+"img/search.0ad4943b.svg"},d3d5:function(t,e,n){},f079:function(t,e,n){t.exports=n.p+"img/note.65fc3c34.svg"},f28e:function(t,e,n){t.exports=n.p+"img/download.28aa1a76.svg"},f3b6:function(t,e,n){t.exports=n.p+"img/videocamera.c14fd336.svg"},f4fe:function(t,e,n){}});
//# sourceMappingURL=app.f4c591c1.js.map