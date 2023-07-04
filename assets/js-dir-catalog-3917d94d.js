import{q as u,d as T,a as d,o as A,e as E,i as S,h as D,g as f,p as x,j as w,k as b,c as P,b as y,t as H,s as F}from"./functions-de1108d3.js";import{i as h}from"./animations-02d2bf85.js";import{U as p}from"./UcoastEl-5d53ad84.js";import{S as I}from"./search-form-e0b17dd0.js";const o=class extends p{constructor(){super(),this.onActiveFilterClick=this.onActiveFilterClick.bind(this),this.debouncedOnSubmit=T(e=>{this.onSubmitHandler(e)},500),this.facetForm=u("form",this),this.facetForm.addEventListener("input",this.debouncedOnSubmit.bind(this));const r=d("#FacetsWrapperDesktop",this);r&&r.addEventListener("keyup",A)}static setListeners(){const r=e=>{const t=e.state?e.state.searchParams:o.searchParamsInitial;t!==o.searchParamsPrev&&o.renderPage(t,null,!1)};window.addEventListener("popstate",r)}static toggleActiveFacets(r=!0){document.querySelectorAll(".js-facet-remove").forEach(e=>{e.classList.toggle("disabled",r)})}static renderPage(r,e=null,t=!0){o.searchParamsPrev=r;const n=o.getSections(),s=document.getElementById("ProductCount"),i=document.getElementById("ProductCountDesktop");u(".collection",o.getProductGridContainer()).classList.add("loading"),s&&s.classList.add("loading"),i&&i.classList.add("loading"),n.forEach(l=>{const m=`${window.location.pathname}?section_id=${l.section}&${r}`,g=C=>C.url===m;o.filterData.some(g)?o.renderSectionFromCache(g,e):o.renderSectionFromFetch(m,e)}),t&&o.updateURLHash(r)}static renderSectionFromFetch(r,e){fetch(r).then(t=>t.text()).then(t=>{const n=t,s=new DOMParser().parseFromString(n,"text/html");o.filterData=[...o.filterData,{html:n,url:r}],o.renderFilters(n,e),o.renderProductGridContainer(n),o.renderProductCount(n),typeof h=="function"&&h(s.documentElement)})}static renderSectionFromCache(r,e){var s;const t=(s=o.filterData.find(r))==null?void 0:s.html;if(!t)throw new Error("search filter not found in cache");const n=new DOMParser().parseFromString(t,"text/html");o.renderFilters(t,e),o.renderProductGridContainer(t),o.renderProductCount(t),typeof h=="function"&&h(n.documentElement)}static renderProductGridContainer(r){var s;const e=o.getProductGridContainer(),t=(s=new DOMParser().parseFromString(r,"text/html").getElementById("ProductGridContainer"))==null?void 0:s.innerHTML;t&&(e.innerHTML=t);const n=E(".scroll-trigger",e);n&&n.forEach(i=>{i.classList.add("scroll-trigger--cancel")})}static renderProductCount(r){var i;const e=new DOMParser().parseFromString(r,"text/html"),t=((i=d("#ProductCount",e.documentElement))==null?void 0:i.innerHTML)??"No Results",n=d("#ProductCount");n&&(n.innerHTML=t,n.classList.remove("loading"));const s=d("#ProductCountDesktop");s&&(s.innerHTML=t,s.classList.remove("loading"))}static renderFilters(r,e){const t=new DOMParser().parseFromString(r,"text/html"),n=E("#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter",t),s=l=>{if(!e)return!1;const m=b(e,".js-filter");return m?l.dataset.index===m.dataset.index:!1},i=n?Array.from(n).filter(l=>!s(l)):[],a=n?Array.from(n).find(s):void 0;if(i.forEach(l=>{const m=u(`.js-filter[data-index="${l.dataset.index}"]`);m.innerHTML=l.innerHTML}),o.renderActiveFacets(t),o.renderAdditionalElements(t),a&&e){const l=S(e,".js-filter");o.renderCounts(a,l)}}static renderActiveFacets(r){[".active-facets-mobile",".active-facets-desktop"].forEach(t=>{const n=r.querySelector(t);if(!n)return;const s=u(t);s.innerHTML=n.innerHTML}),o.toggleActiveFacets(!1)}static renderAdditionalElements(r){[".mobile-facets__open",".mobile-facets__count",".sorting"].forEach(s=>{const i=d(s,r),a=d(s);!i||!a||(a.innerHTML=i.innerHTML)});const t=u("#FacetFiltersFormMobile"),n=D(t,"menu-drawer");if(!n)throw new Error("menu-drawer not found, cant close mobile facets");n.bindEvents()}static renderCounts(r,e){const t=d(".facets__selected",e),n=d(".facets__selected",r),s=d(".facets__summary",e),i=d(".facets__summary",r);n&&t&&(t.outerHTML=n.outerHTML),s&&i&&(s.outerHTML=i.outerHTML)}static updateURLHash(r){history.pushState({searchParams:r},"",`${window.location.pathname}${r&&"?".concat(r)}`)}static getSections(){const r=u("#product-grid");return[{section:f("data-id",r)}]}createSearchParams(r){const e=new FormData(r);return new URLSearchParams(x(e)).toString()}onSubmitForm(r,e){o.renderPage(r,e)}onSubmitHandler(r){var n;r.preventDefault();const e=w("facet-filters-form form"),t=r.srcElement?r.srcElement:void 0;if(t&&t.className=="mobile-facets__checkbox"){const s=S(r,"form"),i=this.createSearchParams(s);this.onSubmitForm(i,r)}else{const s=[],i=((n=b(r,"form"))==null?void 0:n.id)==="FacetFiltersFormMobile";e.forEach(a=>{i?a.id==="FacetFiltersFormMobile"&&s.push(this.createSearchParams(a)):(a.id==="FacetSortForm"||a.id==="FacetFiltersForm"||a.id==="FacetSortDrawerForm")&&(document.querySelectorAll(".no-js-list").forEach(m=>m.remove()),s.push(this.createSearchParams(a)))}),this.onSubmitForm(s.join("&"),r)}}onActiveFilterClick(r){r.preventDefault(),o.toggleActiveFacets();const e=P(r);if(!(e instanceof HTMLAnchorElement))throw new Error("currentTarget is not anchor element");const t=e.href.indexOf("?")==-1?"":e.href.slice(e.href.indexOf("?")+1);o.renderPage(t)}};let c=o;c.htmlSelector="facet-filters-form";c.filterData=[];c.searchParamsInitial=window.location.search.slice(1);c.searchParamsPrev=window.location.search.slice(1);c.searchPathInitial=window.location.pathname;c.searchPathPrev=window.location.pathname;c.getProductGridContainer=()=>u("#ProductGridContainer");function R(){c.filterData=[],c.searchParamsInitial=window.location.search.slice(1),c.searchParamsPrev=window.location.search.slice(1)}function k(){c.setListeners()}class L extends p{constructor(){super(),this.querySelectorAll("input").forEach(e=>e.addEventListener("change",this.onRangeChange.bind(this))),this.setMinAndMaxValues()}onRangeChange(e){const t=P(e);this.adjustToValidValues(t),this.setMinAndMaxValues()}setMinAndMaxValues(){const e=this.querySelectorAll("input"),t=e[0],n=e[1];n.value&&t.setAttribute("max",n.value),t.value&&n.setAttribute("min",t.value),t.value===""&&n.setAttribute("min","0"),n.value===""&&t.setAttribute("max",f("max",n))}adjustToValidValues(e){const t=Number(e.value),n=Number(f("min",e)),s=Number(f("max",e));t<n&&(e.value=`${n}`),t>s&&(e.value=`${s}`)}}L.htmlSelector="price-range";class v extends p{constructor(){super();const e=u("a",this);e.setAttribute("role","button"),e.addEventListener("click",this.closeFilter.bind(this)),e.addEventListener("keyup",t=>{t.preventDefault(),t.code.toUpperCase()==="SPACE"&&this.closeFilter(t)})}closeFilter(e){e.preventDefault(),(y(this,"facet-filters-form")||u("facet-filters-form")).onActiveFilterClick(e)}}v.htmlSelector="facet-remove";class M extends I{constructor(){super(),this.allSearchInputs=w('input[type="search"]'),this.setupEventListeners()}setupEventListeners(){let e=[];this.allSearchInputs.forEach(t=>{if(t.form)e.push(t.form);else throw new Error("input in allSearchInputs is not in a form element")}),this.input.addEventListener("focus",this.onInputFocus.bind(this)),!(e.length<2)&&(e.forEach(t=>t.addEventListener("reset",this.onFormReset.bind(this))),this.allSearchInputs.forEach(t=>t.addEventListener("input",this.onInput.bind(this))))}onFormReset(e){super.onFormReset(e),super.shouldResetForm()&&this.keepInSync("",this.input)}onInput(e){const t=H(e);this.keepInSync(t.value,t)}onInputFocus(){window.innerWidth<750&&this.scrollIntoView({behavior:"smooth"})}keepInSync(e,t){this.allSearchInputs.forEach(n=>{n!==t&&(n.value=e)})}}M.htmlSelector="main-search";F(c,R,k);F(L);F(v);F(M);
//# sourceMappingURL=js-dir-catalog-3917d94d.js.map
