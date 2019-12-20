(function (require, exports, module) {
    module.exports = function (e) {
        var t = {};

        function r(n) {
            if (t[n]) return t[n].exports;
            var o = t[n] = {
                i: n,
                l: !1,
                exports: {}
            };
            return e[n].call(o.exports, o, o.exports, r), o.l = !0, o.exports
        }
        return r.m = e, r.c = t, r.d = function (e, t, n) {
            r.o(e, t) || Object.defineProperty(e, t, {
                enumerable: !0,
                get: n
            })
        }, r.r = function (e) {
            "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
                value: "Module"
            }), Object.defineProperty(e, "__esModule", {
                value: !0
            })
        }, r.t = function (e, t) {
            if (1 & t && (e = r(e)), 8 & t) return e;
            if (4 & t && "object" == typeof e && e && e.__esModule) return e;
            var n = Object.create(null);
            if (r.r(n), Object.defineProperty(n, "default", {
                    enumerable: !0,
                    value: e
                }), 2 & t && "string" != typeof e)
                for (var o in e) r.d(n, o, function (t) {
                    return e[t]
                }.bind(null, o));
            return n
        }, r.n = function (e) {
            var t = e && e.__esModule ? function () {
                return e.default
            } : function () {
                return e
            };
            return r.d(t, "a", t), t
        }, r.o = function (e, t) {
            return Object.prototype.hasOwnProperty.call(e, t)
        }, r.p = "", r(r.s = 0)
    }([function (e, t, r) {
        "use strict";

        function n(e) {
            return (n = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e) {
                return typeof e
            } : function (e) {
                return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
            })(e)
        }

        function o(e, t, r) {
            return t in e ? Object.defineProperty(e, t, {
                value: r,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : e[t] = r, e
        }
        r.r(t), r.d(t, "FireStoreParser", function () {
            return u
        });
        var u = function e(t) {
            var r = function (e) {
                var t = {
                    arrayValue: 1,
                    bytesValue: 1,
                    booleanValue: 1,
                    doubleValue: 1,
                    geoPointValue: 1,
                    integerValue: 1,
                    mapValue: 1,
                    nullValue: 1,
                    referenceValue: 1,
                    stringValue: 1,
                    timestampValue: 1
                };
                return Object.keys(e).find(function (e) {
                    return 1 === t[e]
                })
            }(t);
            return "doubleValue" === r || "integerValue" === r ? t = Number(t[r]) : "arrayValue" === r ? t = (t[r] && t[r].values || []).map(function (t) {
                return e(t)
            }) : "mapValue" === r ? t = e(t[r] && t[r].fields || {}) : "geoPointValue" === r ? t = function (e) {
                for (var t = 1; t < arguments.length; t++) {
                    var r = null != arguments[t] ? arguments[t] : {},
                        n = Object.keys(r);
                    "function" == typeof Object.getOwnPropertySymbols && (n = n.concat(Object.getOwnPropertySymbols(r).filter(function (e) {
                        return Object.getOwnPropertyDescriptor(r, e).enumerable
                    }))), n.forEach(function (t) {
                        o(e, t, r[t])
                    })
                }
                return e
            }({
                latitude: 0,
                longitude: 0
            }, t[r]) : r ? t = t[r] : "object" === n(t) && Object.keys(t).forEach(function (r) {
                return t[r] = e(t[r])
            }), t
        };
        t.default = u
    }]).default;
});