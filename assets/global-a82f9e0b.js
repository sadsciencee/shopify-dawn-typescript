import{m as i,n as f,r as c,t as d}from"./functions-24c9f5aa.js";i();const e={};function m(o,n=o){const s=c(o),r=s[0],u=s[s.length-1];a(),e.focusin=t=>{if(!(t.target!==o&&t.target!==u&&t.target!==r)){if(!e.keydown)throw new Error("trapFocusHandlers.focusin called before .keydown is defined");document.addEventListener("keydown",e.keydown)}},e.focusout=function(){if(!e.keydown)throw new Error("trapFocusHandlers.focusout called before .keydown is defined");document.removeEventListener("keydown",e.keydown)},e.keydown=function(t){if(t.code.toUpperCase()!=="TAB")return;d(t)===u&&!t.shiftKey&&(t.preventDefault(),r.focus()),(t.target===o||t.target===r)&&t.shiftKey&&(t.preventDefault(),u.focus())},document.addEventListener("focusout",e.focusout),document.addEventListener("focusin",e.focusin),n.focus(),n instanceof HTMLInputElement&&["search","text","email","url"].includes(n.type)&&n.value&&n.setSelectionRange(0,n.value.length)}try{document.querySelector(":focus-visible")}catch{f()}function a(o=void 0){e.focusin&&document.removeEventListener("focusin",e.focusin),e.focusout&&document.removeEventListener("focusout",e.focusout),e.keydown&&document.removeEventListener("keydown",e.keydown),o&&o.focus()}export{a as r,m as t};
//# sourceMappingURL=global-a82f9e0b.js.map
