var AssetPicker=(()=>{var c=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports);var f=c((ct,P)=>{"use strict";var u=Object.prototype.hasOwnProperty,q=Object.prototype.toString,x=Object.defineProperty,E=Object.getOwnPropertyDescriptor,w=function(e){return typeof Array.isArray=="function"?Array.isArray(e):q.call(e)==="[object Array]"},_=function(e){if(!e||q.call(e)!=="[object Object]")return!1;var i=u.call(e,"constructor"),n=e.constructor&&e.constructor.prototype&&u.call(e.constructor.prototype,"isPrototypeOf");if(e.constructor&&!i&&!n)return!1;var r;for(r in e);return typeof r>"u"||u.call(e,r)},A=function(e,i){x&&i.name==="__proto__"?x(e,i.name,{enumerable:!0,configurable:!0,value:i.newValue,writable:!0}):e[i.name]=i.newValue},O=function(e,i){if(i==="__proto__")if(u.call(e,i)){if(E)return E(e,i).value}else return;return e[i]};P.exports=function t(){var e,i,n,r,s,o,a=arguments[0],l=1,g=arguments.length,v=!1;for(typeof a=="boolean"&&(v=a,a=arguments[1]||{},l=2),(a==null||typeof a!="object"&&typeof a!="function")&&(a={});l<g;++l)if(e=arguments[l],e!=null)for(i in e)n=O(a,i),r=O(e,i),a!==r&&(v&&r&&(_(r)||(s=w(r)))?(s?(s=!1,o=n&&w(n)?n:[]):o=n&&_(n)?n:{},A(a,{name:i,newValue:t(v,o,r)})):typeof r<"u"&&A(a,{name:i,newValue:r}));return a}});var y=c((dt,S)=>{S.exports={addClass:function(t,e){t.className?t.className.split(" ").indexOf(e)===-1&&(t.className+=" "+e):t.className=e},removeClass:function(t,e){if(t.className){for(var i=t.className.split(" "),n=[],r=0,s=i.length;r<s;r++)i[r]!==e&&n.push(i[r]);t.className=n.join(" ")}},loadCss:function(t){var e=document.createElement("link");e.href=t,e.type="text/css",e.rel="stylesheet",e.media="screen,print",document.getElementsByTagName("head")[0].appendChild(e)}}});var z=c((ht,k)=>{var N=[],d=[],X="insert-css: You need to provide a CSS string. Usage: insertCss(cssString[, options]).";function L(t,e){if(e=e||{},t===void 0)throw new Error(X);var i=e.prepend===!0?"prepend":"append",n=e.container!==void 0?e.container:document.querySelector("head"),r=N.indexOf(n);r===-1&&(r=N.push(n)-1,d[r]={});var s;return d[r]!==void 0&&d[r][i]!==void 0?s=d[r][i]:(s=d[r][i]=G(),i==="prepend"?n.insertBefore(s,n.childNodes[0]):n.appendChild(s)),t.charCodeAt(0)===65279&&(t=t.substr(1,t.length)),s.styleSheet?s.styleSheet.cssText+=t:s.textContent+=t,s}function G(){var t=document.createElement("style");return t.setAttribute("type","text/css"),t}k.exports=L;k.exports.insertCss=L});var b=c((ut,D)=>{D.exports=function(){return""+Math.random().toString(36).substr(2,9)}});var h=c((ft,M)=>{M.exports=function(t){var e=function(){this.construct&&this.construct.apply(this,arguments)};return e.prototype=e,Object.keys(t).forEach(function(i){e.prototype[i]=t[i]}),e}});var U=c((pt,T)=>{var K=b();T.exports=h()({construct:function(t,e){var i=window.addEventListener?"addEventListener":"attachEvent",n=window[i],r=i=="attachEvent"?"onmessage":"message";n(r,function(s){var o=s.origin||s.originalEvent.origin;(s.source===this.window&&o===this.origin||this.origin==="*")&&this.handle(s.data)}.bind(this),!1),this.origin=t,this.window=e,this.servers={},this._handlers={}},registerServer:function(t,e){this.servers[t]=e},_createHandler:function(){var t={callbacks:[]};return t.then=function(e){return t.hasOwnProperty("_result")?e(t._result):t.callbacks.push(e),t},t},call:function(t){var arguments=Array.prototype.slice.call(arguments,1),e=K(),i=this._createHandler();return this._handlers[e]=i,this.window.postMessage({id:e,method:t,arguments},this.origin),i},handle:function(t){if(t.method==="resolve"){if(this._handlers[t.id]){for(var e=this._handlers[t.id],i=0,n=e.callbacks.length;i<n;i++)e.callbacks[i](t.result);e._result=t.result,delete this._handlers[t.id]}}else{for(var r=t.method.split("."),s=r.pop(),o=this.servers;o&&r.length;)o=o[r.shift()];if(!o||!o[s])throw'Unknown method "'+t.method+'"';var a=o[s].apply(o,t.arguments),l=function(g){t.id&&this.window.postMessage({method:"resolve",id:t.id,result:g},this.origin)}.bind(this);typeof a=="function"?a(l):l(a)}}})});var I=c((mt,Q)=>{Q.exports=`<div class="assetpicker-modal">
    <div class="assetpicker-modal-inner">
        <div class="assetpicker-loader"></div>
        <iframe src="about:blank" allowtransparency="true">
            Ehm, without iframes i ain't do nothing.
        </iframe>
    </div>
</div>
`});var B=c((gt,R)=>{R.exports=`.assetpicker-modal {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0);
    z-index: -1;
    transition: background 0.2s, z-index 0s 0.2s;
}
.assetpicker-modal.assetpicker-modal-open {
    z-index:3000;
    background: rgba(0, 0, 0, 0.8);
    transition: background 0.2s
}
.assetpicker-modal .assetpicker-modal-inner {
    position: absolute;
    background: #fff;
    width: 800px;
    height: 500px;
    max-width: calc(100% - 30px);
    max-height: calc(100% - 30px);
    left:50%;
    top:50%;
    transform: translateY(-50%) translateX(-50%);
    opacity: 0;
    transition: opacity 0.1s 0.1s;
    border-radius: 4px;
    overflow: hidden;
}
.assetpicker-modal.assetpicker-maximized .assetpicker-modal-inner {
    width: 100%;
    height: 100%;
}
.assetpicker-modal.assetpicker-modal-open .assetpicker-modal-inner {
    opacity: 1;
}
.assetpicker-modal .assetpicker-modal-inner iframe {
    position: absolute;
    background: transparent;
    top:0;
    left:0;
    width:100%;
    height: 100%;
    overflow: hidden;
    border: none;
}

.assetpicker-loader {
    border: 5px solid gray;
    border-radius: 30px;
    height: 30px;
    left: 50%;
    margin: -15px 0 0 -15px;
    opacity: 0;
    position: absolute;
    top: 50%;
    width: 30px;

    animation: assetpicker-loader-pulsate 1s ease-out;
    animation-iteration-count: infinite;
}
.assetpicker-ready .assetpicker-loader {
    display: none;
    animation: none;
}

@keyframes assetpicker-loader-pulsate {
    0% {
        transform: scale(.1);
        opacity: 0.0;
    }
    50% {
        opacity: 1;
    }
    100% {
        transform: scale(1.2);
        opacity: 0;
    }
}`});var V=c((vt,H)=>{var Z=f(),p=y(),$=z(),C=(function(){var t=document.createElement("div"),e={transition:"transitionend",OTransition:"otransitionend",MozTransition:"transitionend",WebkitTransition:"webkitTransitionEnd"};for(var i in e)if(e.hasOwnProperty(i)&&t.style[i]!==void 0)return e[i]})(),tt=function(t){var e=window.getComputedStyle(t,null),i=["transitionDuration","oTransitionDuration","MozTransitionDuration","webkitTransitionDuration"],n=i.filter(function(r){if(typeof e[r]=="string"&&e[r].match(/[1-9]/))return!0});return!!n.length},et=U();H.exports=h()({construct:function(t){this.options=Z({template:I(),css:B(),openClassName:"assetpicker-modal-open",src:null},t),this.modal=null,this.frame=null;var e=this.options.src.match(/^https?:\/\/[^\/]+/);this.messaging=new et(e?e[0]:document.location.origin)},render:function(){this.options.css&&$(this.options.css);var t=document.createElement("div");t.innerHTML=this.options.template,this.modal=t.children[0],this.modal.addEventListener("click",function(e){e.target===this.modal&&this.close()}.bind(this)),this.frame=this.modal.querySelector("iframe"),document.body.appendChild(this.modal),this._modalClass=this.modal.className},open:function(){if(!this.modal){this.render();var t=this;this.frame.src=this.options.src,window.setTimeout(function(){t.open()},1);return}this.messaging.window=this.frame.contentWindow,p.addClass(this.modal,this.options.openClassName)},maximize:function(){p.addClass(this.modal,"assetpicker-maximized")},minimize:function(){p.removeClass(this.modal,"assetpicker-maximized")},_closed:function(){},close:function(){if(C&&tt(this.modal)){var t=function(){this.modal.removeEventListener(C,t),this._closed()}.bind(this);this.modal.addEventListener(C,t)}else this._closed();p.removeClass(this.modal,this.options.openClassName)}})});var W=c((yt,J)=>{var it=!1,j=f(),F=y();J.exports=h()({construct:function(t,e){it||F.loadCss(e.getDistUrl()+"/css/picker-ui.css"),this.config=j({unique:!0,readonly:!1},e.options.ui,{readonly:t.hasAttribute("data-ro")?["false","0"].indexOf(t.getAttribute("data-ro"))===-1:void 0,unique:t.hasAttribute("data-unique")?["false","0"].indexOf(t.getAttribute("data-unique"))===-1:void 0}),this.add=!1,this.propagate=!1,this.picker=e,this.element=t;var i=t.hasAttribute("value")?t.getAttribute("value"):void 0;if(i)try{this.picked=JSON.parse(i)}catch{this.picked=[],console.error("Error while parsing value of %s",t)}else this.picked=[];this.picked.constructor!==Array&&(this.picked=[this.picked]),this.render();var n=this;e.on("pick",function(r){if(!n.propagate&&this.element===t){var s=r.constructor!==Array?[r]:r;if(n.add){for(var o=0;o<s.length;o++){var a=!1;if(n.config.unique){for(var l=0;l<n.picked.length;l++)if(n.picked[l].storage===s[o].storage&&n.picked[l].id===s[o].id){a=!0;break}}a||n.picked.push(s[o])}s=n.picked}return n.pick(s),!1}n.propagate=!1,n.add=!1})},pick:function(t){this.picked=t,this.propagate=!0,this.picker.element=this.element,this.picker.pick(this.picker._getPickConfig(this.element).limit===1?t.length?t[0]:void 0:t),this.render()},createElement:function(t,e){var i=document.createElement(t);return i.className="assetpicker-"+e.split(" ").join(" assetpicker-"),i},render:function(){if(this.container||(this.container=this.element.parentNode.insertBefore(this.createElement("div","ui"),this.element),this.element.parentNode.removeChild(this.element)),this.container.innerHTML="",this.renderItems(this.picked),F[(this.picked.length||this.config.readonly?"add":"remove")+"Class"](this.element,"assetpicker-hidden"),this.container.appendChild(this.element),this.picked.length&&!this.config.readonly){var t=this.picker._getPickConfig(this.element).limit;(t===0||t!==1&&this.picked.length<t)&&this.container.appendChild(this.createElement("span","add")).addEventListener("click",function(e){this.add=!0,this.element.setAttribute("data-limit",t-this.picked.length),this.picker.open(this.element),this.element.setAttribute("data-limit",t)}.bind(this))}},renderItems:function(t){for(var e=0,i=t.length;e<i;e++){var n=this.container.appendChild(this.createElement("div","item")),r=n.appendChild(this.createElement("div","preview")),s=j({name:"file"},t[e].mediaType),o="ft ft-"+s.name;r.appendChild(this.createElement("div",o)),s.iconBig&&(r.appendChild(this.createElement("div","icn")).style.backgroundImage="url("+s.iconBig+")"),t[e].thumbnail&&(r.appendChild(this.createElement("div","tn "+s.name)).style.backgroundImage="url("+t[e].thumbnail+")"),this.config.readonly||r.appendChild(this.createDeleteButton(t[e]));var a=n.appendChild(this.createElement("div","title"));s.icon?a.appendChild(this.createElement("img","icn")).src=s.icon:a.appendChild(this.createElement("span",o)),a.appendChild(document.createTextNode(t[e].name))}},createDeleteButton:function(t){var e=this.createElement("span","del");return e.addEventListener("click",function(){for(var i=[],n=0,r=this.picked.length;n<r;n++)this.picked[n]!==t&&i.push(this.picked[n]);this.pick(i)}.bind(this)),e}})});var ot=c((kt,Y)=>{var nt=V(),rt=W(),st=b(),m=f(),at=(function(){var t=document.getElementsByTagName("script");return t[t.length-1].src.split("/").slice(0,-2).join("/")})();Y.exports=h()({construct:function(t,e){this.setConfig(t),e=m(!0,{distUrl:at,selector:'[rel="assetpicker"]',modal:{src:null},ui:{enabled:!0}},e||{}),e.modal.src||(e.modal.src=e.distUrl+"/index.html"),(e.modal.src.match(/^https?:\/\/localhost/)||document.location.hostname==="localhost")&&(e.modal.src+="?"+st()),this.pickConfig={},this.options=e,this.modal=null,this.element=null,this.uis=[],this._memoryEvents={ready:null},this._callbacks={},this.on("ready",function(){this.modal.modal.className+=" assetpicker-ready"}),this.on("resize",function(i){this.modal[i?"maximize":"minimize"]()}),document.addEventListener("DOMContentLoaded",function(){for(var i=document.querySelectorAll(this.options.selector),n=0,r=i.length;n<r;n++)this.register(i[n])}.bind(this))},getOrigin:function(){return document.location.origin},getDistUrl:function(){return this.options.distUrl},on:function(t,e){return this._callbacks.hasOwnProperty(t)||(this._callbacks[t]=[]),this._callbacks[t].push(e),this._memoryEvents[t]&&e.apply(this,this._memoryEvents[t]),this},_trigger:function(t){var e=Array.prototype.slice.call(arguments,1);this._callbacks[t]&&this._callbacks[t].forEach(function(i){return i.apply(this,e)}.bind(this)),this._memoryEvents.hasOwnProperty(t)&&(this._memoryEvents[t]=e)},register:function(t){t.hasAttribute("data-assetpicker")||(t.setAttribute("data-assetpicker",1),(t.hasAttribute("data-ui")||this.options.ui&&this.options.ui.enabled)&&this.uis.push(new rt(t,this)),t.addEventListener("click",function(e){e.preventDefault(),this.open(t)}.bind(this)))},_getPickConfig:function(t){var e=function(i){var n=t.getAttribute(i);return n.length?n.split(","):[]};return m({},this.config.pick,{limit:t.hasAttribute("data-limit")?parseInt(t.getAttribute("data-limit")):void 0,types:t.hasAttribute("data-types")?e("data-types"):void 0,extensions:t.hasAttribute("data-ext")?e("data-ext"):void 0})},getUi:function(t){for(var e=0,i=this.uis.length;e<i;e++)if(this.uis[e].element===t)return this.uis[e]},open:function(t){if(typeof HTMLElement=="object"&&t instanceof HTMLElement||t&&typeof t=="object"&&t!==null&&t.nodeType===1&&typeof t.nodeName=="string"?(this.element=t,this.pickConfig=this._getPickConfig(t)):(this.element=void 0,this.pickConfig=m({},this.config.pick,t)),!this.modal)this.modal=new nt(this.options.modal),this.modal.messaging.registerServer("picker",this),this.on("ready",function(){this.modal.messaging.call("app.setConfig",{pick:this.pickConfig})});else try{this.modal.messaging.call("app.setConfig",{pick:this.pickConfig})}catch{}this.modal.open()},getConfig:function(){return this.config},setConfig:function(t){this.config=m(!0,{pick:{limit:1,types:["file"],extensions:[]}},t),this.modal&&picker.modal.messaging.call("app.setConfig",this.config)},pick:function(t){if(this.element){var e=this.element.tagName.toLowerCase();(e==="input"&&this.element.getAttribute("type")==="button"||e==="button")&&this.element.setAttribute("value",t?JSON.stringify(t):"")}this._trigger("pick",t),this.modal&&this.modal.close()}})});return ot();})();
//# sourceMappingURL=picker.js.map
