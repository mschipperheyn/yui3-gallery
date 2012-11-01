YUI.add("gallery-twitter-widget",function(E){var C=/@(\w+)/g,B=/((?:https?|s?ftp|ssh)\:\/\/[^"\s<>]*[^.,;'">\:\s<>\)\]\!])/g,D=/#(\w+)/g,A;A=E.Base.create("Twitter",E.Widget,[],{PHOTO_TEMPLATE:'<div class="twitter-photo"><a href="{url}"><img src="{profile_image_url}"></a></div>',ENTRY_TEMPLATE:'<div class="twitter-update">{img}'+'<div class="twitter-entry"><div class="writer">{userTplt}</div>{text} {time}</div>'+"</div>",TIME_TEMPLATE:'<span class="twitter-timestamp">{relativeTime}</span>',USER_TEMPLATE:'<a href="{url}" class="twitter-username">{username}</a>',TITLE_TEMPLATE:'<h3 class="twitter-title">{title} {user}</h3>',interval:null,initializer:function(F){this.publish({data:{defaultFn:this._defDataFn},error:{defaultFn:this._defErrorFn}});this._initJSONPRequest();this.after({usernameChange:this._refreshJSONPRequest,countChange:this._refreshJSONPRequest});},_initJSONPRequest:function(){var F=this.get("key"),H={count:this.get("count"),d:(new Date()).getTime(),key:F},G=E.Lang.sub(this.get("isQuery")?A.TREND_API_URI:A.FEED_URI,H).replace("#","%23");this._jsonpHandle=new E.JSONPRequest(G,{on:{success:this._handleJSONPResponse,failure:this._defErrorFn},context:this});},_refreshJSONPRequest:function(){this._initJSONPRequest();this.syncUI();},renderUI:function(){this.get("contentBox").append('<div class="yui3-twitter-hdr"></div><div class="yui3-twitter-bdy"><ul class="twitter-updates'+(this.get("showPhoto")?" photo":"")+'"></ul></div><div class="yui3-twitter-ftr"><div class="img">&nbsp;</div></div>');if(this.get("hideSkin")){this.get("boundingBox").addClass("noskin");}},bindUI:function(){this.after("usernameChange",this.syncUI);this.after("countChange",this.syncUI);this.after("stringsChange",this.syncUI);this.after("refreshSecondsChange",this._updateInterval);},syncUI:function(){this._uiUpdateTitle();this.update();this._updateInterval();},_uiUpdateTitle:function(){var F=this.get("contentBox").one(".yui3-twitter-hdr"),J=F.one(".twitter-status-title"),I,G,H;if(this.get("includeTitle")){G=this.get("key");H=this.get("isQuery");I=E.Lang.sub(this.TITLE_TEMPLATE,{title:this.get("strings.title"),user:E.Lang.sub(this.USER_TEMPLATE,{username:H?G:"@"+G,url:H?A.TREND_URL+G.replace("#","%23"):A.PROFILE_URL+G})});if(J){J.replace(I);}else{F.prepend(I);}}else{if(J){J.remove();}}},update:function(){this._jsonpHandle.send();},_handleJSONPResponse:function(F){if(E.Lang.isObject(F)){this.fire("data",{data:F});}else{this.fire("error");}},_defDataFn:function(F){this.get("contentBox").removeClass("twitter-error");this._printEntries(F.data);},_printEntries:function(H){var G=this.get("contentBox"),F=this._createEntries(H);G.one(".twitter-updates").setContent("<li>"+F.join("</li><li>")+"</li>");},_createEntries:function(J){var F=[],I=J.results||J,H;for(H=I.length-1;H>=0;--H){I[H].relativeTime=E.toRelativeTime(new Date(Date.parse(I[H].created_at.replace(/\+\d+/,""))));var G=J.results?I[H].from_user:I[H].user.screen_name;I[H].url=A.PROFILE_URL+G;I[H].username=G;F[H]=this._createEntry(I[H]);}return F;},_createEntry:function(J){var I=this.get("showTime");var H=E.Lang.sub(this.ENTRY_TEMPLATE,J).replace(B,'<a href="$1">$1</a>').replace(C,'<a class="twitter-acct" href="'+A.PROFILE_URL+'$1">@$1</a>').replace(D,'<a class="twitter-hash" href="'+A.TREND_URL+'%23$1"/>#$1</a>'),K=this.get("showTime")?E.Lang.sub(this.TIME_TEMPLATE,J):"",G=this.get("showHandle")?E.Lang.sub(this.USER_TEMPLATE,J):"",F=this.get("showPhoto")?E.Lang.sub(this.PHOTO_TEMPLATE,J):"";return E.Lang.sub(H,{img:F,userTplt:G,time:K});},_defErrorFn:function(){this.get("contentBox").one("ul.twitter-updates").addClass("twitter-error").setContent("<li><em>"+this.get("strings.error")+"</em></li>");},_updateInterval:function(){if(this.interval){this.interval.cancel();}this.interval=E.later(this.get("refreshSeconds")*1000,this,this.update,null,true);}},{PROFILE_URL:"https://twitter.com/#!/",TREND_URL:"https://twitter.com/#!/search/",FEED_URI:"http://search.twitter.com/search.json?q=from:{key}&count={count}&d={d}&callback={callback}",TREND_API_URI:"http://search.twitter.com/search.json?q={key}&count={count}&d={d}&callback={callback}",ATTRS:{key:{},isQuery:{value:false,validator:E.Lang.isBoolean},count:{value:10,validator:E.Lang.isNumber},refreshSeconds:{value:300,validator:E.Lang.isNumber},strings:{value:{title:"Latest Updates",error:"Oops!  We had some trouble connecting to Twitter :("}},showPhoto:{value:true,validator:E.Lang.isBoolean},showHandle:{value:true,validator:E.Lang.isBoolean},includeTitle:{value:true,validator:E.Lang.isBoolean},hideSkin:{value:false,validator:E.Lang.isBoolean},showTime:{value:true,validator:E.Lang.isBoolean}}});E.namespace("Twitter").Status=A;},"@VERSION@",{skinnable:true,requires:["widget-base","substitute","gallery-torelativetime","jsonp","base-build"]});