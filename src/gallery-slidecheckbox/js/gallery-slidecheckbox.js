		var SLIDECHECKBOX='SlideCheckbox',
	WRAPPER = 'wrapper',
	SLIDER = 'slider',
	SLIDERWRAP = 'sliderwrap',
	LABELON = 'labelOn',
	LABELOFF = 'labelOff',
	HANDLE = 'handle',
	MIN_SWIPE = 10;
	;
	
	Y[SLIDECHECKBOX] = Y.Base.create(
	SLIDECHECKBOX,
	Y.Widget,
	[Y.MakeNode],
		{
			anim : null,
			currentX : null,
			lastX : null,
			renderUI : function() {
				this.src = this.get('srcNode').addClass(this.getClassName('hidden'));
				this.get('contentBox').append(this._makeNode()).append(this.src);
				
				this._locateNodes();
				
				var leftX = this._replacePx(this._labelOnNode.one('span').getStyle('width')),
				rightX = this._replacePx(this._labelOffNode.one('span').getStyle('width'));
			
				//-5 to compensate for margin-left 5px in off label
				if(leftX > rightX){
					this._labelOffNode.one('span').setStyle('width',leftX);
					this.width = this._labelOnNode.get('offsetWidth');
				}else{
					this._labelOnNode.one('span').setStyle('width',rightX);
					this.width = this._labelOffNode.get('offsetWidth');
				}
				
				this.left = -this._labelOnNode.get('offsetWidth') + 3;

				this._slideWrapWidth = 3 * this.width + 10;
				this._wrapWidth = 2 * this.width;
				this._handleNode.setStyle('width',this.width - 3);
				this._sliderwrapNode.setStyle('width',this._slideWrapWidth);
				this._sliderNode.setStyle('width',this._slideWrapWidth);
				this._wrapperNode.setStyle('width',this._wrapWidth).all('> .edge').setStyle('backgroundColor',this.get('backgroundColor'));
			},
			bindUI : function(){
				this.disabled = this.src.get('disabled');
				
				var dd = new Y.DD.Drag({
					node: this._sliderwrapNode,
					activeHandle : this._handleNode,
					lock: this.disabled
				});
				
				this._addDragConstraint(dd);
				
				dd.on('drag:drag',function(e){
					var xy = this._wrapperNode.getXY();
					
					//If the node is repositioned we need to reapply the constraint
					if(xy[1] !== dd.actXY[1]){
						dd.unplug();
						this._addDragConstraint(dd);
						e.halt(true);
					}
					
					if(dd.actXY[0] % 2 === 0)
						this.lastX = this.currentX;
					this.currentX = dd.actXY[0];
					
				}, this);
				
				dd.on('drag:end',this.move, this);
				
			},syncUI : function(){
				this._sliderwrapNode.setStyle('left',
					this.src.get('checked')?  0 : this.left
				);
			},destructor : function(){
				this.anim.stop().destroy();
				this.src = null;
			},
			goLeft : function(){
				this.to = this.left;
				this._execute();
			},
			goRight : function(){
				this.to = 0;
				this._execute();
			},
			move : function(left){
				this.from = this._replacePx(this._sliderwrapNode.getComputedStyle('left'));
				
				if(this.lastX !== null){
					if(this.currentX < this.lastX){
						this.goLeft();
					}else{
						this.goRight();
					}
				}
				
				if(this.from > this.left){
					this.goLeft();
				}else{
					this.goRight();
				}
			},
			_addDragConstraint : function(dd){
				var xy = this._wrapperNode.getXY();
				dd.plug(Y.Plugin.DDConstrained, {
					constrain:{
						top:xy[1],
						bottom:xy[1] + this._wrapperNode.get('offsetHeight'),
						right:xy[0] + this._slideWrapWidth,
						left:xy[0] + this.left
					}
				});
			},
			_defaultCB : function(el) {
				return null;
			},
			_onClick : function(e){
				this.move();
			},
			_onSwipe : function(e){
				var item = e.currentTarget;
				item.setData("swipeStart", e.pageX);
 
				item.once("gesturemoveend", function(b) {
 
					var swipeStart = item.getData("swipeStart"),
						swipeEnd = e.pageX,
						isSwipeLeft = (swipeStart - swipeEnd) > MIN_SWIPE;

					this.from = e.pageX;
					if(isSwipeLeft){
						this.goLeft();
					}else{
						this.goRight();
					}
				},this);
			},
			/*
			 * React to changes to the source node that may occur by other components.
			 */
			_onChange : function(){
				
			},
			_execute : function(){
				if(this.disabled)
					return;

				this.src.set('checked',!this.src.get('checked'));
				
				if(this.anim === null){
					this.anim = new Y.Anim({
						node: this._sliderwrapNode,
						from: {left:this.from},
						duration: this.get('duration'),
						to: {left:this.to},
						easing: 'easeIn'
					});
				}
				this.lastX = null;
				this.anim.set('from',{left:(this.from? this.from : this.baseX)});
				this.anim.set('to',{left:this.to});
				this.anim.run();
			},
			_replacePx : function(el){
				return parseInt(el.replace('px',''));
			}
		},
		{
			ATTRS:{
				backgroundColor : {value:'white'},
				duration: {value:0.2},
				strings : {
					value:{
						labelOn: 'ON',
						labelOff: 'OFF'
					}
				}
			},
			_CLASS_NAMES: [WRAPPER,SLIDER,SLIDERWRAP,LABELON,LABELOFF,HANDLE],
			_TEMPLATE: [
				'<div class="{c wrapper}"><span class="edge lt">&nbsp;</span><span class="edge rt">&nbsp;</span>',
				'<div class="{c slider}"><div class="{c sliderwrap}">',
				'<span class="{c labelOn}"><label><span>{s labelOn}</span></label></span>',
				'<div class="{c handle}"><span class="edge lt">&nbsp;</span><span class="edge rt">&nbsp;</span></div>',
				'<span class="{c labelOff}"><label><span>{s labelOff}</span></label></span>',
				'</div></div></div>'
			].join('\n'),
			_EVENTS:{
				slider: [
					{type: 'click',fn:'_onClick'}
				]/*,
				handle:[
					{type: 'gesturemovestart', fn:'_onSwipe'}
				]*/
			},
			HTML_PARSER: {
				value: function (srcNode) {
					return srcNode.getAttribute('checked'); 
				}
			}
		}
	);

