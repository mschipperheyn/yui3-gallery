YUI.add('gallery-ac-widget-v2', function(Y) {

/**
 * An updated display widget for the AutoComplete component.
 * This is what is expected when you say "autocomplete".
 * @class ACWidget
 * @inherits Overlay
 **/

function ACWidget2 () {
	ACWidget2.superclass.constructor.apply(this, arguments) 
};

// shorthands
// TODO: Uppercase all of these.
var BOUND = "_bound",
    selectedIndex = "selectedIndex",
    _selectedIndex = "_selectedIndex",
    _originalValue = "_originalValue",
    YArrayeach = Y.Array.each,
    queryValue = "queryValue";


Y.ACWidget2 = Y.extend(
    ACWidget2,
    Y.Overlay,
    { // prototype
        initializer : function () {
            var self = this;
			//this.render();
            self.after({
                queryChanged : self.syncUI,
                dataChanged : self.syncUI
            });
            self.hide();
			this.publish("ac:selectedElement",{broadcast:2});
			//Publish this so we can handle the IE zIndex bug
			this.publish("ac:show");
			this.publish("ac:hide",{broadcast:2});
        },
        /**
         * Method to display the widget.  Just inserts the widget after
         * the ACPlugin's host object and sets the size appropriately.
         *
         * @for ACWidget
         * @public
         **/
        renderUI : function () {
            var ac = this.get("ac");
            if (!ac) {
                Y.log("Attach before attempting to render the widget", "error", "ac-widget");
                return;
            }
            Y.one('body').prepend(this.get("boundingBox"));
            this.setSize();
            return;
        },
        /**
         * Get the size of the ACPlugin's host object, and then set the widget's width
         * to the same size.  Defined thusly so that it's easy to override.
         *
         * @public
         * @for ACWidget
         **/
        setSize : function () {            
            return this.set("width", this.get("ac").get("host").getComputedStyle("width"));
        },
        /**
         * Bind the necessary event handles, unbinding if there were any other handles
         * in place already.
         *
         * @param ac {Object} Optionally set the ACPlugin object at the same time,
         * that it can be easily re-bound in the ac setter.
         **/
        bindUI : function (ac) {
            var widget = this,
                cb = widget.get("contentBox"), //INHERITED
                currentAC = widget.get("ac"),
                category = Y.stamp(widget)+"|";
            
            if (ac && currentAC !== ac && widget[BOUND]) {
                // supplied something, it's new, and we're bound to something else.
                Y.detach(category);
                widget[BOUND] = 0; // small and falsey
            }
            ac = ac || currentAC;
            
            // if we have an ac, and we're not bound right now, then bind.
            if (ac && !widget[BOUND]) {
                widget[BOUND] = 1;
                cb.delegate("click", widget.click, "li", widget);
                Y.on("click", widget.hide, document); //INHERITED
                ac.on("ac:load", function (e) {
                    widget
                        .setAttrs({
                            query : e.query,
                            data : e.results,
                            total: e.total
                        })
                        .syncUI()
                        .show();
                },widget);
                // TODO: ac: should be superfluous
                // if it's not, then file a bug, because that would mean it broken
                ac.on("ac:query", function (e) {
                    widget.set("query", e.value).syncUI();
                });
                ac.on("ac:next", widget.next, widget);
                ac.on("ac:previous", widget.previous, widget);
                ac.on("ac:hide", widget.hide, widget); //INHERITED
            };
            return widget;
        },
        /**
         * If there is data, then set the markup.
         * Otherwise, do nothing.
         **/
        syncUI : function () {
            var self = this,
                data = self.get("data"),
                query = self.get("query");
            if (!data) return self;
            self[_selectedIndex] = -1;
            self[_originalValue] = "";
            self.get("contentBox").setContent(self.getListMarkup(data)); //INHERITED
            return self;
        },
        /**
         * Given a set of data, return the markup that should go in the widget.
         * @param {Array} The data object, some array-ish thing.
         * @return {String} The markup that goes in the widget.
         **/
        getListMarkup : function (data) {
            var self = this,
                listTemplate = self.get("listTpl"),
                markup = [];
            YArrayeach(data, function (item) {
                markup.push(self.getItemMarkup(item));
            });
            if(self.get("total") > self.get("data").length)
            	markup.push(self.get("moreTpl").replace("{message}",self.get('moreTxt')));
            return listTemplate.replace(/\{list\}/g, markup.join(""));
        },
        /**
         * Given a single item, return the markup for that item.
		 * Assume that data contains a label and id attribute
         * @param {String} the data item
         * @return {String} The markup, generated based on the itemTpl
         **/
        getItemMarkup : function (item) {
			//If we match an item during typing, it should be selected
            if(this.get("query").toLowerCase() === item.label.toLowerCase())
        		this.fire("ac:selectedElement",item);
        	return this.get("itemTpl")
        		.replace(/\{id\}/g,item.id)            	
                .replace(/\{term\}/g, item.label)
                .replace(/\{hilite\}/g, this.getHiliteMarkup(item.label))
                // .replace(/<([^<>]*)<[^>]*>([^<>]*)>/g, '<$1$2>');
        },
        /**
         * Given a single item, return the markup with the query terms hilighted.
         * @param {String} The data item
         * @return {String} The string with the query terms hilighted, according to the
         * hiliteTpl attr.
         **/
        getHiliteMarkup : function (item) {
            var self = this,
                queryTerms = regexpEscape(self.get("query")).split(/\s+/),
                out = item;
            //TODO: use Y.cache on this fn so that the regexp is only created
            // once per term/queryTerms
            var findRegexp = new RegExp("("+queryTerms.join("|")+")", "gi");
			var replRegexp = self.get("hiliteTpl")
                    .replace(/\$/g, '\\$')
                    .replace(/\{term\}/g, '$1');
            
            return out.replace(findRegexp, replRegexp);
            
            // YArrayeach(queryTerms, function (term) {
            //     if (!term) return;
            //     term = regexpEscape(term);
            //     out = out.replace(
            //         new RegExp(term, "g"),
            //         self.get("hiliteTpl").replace(/\{term\}/g, term)
            //     );
            // });
            // return out;
        },
        /**
         * The handler for the ACPlugin's ac:next event.
         **/
        next : function () {
            var self = this;
            
            return (
                self.get("visible") ? self.selectNext()
                : self.get("data") ? self.show()
                : self
            );
        },
        /**
         * Select the next item in the list.  Called by next() when the widget is visible.
         */
        selectNext : function () {
            return this.set(selectedIndex, this.get(selectedIndex) + 1);
        },
        /**
         * Select the previous item in the list. Called by previous() when the widget is visible.
         **/
        selectPrevious : function () {
            return this.set(selectedIndex, this.get(selectedIndex) - 1);
        },
        /**
         * Select the previous item in the list if the widget is visible.
         **/
        previous : function () {
            return this.get("visible") ? this.selectPrevious() : this;
        },
        /**
         * Get the nth item in the list using the itemSelector attr.
         * Note that, for compatibility with NodeList.item(), this is zero-indexed.
         * However, the CSS nth-item selector is one-indexed, so we add 1 to the arg.
         * @param n {Number} The item to retrieve (zero-indexed)
         **/
        item : function (n) {
			return this.get("contentBox")
				.one(this.get("itemSelector").replace(/\{n\}/g, this.get("data")[n].id));
            //return this.get("contentBox")
               // .one(this.get("itemSelector").replace(/\{n\}/g, regexpEscape(n + 1)));
        },
        /**
         * The click handler, set the ACPlugin queryValue to the text of the clicked element,
         * and then hides the widget.
         *
         * @param e {Object} The event object, or anything with a currentTarget.get("text")
         **/
        click : function (e) {
            var self = this,
                ac = self.get("ac"),
                val = e.currentTarget.get("text"),
				id = e.currentTarget.get("id");
			if(id.indexOf('yui') > -1)
				return;
            ac.set(queryValue, val);
			ac.set(queryValue, val);
			var data = self.get("data");
			for(var x =0;x<data.length;x++){
				if(data[x].id == id){
					self.set(selectedIndex, x);
					break;
				}
			}
            self[_selectedIndex] = -1;
            self._currentValue = val;
            ac.get("host").focus();
            self.hide();
        }
    },
    { // statics
        NAME : "ACWidget",
        ATTRS : {
            /**
             * The ACPlugin object to hook into.
             **/
            ac : {
                setter : function (ac) {
                    if (!this[BOUND]) return; // it'll get bound when it renders
                    this.bindUI(ac);
                },
                validator : function (ac) {
                    // TODO: Add some testing here.
                    return true
                }
            },
            /**
             * The data provided by an ac:load event
             **/
            data : {
                validator : function (d) { return d && d.length > 0 }
            },
            /**
             * The query provided along with the data set in an ac:load event.
             * This is used to hilite the items in the list.
             **/
            query : { value : "" },
            /**
             * The total records available for a given query. This may be more than displayed
            **/
            total : { value : 0 },
            /**
             * The markup template for the list of items.
             **/
            listTpl : { value : "<ul>{list}</ul>" },
            /**
             * The item template for each item in the list
             **/
            itemTpl : { value : "<li class=\"yui3-menuitem\" id=\"{id}\"><span class=\"yui3-menuitemlabel\">{hilite}</span></li>" },
            /**
             * The template element for when there are more then options available
            **/
            moreTpl : { value : "<li class=\"yui3-menuitem\"><span class=\"yui3-menuitemlabel more\">{message}</span></li>"},
            /**
             * The CSS selector used to find items in the list.
             * Note that {n} in this case is one-indexed, not zero-indexed.
             **/
            //itemSelector : { value : "ul li:nth-child({n})" },
            itemSelector : { value : "ul li[id=\"{n}\"]" },
            /**
             * The template used to hilite terms
             **/
            hiliteTpl : { value : "<em>{term}</em>" },
            
            moreTxt: { value : 'More hits available if you keep typing!'}
        } // ATTRS
    } // statics
);
/**
 * The item that is selected, for example when the user presses the down arrow to cycle
 * through the available results.
 * 
 * Changing this value causes the ACPlugin to set its queryValue to the new setting.
 * Setting it to -1 makes it go back to what the user had entered.
 * Setting it to less than -1 or greater than the number of items will cause it to wrap around.
 *
 * @attr selectedIndex
 * @for ACWidget
 **/
// don't define this one inline, so that we can compress the key
// 
ACWidget2.ATTRS[selectedIndex] = {
    value : -1,
    // validator should be the name to of an instance method
    validator : function (si) {
        var d = this.get("data");
        return d && Y.Lang.isNumber(si);
    },
    getter : function () { return this[_selectedIndex] },
    setter : function (si) {
        var self = this,
            current = self.get(selectedIndex),
            d = self.get("data"),
            l = d && d.length,
            ac = self.get("ac"),
            selClass = this.getClassName("selected"); //INHERITED
        if (isNaN(current)) current = -1;
        if (!d || !l) return;
        
        // first normalize them both to a number between
        // (-1)..(d.length - 1) where -1 means "what the user typed"
        // this should probably be a function, rather than copy pasta.
        // but for this small a snippet of code, it's fewer bytes to just
        // copy, especially when gzip gets at it.
        while (si < -1) si += l + 1;
        si = (si + 1) % (l + 1) - 1;
        current = (current + 1) % (l + 1) - 1;
                            
        // actually set it, the rest is just monkey business.
        self[_selectedIndex] = si;
        
        // hang onto this, we'll need it later.
        if (current === -1) {
            self[_originalValue] = ac.get(queryValue);
        }
        
        // nothing changing!
        if (current === si) return;
        
        // undo the current one, but only if it's not -1
        var curItem = self.get("contentBox").one("."+selClass);
        if (curItem) curItem.removeClass(selClass);
        
        // handle the new thing
        if (si === -1) {
            // back to the start
            ac.set(queryValue, this[_originalValue]);
        } else {
            var newItem = self.item(si);
            if (newItem) newItem.addClass(selClass);
            ac.set(queryValue, d[si].label);
            self.fire("ac:selectedElement",d[si]);
        }
        return si;
    }
}; // selectedIndex

/**
 * Escape the characters that regexes care about.
 * @private
 **/
//TODO: Feature request (with code) to put this in Lang.
function regexpEscape (text) {
    return (""+text).replace(/([\^\/.*+?|()[\]{}\\])/g, '\\$1');
}



}, '@VERSION@' ,{supersedes:['gallery-ac-widget'], requires:['overlay','gallery-ac-plugin-v2']});
