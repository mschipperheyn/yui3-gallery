YUI.add('gallery-ds-regexcache', function(Y) {

/**
 * Extends DataSource with RegEx caching functionality.
 *
 * @module datasource
 * @submodule gallery-ds-regexcache
 */

/**
 * Adds RegEx cacheability to the DataSource Utility.
 * @class DataSourceRegExCache
 * @extends Cache
 */    
var DataSourceRegExCache = function() {
    DataSourceRegExCache.superclass.constructor.apply(this, arguments);
};

Y.mix(DataSourceRegExCache, {
    /**
     * The namespace for the plugin. This will be the property on the host which
     * references the plugin instance.
     *
     * @property NS
     * @type String
     * @static
     * @final
     * @value "regexcache"
     */
    NS: "regexcache",

    /**
     * Class name.
     *
     * @property NAME
     * @type String
     * @static
     * @final
     * @value "dataSourceRegExCache"
     */
    NAME: "dataSourceRegExCache",

    /////////////////////////////////////////////////////////////////////////////
    //
    // DataSourceRegExCache Attributes
    //
    /////////////////////////////////////////////////////////////////////////////

    ATTRS: {}
});

Y.extend(DataSourceRegExCache, Y.Plugin.Cache, {
    /**
    * Internal init() handler.
    *
    * @method initializer
    * @param config {Object} Config object.
    * @private
    */
    initializer: function(config) {
        this.doBefore("_defRequestFn", this._beforeDefRequestFn);
        this.doBefore("_defResponseFn", this._beforeDefResponseFn);
    },

    /**
     * First look for cached response, then send request to live data.
     *
     * @method _beforeDefRequestFn
     * @param e {Event.Facade} Event Facade with the following properties:
     * <dl>
     * <dt>tId (Number)</dt> <dd>Unique transaction ID.</dd>
     * <dt>request (Object)</dt> <dd>The request.</dd>
     * <dt>callback (Object)</dt> <dd>The callback object.</dd>
     * <dt>cfg (Object)</dt> <dd>Configuration object.</dd>
     * </dl>
     * @protected
     */
    _beforeDefRequestFn: function(e) {
        // Is response already in the Cache?
        var entry = (this.retrieve(e.request)) || null;
        if(entry && entry.response) {
            this.get("host").fire("response", Y.mix({response: entry.response}, e));
            return new Y.Do.Halt("DataSourceRegExCache plugin halted _defRequestFn");
        }
    },
    
    /**
     * Adds data to cache before returning data.
     *
     * @method _beforeDefResponseFn
     * @param e {Event.Facade} Event Facade with the following properties:
     * <dl>
     * <dt>tId (Number)</dt> <dd>Unique transaction ID.</dd>
     * <dt>request (Object)</dt> <dd>The request.</dd>
     * <dt>callback (Object)</dt> <dd>The callback object with the following properties:
     *     <dl>
     *         <dt>success (Function)</dt> <dd>Success handler.</dd>
     *         <dt>failure (Function)</dt> <dd>Failure handler.</dd>
     *     </dl>
     * </dd>
     * <dt>data (Object)</dt> <dd>Raw data.</dd>
     * <dt>response (Object)</dt> <dd>Normalized response object with the following properties:
     *     <dl>
     *         <dt>cached (Object)</dt> <dd>True when response is cached.</dd>
     *         <dt>results (Object)</dt> <dd>Parsed results.</dd>
     *         <dt>meta (Object)</dt> <dd>Parsed meta data.</dd>
     *         <dt>error (Object)</dt> <dd>Error object.</dd>
     *     </dl>
     * </dd>
     * <dt>cfg (Object)</dt> <dd>Configuration object.</dd>
     * </dl>
     * @protected
     */
     _beforeDefResponseFn: function(e) {
        // Add to Cache before returning
        if(e.response && !e.response.cached) {
            e.response.cached = true;
            var regex = null;
            if(e.response.meta.total === e.response.results.length)
            	regex = new RegExp(e.request);
            //this.add(e.request, e.response, (e.callback && e.callback.argument));
            this.add(e.request, e.response, {regex:regex});
        }
     },
	_isMatch: function(request, entry) {
		//We need to make sure that results are also filtered out on the autocomplete side
		var tmp = entry.payload.regex;
		if(tmp != null)
			var tmp = tmp.exec(request);
		return(tmp != null || request === entry.request);
	}
});

Y.namespace('Plugin').DataSourceRegExCache = DataSourceRegExCache;



}, '@VERSION@' ,{requires:['datasource-local','cache-plugin']});
