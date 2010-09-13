YUI.add("gallery-ac-widget-v2",function(B){function G(){G.superclass.constructor.apply(this,arguments);}var A="_bound",D="selectedIndex",I="_selectedIndex",F="_originalValue",C=B.Array.each,E="queryValue";B.ACWidget2=B.extend(G,B.Overlay,{initializer:function(){var J=this;J.after({queryChanged:J.syncUI,dataChanged:J.syncUI});J.hide();this.publish("ac:selectedElement",{broadcast:2});this.publish("ac:show");this.publish("ac:hide",{broadcast:2});},renderUI:function(){var J=this.get("ac");if(!J){return;}B.one("body").prepend(this.get("boundingBox"));this.setSize();return;},setSize:function(){return this.set("width",this.get("ac").get("host").getComputedStyle("width"));},bindUI:function(M){var N=this,J=N.get("contentBox"),L=N.get("ac"),K=B.stamp(N)+"|";if(M&&L!==M&&N[A]){B.detach(K);N[A]=0;}M=M||L;if(M&&!N[A]){N[A]=1;J.delegate("click",N.click,"li",N);B.on("click",N.hide,document);M.on("ac:load",function(O){N.setAttrs({query:O.query,data:O.results,total:O.total}).syncUI().show();},N);M.on("ac:query",function(O){N.set("query",O.value).syncUI();});M.on("ac:next",N.next,N);M.on("ac:previous",N.previous,N);M.on("ac:hide",N.hide,N);}return N;},syncUI:function(){var J=this,L=J.get("data"),K=J.get("query");if(!L){return J;}J[I]=-1;J[F]="";J.get("contentBox").setContent(J.getListMarkup(L));return J;},getListMarkup:function(M){var L=this,J=L.get("listTpl"),K=[];C(M,function(N){K.push(L.getItemMarkup(N));});if(L.get("total")>L.get("data").length){K.push(L.get("moreTpl").replace("{message}",L.get("moreTxt")));}return J.replace(/\{list\}/g,K.join(""));},getItemMarkup:function(J){if(this.get("query").toLowerCase()===J.label.toLowerCase()){this.fire("ac:selectedElement",J);}return this.get("itemTpl").replace(/\{id\}/g,J.id).replace(/\{term\}/g,J.label).replace(/\{hilite\}/g,this.getHiliteMarkup(J.label));},getHiliteMarkup:function(N){var K=this,J=H(K.get("query")).split(/\s+/),L=N;var M=new RegExp("("+J.join("|")+")","gi");var O=K.get("hiliteTpl").replace(/\$/g,"\\$").replace(/\{term\}/g,"$1");return L.replace(M,O);},next:function(){var J=this;return(J.get("visible")?J.selectNext():J.get("data")?J.show():J);},selectNext:function(){return this.set(D,this.get(D)+1);},selectPrevious:function(){return this.set(D,this.get(D)-1);},previous:function(){return this.get("visible")?this.selectPrevious():this;},item:function(J){return this.get("contentBox").one(this.get("itemSelector").replace(/\{n\}/g,this.get("data")[J].id));},click:function(N){var K=this,L=K.get("ac"),O=N.currentTarget.get("text"),P=N.currentTarget.get("id");if(P.indexOf("yui")>-1){return;}L.set(E,O);L.set(E,O);var M=K.get("data");for(var J=0;J<M.length;J++){if(M[J].id==P){K.set(D,J);break;}}K[I]=-1;K._currentValue=O;L.get("host").focus();K.hide();}},{NAME:"ACWidget",ATTRS:{ac:{setter:function(J){if(!this[A]){return;}this.bindUI(J);},validator:function(J){return true;}},data:{validator:function(J){return J&&J.length>0;}},query:{value:""},total:{value:0},listTpl:{value:"<ul>{list}</ul>"},itemTpl:{value:'<li class="yui3-menuitem" id="{id}"><span class="yui3-menuitemlabel">{hilite}</span></li>'},moreTpl:{value:'<li class="yui3-menuitem"><span class="yui3-menuitemlabel more">{message}</span></li>'},itemSelector:{value:'ul li[id="{n}"]'},hiliteTpl:{value:"<em>{term}</em>"},moreTxt:{value:"More hits available if you keep typing!"}}});G.ATTRS[D]={value:-1,validator:function(J){var K=this.get("data");return K&&B.Lang.isNumber(J);},getter:function(){return this[I];},setter:function(L){var Q=this,N=Q.get(D),O=Q.get("data"),J=O&&O.length,P=Q.get("ac"),K=this.getClassName("selected");if(isNaN(N)){N=-1;}if(!O||!J){return;}while(L<-1){L+=J+1;}L=(L+1)%(J+1)-1;N=(N+1)%(J+1)-1;Q[I]=L;if(N===-1){Q[F]=P.get(E);}if(N===L){return;}var R=Q.get("contentBox").one("."+K);if(R){R.removeClass(K);}if(L===-1){P.set(E,this[F]);}else{var M=Q.item(L);if(M){M.addClass(K);}P.set(E,O[L].label);Q.fire("ac:selectedElement",O[L]);}return L;}};function H(J){return(""+J).replace(/([\^\/.*+?|()[\]{}\\])/g,"\\$1");}},"@VERSION@",{supersedes:["gallery-ac-widget"],requires:["overlay","gallery-ac-plugin-v2"]});