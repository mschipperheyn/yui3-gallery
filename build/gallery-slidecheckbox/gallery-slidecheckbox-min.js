YUI.add("gallery-slidecheckbox",function(C){var E="SlideCheckbox",I="contentBox",G="wrapper",A="slider",F="sliderwrap",B="labelOn",H="labelOff",D="handle";C[E]=C.Base.create(E,C.Widget,[C.MakeNode],{anim:null,currentX:null,lastX:null,renderUI:function(){this.src=this.get("srcNode").addClass(this.getClassName("hidden"));this.get(I).append(this._makeNode()).append(this.src);this._locateNodes();var M=this._labelOnNode.one("div").get("offsetWidth"),L=this._labelOffNode.one("div").get("offsetWidth"),N=this._labelOnNode.get("offsetWidth"),O=this.getSkinName(),J=O?O.indexOf("ios5")>-1:null;if(M>L){this._labelOffNode.one("div").setStyle("width",M);}else{this._labelOnNode.one("div").setStyle("width",L);N=this._labelOnNode.get("offsetWidth");}this.left=-this._labelOnNode.get("offsetWidth")+3;var K=2*N;if(J){this._slideWrapWidth=2*N+28;this.left=this.left+11;K=N+14;}else{this._slideWrapWidth=3*N+10;this._handleNode.setStyle("width",N-3);}this._sliderwrapNode.setStyle("width",this._slideWrapWidth);this._wrapperNode.setStyle("width",K);},bindUI:function(){this.disabled=this.src.get("disabled");var K=new C.DD.Drag({node:this._sliderwrapNode,activeHandle:this._handleNode,lock:this.disabled}),J=this.get(I);this._addDragConstraint(K);K.on("drag:drag",function(M){var L=this._wrapperNode.getXY();if(L[1]!==K.actXY[1]){K.unplug();this._addDragConstraint(K);M.halt(true);}if(K.actXY[0]%2===0){this.lastX=this.currentX;}this.currentX=K.actXY[0];},this);K.on("drag:end",this.move,this);J.on("focus",function(){J.on("key",this.goLeft,"down:37",this);J.on("key",this.goRight,"down:39",this);J.on("key",function(L){L.preventDefault();this.move();},"down:32",this);},this);J.on("blur",function(){J.detach("key");J.blur();},this);this.src.on("change",function(L){alert(this.src.get("checked"));});},syncUI:function(){this._sliderwrapNode.setStyle("left",this.src.get("checked")?0:this.left);},destructor:function(){this.anim.stop().destroy();this.src=null;},goLeft:function(){this.to=this.left;this._execute();},goRight:function(){this.to=0;this._execute();},move:function(){this.from=this._replacePx(this._sliderwrapNode.getComputedStyle("left"));if(this.lastX!==null){if(this.currentX<this.lastX||this.from===this.left){this.goLeft();}else{this.goRight();}}if(this.from>this.left){this.goLeft();}else{this.goRight();}},_addDragConstraint:function(J){var K=this._wrapperNode.getXY();J.plug(C.Plugin.DDConstrained,{constrain:{top:K[1],bottom:K[1]+this._wrapperNode.get("offsetHeight"),right:K[0]+this._slideWrapWidth,left:K[0]+this.left}});},_defaultCB:function(J){return null;},_onClick:function(J){J.preventDefault();this.move();},_execute:function(){this.focus();if(this.disabled){return;}if(this.anim===null){this.anim=new C.Anim({node:this._sliderwrapNode,from:{left:this.from},duration:this.get("duration"),to:{left:this.to},easing:"easeIn"});}this.lastX=null;this.anim.set("from",{left:(this.from?this.from:this.baseX)});this.anim.set("to",{left:this.to});this.anim.run();this.src.set("checked",!this.src.get("checked"));},_replacePx:function(J){return parseInt(J.replace("px",""));}},{ATTRS:{duration:{value:0.2},strings:{value:{labelOn:"ON",labelOff:"OFF"}}},_CLASS_NAMES:[G,A,F,B,H,D],_TEMPLATE:['<div class="{c wrapper}"><span class="edge lt">&nbsp;</span><span class="edge rt">&nbsp;</span>','<div class="{c slider}"><div class="{c sliderwrap}">','<div class="{c labelOn}"><label><div>{s labelOn}</div></label></div>','<div class="{c handle}"><span class="edge lt">&nbsp;</span><span class="edge rt">&nbsp;</span></div>','<div class="{c labelOff}"><label><div>{s labelOff}</div></label></div>',"</div></div></div>"].join("\n"),_EVENTS:{slider:[{type:"click",fn:"_onClick"}]},HTML_PARSER:{value:function(J){return J.getAttribute("checked");}}});},"@VERSION@",{requires:["node-base","anim-base","anim-easing","base-build","event-key","event-move","widget","node-style","gallery-makenode","dd-drag","dd-constrain"],optional:["node-base","anim-base","anim-easing","base-build","event-key","event-move","widget","node-style","gallery-makenode","dd-drag","dd-constrain"],skinnable:true});