paste['define']('paste.guid', function (guid) {
    'use strict';

    /**
     * @class module:paste.guid.Guid
     * @return {String}
     * @constructor
     * @static
     */
    guid.Guid = function () {

        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };

        /*jslint bitwise:true */
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    };

    /**
     * @function module:paste.guid.Guid.create
     * @return {String}
     */
    guid.Guid.create = function () {
        return guid.Guid();  // creates a basic uuid
    };
});
paste['define']('paste.oop', function (oop) {
    'use strict';

    var _memberName,
        _scopeDefault,
        _ScopeProxy = function (context, memberName, proxyPrototypeMember) {
            this[memberName] = (function (context, superFunc) {
                return function () {
                    return superFunc.apply(context, arguments);
                };
            }(context, proxyPrototypeMember));
        },
        _scopeFunc,
        _makeScopeFunc = function (memberName, func, proxyPrototypeMember) {
            return function () {
                _scopeDefault = this.base;
                this.base = new _ScopeProxy(this, memberName, proxyPrototypeMember);
                _scopeFunc = func.apply(this, arguments);
                this.base = _scopeDefault;
                return _scopeFunc;
            };
        };

    /**
     *Create a new paste.oop.Class. This is the basis for creating an extendible class definition. See {@link module:paste/oop.Class.create} and {@link module:paste/oop.Class.extend} for correct usage.
     *
     * @class module:paste/oop.Class
     */
    oop.Class = function () {
    };

    /**
     *
     * @function module:paste/oop.Class.create
     * @param members
     * @return {module:paste/oop.Class}
     *
     * @example
     * var MyClassDef = oop.Class.create({
     *     init:function (param) {
     *          this.prop = param;
     *     }
     * });
     * MyClassDef.prototype.dispose = function () {
     *      delete this.prop;
     * };
     * MyClassDef.bind = function (param) {
     *      return new MyClassDef(param);
     * }
     */
    oop.Class.create = function (members) {
        return oop.Class.extend(members);
    };

    /**
     * @function module:paste/oop.Class.extend
     * @param members
     * @return {module:paste/oop.Class}
     * @example
     * var MySubClassDef = MyClassDef.extend({
     *     init : function () {
     *          this.base.init('value');
     *     },
     *     dispose : function () {
     *          delete this._lazyProp;
     *          this.base.dispose();
     *     }
     * });
     * MySubClassDef.prototype.getLazyProp = function () {
     *      if (!this._lazyProp) {
     *          this._lazyProp = 'value';
     *      }
     *
     *      return this._lazyProp;
     * };
     * MySubClassDef.bind = function () {
     *      return new MySubClassDef();
     * }
     */
    oop.Class.extend = function (members) {
        function Class () {
            if (this.init) {
                this.init.apply(this, arguments);
            }
        }

        var SuperClassProxy = function () {
        }, _super = SuperClassProxy.prototype = this.prototype;

        Class.prototype = new SuperClassProxy();
        Class.prototype.constructor = Class;

        for (_memberName in members) {
            if (members.hasOwnProperty(_memberName)) {
                Class.prototype[_memberName] = (typeof members[_memberName] === 'function' && typeof SuperClassProxy.prototype[_memberName] === 'function') ? _makeScopeFunc(_memberName, members[_memberName], SuperClassProxy.prototype[_memberName]) : members[_memberName];
            }
        }

        Class.extend = oop.Class.extend;

        _super = null;
        return Class;
    };
});
paste['define']('paste.util', function (util) {
    'use strict';

    /**
     * Bare bones iterator. Context is supported but at almost a 10x performance decrease. Use with caution
     * In the callback you may return true to break out of the loop
     *
     * @function module:paste/util.each
     * @param array
     * @param {Function} callback
     * @param {Object} context
     *
     */
    util.each = function (array, callback, context) {
        var i = 0,
            len = array.length;

        if (context) {
            for (i; i < len; i += 1) {
                if (callback.call(context, array[i], i)) {
                    break;
                }
            }
        } else {
            for (i; i < len; i += 1) {
                if (callback(array[i], i)) {
                    break;
                }
            }
        }
    };

    util.range = function (begin, end) {
        var i, result = [];
        for (i = begin; i < end; ++i) {
            result.push(i);
        }
        return result;
    };

    /**
     * Merges two objects. Optionally overwrite the target object's properties with the source properties.
     *
     * @function module:paste/util.mixin
     * @param target
     * @param source
     * @param overwrite
     * @return {Object}
     */
    util.mixin = function (target, source, overwrite) {
        target = target || {};
        overwrite = util.parseBoolean(overwrite, false);
        var propName;

        if (!source) {
            return target;
        }

        for (propName in source) {
            if (source.hasOwnProperty(propName)) {
                if (overwrite || !target.hasOwnProperty(propName)) {
                    target[propName] = source[propName];
                }
            }
        }

        return target;
    };

    /**
     * Checks to see if an object has any properties of its own.
     *
     * @function module:paste/util.isEmptyObject
     * @param value
     * @return {Boolean}
     */
    util.isEmptyObject = function (value) {
        if (util.isObject(value) === false) {
            //console.warn('util.isEmptyObject: value is not an object'); // TODO - tom - implement error handling
        }

        for (var name in value) {
            if (value.hasOwnProperty(name)) {
                return false;
            }
        }
        return true;
    };

    /**
     * Trim whitespace
     *
     * @function module:paste/util.trim
     * @param value
     * @return {Boolean}
     */
    util.trim = function (value) {
        return value.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };

    /**
     * Trim whitespace
     *
     * @function module:paste/util.trim
     * @param value
     * @return {Boolean}
     */
    util.trimSafe = function (value) {
        return (util.isString(value)) ? value.replace(/^\s\s*/, '').replace(/\s\s*$/, '') : value;
    };

    /**
     * Tests to see if a string is empty (after being trimmed)
     *
     * @function module:paste/util.isEmptyString
     * @param value
     * @return {Boolean}
     */
    util.isEmptyString = function (value) {
        return (util.isString(value) === false) || !util.trim(value);
    };

    /**
     * Determine whether the argument is an array.
     *
     * @function module:paste/util.isArray
     * @param value
     * @return {Boolean}
     */
    util.isArray = function (value) {
        return typeof(value) === 'array' || (value !== null && typeof(value) === 'object' && value instanceof Array);
    };

    /**
     * Determine whether the argument is a boolean.
     *
     * @function module:paste/util.isBoolean
     * @param value
     * @return {Boolean}
     */
    util.isBoolean = function (value) {
        return typeof(value) === 'boolean' || (value !== null && typeof(value) === 'object' && value instanceof Boolean);
    };

    /**
     * Attempt to convert a value into a boolean
     *
     * @function module:paste/util.parseBoolean
     * @param value
     * @param defaultValue
     * @return {Boolean}
     */
    util.parseBoolean = function (value, defaultValue) {
        var parse = function (val) {
                if (util.isBoolean(val)) {
                    return val;
                } else if (util.isString(val)) {
                    return val.toLowerCase() === 'true';
                } else {
                    return null;
                }
            },
            __ret = parse(value),
            __defaultRet = parse(defaultValue);
        if (__ret !== null) {
            return __ret;
        } else if (__defaultRet !== null) {
            return __defaultRet;
        } else {
            return false;
        }
    };

    /**
     * Determine whether the argument is a function.
     *
     * @function module:paste/util.isFunction
     * @param value
     * @return {Boolean}
     */
    util.isFunction = function (value) {
        return typeof(value) === 'function' || (value !== null && typeof(value) === 'object' && value instanceof Function);
    };

    /**
     * Determine whether the argument is a number.
     *
     * @function module:paste/util.isNumber
     * @param value
     * @return {Boolean}
     */
    util.isNumber = function (value) {
        return !isNaN(value) && (typeof(value) === 'number' || (value !== null && typeof(value) === 'object' && value instanceof Number));
    };

    /**
     * Determine whether the argument is a string.
     *
     * @function module:paste/util.isString
     * @param value
     * @return {Boolean}
     */
    util.isString = function (value) {
        return typeof(value) === 'string' || (value !== null && typeof(value) === 'object' && value instanceof String);
    };

    /**
     * Determine whether the passed string is not empty.
     *
     * @function module:paste/util.isNonEmptyString
     * @param value
     * @return {Boolean}
     */
    util.isNonEmptyString = function (value) {
        return (util.isString(value) === true) && util.trim(value).length > 0;
    };

    /**
     * Determine whether the argument is an object.
     *
     * @function module:paste/util.isObject
     * @param value
     * @return {Boolean}
     */
    util.isObject = function (value) {
        if (!value) {
            return false;
        }
        return(typeof(value) === 'object' || util.isArray(value) || util.isFunction(value));
    };

    /**
     * Determine whether the given object has a valid method.
     *
     * @function module:paste/util.hasMethod
     * @param object
     * @param method
     * @return {Boolean}
     */
    util.hasMethod = function (object, method) {
        return (util.isObject(object) && util.isFunction(object[method]));
    };

    /**
     * Determine whether a value exists within a range
     *
     * @function module:paste/util.numberInRange
     * @param value
     * @param min
     * @param max
     * @return {Boolean}
     */
    util.numberInRange = function (value, min, max) {
        //deprecate .inRange
        return !(value < min || value > max);
    };

    /**
     * Clone a function.
     *
     * @function module:paste/util.cloneFunction
     * @param value
     * @return {Function}
     */
    util.cloneFunction = function (value) {
        if (util.isFunction(value) === false) {
            throw 'Utility.cloneFunction: you passed a value that is not a function';
        }
        var property,
            clonedFunction = function () {
                return value.apply(this, arguments);
            };

        clonedFunction.prototype = value.prototype;
        for (property in value) {
            if (value.hasOwnProperty(property) && property !== 'prototype') {
                clonedFunction[property] = value[property];
            }
        }

        return clonedFunction;
    };

    /**
     * @function module:paste/util.cloneObject
     * @param obj
     * @return {Object}
     */
    util.cloneObject = function (obj) {
        // Handle the 3 simple types, and null or undefined
        if (null === obj || "object" !== typeof obj) { return obj; }
        var copy, len, i, attr;
        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }
        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            len = obj.length;
            for (i = 0; i < len; ++i) {
                copy[i] = this.clone(obj[i]);
            }
            return copy;
        }
        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (attr in obj) {
                if (obj.hasOwnProperty(attr)) { copy[attr] = this.cloneObject(obj[attr]); }
            }
            return copy;
        }
        throw "Unable to copy obj! Its type isn't supported.";
    };

    /**
     * Convert a hyphenated string into camelCase.
     *
     * @function module:paste/util.toCamelCase
     * @param value
     * @return {String}
     */
    util.toCamelCase = function (value) {
        return value.replace(/(\-[a-z])/g, function ($1) {return $1.toUpperCase().replace('-', '');});
    };

    /**
     * Hyphenates a camelCased string.
     *
     * @function module:paste/util.toDashed
     * @param value
     * @return {String}
     */
    util.toDashed = function (value) {
        return value.replace(/([A-Z])/g, function ($1) {return '-' + $1.toLowerCase();});
    };

    /**
     * Converts a camelCased string into an underscored_string.
     *
     * @function module:paste/util.toUnderscored
     * @param value
     * @return {String}
     */
    util.toUnderscored = function (value) {
        return value.replace(/([A-Z])/g, function ($1) {return '_' + $1.toLowerCase();});
    };

    /**
     * Determine whether the given string starts with the given character.
     *
     * @function module:paste/util.stringStartsWith
     * @param string
     * @param value
     * @return {Boolean}
     */
    util.stringStartsWith = function (string, value) {
        //deprecate .startsWith
        return string && string.slice(0, value.length) === value;
    };

    /**
     * Determine whether the given string ends with the given character.
     *
     * @function module:paste/util.stringEndsWith
     * @param string
     * @param value
     * @return {Boolean}
     */
    util.stringEndsWith = function (string, value) {
        //deprecate .endsWith
        return string && string.slice(-value.length) === value;
    };

    /**
     *
     * @function module:paste/util.arrayContains
     * @param {Array}array
     * @param value
     * @return {Boolean}
     */
    util.arrayContains = function (array, value) {
        var i = array.length;

        while (i--) {
            if (array[i] === value) {
                return true;
            }
        }
        return false;
    };

    /**
     * Appends parameters to window.location.search and returns an updated value
     *
     * @function module:paste/util.searchParamsAppend
     * @param url
     * @param parameters
     * @return {String}
     */
    util.searchParamsAppend = function (url, parameters) {
        var parameterString = '',
            empty,
            params,
            curName,
            i,
            length,
            keys;

        if (util.isString(parameters)) {
            parameterString = parameters;
        } else if (util.isObject(parameters)) {
            empty = { };
            params = [];
            i = 0;
            keys = Object.keys(parameters);
            length = keys.length;
            for (i; i < length; i += 1) {
                curName = keys[i];
                if ((typeof(empty[curName]) === "undefined" || parameters[curName] !== empty[curName]) && curName !== "length") {
                    params.push(encodeURIComponent(curName) + "=" + encodeURIComponent(parameters[curName]));
                }
            }

            parameterString = params.join("&");
        }

        if (!parameterString) {
            return url;
        }

        if (!url) {
            return parameterString;
        }

        return url + ( url.indexOf("?") ? "?" : "&" ) + parameterString;
    };

    /**
     * Parses window.location.search and returns a dictionary (object) representation
     *
     * @function module:paste/util.getSearchParams
     * @return {Object}
     */
    util.getSearchParams = function () {
        // deprecate .getQueryParams
        var
            baseQuery = window.location.search,
            subQuery = '',
            queryObj = {},
            i,
            len;
        baseQuery = baseQuery.replace('?', '').split('&');
        len = baseQuery.length;
        for (i = 0; i < len; i++) {
            subQuery = baseQuery[i].split('=');
            queryObj[subQuery[0]] = subQuery[1];
        }
        return queryObj;
    };

    /**
     * Custom implementation of HTML5 dataset because native HTML5 dataset is slow.
     * Reads and stores data attributes on an element only when get or set are first called. The set method will
     * overwrite existing values (if present).
     *
     * Inspired by: http://calendar.perfplanet.com/2012/efficient-html5-data-attributes/
     *
     * @function module:paste/util.dataset
     * @return {Object}
     */
    util.dataset = (function () {
        var storage = {},
            initStarted = false,
            initCompleted = false,
            publicMethods = {
                reset: function () {
                    storage = {};
                },
                set: function (dom, data) {
                    if (!dom.__data) {
                        dom.__data = {};
                    }

                    if (!initStarted && !initCompleted) {
                        init(dom);
                    }

                    storage[dom.__data] = util.mixin(storage[dom.__data], data, true);
                },
                get: function (dom, prop) {
                    if (!initStarted && !initCompleted) {
                        init(dom);
                    }

                    return (prop) ? storage[dom.__data][prop] : storage[dom.__data];
                }
            },
            init = function (element) {
                // go through each attribute and save the value to storage
                initStarted = true;

                util.each(element.attributes, function (att, i) {
                    if (/^data-/.test(att.name)) {
                        var obj = {},
                            prop = util.toCamelCase(att.name.slice(5));

                        obj[prop] = att.value;

                        publicMethods.set(element, obj);
                    }
                });

                initCompleted = true;
            };

        return publicMethods;
    })();
});
paste['define']('polyfills.getcomputedstyle', function () {
    // http://jsfiddle.net/lauckness/Veukg/

    if (!window.getComputedStyle) {
        var CSS_PROP_EXPR = /(\-([a-z]){1})/g,
            PIXEL = /^[\.\d]+(px)?$/i,
            CONTAINS_NUMBER = /^-?\d/,
            _getPixelValue = function(target, value) {
                var __ret = value;
                if (!PIXEL.test(value) && CONTAINS_NUMBER.test(value) && target.runtimeStyle) {
                    var style = target.style.left,
                        runtimeStyle = target.runtimeStyle.left;
                    target.runtimeStyle.left = target.currentStyle.left;
                    target.style.left = value || 0;
                    value = target.style.pixelLeft;
                    target.style.left = style;
                    target.runtimeStyle.left = runtimeStyle;

                    __ret = value + 'px';
                }

                return __ret;

            };

        window.getComputedStyle = function(element, pseudoElt) {
            this.getPropertyValue = function(propertyName) {
                if (propertyName == 'float') {
                    propertyName = 'styleFloat';
                }
                if (CSS_PROP_EXPR.test(propertyName)) {
                    propertyName = propertyName.replace(CSS_PROP_EXPR, function() {
                        return arguments[2].toUpperCase();
                    });
                }
                return element.currentStyle[propertyName] ? _getPixelValue (element, element.currentStyle[propertyName]) : null;
            };
            return this;
        };
    }
});
paste['define']('paste.dom', [
        'paste.util',
        'paste.oop'
    ], function (dom, util, oop) {
        'use strict';

        /*
         * classList.js: Cross-browser full element.classList implementation.
         * 2011-06-15
         *
         * By Eli Grey, http://eligrey.com
         * Public Domain.
         * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
         */

        /*global DOMException */

        /*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

        if (typeof document !== "undefined" && !("classList" in document.createElement("a"))) {

            if (!('HTMLElement' in window) && !('Element' in window)) {
                return;
            }

            var
                classListProp = "classList"
                , protoProp = "prototype"
                , elemCtrProto = (window.HTMLElement || window.Element)[protoProp]
                , objCtr = Object
                , strTrim = String[protoProp].trim || function () {
                    return this.replace(/^\s+|\s+$/g, "");
                }
                , arrIndexOf = Array[protoProp].indexOf || function (item) {
                    var
                        i = 0
                        , len = this.length
                    ;
                    for (; i < len; i++) {
                        if (i in this && this[i] === item) {
                            return i;
                        }
                    }
                    return -1;
                }
                // Vendors: please allow content code to instantiate DOMExceptions
                , DOMEx = function (type, message) {
                    this.name = type;
                    this.code = DOMException[type];
                    this.message = message;
                }
                , checkTokenAndGetIndex = function (classList, token) {
                    if (token === "") {
                        throw new DOMEx(
                            "SYNTAX_ERR"
                            , "An invalid or illegal string was specified"
                        );
                    }
                    if (/\s/.test(token)) {
                        throw new DOMEx(
                            "INVALID_CHARACTER_ERR"
                            , "String contains an invalid character"
                        );
                    }
                    return arrIndexOf.call(classList, token);
                }
                , ClassList = function (elem) {
                    var
                        trimmedClasses = strTrim.call(elem.className)
                        , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
                        , i = 0
                        , len = classes.length
                    ;
                    for (; i < len; i++) {
                        this.push(classes[i]);
                    }
                    this._updateClassName = function () {
                        elem.className = this.toString();
                    };
                }
                , classListProto = ClassList[protoProp] = []
                , classListGetter = function () {
                    return new ClassList(this);
                }
            ;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
            DOMEx[protoProp] = Error[protoProp];
            classListProto.item = function (i) {
                return this[i] || null;
            };
            classListProto.contains = function (token) {
                token += "";
                return checkTokenAndGetIndex(this, token) !== -1;
            };
            classListProto.add = function (token) {
                token += "";
                if (checkTokenAndGetIndex(this, token) === -1) {
                    this.push(token);
                    this._updateClassName();
                }
            };
            classListProto.remove = function (token) {
                token += "";
                var index = checkTokenAndGetIndex(this, token);
                if (index !== -1) {
                    this.splice(index, 1);
                    this._updateClassName();
                }
            };
            classListProto.toggle = function (token) {
                token += "";
                if (checkTokenAndGetIndex(this, token) === -1) {
                    this.add(token);
                } else {
                    this.remove(token);
                }
            };
            classListProto.toString = function () {
                return this.join(" ");
            };

            if (objCtr.defineProperty) {
                var classListPropDesc = {
                    get : classListGetter, enumerable : true, configurable : true
                };
                try {
                    objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                } catch (ex) { // IE 8 doesn't support enumerable:true
                    if (ex.number === -0x7FF5EC54) {
                        classListPropDesc.enumerable = false;
                        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                    }
                }
            } else if (objCtr[protoProp].__defineGetter__) {
                elemCtrProto.__defineGetter__(classListProp, classListGetter);
            }
        }


        var PIXEL = /^[\.\d]+(px)?$/i,
            CONTAINS_NUMBER = /^-?\d/,
            /**
             * @name module:paste/dom~_date
             * @type {Date}
             */
            _date = new Date(),
            /**
             * @name module:paste/dom~$windowStorageKeyPrefix
             * @type {String}
             */
            $windowStorageKeyPrefix = '$JWindowStore-Dom-' + _date.getTime() + '-',
            /**
             * @name module:paste/dom~_html5Supported
             * @type {Boolean}
             */
            _html5Supported = null,
            /**
             * @name module:paste/dom~_html5Elements
             * @type {String[]}
             */
            _html5Elements = ['abbr', 'article', 'aside', 'audio', 'canvas', 'datalist', 'details', 'figcaption', 'figure', 'footer', 'header', 'hgroup', 'mark', 'meter', 'nav', 'output', 'progress', 'section', 'subline', 'summary', 'time', 'video'],
            /**
             * @name module:paste/dom~_html5ProxyDiv
             * @type {HTMLDivElement}
             */
            _html5ProxyDiv = null,

            /**
             * @function module:paste/dom~_getHtml5ProxyDiv
             * @return {HTMLDivElement}
             * @internal
             */
            _getHtml5ProxyDiv = function () {
                if (_html5ProxyDiv === null) {
                    var proxyFrag,
                        length;
                    _html5ProxyDiv = document.createElement('div');
                    _html5ProxyDiv.innerHTML = '<header></header>';

                    proxyFrag = document.createDocumentFragment();
                    length = _html5Elements.length;
                    while (length--) {
                        proxyFrag.createElement(_html5Elements[length]);
                    }
                    proxyFrag.appendChild(_html5ProxyDiv);
                }

                return _html5ProxyDiv;
            };
        /**
         * @function module:paste/dom.getDocumentBody
         * @static
         *
         * @return {HTMLElement}
         */
        dom.getDocumentBody = function () {
            var body = window[$windowStorageKeyPrefix + 'documentBody'];
            if (!body) {
                window[$windowStorageKeyPrefix + 'documentBody'] = body = ((typeof(document.compatMode) === "string" && document.compatMode.indexOf("CSS") >= 0 && document.documentElement) ? document.documentElement : document.body);
            }
            return body;
        };

        /**
         * Tests for HTML5 support by inserting and testing a <header> tag.
         *
         * @function module:paste/dom.getHtml5Supported
         * @static
         *
         * @return {Boolean}
         */
        dom.getHtml5Supported = function () {
            if (_html5Supported === null) {
                var html5Test = document.createElement('div');
                html5Test.innerHTML = '<header></header>';
                _html5Supported = html5Test.childNodes.length > 0;
            }

            return _html5Supported;
        };

        /**
         * @function module:paste/dom.innerHtml5
         * @static
         *
         * @param innerHtml
         * @return {DocumentFragment | String}
         */
        dom.innerHtml5 = function (innerHtml) {
            if (dom.getHtml5Supported()) {
                return innerHtml;
            } else {
                var proxyEl = _getHtml5ProxyDiv(),
                    proxyFrag,
                    length;

                proxyEl.innerHTML = innerHtml;
                length = proxyEl.childNodes.length;
                proxyFrag = document.createDocumentFragment();
                while (length--) {
                    proxyFrag.appendChild(proxyEl.firstChild);
                }

                return proxyFrag;
            }
        };

        /**
         * Returns the number of pixels that the document has already been scrolled horizontally.
         *
         * @function module:paste/dom.getScrollLeft
         * @static
         *
         * @return {Number}
         */

        /**
         * Returns the number of pixels that the document has already been scrolled vertically.
         *
         * @function module:paste/dom.getScrollTop
         * @static
         *
         * @return {Number}
         */

        if (typeof(window.pageXOffset) === "number") {
            dom.getScrollLeft = function () {
                return window.pageXOffset;
            };
            dom.getScrollTop = function () {
                return window.pageYOffset;
            };
        } else if (typeof(dom.getDocumentBody().scrollLeft) === "number") {
            dom.getScrollLeft = function () {
                return dom.getDocumentBody().scrollLeft;
            };
            dom.getScrollTop = function () {
                return dom.getDocumentBody().scrollTop;
            };
        } else {
            dom.getScrollLeft = dom.getScrollTop = function () {
                return NaN;
            };
        }

        /**
         * Returns either the width in pixels of the content of an element or the width of the element itself,
         * whichever is greater.
         *
         * @function module:paste/dom.getScrollWidth
         * @static
         *
         * @return {Number}
         */
        dom.getScrollWidth = function () {
            return dom.getDocumentBody().scrollWidth;
        };

        /**
         * Returns the height of an element's content including content not visible on the screen due to overflow.
         * It includes the element padding but not its margin.
         *
         * @function module:paste/dom.getScrollHeight
         * @static
         *
         * @return {Number}
         */
        dom.getScrollHeight = function () {
            return dom.getDocumentBody().scrollHeight;
        };

        /**
         * Returns the width (in pixels) of the browser window viewport including, if rendered, the vertical scrollbar.
         *
         * @function module:paste/dom.getViewportWidth
         * @static
         *
         * @return {Number}
         */

        /**
         * Returns the height (in pixels) of the browser window viewport including, if rendered, the horizontal scrollbar.
         *
         * @function module:paste/dom.getViewportHeight
         * @static
         *
         * @return {Number}
         */
        if (typeof(window.innerWidth) === "number") {
            dom.getViewportHeight = function () {
                return window.innerHeight;
            };
            dom.getViewportWidth = function () {
                return window.innerWidth;
            };
        } else if (typeof(dom.getDocumentBody().clientWidth) === "number") {
            dom.getViewportHeight = function () {
                return dom.getDocumentBody().clientHeight;
            };
            dom.getViewportWidth = function () {
                return dom.getDocumentBody().clientWidth;
            };
        } else {
            dom.getViewportHeight = dom.getViewportWidth = function () {
                return NaN;
            };
        }

        /**
         * Gets the computed style for a CSS property
         *
         * @function module:paste/dom.getComputedStyle
         * @static
         *
         * @param element
         * @param property
         *
         */
        dom.getComputedStyle = function (element, property, pseudoEl) {
            if (window.getComputedStyle) {
                // Standards-compliant (IE9+)
                return window.getComputedStyle(element, pseudoEl || null).getPropertyValue(property);
            } else if (element.currentStyle) {
                // IE 8-
                return element.currentStyle[property];
            }

            return false;
        };

        /**
         * Show an element using its CSS display property.
         *
         * @function module:paste/dom.show
         * @static
         *
         * @param element
         *
         */
        dom.show = function (element) {
            var displayKey = '$' + _date + ' _dom_hide_display',
                value = element[displayKey];
            element.style.display = value || 'block';
            if (value) {
                delete element[displayKey];
            }
        };

        /**
         * Hide an element using its CSS display property.
         *
         * @function module:paste/dom.hide
         * @static
         *
         * @param element
         *
         */
        dom.hide = function (element) {
            if (element.style.display !== 'none') {
                element['$' + _date + ' _dom_hide_display'] = element.style.display;
                element.style.display = 'none';
            }
        };

        /**
         * Returns the first element within the document that matches the specified group of selectors. IE8+
         *
         * @function module:paste/dom.querySelector
         * @static
         *
         * @param selector
         * @param parent
         * @return {*}
         *
         * @todo Implement parent filtering
         */
        dom.querySelector = function (selector, parent) {
            if (document.querySelector) {
                return (parent || document).querySelector(selector);
            }

            return null;
        };

        /**
         * Returns a list of the elements within the document that match the specified group of selectors. IE8+
         *
         * @function module:paste/dom.querySelectorAll
         * @static
         *
         * @param selector
         * @param parent
         * @return {*}
         *
         * @todo Implement parent filtering
         */
        dom.querySelectorAll = function (selector, parent) {
            if (document.querySelectorAll) {
                return (parent || document).querySelectorAll(selector);
            }

            return [];
        };

        /**
         * Alias for the get method.
         *
         * @function module:paste/dom.get
         * @static
         *
         * @see module:paste/dom.getElement
         */

        /**
         * Returns an element or element list based on the selector being passed.
         * Uses getElementById or querySelectorAll.
         *
         * @function module:paste/dom.getElement
         * @static
         *
         * @param {String} idOrSelector
         * @param {Boolean | HTMLElement} isQueryOrParent
         *
         * @example
         * Get element list based on a class, limiting the search to the specified element.
         * dom.get('.my-class', myContainingElement);
         *
         * Get element based on an id. Note: do not use a hash when querying for an id.
         * dom.get('my-div');
         *
         * Get element list based on a class from the document. Passing true is necessary for class and tag searches.
         * dom.get('.my-class', true);
         * dom.get('section', true);
         */
        dom.get = dom.getElement = function (idOrSelector, isQueryOrParent) {
            // warning: for mobile, just use document.getElementById
            // do not use #my-id if you are just getting the id, please just use 'my-id'
            if (!isQueryOrParent) {
                return document.getElementById(idOrSelector);
            } else if (true === isQueryOrParent) {
                return dom.querySelectorAll(idOrSelector);
            } else {
                return dom.querySelectorAll(idOrSelector, isQueryOrParent);
            }
        };

        /**
         * Scans for the existence of an element by scanning up the DOM tree.
         *
         * @function module:paste/dom.elementExists
         * @static
         *
         * @param {HTMLElement} element
         * @return {Boolean}
         */
        dom.elementExists = function (element) {
            var html = document.body.parentNode;
            while (element) {
                if (element === html) {
                    return true;
                }
                element = element.parentNode;
            }
            return false;
        };

        /**
         * Strips the hash tag from the an id string.
         * E.g. #my-id -> my-id.
         *
         * @function module:paste/dom.stripIdHash
         * @static
         *
         * @param {String} elementId
         * @return {String}
         */
        dom.stripIdHash = function (elementId) {
            if (elementId.charAt(0) === '#') {
                return elementId.slice(1);
            }
            return elementId;
        };

        /**
         * Checks whether an element is contained within another element.
         *
         * @function module:paste/dom.contains
         * @static
         *
         * @param {HTMLElement} parent
         * @param {HTMLElement} child
         * @return {Boolean}
         */
        dom.contains = function (parent, child) {
            if (!parent) {
                return false;
            }

            while (parent) {
                if (parent === child) {
                    return true;
                }

                try {
                    child = child.parentNode;
                    if (!child.tagName || child.tagName.toUpperCase() === "BODY") {
                        break;
                    }
                } catch (ex) {
                    break;
                }
            }

            return false;
        };

        /**
         * Checks whether an element contains a class. IE8+ (via a polyfill)
         *
         * @function module:paste/dom.hasCssClass
         * @static
         *
         * @deprecated Use element.classList.contains
         *
         * @param {HTMLElement} element
         * @param {String} className
         * @return {Boolean}
         */
        dom.hasCssClass = function (element, className) {
            if (!element || !element.classList) {
                return false;
            }

            if (!className) {
                return false;
            }

            return element.classList.contains(className);
        };

        /**
         * Removes a class from an element. IE8+ (via a polyfill)
         *
         * @function module:paste/dom.removeCssClass
         * @static
         *
         * @deprecated Use element.classList.remove
         *
         * @param {HTMLElement} element
         * @param {String} className
         * @return {Boolean}
         */
        dom.removeCssClass = function (element, className) {
            if (!element || !element.classList) {
                return false;
            }
            if (!className) {
                return false;
            }

            element.classList.remove(className);
            return true;
        };

        /**
         * Add a class to an element. IE8+ (via a polyfill)
         *
         * @function module:paste/dom.addCssClass
         * @static
         *
         * @deprecated Use element.classList.add
         *
         * @param {HTMLElement} element
         * @param {String} className
         * @param {Boolean} checkExisting
         * @return {Boolean}
         */
        dom.addCssClass = function (element, className, checkExisting) {
            if (!element || !element.classList) {
                return false;
            }
            if (!className) {
                return false;
            }

            element.classList.add(className);
            return true;
        };

        /**
         * Add or remove a class based on its presence. IE8+ (via a polyfill)
         *
         * @function module:paste/dom.toggleCssClass
         * @static
         *
         * @deprecated Use element.classList.toggle
         *
         * @param {HTMLElement} element
         * @param {String} className
         * @return {Boolean}
         */
        dom.toggleCssClass = function (element, className) {
            if (!element || !element.classList) {
                return false;
            }
            if (!className) {
                return false;
            }

            element.classList.toggle(className);
            return true;
        };

        /**
         * Returns a document fragment containing the markup passed as a string.
         *
         * @function module:paste/dom.createFragment
         * @static
         *
         * @param {String} string
         * @param {String} [proxyElementType='div'] proxyElementType
         * @return {DocumentFragment}
         */
        dom.createFragment = function (string, proxyElementType) {
            var frag = document.createDocumentFragment(),
                proxy = document.createElement(proxyElementType || 'div');
            proxy.innerHTML = string;

            while (proxy.firstChild) {
                frag.appendChild(proxy.firstChild);
            }

            return frag;
        };

        /**
         * Returns a pixel value for an element's property
         *
         * @function module:paste/dom.getPixelValue
         * @static
         *
         * @param {HTMLElement} target
         * @param {String} value
         * @return {DocumentFragment}
         */
        dom.getPixelValue = function(target, value) {
            var __ret = value;
            if (!PIXEL.test(value) && CONTAINS_NUMBER.test(value) && target.runtimeStyle) {
                var style = target.style.left,
                    runtimeStyle = target.runtimeStyle.left;
                target.runtimeStyle.left = target.currentStyle.left;
                target.style.left = value || 0;
                value = target.style.pixelLeft;
                target.style.left = style;
                target.runtimeStyle.left = runtimeStyle;

                __ret = value + 'px';
            }

            return __ret;

        };

        /**
         * @class module:paste/dom.Point
         * @augments module:paste/oop.Class
         * @static
         *
         * @param {Number} [x=0]
         * @param {Number} [y=0]
         */
        dom.Point = oop.Class.create({
            init : function (x, y) {
                this.x = x || 0;
                this.y = y || 0;
            },

            /**
             * @function module:paste/dom.Point#combine
             * @param {module:paste/dom.Point} point
             * @return {module:paste/dom.Point}
             */
            combine : function (point) {
                return new dom.Point(
                    this.x += point.x,
                    this.y += point.y
                );
            }
        });

        /**
         * @function module:paste/dom.Point.fromJQuery
         * @static
         *
         * @param {Object} jQueryPosition
         * @property {Number} jQueryPosition.left
         * @property {Number} jQueryPosition.top
         * @return {module:paste/dom.Point}
         */
        dom.Point.fromJQuery = function (jQueryPosition) {
            return new dom.Point(jQueryPosition.left, jQueryPosition.top);
        };

        /**
         * @class module:paste/dom.Size
         * @augments module:paste/oop.Class
         * @static
         *
         * @param {Number} [width=0]
         * @param {Number} [height=0]
         */
        dom.Size = oop.Class.create({
            init : function (width, height) {
                this.width = width || 0;
                this.height = height || 0;
            }
        });

        /**
         * @function module:paste/dom.Size.fromElement
         * @static
         *
         * @param {HTMLElement} element
         * @return {module:paste/dom.Size}
         */
        dom.Size.fromElement = function (element) {
            if (!element) {
                return new dom.Size();
            }

            return new dom.Size(element.offsetWidth, element.offsetHeight);
        };

        /**
         * @class module:paste/dom.Bounds
         * @augments module:paste/oop.Class
         * @static
         *
         * @param {Number} [left=0]
         * @param {Number} [top=0]
         * @param {Number} [width=0]
         * @param {Number} [height=0]
         */
        dom.Bounds = oop.Class.create({
            init : function (left, top, width, height) {
                this.left = left || 0;
                this.top = top || 0;
                this.width = width || 0;
                this.height = height || 0;
            },

            /**
             * @function module:paste/dom.Bounds#getRight
             * @return {Number}
             */
            getRight : function () {
                return this.left + this.width;
            },

            /**
             * @function module:paste/dom.Bounds#getBottom
             * @return {Number}
             */
            getBottom : function () {
                return this.top + this.height;
            },

            /**
             * @function module:paste/dom.Bounds#contains
             *
             * @param {Object} point
             * @property {Number} point.x
             * @property {Number} point.y
             *
             * @return {Boolean}
             */
            contains : function (point) {
                if ((this.top > point.y) || (this.getBottom() < point.y)) {
                    return false;
                }

                return !((this.left > point.x) || (this.getRight() < point.x));
            }
        });

        /**
         * @function module:paste/dom.Bounds.fromElement
         * @static
         *
         * @param {HTMLElement} element
         * @return {module:paste/dom.Bounds}
         */
        dom.Bounds.fromElement = function (element) {
            if (!element || element.style.display === "none") {
                return new dom.Bounds();
            }

            var box,
                bounds;
            if (element.getBoundingClientRect) {
                try {
                    if (element.tagName === "HTML") {
                        return new dom.Bounds();
                    }

                    box = element.getBoundingClientRect();
                    return new dom.Bounds(
                        box.left - dom.getDocumentBody().clientLeft + dom.getScrollLeft(),
                        box.top - dom.getDocumentBody().clientTop + dom.getScrollTop(),
                        element.offsetWidth,
                        element.offsetHeight);
                } catch (boundingEx) {
//                log.warn(boundingEx);
                }
            }

            // old firefox hack
            if (document.getBoxObjectFor) {
                try {
                    box = document.getBoxObjectFor(element);
                    return new dom.Bounds(box.x, box.y, element.offsetWidth, element.offsetHeight);
                } catch (boxObjEx) {
//                log.warn(boxObjEx);
                }
            }

            bounds = new dom.Bounds(element.offsetLeft, element.offsetTop, element.offsetWidth, element.offsetHeight);
            try {
                while ((element = element.offsetParent) !== null) {
                    bounds.left += element.offsetLeft;
                    bounds.top += element.offsetTop;

                    if (element === document.body) {
                        break;
                    }
                }
            } catch (boundsEx) {
//            log.warn(boundsEx);
            }

            return bounds;
        };

        /**
         * @class module:paste/dom.MarkupWriter
         * @augments module:paste/oop.Class
         * @static
         *
         * @property {Array} writer
         */
        dom.MarkupWriter = oop.Class.create({
            init : function () {
                this.writer = [];
            },

            /**
             * @function module:paste/dom.MarkupWriter#toString
             * @return {String}
             */
            toString : function () {
                return this.writer.join('');
            },

            /**
             * @function module:paste/dom.MarkupWriter#toFragment
             * @return {DocumentFragment}
             */
            toFragment : function () {
                return dom.createFragment(this.toString());
            },

            /**
             * @function module:paste/dom.MarkupWriter#push
             * @param {String} string
             */
            push : function (string) {
                this.writer.push(string);
            },

            /**
             * @function module:paste/dom.MarkupWriter#append
             * @param {String} string
             */
            append : function (string) {
                this.push(string);
            },

            /**
             * @function module:paste/dom.MarkupWriter#clear
             */
            clear : function () {
                this.dispose();
                this.writer = [];
            },

            /**
             * @function module:paste/dom.MarkupWriter#dispose
             */
            dispose : function () {
                var reset = this.reset;
                this.writer = reset;
                delete this.writer;
            },

            /**
             * @function module:paste/dom.MarkupWriter#length
             * @return {Number}
             */
            length : function () {
                return this.writer.length;
            },

            /**
             * @function module:paste/dom.MarkupWriter#isEmpty
             * @return {Boolean}
             */
            isEmpty : function () {
                return this.writer.length === 0;
            }
        });

        /**
         * @function module:paste/dom.MarkupWriter.create
         * @static
         *
         * @return {module:paste/dom.MarkupWriter}
         */
        dom.MarkupWriter.create = function () {
            return new dom.MarkupWriter();
        };
    });
paste['define']('paste.event', ['paste.guid', 'paste.util'], function (event, guid, util) {
    'use strict';

    var IE_EVENTS = {
            'blur' : null,
            'change' : null,
            'click' : null,
            'contextmenu' : null,
            'copy' : null,
            'cut' : null,
            'dblclick' : null,
            'error' : null,
            'focus' : null,
            'focusin' : null,
            'focusout' : null,
            'hashchange' : null,
            'keydown' : null,
            'keypress' : null,
            'keyup' : null,
            'load' : null,
            'mousedown' : null,
            'mouseenter' : null,
            'mouseleave' : null,
            'mousemove' : null,
            'mouseout' : null,
            'mouseover' : null,
            'mouseup' : null,
            'mousewheel' : null,
            'paste' : null,
            'reset' : null,
            'resize' : null,
            'scroll' : null,
            'select' : null,
            'submit' : null,
            'textinput' : null,
            'unload' : null,
            'wheel' : null
        },

        getEventTarget = function (e) {
            var element = null;
            if (e.target) {
                element = e.target;
            } else if (e.srcElement) {
                element = e.srcElement;
            }
            return element;
        },

        // linkages
        $createGuid = guid['Guid']['create'],
        $isString = util['isString'],
        $isEmptyString = util['isEmptyString'],
        $hasMethod = util['hasMethod'],
        $parseBoolean = util['parseBoolean'],
        $addEventListenerSupport = window.addEventListener ? true : false,

        createEventSupport = document.createEvent ? true : false,
        createEventObjectSupport = document.createEventObject ? true : false,
        moduleGuid = $createGuid();

    /**
     *
     * @param $arguments
     * @constructor
     */
    function PasteEventData($arguments) {
        if ($arguments && $arguments.length === 1) {
            $arguments = $arguments[0];
        }

        this.idemId = $createGuid();
        this['data'] = $arguments;
    }

    /**
     *
     * @param defaultContext
     * @param eventName
     * @param bubbles
     * @param cancelable
     * @constructor
     */
    function PasteEvent(defaultContext, eventName, bubbles, cancelable) {
        this.eventName = ($isString(eventName) && $isEmptyString(eventName) === false) ? eventName : ('$pasteEvent-' + $createGuid());

        if (defaultContext && defaultContext['nodeType']) {
            this.dispatchContext = defaultContext;
        } else if (createEventSupport) {
            this.dispatchContext = document;
        } else {
            this.dispatchContext = document.documentElement;
        }

        this.defaultContext = defaultContext || window;

        this.subscriptions = {};

        if (createEventSupport) {
            this.eventProxy = document.createEvent('Event');
            this.eventProxy.initEvent(this.eventName, $parseBoolean(bubbles), $parseBoolean(cancelable, true));
            this.eventProxy['pasteEvent'] = new PasteEventData(null);
        } else if (createEventObjectSupport) {
            this.eventProxy = document.createEventObject();
            this.eventProxy['pasteEvent'] = new PasteEventData(null);
        } else {
            throw (new Error('Fatal event error'));
        }
    }

    /**
     *
     * @param eventName
     * @param element_or_eventContext
     * @param method
     * @param context
     * @param executeCount
     * @constructor
     */
    function PasteSubscription(eventName, element_or_eventContext, method, context, executeCount) {
        var guid = $createGuid(),
            $ieEventName,
            $ieListenerHandler;

        if ($isString(method) && context) {
            method = context[method];
        }

        if (executeCount === true) {
            executeCount = 1;
        }

        if ((element_or_eventContext && element_or_eventContext['nodeType']) || element_or_eventContext === window) {
            this.eventContext = element_or_eventContext;
        } else {
            this.eventContext = ((createEventSupport) ? document : document.documentElement);
        }

        this.guid = guid;

        if ($hasMethod(eventName, 'getEventName')) {
            this.eventName = eventName['getEventName']();
            this.eventUnsubscribe = (function ($pasteEvent, guid) {
                return function ($removeFunc) {
                    if ($removeFunc && $removeFunc === $pasteEvent['remove']) {
                        return;
                    }
                    $pasteEvent['remove'](guid);
                };
            }(eventName, guid));
        } else {
            this.eventName = eventName;
            this.eventUnsubscribe = function () {
            };
        }

        this.pasteEventIdem = '';
        this.method = method;
        this.context = context;
        this.executeCount = executeCount || 0;
        this._isBound = true;
        this.listenerHandler = (function ($this) {
            return function ($domEvent) {
                var remove = ($this.executeCount -= 1) === 0,
                    idemId,
                    eventArg,
                    $pasteEvent,
                    $pasteEventData,
                    element;

                if ($this._isBound === false) {
                    return;
                }

                eventArg = $domEvent;

                if (!eventArg) {
                    eventArg = window.event;
                }

                if (remove) {
                    $this._isBound = false;
                }

                // stupid IE <= 8 hack
                if (!eventArg.preventDefault) {
                    eventArg.preventDefault = function () {
                        eventArg.returnValue = false;
                    };
                }

                // stupid IE <= 8 hack
                if (!eventArg.stopPropagation) {
                    eventArg.stopPropagation = function () {
                        eventArg.cancelBubble = false;
                    };
                }

                // stupid IE <= 8 hack
                if (!eventArg.target) {
                    eventArg.target = eventArg.srcElement;
                }

                // stupid IE <= 8 hack
                if (!eventArg.currentTarget) {
                    eventArg.currentTarget = eventArg.srcElement;
                }

                $pasteEvent = eventArg['pasteEvent'] || null;

                if ($pasteEvent) {
                    idemId = $pasteEvent.idemId;
                    $pasteEventData = $pasteEvent['data'];
                    if ($this.pasteEventIdem === idemId) {
                        $pasteEventData = null;
                    } else {
                        $this.pasteEventIdem = idemId;
                    }
                }
                if ($this.context) {
                    $this.method.call($this.context, eventArg, $pasteEventData);
                } else {
                    $this.method(eventArg, $pasteEventData);
                }

                if (remove) {
                    $this['remove']();
                }
            };
        }(this));

        if ($addEventListenerSupport) {
            this.eventContext.addEventListener(this.eventName, this.listenerHandler, false);
        } else if (window.attachEvent) {
//            console.log('Subscribing: ' + this.eventName)
            if ($hasMethod(eventName, 'getEventName')) {
//                console.log('event wrapper sub');
                $ieEventName = eventName.getEventName();
                $ieListenerHandler = util['cloneFunction'](this.listenerHandler);
                delete this.listenerHandler;

                this.listenerHandler = (function ($this, $eventName) {
                    return function (e) {
                        var eventName = e.type,
                            canFireHandler = false;

//                        console.log('handler for: ' + $eventName + '; type=' + eventName + '; propName=' + e.propertyName)
                        if ($eventName === eventName) {
                            canFireHandler = true;
//                            console.log('REGULAR DOM EVENT TRIGGERED')
                        } else if ($eventName === e.propertyName && $eventName + '$pasteEvent' in e.srcElement) {
                            e['pasteEvent'] = e.srcElement[$eventName + '$pasteEvent'];
                            canFireHandler = true;
//                            console.log('CUSTOM EVENT TRIGGERED')
                        }

                        if (canFireHandler) {
//                            console.log('firing handler')
                            $ieListenerHandler.apply($this, arguments);
                        }
                    };
                }(this, $ieEventName));

                if (IE_EVENTS.hasOwnProperty($ieEventName)) {
                    this.eventName = 'on' + $ieEventName;
                    this.eventContext.attachEvent(this.eventName, this.listenerHandler);
                }
//                console.log(this.eventContext);
                this.eventContext[guid + '$eventName'] = 'onpropertychange';
                this.eventContext.attachEvent(this.eventContext[guid + '$eventName'], this.listenerHandler);

//                console.log('end event wrap sub');
            } else {
//                console.log('regular sub');
                this.eventName = 'on' + eventName;
                this.eventContext.attachEvent(this.eventName, this.listenerHandler);
            }
        }
    }

    PasteSubscription.prototype._removeEventListener = function () {
        if ($addEventListenerSupport) { /*ignore-this-jslint-error*/
            this.eventContext.removeEventListener(this.eventName, this.listenerHandler, false);
        } else if (window.attachEvent) {
            var eventPropertyName = this.guid + '$eventName';
            if (this.eventContext[eventPropertyName]) {
//                    console.log('detaching (' + this.guid + '$eventName): ' + this.eventContext[eventPropertyName]);
                this.eventContext.detachEvent(this.eventContext[eventPropertyName], this.listenerHandler);
                delete this.eventContext[eventPropertyName];
            }
            this.eventContext.detachEvent(this.eventName, this.listenerHandler);
        }
    };

    PasteSubscription.prototype['getGuid'] = function () {
        return this.guid;
    };
    PasteSubscription.prototype['remove'] = function ($removeFunc) {
        this._removeEventListener();
        this.eventUnsubscribe($removeFunc);

        delete this.listenerHandler;
        delete this.eventName;
        delete this.method;
        delete this.context;
        delete this.executeCount;
        delete this._isBound;
    };
    PasteSubscription.prototype['dispose'] = PasteSubscription.prototype['remove'];
    PasteSubscription.prototype['attach'] = function () {
        if (this._isBound) {
            return false;
        }

        this._isBound = true;
        return true;
    };
    PasteSubscription.prototype['detach'] = function () {
        if (!this._isBound) {
            return false;
        }

        this._isBound = false;
        return true;
    };
    PasteSubscription.prototype['isBound'] = function () {
        return this._isBound;
    };
    PasteEvent.prototype['getEventName'] = function () {
        return this.eventName;
    };
    PasteEvent.prototype['remove'] = function (subscription_or_guid) {
        if ($hasMethod(subscription_or_guid, 'getGuid')) {
            var guid = subscription_or_guid['getGuid']();
            subscription_or_guid['remove'](this['remove']);
            delete this.subscriptions[guid];
        } else if ($isString(subscription_or_guid)) {
            this.subscriptions[subscription_or_guid]['remove'](this['remove']);
            delete this.subscriptions[subscription_or_guid];
        }
    };
    PasteEvent.prototype['fire'] = function () {
        if (createEventSupport) {
            this.eventProxy['pasteEvent'] = new PasteEventData(arguments || null);
            this.dispatchContext.dispatchEvent(this.eventProxy);
        } else if (createEventObjectSupport) {
            var eventName = this.eventName,
                dispatchContext;

//            console.log('calling ev fire: ' + this.eventName);
            try {
                this.eventProxy['pasteEvent'] = new PasteEventData(arguments || null);
                this.defaultContext['fireEvent']('on' + eventName, this.eventProxy);
            } catch (e) {
//                console.log('failed ev fire: ' + eventName);
//                console.log(this.dispatchContext)
                this.dispatchContext[eventName + '$pasteEvent'] = new PasteEventData(arguments || null);
                dispatchContext = this.dispatchContext[eventName];
                if (dispatchContext) {
//                    console.log('failed increment')
                    this.dispatchContext[eventName] += 1;
                } else {
//                    console.log('failed create')
                    this.dispatchContext[eventName] = 1;
                }

//                console.log(this.dispatchContext[eventName])
            }
//            console.log('completed ev fire: ' + eventName);
            eventName = null;
        }
    };
    PasteEvent.prototype['subscribe'] = function (method, context, executeCount) {
        var subscription = new PasteSubscription(this, this.dispatchContext, method, context || this.defaultContext, executeCount),
            subscriptionGuid = subscription['getGuid']();
        this.subscriptions[subscriptionGuid] = subscription;
        return this.subscriptions[subscriptionGuid];
    };
    PasteEvent.prototype['bind'] = PasteEvent.prototype['subscribe'];
    PasteEvent.prototype['dispose'] = function () {
        var keys = Object.keys(this.subscriptions),
            i,
            len = keys.length;
        for (i = 0; i < len; i += 1) {
            this['remove'](keys[i]);
        }

        delete this.eventProxy;
        delete this.dispatchContext;
        delete this.defaultContext;
        delete this.subscriptions;
        delete this.eventName;
        delete this.eventProxy;
    };

    event['bind'] = function (eventName, element_or_eventContext, method, context, executeCount) {
        return new PasteSubscription(eventName, element_or_eventContext, method, context, executeCount);
    };
    event['getEventTarget'] = getEventTarget;
    event['DocumentEvent'] = {
        'loaded' : function (method, context, executeCount) {
            if (!window[moduleGuid + '$pasteEvent$onLoad']) {
                window[moduleGuid + '$pasteEvent$onLoad'] = new PasteEvent();
                if (document.readyState.toLowerCase() === 'loaded' || document.readyState.toLowerCase() === 'complete') {
                    var timeout = window.setTimeout(function () {
                        window[moduleGuid + '$pasteEvent$onLoad']['fire']();
                        window.clearTimeout(timeout);
                        timeout = null;
                    }, 0);
                } else if (!document.addEventListener && document.attachEvent) {
                    if (document.readyState) {
                        document.attachEvent('onreadystatechange', function () {
                            if (document.readyState.toLowerCase() === 'loaded' || document.readyState.toLowerCase() === 'complete') {
                                window[moduleGuid + '$pasteEvent$onLoad']['fire']();
                            }
                        });
                    } else {
                        document.attachEvent('onload', function () {
                            window[moduleGuid + '$pasteEvent$onLoad']['fire']();
                        });
                    }
                } else if (document.addEventListener) {
                    window.addEventListener('load', function () {
                        window[moduleGuid + '$pasteEvent$onLoad']['fire']();
                    });
                }
            }
            return window[moduleGuid + '$pasteEvent$onLoad']['subscribe'](method, context, executeCount);
        }
    };
    event['Event'] = PasteEvent;
    event['Event']['getEventTarget'] = getEventTarget;
    event['Event']['Subscription'] = event['Subscription'] = PasteSubscription;
});
paste['define']('paste.ui.form.validity', [
        'paste.event',
        'paste.dom'
    ], function (module, event, dom) {
        /*
         * Emulate validity for some browsers
         * http://dev.w3.org/html5/spec/constraints.html#validitystate
         */

        if ('validity' in document.createElement('input')) {
            return function (el) {
            }; // no op
        }

        var fireInvalidEvent = function fireInvalidEvent(element) {
                var invalidEvent = new event['Event'](
                    element,
                    'invalid',
                    true,
                    true
                );
                invalidEvent['fire']();
                invalidEvent['dispose']();
                invalidEvent = null;
            },
            parseBoolean = function (value, defaultValue) {
                var parse = function (val) {
                        if (typeof(val) === 'boolean' || (val !== null && typeof(val) === 'object' && val instanceof Boolean)) {
                            return val;
                        } else if (typeof(val) === 'string' || (val !== null && typeof(val) === 'object' && val instanceof String)) {
                            return val.toLowerCase() === 'true';
                        } else {
                            return null;
                        }
                    },
                    __ret = parse(value),
                    __defaultRet = parse(defaultValue);
                if (__ret !== null) {
                    return __ret;
                } else if (__defaultRet !== null) {
                    return __defaultRet;
                } else {
                    return false;
                }
            }, html5InputPatterns = {
                datetime: /^\s*\S/, // whitespace check for now
                'datetime-local': /^\s*\S/, // whitespace check for now
                date: /\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/,
                month: /^\s*\S/, // whitespace check for now
                time: /^\s*\S/, // whitespace check for now
                week: /^\s*\S/, // whitespace check for now
                number: /-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?/,
                range: /^\s*\S/, // whitespace check for now
                email: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                url: /\b(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|$!:,.;]*[A-Z0-9+&@#\/%=~_|$]/i, // whitespace check for now
                search: /^\s*\S/, // whitespace check for now
                tel: /^\s*\S/, // whitespace check for now
                color: /^\s*\S/, // whitespace check for now
                file: /^(?:[\w]\:|\\)(\\[A-Za-z_\-\s0-9\.]+)+\.(png|jpg|jpeg)$/ //check for correct image type
            },
            $math = Math,
            $rand = $math['random'],
            S4 = function S4() {
                return (((1 + $rand()) * 0x10000) | 0)['toString'](16)['substring'](1);
            },
            bootstrappedKey = 'validityBootstrapped' + (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4()),
            bootstrap = function bootstrap(el) {
                if ('validity' in el || el[bootstrappedKey]) {
                    return;
                }


                if (el.nodeType === Node.ELEMENT_NODE && el.nodeName.toLowerCase() === 'form') {
                    if (el['checkValidity']) {
                        return;
                    }
                    el['checkValidity'] = (function ($el) {
                        return function () {
                            var formElements = dom['querySelectorAll'](
                                    'button,input,select,textarea',
                                    $el
                                ),
                                formElementsLen = formElements['length'],
                                isValid = true;

                            while (formElementsLen --) {
                                bootstrap(formElements[formElementsLen]);
                                if (!formElements[formElementsLen]['checkValidity']()) {
                                    isValid = false;
                                    break;
                                }
                            }

                            return isValid;
                        };
                    }(el));
                } else if (el.nodeType === Node.ELEMENT_NODE) {

                    // todo: support custom patterns
                    /*
                     input type=datetime – global date-and-time input control NEW
                     input type=datetime-local – local date-and-time input control NEW
                     input type=date – date input control NEW
                     input type=month – year-and-month input control NEW
                     input type=time – time input control NEW
                     input type=week – year-and-week input control NEW
                     input type=number – number input control NEW
                     input type=range – imprecise number-input control NEW
                     input type=email – e-mail address input control NEW
                     input type=url – URL input control NEW
                     input type=search – search field NEW
                     input type=tel – telephone-number-input field NEW
                     input type=color – color-well control NEW
                     */

                    // do check here
                    if (!el['validity']) {
                        el['validity'] = new window['ValidityState']();
                    }
                    if (el['checkValidity']) {
                        return;
                    }
                    el['checkValidity'] = (function ($el) {
                        return function () {
                            /*
                             Suffering from being missing
                             When a control has no value but has a required attribute (input required, select required, textarea required), or, in the case of an element in a radio button group, any of the other elements in the group has a required attribute.

                             Suffering from a type mismatch
                             When a control that allows arbitrary user input has a value that is not in the correct syntax (E-mail, URL).

                             Suffering from a pattern mismatch
                             When a control has a value that doesn't satisfy the pattern attribute.

                             Suffering from being too long
                             When a control has a value that is too long for the form control maxlength attribute (input maxlength, textarea maxlength).

                             Suffering from an underflow
                             When a control has a value that is too low for the min attribute.

                             Suffering from an overflow
                             When a control has a value that is too high for the max attribute.

                             Suffering from a step mismatch
                             When a control has a value that doesn't fit the rules given by the step attribute.

                             Suffering from a custom error
                             When a control's custom validity error message (as set by the element's setCustomValidity() method) is not the empty string.
                             */

                            var type = ($el.type) ? $el.type.toLowerCase() : null,
                                value,
                                selectedOptions,
                                i,
                                form,
                                radioElements,
                                length,
                                keys,
                                keysLen;

                            if ($el.nodeName.toLowerCase() === 'select') {
                                selectedOptions = [];
                                if (!('selectedOptions' in $el)) {
                                    // less than ie10
                                    length = $el.options.length;
                                    for (i = 0; i < length; i++) {
                                        if ($el.options[i].selected && $el.value !== '') {
                                            selectedOptions[selectedOptions.length] = $el.options[i];
                                        }
                                    }
                                } else {
                                    selectedOptions = $el.selectedOptions;
                                }
                                value = '';
                                for (i = 0; i < selectedOptions.length; i++) {
                                    value += selectedOptions[i].value;
                                    if (i < selectedOptions.length - 1) {
                                        value += ',';
                                    }
                                }
                            } else if (type === 'radio') {
                                value = $el.checked ? $el.value : '';

                                if ($el.name.length > 0) {
                                    form = $el;
                                    while (form) {
                                        if (form.nodeName.toLowerCase() === 'form') {
                                            break;
                                        }
                                        try {
                                            form = form.parentNode;
                                            if (!form.nodeName || form.nodeName.toLowerCase() === 'body') {
                                                form = null;
                                                break;
                                            }
                                        } catch (ex) {
                                            form = null;
                                            break;
                                        }
                                    }
                                    if (form) {
                                        radioElements = form[$el.name];
                                        length = radioElements.length;
                                        for (i = 0; i < length; i++) {
                                            if (radioElements[i].checked) {
                                                value = radioElements[i].value;
                                                break;
                                            }
                                        }
                                    }
                                }
                            } else {
                                value = $el.value;
                            }

                            $el.validity.setValid(true);

                            if ($el.hasAttribute('required') && value.length <= 0) {
                                $el.validity.setValid(false);
                            }
                            if (html5InputPatterns.hasOwnProperty(type) && !html5InputPatterns[type].test(value)) {
                                $el.validity.setValid(false);
                            }
                            if ($el.hasAttribute('pattern')) {
                                throw(new Error('checkValidity pattern not supported'));
                            }
                            if ($el.hasAttribute('maxlength') && value.length > parseInt($el.getAttribute('maxlength'), 10)) {
                                $el.validity.setValid(false);
                            }
                            if ($el.hasAttribute('min') && parseInt(value, 10) < parseInt($el.getAttribute('min'), 10)) {
                                $el.validity.setValid(false);
                            }
                            if ($el.hasAttribute('max') && parseInt(value, 10) > parseInt($el.getAttribute('max'), 10)) {
                                $el.validity.setValid(false);
                            }
                            if ($el.hasAttribute('step')) {
                                throw(new Error('checkValidity step not supported'));
                            }

                            keys = Object.keys(window.ValidityState);
                            keysLen = keys.length;
                            while (keysLen--) {
                                $el.setAttribute(
                                    'data-validity-' + keys[keysLen],
                                    $el.validity[keys[keysLen]]
                                );
                            }

                            if (!$el.validity.valid) {
                                fireInvalidEvent($el);
                            }

                            return $el.validity.valid;
                        };
                    }(el));
                }
                el[bootstrappedKey] = true;

            };


        window.ValidityState = function (valueMissing, typeMismatch, patternMismatch, tooLong, rangeUnderflow, rangeOverflow, stepMismatch, customError, valid) {
            this.valueMissing = parseBoolean(valueMissing);
            this.typeMismatch = parseBoolean(typeMismatch);
            this.patternMismatch = parseBoolean(patternMismatch);
            this.tooLong = parseBoolean(tooLong);
            this.rangeUnderflow = parseBoolean(rangeUnderflow);
            this.rangeOverflow = parseBoolean(rangeOverflow);
            this.stepMismatch = parseBoolean(stepMismatch);
            this.customError = parseBoolean(customError);
            this.valid = parseBoolean(valid, true);

        };
        window.ValidityState.prototype = {
            setValueMissing: function () {
                this.valueMissing = parseBoolean(arguments[0]);
            },
            setTypeMismatch: function () {
                this.typeMismatch = parseBoolean(arguments[0]);
            },
            setPatternMismatch: function () {
                this.patternMismatch = parseBoolean(arguments[0]);
            },
            setTooLong: function () {
                this.tooLong = parseBoolean(arguments[0]);
            },
            setRangeUnderflow: function () {
                this.rangeUnderflow = parseBoolean(arguments[0]);
            },
            setRangeOverflow: function () {
                this.rangeOverflow = parseBoolean(arguments[0]);
            },
            setStepMismatch: function () {
                this.stepMismatch = parseBoolean(arguments[0]);
            },
            setCustomError: function () {
                this.customError = parseBoolean(arguments[0]);
            },
            setValid: function () {
                this.valid = parseBoolean(arguments[0], true);
            }
        };

        return bootstrap
    });
paste['define']("paste.ui.form", [
        "paste.dom",
        "paste.event",
        "paste.util",
        "paste.guid",
        'paste.ui.form.validity'
    ], function (module, dom, event, util, guid, validity) {
        "use strict";

        var BIND_KEY = 'bind',
            SUBMIT_KEY = 'submit',
            CHANGE_KEY = 'change',
            FOCUSOUT_KEY = 'focusout',
            KEYUP_KEY = 'keyup',
            CHECK_VALIDITY_KEY = 'checkValidity',
            TARGET_ELEMENT_KEY = 'getEventTarget',
            PREVENT_DEFAULT_KEY = 'preventDefault',
            DATA_PREFIX_KEY = 'data-',
            VALIDITY_DATA_PREFIX_KEY = DATA_PREFIX_KEY + 'validity-',
            VALID_KEY = 'valid',
            INVALID_KEY = 'invalid',
            forms = document['getElementsByTagName']('form'),
            formLen = forms['length'],
            changeSubscriptions = {},
            focusOutSubscriptions = {},
            keyUpSubscriptions = {},
            submitSubscriptions = {},
            formEl,
            formElId,
            invalidEvents = {},
            setValidityAttributes = function setValidityAttributes(el, isValid) {
                el.setAttribute(
                    VALIDITY_DATA_PREFIX_KEY + VALID_KEY,
                    isValid
                );
            },
            formSubmitHandler = function formSubmitHandler(e, data) {
                var targetEl = event[TARGET_ELEMENT_KEY](e),
                    formEl = this,
                    validityStateValid,
                    notAllowedState;

                if (!targetEl) {
                    e[PREVENT_DEFAULT_KEY]();
                }

                notAllowedState = formEl['getAttribute']('data-not-allowed') === 'true';

                validity(targetEl);
                validityStateValid = formEl[CHECK_VALIDITY_KEY]();

                if (!validityStateValid || notAllowedState) {
                    e[PREVENT_DEFAULT_KEY]();
                } else {
                    setValidityAttributes(formEl, true);
                }

            },
            inputUpdateHandler = function inputUpdateHandler(e, data) {
                var targetEl = event[TARGET_ELEMENT_KEY](e),
                    formEl = this;

                if (!targetEl) {
                    return;
                }

                validity(targetEl);
                if (targetEl[CHECK_VALIDITY_KEY]()) {
                    validity(formEl);
                    setValidityAttributes(targetEl, true);
                    setValidityAttributes(formEl, formEl[CHECK_VALIDITY_KEY]());
                }
            },
            inputInvalidHandler = function inputInvalidHandler(e, data) {
                var targetEl = event[TARGET_ELEMENT_KEY](e),
                    formEl = this;

                setValidityAttributes(targetEl, false);
                setValidityAttributes(formEl, false);
            };

        while (formLen--) {
            formEl = forms[formLen];
            formEl['noValidate'] = true;

            formElId = formEl['id'];
            if (!formElId) {
                formEl['id'] = formElId = guid['Guid']['create']();
            }

            validity(formEl);
            setValidityAttributes(formEl, formEl[CHECK_VALIDITY_KEY]());

            if (!submitSubscriptions[formElId]) {
                submitSubscriptions[formElId] = event[BIND_KEY](
                    SUBMIT_KEY,
                    formEl,
                    formSubmitHandler,
                    formEl
                );
            }

            if (!changeSubscriptions[formElId]) {
                changeSubscriptions[formElId] = event[BIND_KEY](
                    CHANGE_KEY,
                    formEl,
                    inputUpdateHandler,
                    formEl
                );
            }

            if (!focusOutSubscriptions[formElId]) {
                focusOutSubscriptions[formElId] = event[BIND_KEY](
                    FOCUSOUT_KEY,
                    formEl,
                    inputUpdateHandler,
                    formEl
                );
            }

            if (!keyUpSubscriptions[formElId]) {
                keyUpSubscriptions[formElId] = event[BIND_KEY](
                    KEYUP_KEY,
                    formEl,
                    inputUpdateHandler,
                    formEl
                );
            }

            if (!invalidEvents[formElId]) {
                invalidEvents[formElId] = new event['Event'](
                    formEl,
                    INVALID_KEY
                );
                invalidEvents[formElId][BIND_KEY](
                    inputInvalidHandler,
                    formEl,
                    null,
                    true
                )
            }
        }
    });
paste['define'](
    'jawbone.ui.heroscroll',
    [
        'paste.guid',
        'paste.util',
        'paste.dom',
        'paste.event',
        'polyfills.getcomputedstyle'
    ],
    function (heroscroll, guid, util, dom, event, _) {
        'use strict';

        var html = dom['getDocumentBody'](),
            body = document.getElementsByTagName('body')[0],
            OVERRIDE_IMAGE_HEIGHT_FLAG = 'force-full-height',
            HERO_CLASS = 'jawbone-hero',
            HERO_TOUCH_CLASS = HERO_CLASS + '-touch',
            HERO_IMAGE_CLASS = HERO_CLASS + '-image',
            HERO_CONTENT_CLASS = HERO_CLASS + '-content',

            // this isn't the best touch detection, but it serves our purposes here
            touchSupported = (function() {
                return (('ontouchstart' in window) || (window['DocumentTouch'] && document instanceof DocumentTouch));
            }()),

            backgroundSizeSupported = (function () {
                var undef;
                return document.body.style['backgroundSize'] !== undef;
            }()),


            opacitySupported = (function () {
                var undef;
                return document.body.style['opacity'] !== undef;
            }()),


            /*
             * OPACITY ANIMATION
             */
            setOpacity = function (element, value) {
                if (opacitySupported) {
                    element.style.opacity = value / 100;
                } else {
                    element.style.filter = 'alpha(opacity=' + value + ')';
                }
            },
            $transitionOpacityInterval,
            $transitionOpacityFunc = function (element, value) {
                $transitionOpacityInterval = window.setTimeout((function (element, value) {
                    return function () {
                        window.clearTimeout($transitionOpacityInterval);
                        $transitionOpacityInterval = null;
                        setOpacity(element, value);
                    };
                }(element, value)), value * 10);
            },
            transitionOpacity = function (element, start, end) {
                setOpacity(element, start);
                var i, len = end;
                for (i = 1; i <= len; i += 1) {
                    $transitionOpacityFunc(element, i);
                }

                return end;
            },


            /*
             * HERO MODULE CLICK
             */
            $heroIdChange,
            dispatchHeroIdChange = function (heroId) {
                $heroIdChange = new event['Event'](window, 'hashchange');
                $heroIdChange['fire']({
                    'newURL' : heroId,
                    'updateHash' : false
                });
                $heroIdChange['dispose']();
                $heroIdChange = null;
            },
            heroClickSubscriptions = {},
            $heroClickedEl,
            $heroClickedElNextSibling,
            heroClickSub = function (e) {
                $heroClickedEl = event['Event']['getEventTarget'](e);
                if (!dom['hasCssClass']($heroClickedEl, HERO_CLASS)) {
                    while (!dom['hasCssClass']($heroClickedEl, HERO_CLASS)) {
                        try {
                            $heroClickedEl = $heroClickedEl.parentNode;
                            if (!$heroClickedEl.tagName || $heroClickedEl.tagName.toLowerCase() === "body") {
                                $heroClickedEl = null;
                                break;
                            }
                        } catch (ex) {
                            $heroClickedEl = null;
                            break;
                        }
                    }
                }

                $heroClickedElNextSibling = ($heroClickedEl.nextElementSibling || $heroClickedEl['nextSibling']);

                if ($heroClickedElNextSibling && dom['hasCssClass']($heroClickedElNextSibling, HERO_CLASS) && $heroClickedElNextSibling.id) {
                    e.preventDefault();
                    dispatchHeroIdChange($heroClickedElNextSibling.id);
                }
            },


            /*
             * HERO MODULE LAZY LOAD
             */
            _heroes = null,
            $heroElements,
            $heroImage,
            $heroContent,
            $heroClickSub,
            $heroImageUrl,
            $heroImageBgPosition,
            setHeroImageHeight = function (heroImage, height, heroImageBounds) {
                var backgroundPosition;
                if (height instanceof dom['Bounds']) {
                    heroImageBounds = height;
                    height = null;
                }
                if (heroImage) {
                    if (heroImage.hasAttribute(OVERRIDE_IMAGE_HEIGHT_FLAG)) {
                        height = height || dom['getViewportHeight']() + 'px';
                        heroImage.style.height = height;
                    }

                    if (heroImageBounds) {
                        backgroundPosition = heroImageBounds.backgroundPosition;
                    }

                    heroImageBounds = dom['Bounds']['fromElement'](heroImage);


                    if (backgroundPosition) {
                        heroImageBounds.backgroundPosition = backgroundPosition;
                    }

                    heroImage = height = null;
                }

                return heroImageBounds;
            },
            augmentHeroImageBounds = function (heroImage, heroImageBounds) {
                if (backgroundSizeSupported && heroImage && heroImageBounds && !heroImageBounds.hasOwnProperty('backgroundPosition')) {
                    $heroImageBgPosition = window.getComputedStyle(heroImage).getPropertyValue('background-position').split(' ');
                    heroImageBounds.backgroundPosition = {
                        // this isn't optimal, but oh well
                        x : $heroImageBgPosition[0] || '50%',
                        y : dom['getPixelValue'](heroImage, ($heroImageBgPosition[1] || 0))
                    };

                    heroImage = null;
                }

                return heroImageBounds;
            },
            getHeroes = function () {
                if (_heroes === null) {

                    $heroElements = dom['get']('.' + HERO_CLASS, true) || [];
                    _heroes = [];
                    util['each']($heroElements, function (element, i) {
                        if (!element.id) {
                            element.id = guid['Guid']['create']();
                        }

                        if (touchSupported) {
                            dom['addCssClass'](element, HERO_TOUCH_CLASS);
                        }

                        $heroImage = dom['querySelector']('.' + HERO_IMAGE_CLASS, element);
                        if ($heroImage && !backgroundSizeSupported) {
                            $heroImageUrl = window.getComputedStyle($heroImage).getPropertyValue('background-image');
                            if (util['stringStartsWith']($heroImageUrl, 'url(') && util['stringEndsWith']($heroImageUrl, ')')) {
                                $heroImageUrl = $heroImageUrl.slice(4, -1).replace(/['"]/g, '');
                                $heroImage.style.backgroundImage = 'none';
                                $heroImage.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + $heroImageUrl + "', sizingMethod='scale');";
                            }
                        }

                        $heroContent = dom['querySelector']('.' + HERO_CONTENT_CLASS, element);
                        if (element.hasAttribute('data-hero-hashclick')) {
                            if (heroClickSubscriptions.hasOwnProperty(element.id)) {
                                $heroClickSub = heroClickSubscriptions[element.id];
                            } else if (!touchSupported) {
                                $heroClickSub = new event['Event']['Subscription']('click', element, heroClickSub);
                                heroClickSubscriptions[element.id] = $heroClickSub;
                            }
                        }

                        _heroes.push({
                            bounds : dom['Bounds']['fromElement'](element),
                            image : $heroImage,
                            imageFixed : $heroImage && $heroImage.hasAttribute('data-hero-image-fixed'),
                            imageFade : $heroImage && $heroImage.hasAttribute('data-hero-image-fade'),
                            imageMinOpacity : $heroImage ? ($heroImage.getAttribute('data-hero-min-opacity') || 0) : 0,
                            imageBounds : augmentHeroImageBounds($heroImage, setHeroImageHeight($heroImage)),
                            content : $heroContent,
                            contentBounds : dom['Bounds']['fromElement']($heroContent),
                            id : element.id
                        });
                    });

                    $heroElements = $heroImage = $heroContent = $heroClickSub = null;
                }

                return _heroes;
            },


            /*
             * HERO MODULE SCROLL HANDLING
             */
            PAGE_SCROLL_MULTIPLIERS = {
                max : 0.3,
                min : 0.3
            },
            pageScrollTop,
            $pageScrollHeroBottom,
            $pageScrollHeroTop,
            $pageScrollHeroContentTop,
            $pageScrollHeroContentBottom,
            $pageScrollHeroContentOpacity,
            $pageScrollOffsetTop,
            $pageScrollAvailableSpace,
            $pageScrollBgMultiplier,
            $pageScrollImageOpacity,
            $pageScrollContentHeroStyle,
            $pageScrollContentHeroVisualOffsetTop,
            $pageScrollContentHeroVisualOffsetBottom,
            $pageScrollVisualBounds,
            pageScrollHandler = function (e) {
                pageScrollTop = dom['getScrollTop']();
                $pageScrollOffsetTop = ((getHeroes().length > 0) ? getHeroes()[0].bounds['top'] : 0);
                $pageScrollAvailableSpace = dom['getViewportHeight']();

                util['each'](getHeroes(), function (hero, i) {
                    $pageScrollHeroBottom = hero.bounds['getBottom']() - pageScrollTop;
                    $pageScrollHeroTop = (hero.bounds['top'] - pageScrollTop);

//                    console.log(i + ': h:' + hero.bounds.height + ' | av:' + $pageScrollAvailableSpace + ' | s:' + pageScrollTop + ' | t:' + $pageScrollHeroTop + ' | b:' + $pageScrollHeroBottom);

                    if (hero.content && hero.image) {
                        if ($pageScrollHeroBottom > 0 && $pageScrollHeroTop < $pageScrollAvailableSpace) {

                            $pageScrollContentHeroStyle = window.getComputedStyle(hero.content);
                            $pageScrollContentHeroVisualOffsetTop = (parseInt($pageScrollContentHeroStyle.getPropertyValue('margin-top'), 10) || 0) + (parseInt($pageScrollContentHeroStyle.getPropertyValue('top'), 10) || 0);
                            $pageScrollContentHeroVisualOffsetBottom = (parseInt($pageScrollContentHeroStyle.getPropertyValue('margin-bottom'), 10) || 0) + (parseInt($pageScrollContentHeroStyle.getPropertyValue('bottom'), 10) || 0);

                            $pageScrollVisualBounds = new dom['Bounds'](
                                hero.contentBounds.left,
                                hero.contentBounds.top + $pageScrollContentHeroVisualOffsetTop,
                                hero.contentBounds.width,
                                hero.contentBounds.height - $pageScrollContentHeroVisualOffsetTop - $pageScrollContentHeroVisualOffsetBottom
                            );

                            $pageScrollHeroContentBottom = $pageScrollVisualBounds['getBottom']() - pageScrollTop;
                            $pageScrollHeroContentTop = ($pageScrollVisualBounds['top'] - pageScrollTop);

//                            console.log('- ' + i + ': offset: ' + $pageScrollContentHeroVisualOffsetTop + ' | cb: ' + $pageScrollHeroContentBottom + ' | ct: ' + $pageScrollHeroContentTop + ' | %b: ' + ($pageScrollHeroContentTop / pageScrollTop) + ' | %t: ' + ($pageScrollHeroContentTop / $pageScrollVisualBounds['height']));

                            if ($pageScrollHeroContentTop > $pageScrollAvailableSpace) {
                                // BELOW FOLD
//                                console.log("BELOW FOLD");
                                $pageScrollHeroContentOpacity = 0;
                            }

                            /*
                                    This was causing content to be faded even when scrolled to the top. The "in view" logic
                                    below seemed to handle the fade well enough on it's own.

                                else if ($pageScrollHeroContentTop <= $pageScrollAvailableSpace && $pageScrollHeroContentBottom >= $pageScrollAvailableSpace) {
                                    // COMING INTO VIEW FROM BOTTOM FOLD
    //                                console.log('%b: ' + (($pageScrollAvailableSpace - $pageScrollHeroContentTop) / $pageScrollVisualBounds['height']));
                                    $pageScrollHeroContentOpacity = Math.min(1, (($pageScrollAvailableSpace - $pageScrollHeroContentTop) / $pageScrollVisualBounds['height']));
                                }
                            */
                            else if ($pageScrollHeroContentBottom <= $pageScrollAvailableSpace && $pageScrollHeroContentTop >= $pageScrollOffsetTop) {
                                // IN VIEW
//                                console.log("IN VIEW");
                                $pageScrollHeroContentOpacity = 1;
                            } else if ($pageScrollHeroContentTop < $pageScrollOffsetTop && $pageScrollHeroBottom >= $pageScrollOffsetTop) {
                                // GOING OUT OF VIEW AT THE TOP
//                                console.log('%t: ' + (1 - (($pageScrollOffsetTop - $pageScrollHeroContentTop) / $pageScrollVisualBounds['height'])));
                                $pageScrollHeroContentOpacity = Math.max(0, (1 - (($pageScrollOffsetTop - $pageScrollHeroContentTop) / $pageScrollVisualBounds['height'])));
                            } else if ($pageScrollHeroBottom < $pageScrollOffsetTop) {
                                // ABOVE TOP
                                $pageScrollHeroContentOpacity = 0;
//                                console.log("ABOVE TOP");
                            }

                            if (opacitySupported) {
                                hero.content.style.opacity = $pageScrollHeroContentOpacity;
                            } else {
                                hero.content.style.filter = 'alpha(opacity=' + ($pageScrollHeroContentOpacity * 100) + ')';
                            }

                            $pageScrollHeroContentTop = null;
                            $pageScrollHeroContentBottom = null;
                            $pageScrollHeroContentOpacity = null;
                            $pageScrollContentHeroStyle = null;
                            $pageScrollContentHeroVisualOffsetTop = null;
                            $pageScrollContentHeroVisualOffsetBottom = null;
                            $pageScrollVisualBounds = null;
                        }

                    }

                    if (hero.imageFade) {
                        $pageScrollImageOpacity = Math.max(($pageScrollHeroBottom / $pageScrollAvailableSpace), 0);

                        if (opacitySupported) {
                            if ($pageScrollImageOpacity > hero.imageMinOpacity) {
                                hero.image.style.opacity = $pageScrollImageOpacity;
                            }
                        } else {
                            if ($pageScrollImageOpacity > (hero.imageMinOpacity * 100)) {
                                hero.image.style.filter = 'alpha(opacity=' + ($pageScrollImageOpacity * 100) + ')';
                            }
                        }
                        $pageScrollImageOpacity = null;
                    }

                    if (backgroundSizeSupported && hero.image && !hero.imageFixed) {
                        var targetBackgroundTop = $pageScrollHeroTop;
                        if (targetBackgroundTop - $pageScrollOffsetTop > $pageScrollAvailableSpace) {
                            $pageScrollBgMultiplier = 1;
                        } else {
                            targetBackgroundTop = $pageScrollHeroBottom - $pageScrollAvailableSpace;

                            if (targetBackgroundTop <= 1 && targetBackgroundTop >= 0) {
                                targetBackgroundTop = 1;
                            } else if (targetBackgroundTop <= 0 && targetBackgroundTop >= -1) {
                                targetBackgroundTop = -1;
                            }

                            $pageScrollBgMultiplier = Math.abs(targetBackgroundTop / $pageScrollAvailableSpace);
                            if ($pageScrollBgMultiplier >= PAGE_SCROLL_MULTIPLIERS.max) {
                                $pageScrollBgMultiplier = PAGE_SCROLL_MULTIPLIERS.max;
                            } else if ($pageScrollBgMultiplier <= PAGE_SCROLL_MULTIPLIERS.min) {
                                $pageScrollBgMultiplier = PAGE_SCROLL_MULTIPLIERS.min;
                            }
                        }
                        targetBackgroundTop = (targetBackgroundTop * $pageScrollBgMultiplier) + parseInt(hero.imageBounds.backgroundPosition.y, 10);
                        if (targetBackgroundTop > pageScrollTop + $pageScrollHeroTop) {
                            targetBackgroundTop -= (targetBackgroundTop - (pageScrollTop + $pageScrollHeroTop));
                        }
                        hero.image.style.backgroundAttachment = 'fixed';
                        hero.image.style.backgroundPosition = '50% ' + (targetBackgroundTop) + 'px';

                        $pageScrollBgMultiplier = null;
                    }
                });

                $pageScrollHeroBottom = null;
                $pageScrollHeroTop = null;
                $pageScrollOffsetTop = null;
                $pageScrollAvailableSpace = null;
            },
            pageScrollSub = new event['Event']['Subscription']('scroll', window, pageScrollHandler),
            $dispatchPageScrollTimeout,
            dispatchPageScroll = function () {
                window.clearTimeout($dispatchPageScrollTimeout);
                if (pageScrollSub['isBound']()) {
                    $dispatchPageScrollTimeout = window.setTimeout(pageScrollHandler, 0);
                }
            },


            /*
             * HERO MODULE RESIZE HANDLING
             */
            pageResizeHandler = function () {
                util['each'](getHeroes(), function (hero, i) {
                    hero.bounds = dom['Bounds']['fromElement'](dom['get'](hero.id));
                    hero.imageBounds = augmentHeroImageBounds(hero.image, setHeroImageHeight(hero.image, hero.imageBounds));
                    hero.contentBounds = dom['Bounds']['fromElement'](hero.content);
                });

                dispatchPageScroll();
            },
            pageResizeSub = new event['Event']['Subscription']('resize', window, pageResizeHandler),
            $dispatchPageResizeTimeout,
            dispatchPageResize = function () {
                window.clearTimeout($dispatchPageResizeTimeout);
                if (pageResizeHandler['isBound']()) {
                    $dispatchPageResizeTimeout = window.setTimeout(pageResizeHandler, 0);
                }
            },


            /*
             * INITIALIZATION
             */
            init = (function () {
                var hash = window.location.hash.split('#', 2)[1];

                if (touchSupported) {
                    pageScrollSub['detach']();
                    pageResizeSub['detach']();
                } else {
                    dispatchPageScroll();
                }

                getHeroes();

                html.classList.add('jb-heroscroll-loaded');
                body.classList.add('jb-heroscroll-loaded');
            }());
    }
);