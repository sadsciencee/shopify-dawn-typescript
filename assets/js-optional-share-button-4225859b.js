import{q as e,s as i}from"./functions-24c9f5aa.js";import{D as n}from"./details-disclosure-c9694ad2.js";import"./UcoastEl-260a5367.js";class t extends n{constructor(){super(),this.elements={shareButton:e("button",this),shareSummary:e("summary",this),closeButton:e(".share-button__close",this),successMessage:e('[id^="ShareMessage"]',this),urlInput:e("input",this)},this.urlToShare=this.elements.urlInput?this.elements.urlInput.value:document.location.href,navigator.share?(this.mainDetailsToggle.setAttribute("hidden",""),this.elements.shareButton.classList.remove("hidden"),this.elements.shareButton.addEventListener("click",()=>{navigator.share({url:this.urlToShare,title:document.title})})):(this.mainDetailsToggle.addEventListener("toggle",this.toggleDetails.bind(this)),e(".share-button__copy",this.mainDetailsToggle).addEventListener("click",this.copyToClipboard.bind(this)),e(".share-button__close",this.mainDetailsToggle).addEventListener("click",this.close.bind(this)))}toggleDetails(){this.mainDetailsToggle.open||(this.elements.successMessage.classList.add("hidden"),this.elements.successMessage.textContent="",this.elements.closeButton.classList.add("hidden"),this.elements.shareSummary.focus())}copyToClipboard(){navigator.clipboard.writeText(this.elements.urlInput.value).then(()=>{this.elements.successMessage.classList.remove("hidden"),this.elements.successMessage.textContent=window.accessibilityStrings.shareSuccess,this.elements.closeButton.classList.remove("hidden"),this.elements.closeButton.focus()})}updateUrl(s){this.urlToShare=s,this.elements.urlInput.value=s}}t.htmlSelector="share-button";i(t);
//# sourceMappingURL=js-optional-share-button-4225859b.js.map
