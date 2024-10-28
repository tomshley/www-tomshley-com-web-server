(function (e, f) {
    function h(a, b) {
        this.moduleA = a;
        this.moduleB = b;
        this._key = null;
        this.isSatisfied = !1
    }

    function d(a, b, c) {
        this.name = a;
        this._isExternal = "js" === a.substr(a.lastIndexOf(".") + 1) || -1 < a.lastIndexOf(":") || "/" === a.substr(0, 1);
        this.isLoaded = this.isLoading = this._isActive = !1;
        this.moduleRelations = {};
        this.errorCount = 0;
        this.errorTimeout = null;
        this.define(b, c)
    }

    f.keys || (f.keys = function (a) {
        if (a !== f(a)) throw new TypeError("Object.keys called on a non-object");
        var b = [], c;
        for (c in a) f.prototype.hasOwnProperty.call(a,
            c) && b.push(c);
        return b
    });
    var j = e.__paste__ || function () {
        var a = e.paste || this;
        if (!a || !(a.hasOwnProperty && a instanceof j)) {
            a = new j;
            a._instanceStart = (new Date).getTime()
        }
        return a
    }, l = document.head || document.getElementsByTagName("head")[0], p = !document.head, g = {}, k = {};
    e.__paste__ = j;
    e.paste = j();
    k = {usePasteBuilder: !0, packagesUrl: "/paste/", executionContext: e.paste};
    h.prototype = {
        getKey: function () {
            if (!this._key) this._key = this.moduleA.name + "|" + this.moduleB.name;
            return this._key
        }, trySatisfyActivate: function () {
            this.trySatisfy();
            this.isSatisfied && this.moduleA.activate();
            return this.isSatisfied
        }, trySatisfy: function () {
            this.moduleB.isDefined ? this.isSatisfied = this.moduleB.activate() : this.moduleB.load();
            this.isSatisfied && this.moduleA.updateRelation(this);
            return this.isSatisfied
        }
    };
    h.add = function (a, b) {
        var c = new h(a, b);
        c.trySatisfy();
        return c
    };
    h.getAll = function () {
        var a = f.keys(g), b, c = a.length, d = [], e = {}, m = [], i = 0, o = 0;
        for (b = 0; b < c; b = b + 1) {
            e = g[a[b]].moduleRelations;
            m = f.keys(e);
            o = m.length;
            for (i = 0; i < o; i = i + 1) d.push(e[m[i]])
        }
        return d
    };
    d.prototype =
        {
            _parseDependencies: function () {
                var a = this.dependencies, b = 0, c = a.length, e;
                for (b; b < c; b = b + 1) {
                    e = h.add(this, d.define(a[b]));
                    this.moduleRelations[e.getKey()] = e
                }
            }, _cleanup: function () {
                delete this.moduleRelations;
                this.moduleRelations = {};
                delete this.isLoading;
                delete this.isLoaded;
                delete this.name;
                delete this.dependencies;
                delete this._fn;
                delete this._isExternal;
                delete this.errorCount;
                delete this.errorTimeout
            }, define: function (a, b) {
                if (this._isActive) return true;
                if (this._isExternal) {
                    a = a || [];
                    this.load()
                }
                this.isDefined =
                    typeof a === "array" || a !== null && typeof a === "object" && a instanceof Array;
                if (!this.isDefined) return false;
                this.dependencies = a;
                this._fn = b;
                this._parseDependencies();
                this.activate();
                return true
            }, hasDirtyRelations: function (a) {
                if (this._isActive) return false;
                a = a || f.keys(this.moduleRelations).length;
                return a > 0 || this._isExternal && !this.isLoaded
            }, updateRelation: function (a) {
                this._isActive || a.isSatisfied && delete this.moduleRelations[a.getKey()]
            }, activate: function () {
                if (this._isActive || !this.isDefined) return this._isActive;
                var a, b, c, n;
                if (this.hasDirtyRelations()) {
                    a = f.keys(this.moduleRelations);
                    b = 0;
                    c = a.length;
                    for (b; b < c; b = b + 1) {
                        n = this.moduleRelations[a[b]];
                        n.trySatisfy()
                    }
                    if (this.hasDirtyRelations()) return false
                }
                this._isActive = true;
                if (this._fn) {
                    b = d.getActivationParts(this.name, this.dependencies);
                    if (a = this._fn.apply(e.paste, b[1])) {
                        b = b[0];
                        b[0][b[1]] = a
                    }
                }
                this._cleanup();
                return this._isActive
            }, load: function () {
                if (!this._isActive && !this.isLoaded && !this.isLoading) {
                    window.clearTimeout(this.errorTimeout);
                    this.errorTimeout = null;
                    var a =
                        document.createDocumentFragment(), b = document.createElement("script");
                    b.type = "text/javascript";
                    b.async = true;
                    b.charset = "utf-8";
                    b.src = this._isExternal ? this.name : d.getURIFromName(this.name);
                    b.data = this.name;
                    if (b.addEventListener) {
                        b.addEventListener("load", d.handleSourceSuccess, false);
                        b.addEventListener("error", d.handleSourceError, false)
                    } else if (b.attachEvent) {
                        b.readyState ? b.attachEvent("onreadystatechange", d.handleReadyStateChange) : b.attachEvent("onload", d.handleSourceSuccess);
                        b.attachEvent("onerror",
                            d.handleSourceError)
                    }
                    if (p) l.appendChild(b); else {
                        a.appendChild(b);
                        l.appendChild(a)
                    }
                    this.isLoading = true
                }
            }
        };
    d._disposeSourceListeners = function (a, b) {
        b.isLoading = false;
        if (a.removeEventListener) {
            a.removeEventListener("load", d.handleSourceSuccess, false);
            a.removeEventListener("error", d.handleSourceError, false)
        } else if (a.detachEvent) {
            a.readyState ? a.detachEvent("onreadystatechange", d.handleReadyStateChange) : a.detachEvent("onload", d.handleSourceSuccess);
            a.detachEvent("onerror", d.handleSourceError)
        }
    };
    d.handleReadyStateChange =
        function (a) {
            var b = a.target || a.srcElement;
            b && (b.readyState.toLowerCase() === "loaded" || b.readyState.toLowerCase() === "complete") && d.handleSourceSuccess(a)
        };
    d.handleSourceSuccess = function (a) {
        var a = a.target || a.srcElement, b = h.getAll(), c = b.length, e = 0, f = g[a.data];
        d._disposeSourceListeners(a, f);
        f.isLoaded = true;
        for (e; e < c; e = e + 1) b[e].trySatisfyActivate()
    };
    d.handleSourceError = function (a) {
        var b = (a = a.target || a.srcElement) ? a.src : null, c = g[a.data];
        d._disposeSourceListeners(a, c);
        l.removeChild(a);
        c.errorCount = c.errorCount +
            1;
        window.clearTimeout(c.errorTimeout);
        if (c.errorCount <= 5) c.errorTimeout = window.setTimeout(function () {
            c.load()
        }, 5E3); else throw Error("Error loading resource. Max attempts reached. " + b);
        b = null
    };
    d.getURIFromName = function (a) {
        if (a.length < 1) throw Error("paste.require - please specify a correct module name and package hierarchy (empty string)");
        if (a.lastIndexOf("/") > -1) throw Error("paste.require - please specify a correct module name and package hierarchy");
        return k.packagesUrl + (k.usePasteBuilder ? a : a.replace(".",
            "/")) + ".js"
    };
    d.getActivationParts = function (a, b) {
        var c = function (a) {
            var a = a.split("."), b = 0, d = a.length, c = window, e, f;
            for (b; b < d; b = b + 1) {
                f = a[b];
                e = c;
                c[f] = c[f] || {};
                c = c[f]
            }
            return [e, f, c]
        }, d = c(a), e = [d[2]], f = 0, g = b.length;
        for (f; f < g; f = f + 1) e.push(c(b[f])[2]);
        return [d, e]
    };
    d.define = function (a, b, c) {
        if (typeof a !== "string") {
            c = b;
            b = a;
            a = "paste._internal$" + (new Date).getTime() + ((1 + Math.random()) * 65536 | 0).toString(16).substring(1)
        }
        if (typeof b === "function" || b !== null && typeof b === "object" && b instanceof Function) {
            c = b;
            b = []
        }
        g.hasOwnProperty(a) ?
            g[a].isDefined || g[a].define(b, c) : g[a] = new d(a, b, c);
        return g[a]
    };
    e.paste.define = d.define;
    e.paste.define.amd = {multiversion: !1};
    e.paste.require = function (a, b) {
        if (typeof a === "string" || a !== null && typeof a === "object" && a instanceof String) a = [a];
        return d.define(a, b)
    };
    e.paste.config = function (a) {
        a.hasOwnProperty("packagesUrl") && (k.packagesUrl = a.packagesUrl)
    };
    e.paste.instanceStart = e.paste._instanceStart
})(window, Object);
paste.define("paste.guid", function (b) {
    b.Guid = function () {
        var a = function () {
            return (65536 * (1 + Math.random()) | 0).toString(16).substring(1)
        };
        return a() + a() + "-" + a() + "-" + a() + "-" + a() + "-" + a() + a() + a()
    };
    b.Guid.create = function () {
        return b.Guid()
    }
});
paste.define("paste.oop", function (e) {
    var a, f, h = function (c, b, a) {
        this[b] = function (a, c) {
            return function () {
                return c.apply(a, arguments)
            }
        }(c, a)
    }, g, i = function (a, b, d) {
        return function () {
            f = this.base;
            this.base = new h(this, a, d);
            g = b.apply(this, arguments);
            this.base = f;
            return g
        }
    };
    e.Class = function () {
    };
    e.Class.create = function (a) {
        return e.Class.extend(a)
    };
    e.Class.extend = function (c) {
        function b() {
            this.init && this.init.apply(this, arguments)
        }

        var d = function () {
        };
        d.prototype = this.prototype;
        b.prototype = new d;
        b.prototype.constructor =
            b;
        for (a in c) c.hasOwnProperty(a) && (b.prototype[a] = "function" === typeof c[a] && "function" === typeof d.prototype[a] ? i(a, c[a], d.prototype[a]) : c[a]);
        b.extend = e.Class.extend;
        return b
    }
});
paste.define("paste.util", function (b) {
    b.each = function (a, e, c) {
        var b = 0, f = a.length;
        if (c) for (b; b < f && !e.call(c, a[b], b); b += 1); else for (b; b < f && !e(a[b], b); b += 1);
    };
    b.range = function (a, e) {
        var b, d = [];
        for (b = a; b < e; ++b) d.push(b);
        return d
    };
    b.mixin = function (a, e, c) {
        var a = a || {}, c = b.parseBoolean(c, !1), d;
        if (!e) return a;
        for (d in e) if (e.hasOwnProperty(d) && (c || !a.hasOwnProperty(d))) a[d] = e[d];
        return a
    };
    b.isEmptyObject = function (a) {
        b.isObject(a);
        for (var e in a) if (a.hasOwnProperty(e)) return !1;
        return !0
    };
    b.trim = function (a) {
        return a.replace(/^\s\s*/,
            "").replace(/\s\s*$/, "")
    };
    b.trimSafe = function (a) {
        return b.isString(a) ? a.replace(/^\s\s*/, "").replace(/\s\s*$/, "") : a
    };
    b.isEmptyString = function (a) {
        return !1 === b.isString(a) || !b.trim(a)
    };
    b.isArray = function (a) {
        return "array" === typeof a || null !== a && "object" === typeof a && a instanceof Array
    };
    b.isBoolean = function (a) {
        return "boolean" === typeof a || null !== a && "object" === typeof a && a instanceof Boolean
    };
    b.parseBoolean = function (a, e) {
        var c = function (a) {
                return b.isBoolean(a) ? a : b.isString(a) ? "true" === a.toLowerCase() : null
            },
            d = c(a), c = c(e);
        return null !== d ? d : null !== c ? c : !1
    };
    b.isFunction = function (a) {
        return "function" === typeof a || null !== a && "object" === typeof a && a instanceof Function
    };
    b.isNumber = function (a) {
        return !isNaN(a) && ("number" === typeof a || null !== a && "object" === typeof a && a instanceof Number)
    };
    b.isString = function (a) {
        return "string" === typeof a || null !== a && "object" === typeof a && a instanceof String
    };
    b.isNonEmptyString = function (a) {
        return !0 === b.isString(a) && 0 < b.trim(a).length
    };
    b.isObject = function (a) {
        return !a ? !1 : "object" === typeof a ||
            b.isArray(a) || b.isFunction(a)
    };
    b.hasMethod = function (a, e) {
        return b.isObject(a) && b.isFunction(a[e])
    };
    b.numberInRange = function (a, b, c) {
        return !(a < b || a > c)
    };
    b.cloneFunction = function (a) {
        if (!1 === b.isFunction(a)) throw "Utility.cloneFunction: you passed a value that is not a function";
        var e, c = function () {
            return a.apply(this, arguments)
        };
        c.prototype = a.prototype;
        for (e in a) a.hasOwnProperty(e) && "prototype" !== e && (c[e] = a[e]);
        return c
    };
    b.cloneObject = function (a) {
        if (null === a || "object" !== typeof a) return a;
        var b, c, d;
        if (a instanceof Date) return b = new Date, b.setTime(a.getTime()), b;
        if (a instanceof Array) {
            b = [];
            c = a.length;
            for (d = 0; d < c; ++d) b[d] = this.clone(a[d]);
            return b
        }
        if (a instanceof Object) {
            b = {};
            for (c in a) a.hasOwnProperty(c) && (b[c] = this.cloneObject(a[c]));
            return b
        }
        throw "Unable to copy obj! Its type isn't supported.";
    };
    b.toCamelCase = function (a) {
        return a.replace(/(\-[a-z])/g, function (a) {
            return a.toUpperCase().replace("-", "")
        })
    };
    b.toDashed = function (a) {
        return a.replace(/([A-Z])/g, function (a) {
            return "-" + a.toLowerCase()
        })
    };
    b.toUnderscored =
        function (a) {
            return a.replace(/([A-Z])/g, function (a) {
                return "_" + a.toLowerCase()
            })
        };
    b.stringStartsWith = function (a, b) {
        return a && a.slice(0, b.length) === b
    };
    b.stringEndsWith = function (a, b) {
        return a && a.slice(-b.length) === b
    };
    b.arrayContains = function (a, b) {
        for (var c = a.length; c--;) if (a[c] === b) return !0;
        return !1
    };
    b.searchParamsAppend = function (a, e) {
        var c = "", d, f, g, h, i;
        if (b.isString(e)) c = e; else if (b.isObject(e)) {
            c = {};
            d = [];
            g = 0;
            i = Object.keys(e);
            h = i.length;
            for (g; g < h; g += 1) f = i[g], ("undefined" === typeof c[f] || e[f] !== c[f]) &&
            "length" !== f && d.push(encodeURIComponent(f) + "=" + encodeURIComponent(e[f]));
            c = d.join("&")
        }
        return !c ? a : !a ? c : a + (a.indexOf("?") ? "?" : "&") + c
    };
    b.getSearchParams = function () {
        var a = window.location.search, b = "", c = {}, d, f, a = a.replace("?", "").split("&");
        f = a.length;
        for (d = 0; d < f; d++) b = a[d].split("="), c[b[0]] = b[1];
        return c
    };
    b.dataset = function () {
        var a = {}, e = !1, c = !1, d = {
            reset: function () {
                a = {}
            }, set: function (d, h) {
                d.__data || (d.__data = {});
                !e && !c && f(d);
                a[d.__data] = b.mixin(a[d.__data], h, !0)
            }, get: function (b, d) {
                !e && !c && f(b);
                return d ?
                    a[b.__data][d] : a[b.__data]
            }
        }, f = function (a) {
            e = !0;
            b.each(a.attributes, function (c) {
                if (/^data-/.test(c.name)) {
                    var e = {}, f = b.toCamelCase(c.name.slice(5));
                    e[f] = c.value;
                    d.set(a, e)
                }
            });
            c = !0
        };
        return d
    }()
});
paste.define("polyfills.getcomputedstyle", function () {
    if (!window.getComputedStyle) {
        var c = /(\-([a-z]){1})/g, e = /^[\.\d]+(px)?$/i, f = /^-?\d/, g = function (b, a) {
            var d = a;
            if (!e.test(a) && f.test(a) && b.runtimeStyle) {
                var d = b.style.left, c = b.runtimeStyle.left;
                b.runtimeStyle.left = b.currentStyle.left;
                b.style.left = a || 0;
                a = b.style.pixelLeft;
                b.style.left = d;
                b.runtimeStyle.left = c;
                d = a + "px"
            }
            return d
        };
        window.getComputedStyle = function (b) {
            this.getPropertyValue = function (a) {
                "float" == a && (a = "styleFloat");
                c.test(a) && (a = a.replace(c,
                    function (a, b, c) {
                        return c.toUpperCase()
                    }));
                return b.currentStyle[a] ? g(b, b.currentStyle[a]) : null
            };
            return this
        }
    }
});
paste.define("paste.dom", ["paste.util", "paste.oop"], function (b, f, h) {
    if ("undefined" !== typeof document && !("classList" in document.createElement("a"))) {
        if (!("HTMLElement" in window) && !("Element" in window)) return;
        var f = (window.HTMLElement || window.Element).prototype, i = Object,
            r = String.prototype.trim || function () {
                return this.replace(/^\s+|\s+$/g, "")
            }, s = Array.prototype.indexOf || function (a) {
                for (var c = 0, b = this.length; c < b; c++) if (c in this && this[c] === a) return c;
                return -1
            }, k = function (a, c) {
                this.name = a;
                this.code = DOMException[a];
                this.message = c
            }, j = function (a, c) {
                if ("" === c) throw new k("SYNTAX_ERR", "An invalid or illegal string was specified");
                if (/\s/.test(c)) throw new k("INVALID_CHARACTER_ERR", "String contains an invalid character");
                return s.call(a, c)
            }, n = function (a) {
                for (var c = r.call(a.className), c = c ? c.split(/\s+/) : [], b = 0, d = c.length; b < d; b++) this.push(c[b]);
                this._updateClassName = function () {
                    a.className = this.toString()
                }
            }, d = n.prototype = [], o = function () {
                return new n(this)
            };
        k.prototype = Error.prototype;
        d.item = function (a) {
            return this[a] ||
                null
        };
        d.contains = function (a) {
            return -1 !== j(this, a + "")
        };
        d.add = function (a) {
            a += "";
            -1 === j(this, a) && (this.push(a), this._updateClassName())
        };
        d.remove = function (a) {
            a = j(this, a + "");
            -1 !== a && (this.splice(a, 1), this._updateClassName())
        };
        d.toggle = function (a) {
            a += "";
            -1 === j(this, a) ? this.add(a) : this.remove(a)
        };
        d.toString = function () {
            return this.join(" ")
        };
        if (i.defineProperty) {
            d = {get: o, enumerable: !0, configurable: !0};
            try {
                i.defineProperty(f, "classList", d)
            } catch (t) {
                -2146823252 === t.number && (d.enumerable = !1, i.defineProperty(f,
                    "classList", d))
            }
        } else i.prototype.__defineGetter__ && f.__defineGetter__("classList", o)
    }
    var u = /^[\.\d]+(px)?$/i, v = /^-?\d/, l = new Date, p = "$JWindowStore-Dom-" + l.getTime() + "-", m = null,
        q = "abbr article aside audio canvas datalist details figcaption figure footer header hgroup mark meter nav output progress section subline summary time video".split(" "),
        e = null;
    b.getDocumentBody = function () {
        var a = window[p + "documentBody"];
        a || (window[p + "documentBody"] = a = "string" === typeof document.compatMode && 0 <= document.compatMode.indexOf("CSS") &&
        document.documentElement ? document.documentElement : document.body);
        return a
    };
    b.getHtml5Supported = function () {
        if (null === m) {
            var a = document.createElement("div");
            a.innerHTML = "<header></header>";
            m = 0 < a.childNodes.length
        }
        return m
    };
    b.innerHtml5 = function (a) {
        if (b.getHtml5Supported()) return a;
        var c;
        if (null === e) {
            var g;
            e = document.createElement("div");
            e.innerHTML = "<header></header>";
            c = document.createDocumentFragment();
            for (g = q.length; g--;) c.createElement(q[g]);
            c.appendChild(e)
        }
        c = e;
        c.innerHTML = a;
        g = c.childNodes.length;
        for (a = document.createDocumentFragment(); g--;) a.appendChild(c.firstChild);
        return a
    };
    "number" === typeof window.pageXOffset ? (b.getScrollLeft = function () {
        return window.pageXOffset
    }, b.getScrollTop = function () {
        return window.pageYOffset
    }) : "number" === typeof b.getDocumentBody().scrollLeft ? (b.getScrollLeft = function () {
        return b.getDocumentBody().scrollLeft
    }, b.getScrollTop = function () {
        return b.getDocumentBody().scrollTop
    }) : b.getScrollLeft = b.getScrollTop = function () {
        return NaN
    };
    b.getScrollWidth = function () {
        return b.getDocumentBody().scrollWidth
    };
    b.getScrollHeight = function () {
        return b.getDocumentBody().scrollHeight
    };
    "number" === typeof window.innerWidth ? (b.getViewportHeight = function () {
        return window.innerHeight
    }, b.getViewportWidth = function () {
        return window.innerWidth
    }) : "number" === typeof b.getDocumentBody().clientWidth ? (b.getViewportHeight = function () {
        return b.getDocumentBody().clientHeight
    }, b.getViewportWidth = function () {
        return b.getDocumentBody().clientWidth
    }) : b.getViewportHeight = b.getViewportWidth = function () {
        return NaN
    };
    b.getComputedStyle = function (a,
                                   c, b) {
        return window.getComputedStyle ? window.getComputedStyle(a, b || null).getPropertyValue(c) : a.currentStyle ? a.currentStyle[c] : false
    };
    b.show = function (a) {
        var c = "$" + l + " _dom_hide_display", b = a[c];
        a.style.display = b || "block";
        b && delete a[c]
    };
    b.hide = function (a) {
        if (a.style.display !== "none") {
            a["$" + l + " _dom_hide_display"] = a.style.display;
            a.style.display = "none"
        }
    };
    b.querySelector = function (a, c) {
        return document.querySelector ? (c || document).querySelector(a) : null
    };
    b.querySelectorAll = function (a, c) {
        return document.querySelectorAll ?
            (c || document).querySelectorAll(a) : []
    };
    b.get = b.getElement = function (a, c) {
        return c ? true === c ? b.querySelectorAll(a) : b.querySelectorAll(a, c) : document.getElementById(a)
    };
    b.elementExists = function (a) {
        for (var c = document.body.parentNode; a;) {
            if (a === c) return true;
            a = a.parentNode
        }
        return false
    };
    b.stripIdHash = function (a) {
        return a.charAt(0) === "#" ? a.slice(1) : a
    };
    b.contains = function (a, c) {
        if (!a) return false;
        for (; a;) {
            if (a === c) return true;
            try {
                c = c.parentNode;
                if (!c.tagName || c.tagName.toUpperCase() === "BODY") break
            } catch (b) {
                break
            }
        }
        return false
    };
    b.hasCssClass = function (a, c) {
        return !a || !a.classList || !c ? false : a.classList.contains(c)
    };
    b.removeCssClass = function (a, c) {
        if (!a || !a.classList || !c) return false;
        a.classList.remove(c);
        return true
    };
    b.addCssClass = function (a, c) {
        if (!a || !a.classList || !c) return false;
        a.classList.add(c);
        return true
    };
    b.toggleCssClass = function (a, c) {
        if (!a || !a.classList || !c) return false;
        a.classList.toggle(c);
        return true
    };
    b.createFragment = function (a, c) {
        var b = document.createDocumentFragment(), d = document.createElement(c || "div");
        for (d.innerHTML =
                 a; d.firstChild;) b.appendChild(d.firstChild);
        return b
    };
    b.getPixelValue = function (a, c) {
        var b = c;
        if (!u.test(c) && v.test(c) && a.runtimeStyle) {
            var b = a.style.left, d = a.runtimeStyle.left;
            a.runtimeStyle.left = a.currentStyle.left;
            a.style.left = c || 0;
            c = a.style.pixelLeft;
            a.style.left = b;
            a.runtimeStyle.left = d;
            b = c + "px"
        }
        return b
    };
    b.Point = h.Class.create({
        init: function (a, b) {
            this.x = a || 0;
            this.y = b || 0
        }, combine: function (a) {
            return new b.Point(this.x = this.x + a.x, this.y = this.y + a.y)
        }
    });
    b.Point.fromJQuery = function (a) {
        return new b.Point(a.left,
            a.top)
    };
    b.Size = h.Class.create({
        init: function (a, b) {
            this.width = a || 0;
            this.height = b || 0
        }
    });
    b.Size.fromElement = function (a) {
        return !a ? new b.Size : new b.Size(a.offsetWidth, a.offsetHeight)
    };
    b.Bounds = h.Class.create({
        init: function (a, b, d, e) {
            this.left = a || 0;
            this.top = b || 0;
            this.width = d || 0;
            this.height = e || 0
        }, getRight: function () {
            return this.left + this.width
        }, getBottom: function () {
            return this.top + this.height
        }, contains: function (a) {
            return this.top > a.y || this.getBottom() < a.y ? false : !(this.left > a.x || this.getRight() < a.x)
        }
    });
    b.Bounds.fromElement =
        function (a) {
            if (!a || a.style.display === "none") return new b.Bounds;
            var c;
            if (a.getBoundingClientRect) try {
                if (a.tagName === "HTML") return new b.Bounds;
                c = a.getBoundingClientRect();
                return new b.Bounds(c.left - b.getDocumentBody().clientLeft + b.getScrollLeft(), c.top - b.getDocumentBody().clientTop + b.getScrollTop(), a.offsetWidth, a.offsetHeight)
            } catch (d) {
            }
            if (document.getBoxObjectFor) try {
                c = document.getBoxObjectFor(a);
                return new b.Bounds(c.x, c.y, a.offsetWidth, a.offsetHeight)
            } catch (e) {
            }
            c = new b.Bounds(a.offsetLeft, a.offsetTop,
                a.offsetWidth, a.offsetHeight);
            try {
                for (; (a = a.offsetParent) !== null;) {
                    c.left = c.left + a.offsetLeft;
                    c.top = c.top + a.offsetTop;
                    if (a === document.body) break
                }
            } catch (f) {
            }
            return c
        };
    b.MarkupWriter = h.Class.create({
        init: function () {
            this.writer = []
        }, toString: function () {
            return this.writer.join("")
        }, toFragment: function () {
            return b.createFragment(this.toString())
        }, push: function (a) {
            this.writer.push(a)
        }, append: function (a) {
            this.push(a)
        }, clear: function () {
            this.dispose();
            this.writer = []
        }, dispose: function () {
            this.writer = this.reset;
            delete this.writer
        }, length: function () {
            return this.writer.length
        }, isEmpty: function () {
            return this.writer.length === 0
        }
    });
    b.MarkupWriter.create = function () {
        return new b.MarkupWriter
    }
});
var c = !0, h = null, k = !1;
paste.define("paste.event", ["paste.guid", "paste.util"], function (e, w, l) {
    function t(a) {
        var b = h;
        a.target ? b = a.target : a.srcElement && (b = a.srcElement);
        return b
    }

    function m(a) {
        a && 1 === a.length && (a = a[0]);
        this.o = o();
        this.data = a
    }

    function i(a, b, d, n) {
        this.a = q(b) && x(b) === k ? b : "$pasteEvent-" + o();
        this.f = a && a.nodeType || a === window ? a : p ? document : document.documentElement;
        this.i = a || window;
        this.g = {};
        if (p) this.d = document.createEvent("Event"), this.d.initEvent(this.a, r(d), r(n, c)), this.d.pasteEvent = new m(h); else if (u) this.d = document.createEventObject(),
            this.d.pasteEvent = new m(h); else throw Error("Fatal event error");
    }

    function g(a, b, d, n, g, i) {
        var e = o(), j;
        q(d) && n && (d = n[d]);
        g === c && (g = 1);
        this.b = b && b.nodeType || b === window ? b : p ? document : document.documentElement;
        this.l = e;
        s(a, "getEventName") ? (this.a = a.getEventName(), this.k = function (a, b) {
            return function (d) {
                d && d === a.remove || a.remove(b)
            }
        }(a, e)) : (this.a = a, this.k = function () {
        });
        this.m = "";
        this.method = d;
        this.h = n;
        this.j = g || 0;
        this.e = c;
        this.c = function (a) {
            return function (b) {
                var d = (a.j = a.j - 1) === 0, f, g, e;
                if (a.e !== k) {
                    f = b;
                    if (!f) f = window.event;
                    if (d) a.e = k;
                    if (!f.preventDefault) f.preventDefault = function () {
                        f.returnValue = k
                    };
                    if (!f.stopPropagation) f.stopPropagation = function () {
                        f.cancelBubble = k
                    };
                    if (!f.target) f.target = f.srcElement;
                    if (!f.currentTarget) f.currentTarget = f.srcElement;
                    if (g = f.pasteEvent || h) {
                        b = g.o;
                        e = g.data;
                        a.m === b ? e = h : a.m = b
                    }
                    a.h ? a.method.call(a.h, f, e) : a.method(f, e);
                    d && a.remove()
                }
            }
        }(this);
        v ? this.b.addEventListener(this.a, this.c, r(i, k)) : window.attachEvent && (s(a, "getEventName") ? (a = a.a, j = l.cloneFunction(this.c), delete this.c,
            this.c = function (a, b) {
                return function (d) {
                    var f = k;
                    if (b === d.type) f = c; else if (b === d.propertyName && b + "$pasteEvent" in d.srcElement) {
                        d.pasteEvent = d.srcElement[b + "$pasteEvent"];
                        f = c
                    }
                    f && j.apply(a, arguments)
                }
            }(this, a), y.hasOwnProperty(a) && (this.a = "on" + a, this.b.attachEvent(this.a, this.c)), this.b[e + "$eventName"] = "onpropertychange", this.b.attachEvent(this.b[e + "$eventName"], this.c)) : (this.a = "on" + a, this.b.attachEvent(this.a, this.c)))
    }

    var y = {
            blur: h,
            change: h,
            click: h,
            contextmenu: h,
            copy: h,
            cut: h,
            dblclick: h,
            error: h,
            focus: h,
            focusin: h,
            focusout: h,
            hashchange: h,
            keydown: h,
            keypress: h,
            keyup: h,
            load: h,
            mousedown: h,
            mouseenter: h,
            mouseleave: h,
            mousemove: h,
            mouseout: h,
            mouseover: h,
            mouseup: h,
            mousewheel: h,
            paste: h,
            reset: h,
            resize: h,
            scroll: h,
            select: h,
            submit: h,
            textinput: h,
            unload: h,
            wheel: h
        }, o = w.Guid.create, q = l.isString, x = l.isEmptyString, s = l.hasMethod, r = l.parseBoolean,
        v = window.addEventListener ? c : k, p = document.createEvent ? c : k,
        u = document.createEventObject ? c : k, j = o();
    g.prototype.n = function () {
        if (v) this.b.removeEventListener(this.a, this.c, k); else if (window.attachEvent) {
            var a =
                this.l + "$eventName";
            this.b[a] && (this.b.detachEvent(this.b[a], this.c), delete this.b[a]);
            this.b.detachEvent(this.a, this.c)
        }
    };
    g.prototype.getGuid = function () {
        return this.l
    };
    g.prototype.remove = function (a) {
        this.n();
        this.k(a);
        delete this.c;
        delete this.a;
        delete this.method;
        delete this.h;
        delete this.j;
        delete this.e
    };
    g.prototype.dispose = g.prototype.remove;
    g.prototype.attach = function () {
        return this.e ? k : this.e = c
    };
    g.prototype.detach = function () {
        if (!this.e) return k;
        this.e = k;
        return c
    };
    g.prototype.isBound = function () {
        return this.e
    };
    i.prototype.getEventName = function () {
        return this.a
    };
    i.prototype.remove = function (a) {
        if (s(a, "getGuid")) {
            var b = a.getGuid();
            a.remove(this.remove);
            delete this.g[b]
        } else q(a) && (this.g[a].remove(this.remove), delete this.g[a])
    };
    i.prototype.fire = function () {
        if (p) this.d.pasteEvent = new m(arguments || h), this.f.dispatchEvent(this.d); else if (u) {
            var a = this.a, b;
            try {
                this.d.pasteEvent = new m(arguments || h), this.i.fireEvent("on" + a, this.d)
            } catch (d) {
                this.f[a + "$pasteEvent"] = new m(arguments || h), b = this.f[a], this.f[a] = b ? this.f[a] +
                    1 : 1
            }
        }
    };
    i.prototype.subscribe = function (a, b, d, e) {
        a = new g(this, this.f, a, b || this.i, d, e);
        b = a.getGuid();
        this.g[b] = a;
        return this.g[b]
    };
    i.prototype.bind = i.prototype.subscribe;
    i.prototype.dispose = function () {
        var a = Object.keys(this.g), b, d = a.length;
        for (b = 0; b < d; b += 1) this.remove(a[b]);
        delete this.d;
        delete this.f;
        delete this.i;
        delete this.g;
        delete this.a;
        delete this.d
    };
    e.bind = function (a, b, d, e, i, j) {
        return new g(a, b, d, e, i, j)
    };
    e.getEventTarget = t;
    e.DocumentEvent = {
        loaded: function (a, b, d) {
            if (!window[j + "$pasteEvent$onLoad"]) if (window[j +
            "$pasteEvent$onLoad"] = new i, "loaded" === document.readyState.toLowerCase() || "complete" === document.readyState.toLowerCase()) var e = window.setTimeout(function () {
                window[j + "$pasteEvent$onLoad"].fire();
                window.clearTimeout(e);
                e = h
            }, 0); else !document.addEventListener && document.attachEvent ? document.readyState ? document.attachEvent("onreadystatechange", function () {
                ("loaded" === document.readyState.toLowerCase() || "complete" === document.readyState.toLowerCase()) && window[j + "$pasteEvent$onLoad"].fire()
            }) : document.attachEvent("onload",
                function () {
                    window[j + "$pasteEvent$onLoad"].fire()
                }) : document.addEventListener && window.addEventListener("load", function () {
                window[j + "$pasteEvent$onLoad"].fire()
            });
            return window[j + "$pasteEvent$onLoad"].subscribe(a, b, d)
        }
    };
    e.Event = i;
    e.Event.getEventTarget = t;
    e.Event.Subscription = e.Subscription = g
});
var f = null;
paste.define("tomshley.ui.heroscroll", ["paste.guid", "paste.util", "paste.dom", "paste.event", "polyfills.getcomputedstyle"], function (I, Q, r, d, s) {
    function J() {
        window.clearTimeout(K);
        L.isBound() && (K = window.setTimeout(M, 0))
    }

    function M() {
        j = d.getScrollTop();
        h = u()[0].c.top;
        g = d.getViewportHeight();
        r.each(u(), function (a) {
            k = a.c.getBottom() - j;
            m = a.c.top - j;
            a.content && a.a && (0 < k && m < g) && (n = window.getComputedStyle(a.content), v = (parseInt(n.getPropertyValue("margin-top"), 10) || 0) + (parseInt(n.getPropertyValue("top"), 10) ||
                0), B = (parseInt(n.getPropertyValue("margin-bottom"), 10) || 0) + (parseInt(n.getPropertyValue("bottom"), 10) || 0), t = new d.Bounds(a.b.left, a.b.top + v, a.b.width, a.b.height - v - B), C = t.getBottom() - j, o = t.top - j, o > g ? l = 0 : C <= g && o >= h ? l = 1 : o < h && k >= h ? l = Math.max(0, 1 - (h - o) / t.height) : k < h && (l = 0), N ? a.content.style.opacity = l : a.content.style.filter = "alpha(opacity=" + 100 * l + ")", t = B = v = n = l = C = o = f);
            a.f && (p = Math.max(k / g, 0), N ? p > a.e && (a.a.style.opacity = p) : p > 100 * a.e && (a.a.style.filter = "alpha(opacity=" + 100 * p + ")"), p = f);
            if (D && a.a && !a.g) {
                var b =
                    m;
                b - h > g ? i = 1 : (b = k - g, 1 >= b && 0 <= b ? b = 1 : 0 >= b && -1 <= b && (b = -1), i = Math.abs(b / g), 0.3 <= i ? i = 0.3 : 0.3 >= i && (i = 0.3));
                b = b * i + parseInt(a.d.backgroundPosition.y, 10);
                b > j + m && (b -= b - (j + m));
                a.a.style.backgroundAttachment = "fixed";
                a.a.style.backgroundPosition = "50% " + b + "px";
                i = f
            }
        });
        g = h = m = k = f
    }

    function u() {
        w === f && (E = d.get(".tomshley-hero", !0) || [], w = [], r.each(E, function (a) {
            a.id || (a.id = Q.Guid.create());
            F && d.addCssClass(a, "tomshley-hero-touch");
            if ((c = d.querySelector(".tomshley-hero-image", a)) && !D) q = window.getComputedStyle(c).getPropertyValue("background-image"),
            r.stringStartsWith(q, "url(") && r.stringEndsWith(q, ")") && (q = q.slice(4, -1).replace(/['"]/g, ""), c.style.backgroundImage = "none", c.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + q + "', sizingMethod='scale');");
            x = d.querySelector(".tomshley-hero-content", a);
            a.hasAttribute("data-hero-hashclick") && (G.hasOwnProperty(a.id) ? y = G[a.id] : F || (y = new s.Event.Subscription("click", a, R), G[a.id] = y));
            w.push({
                c: d.Bounds.fromElement(a),
                a: c,
                g: c && c.hasAttribute("data-hero-image-fixed"),
                f: c && c.hasAttribute("data-hero-image-fade"),
                e: c ? c.getAttribute("data-hero-min-opacity") || 0 : 0,
                d: O(c, P(c)),
                content: x,
                b: d.Bounds.fromElement(x),
                id: a.id
            })
        }), E = c = x = y = f);
        return w
    }

    function O(a, b) {
        D && (a && b && !b.hasOwnProperty("backgroundPosition")) && (H = window.getComputedStyle(a).getPropertyValue("background-position").split(" "), b.backgroundPosition = {
            x: H[0] || "50%",
            y: d.getPixelValue(a, H[1] || 0)
        });
        return b
    }

    function P(a, b) {
        var c, e;
        b instanceof d.Bounds && (c = b, b = f);
        if (a && (a.hasAttribute("force-full-height") && (b = b || d.getViewportHeight() + "px", a.style.height =
            b), c && (e = c.backgroundPosition), c = d.Bounds.fromElement(a), e)) c.backgroundPosition = e;
        return c
    }

    function R(a) {
        e = s.Event.getEventTarget(a);
        if (!d.hasCssClass(e, "tomshley-hero")) for (; !d.hasCssClass(e, "tomshley-hero");) try {
            if (e = e.parentNode, !e.tagName || "body" === e.tagName.toLowerCase()) {
                e = f;
                break
            }
        } catch (b) {
            e = f;
            break
        }
        if ((z = e.nextElementSibling || e.nextSibling) && d.hasCssClass(z, "tomshley-hero") && z.id) a.preventDefault(), a = z.id, A = new s.Event(window, "hashchange"), A.fire({
            newURL: a,
            updateHash: !1
        }), A.dispose(), A = f
    }

    var I =
            d.getDocumentBody(), S = document.getElementsByTagName("body")[0],
        F = "ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch,
        D = void 0 !== document.body.style.backgroundSize, N = void 0 !== document.body.style.opacity, A,
        G = {}, e, z, w = f, E, c, x, y, q, H, j, k, m, o, C, l, h, g, i, p, n, v, B, t,
        L = new s.Event.Subscription("scroll", window, M), K,
        T = new s.Event.Subscription("resize", window, function () {
            r.each(u(), function (a) {
                a.c = d.Bounds.fromElement(d.get(a.id));
                a.d = O(a.a, P(a.a, a.d));
                a.b = d.Bounds.fromElement(a.content)
            });
            J()
        });
    F ? (L.detach(), T.detach()) : J();
    u();
    I.classList.add("tomshley-heroscroll-loaded");
    S.classList.add("tomshley-heroscroll-loaded")
});
