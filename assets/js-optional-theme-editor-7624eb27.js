import{t as i,b as c,e as d}from"./functions-24c9f5aa.js";function l(){function n(){const t=d("product-modal[open]");t&&t.forEach(e=>e.hide())}document.addEventListener("shopify:block:select",function(t){n();const e=i(t);if(!e.classList.contains("slideshow__slide"))return;const o=c(e,"slideshow-component");o&&(o.pause(),setTimeout(function(){o.slider.scrollTo({left:e.offsetLeft})},200))}),document.addEventListener("shopify:block:deselect",function(t){const e=i(t);if(!e.classList.contains("slideshow__slide"))return;const o=c(e,"slideshow-component");o&&o.autoplayButtonIsSetToPlay&&o.play()}),document.addEventListener("shopify:section:load",()=>{n();const t=d("[id^=EnableZoomOnHover] script");t==null||t.forEach(e=>{const s=e.parentNode;if(!s)return;const o=document.createElement("script");o.src=e.src,s.replaceChild(o,e)})}),document.addEventListener("shopify:section:reorder",()=>n()),document.addEventListener("shopify:section:select",()=>n()),document.addEventListener("shopify:section:deselect",()=>n()),document.addEventListener("shopify:inspector:activate",()=>n()),document.addEventListener("shopify:inspector:deactivate",()=>n())}l();
//# sourceMappingURL=js-optional-theme-editor-7624eb27.js.map
