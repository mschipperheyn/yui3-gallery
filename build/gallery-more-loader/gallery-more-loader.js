YUI.add('gallery-more-loader', function(Y) {

/**
* You supply url, start, count and max variables in the container node as data-attributes

* {start} and {max} are automatically replaced by the appropriate values. {dte} is replaced by the current time in milliseconds at the time of the load
*
* You can load based on a button click, a end of page scroll event (will be supplied later as an extension) or automcatically repeating
* The server content can be returned as HTML. In that case, supply a container attribute to append/prepend to, 
* or as XML or json, in that case, just listen for the load event and process appropriately.
*/
var NME='MoreLoader',
SRC = 'container',
/**
* Event generated at the start of the loading process. Could be used to activate a busy screen or disabling the load more button
* url: the actual url used to retrieve content
*/
EVT_START='start',
/**
* Event generated when content is returned from the server
* status: the status of the server response
* content: the returned content from the server after processing optional contentSelector
* responseText: the full responseText from the server
*/
EVT_LOAD='load',
/**
* Event generated when an error occurs in the response. This could be used to update the UI with a network failure message or try again button
* status: the status of the server response
* content: the returned content from the server
* responseText: the full responseText from the server
*/
EVT_ERROR='error',
/**
* Event generated when the last page is reached. Only thrown when count > 0
* You can use this to hide the More button for example
*/
EVT_MAX='max';

function MoreLoader(config) {
    MoreLoader.superclass.constructor.apply(this, arguments);
}

MoreLoader.NAME = NME;

Y.extend(
MoreLoader,
Y.Base,
	{
		initializer:function(cfg){
			var src = this.get(SRC),
			moreBtn = this.get('moreBtn');

			this.publish(EVT_LOAD,  {defaultFn: this._defCompleteFn});
			this.publish(EVT_START,  {});
			this.publish(EVT_ERROR,  {});
			this.publish(EVT_MAX,  {});
			
			//make sure that we're not getting all the data items if start or max is missing
			this.start = this.get('start');
			this.max = this.get('max');
			this.count = this.get('count');
			this.loading = false;
			
			if(moreBtn){
				moreBtn.on('click',function(e){
					this.loadContent(
						this._getUrl(cfg.url, this.start, this.max)
					);
				},this);
			}
			
			if(this.get('autoRepeat') > 0)
				this.startTimer();
			
		},
		startTimer: function(){
			var repeat = this.get('autoRepeat') * 1000,
			self = this;
			if(repeat > 0 && !this.timer){
				this.timer = setInterval(function(){
					self.loadContent(
						self._getUrl(self.get('url'),self.start,self.max)
					);
				}, repeat);
			}
		},
		stopTimer: function(){
			if(this.timer)
				clearInterval(this.timer);
		},
		loadContent:function(url){
			
			if(this.loading || (this.count > 0 && this.start >= this.count))
				return;
			
			this.loading = true;
			
			this.fire(EVT_START, {url:url});
			
			Y.io(url,{
				on:{
					success:this._processResult,
					failure:this._processResult
				},
				timeour:10000,
				context:this
			});
		},
		_processResult:function(transactionid,res){
			var status		= res.status,
				event		= status < 300 ? EVT_LOAD : EVT_ERROR,
				content		= res.responseText,
				selector 	= this.get('contentSelector'),
				e			= {
								start		: this.start,
								content     : content,
								responseText: res.responseText,
								status      : status
							};

			if(event === EVT_LOAD){
				if(selector !== null && content){
					e.content = Y.Node.create(content).one(selector).get('innerHTML');
				}
			}
			
			this.loading = false;
			
			this.fire(event, e);
			
		},
		_defCompleteFn:function(e){
			
			this.start = this.start + this.max;
			
			var container = this.get(SRC);

			if (container && e.content) {
				var anim = this.get('anim'),
				content = e.content.get('innerHTML');
				
				content = Y.Node.create(anim? '<div style="opacity:0;">' + content + '</div>' : content);
				//content = Y.Node.create(anim? '<div style="opacity:0;">' + e.content + '</div>' : e.content);
				
				if(this.get('append')){
					container.append(content);
				}else{
					container.prepend(content);
				}
				
				//If we have in-line javascript withing the retrieved HTML, it will not be executed by appending the content to the dom
				//So we need to get all the script elements and evaluate them
				var script = content.all('script').get('innerHTML').join("");
				
				Y.log('Evaluating script: ' + script);
				eval(script);

				
				if(anim){
					content.transition({
						opacity:{
							easing: 'ease-in',
							duration: 0.6,
							value:100
						}
					});
				}
			}
			
			if(this.count > 0 && this.start >= this.count)
				this.fire(EVT_MAX);
		},
		/**
		* Supports url such as http://myurl/{st}/{mx} or http://myurl/?start={st}&max={mx}
		* Parameters that are supported are 
		* {st}
		* {mx}
		* {dte} : current date time in millis
		*/
		_getUrl:function(url,start,max){
			
			if(url.indexOf('{st}') > -1){
				return Y.Lang.sub(this.get('url'),{
					start: start,
					max: max,
					dte: new Date().getMilliseconds()
				});
			}
			
			return url;
		},
		destructor:function(){
			this.stopTimer();
			this.get('moreBtn') && this.get('moreBtn').destroy();
			
		}
	
	},{
		ATTRS:{
			/**
			* The url supplied to the loader 
			* url format options: 
			* http://myurl/?start={start}&max={max}
			* http://myurl/?start={start}&max={max}&dte={dte}
			* http://myurl/?dte={dte}
			* http://myurl/
			*/
			url:null,
			/**
			* the start value of loading
			*/
			start:{
				value:0
			},
			/**
			* The max value for loading. Since we're not counting items when we're loading
			* every load is assumed to contain the maximum amount of elements
			*/
			max:{
				value:0
			},
			/**
			* The total number of results. If 0, it is assumed that loading is "endless" 
			* in which case it is recommendable to use a url which supports the dte={dte} parameter which supplies the current time in milliseconds
			*/
			count:{
				value:0
			},
			/**
			* Should the retrieved content be appended or prepended
			*/
			append:{
				value:true
			},
			/**
			* Allows you to turn off animation, which can be useful in situtions where adding a wrapping div is illegal, such as with tables
			*/
			anim:{
				value:true
			},
			/**
			* Repeat the loading event automatically every x seconds.
			* With this function it is recommended that use a dte variable in the url and process it on the server to avoid duplicate results
			*/
			autoRepeat:{
				value : 0
			},
			/**
			* Container node to automatically append/prepend retrieved content to.
			* If container = null it is assumed you will handle the processing yourself through the supplied events
			*/ 
			container:{
				value:null,
				setter:Y.one
			},
			/**
			* If no moreBtn is supplied, when a user scrolls to the end of the page, more content is loaded, if available
			*/
			moreBtn: {
				value:null,
				setter:Y.one
			},
			/**
			* Select a specific node in the returned content. The content in this node will be selected to be inserted into the page
			*/
			contentSelector:{
				value:null
			}
		}
});

Y[NME] = MoreLoader;



}, '@VERSION@' ,{requires:['node-base','io-base','transition']});
