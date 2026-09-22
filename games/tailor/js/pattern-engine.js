var TailorPattern = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/lodash/_freeGlobal.js
  var require_freeGlobal = __commonJS({
    "node_modules/lodash/_freeGlobal.js"(exports, module) {
      var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
      module.exports = freeGlobal;
    }
  });

  // node_modules/lodash/_root.js
  var require_root = __commonJS({
    "node_modules/lodash/_root.js"(exports, module) {
      var freeGlobal = require_freeGlobal();
      var freeSelf = typeof self == "object" && self && self.Object === Object && self;
      var root = freeGlobal || freeSelf || Function("return this")();
      module.exports = root;
    }
  });

  // node_modules/lodash/_Symbol.js
  var require_Symbol = __commonJS({
    "node_modules/lodash/_Symbol.js"(exports, module) {
      var root = require_root();
      var Symbol2 = root.Symbol;
      module.exports = Symbol2;
    }
  });

  // node_modules/lodash/_getRawTag.js
  var require_getRawTag = __commonJS({
    "node_modules/lodash/_getRawTag.js"(exports, module) {
      var Symbol2 = require_Symbol();
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      var nativeObjectToString = objectProto.toString;
      var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
      function getRawTag(value) {
        var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
        try {
          value[symToStringTag] = void 0;
          var unmasked = true;
        } catch (e) {
        }
        var result = nativeObjectToString.call(value);
        if (unmasked) {
          if (isOwn) {
            value[symToStringTag] = tag;
          } else {
            delete value[symToStringTag];
          }
        }
        return result;
      }
      module.exports = getRawTag;
    }
  });

  // node_modules/lodash/_objectToString.js
  var require_objectToString = __commonJS({
    "node_modules/lodash/_objectToString.js"(exports, module) {
      var objectProto = Object.prototype;
      var nativeObjectToString = objectProto.toString;
      function objectToString(value) {
        return nativeObjectToString.call(value);
      }
      module.exports = objectToString;
    }
  });

  // node_modules/lodash/_baseGetTag.js
  var require_baseGetTag = __commonJS({
    "node_modules/lodash/_baseGetTag.js"(exports, module) {
      var Symbol2 = require_Symbol();
      var getRawTag = require_getRawTag();
      var objectToString = require_objectToString();
      var nullTag = "[object Null]";
      var undefinedTag = "[object Undefined]";
      var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
      function baseGetTag(value) {
        if (value == null) {
          return value === void 0 ? undefinedTag : nullTag;
        }
        return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
      }
      module.exports = baseGetTag;
    }
  });

  // node_modules/lodash/isObject.js
  var require_isObject = __commonJS({
    "node_modules/lodash/isObject.js"(exports, module) {
      function isObject(value) {
        var type = typeof value;
        return value != null && (type == "object" || type == "function");
      }
      module.exports = isObject;
    }
  });

  // node_modules/lodash/isFunction.js
  var require_isFunction = __commonJS({
    "node_modules/lodash/isFunction.js"(exports, module) {
      var baseGetTag = require_baseGetTag();
      var isObject = require_isObject();
      var asyncTag = "[object AsyncFunction]";
      var funcTag = "[object Function]";
      var genTag = "[object GeneratorFunction]";
      var proxyTag = "[object Proxy]";
      function isFunction(value) {
        if (!isObject(value)) {
          return false;
        }
        var tag = baseGetTag(value);
        return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
      }
      module.exports = isFunction;
    }
  });

  // node_modules/lodash/_coreJsData.js
  var require_coreJsData = __commonJS({
    "node_modules/lodash/_coreJsData.js"(exports, module) {
      var root = require_root();
      var coreJsData = root["__core-js_shared__"];
      module.exports = coreJsData;
    }
  });

  // node_modules/lodash/_isMasked.js
  var require_isMasked = __commonJS({
    "node_modules/lodash/_isMasked.js"(exports, module) {
      var coreJsData = require_coreJsData();
      var maskSrcKey = (function() {
        var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
        return uid ? "Symbol(src)_1." + uid : "";
      })();
      function isMasked(func) {
        return !!maskSrcKey && maskSrcKey in func;
      }
      module.exports = isMasked;
    }
  });

  // node_modules/lodash/_toSource.js
  var require_toSource = __commonJS({
    "node_modules/lodash/_toSource.js"(exports, module) {
      var funcProto = Function.prototype;
      var funcToString = funcProto.toString;
      function toSource(func) {
        if (func != null) {
          try {
            return funcToString.call(func);
          } catch (e) {
          }
          try {
            return func + "";
          } catch (e) {
          }
        }
        return "";
      }
      module.exports = toSource;
    }
  });

  // node_modules/lodash/_baseIsNative.js
  var require_baseIsNative = __commonJS({
    "node_modules/lodash/_baseIsNative.js"(exports, module) {
      var isFunction = require_isFunction();
      var isMasked = require_isMasked();
      var isObject = require_isObject();
      var toSource = require_toSource();
      var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
      var reIsHostCtor = /^\[object .+?Constructor\]$/;
      var funcProto = Function.prototype;
      var objectProto = Object.prototype;
      var funcToString = funcProto.toString;
      var hasOwnProperty = objectProto.hasOwnProperty;
      var reIsNative = RegExp(
        "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
      );
      function baseIsNative(value) {
        if (!isObject(value) || isMasked(value)) {
          return false;
        }
        var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
        return pattern.test(toSource(value));
      }
      module.exports = baseIsNative;
    }
  });

  // node_modules/lodash/_getValue.js
  var require_getValue = __commonJS({
    "node_modules/lodash/_getValue.js"(exports, module) {
      function getValue(object, key) {
        return object == null ? void 0 : object[key];
      }
      module.exports = getValue;
    }
  });

  // node_modules/lodash/_getNative.js
  var require_getNative = __commonJS({
    "node_modules/lodash/_getNative.js"(exports, module) {
      var baseIsNative = require_baseIsNative();
      var getValue = require_getValue();
      function getNative(object, key) {
        var value = getValue(object, key);
        return baseIsNative(value) ? value : void 0;
      }
      module.exports = getNative;
    }
  });

  // node_modules/lodash/_defineProperty.js
  var require_defineProperty = __commonJS({
    "node_modules/lodash/_defineProperty.js"(exports, module) {
      var getNative = require_getNative();
      var defineProperty = (function() {
        try {
          var func = getNative(Object, "defineProperty");
          func({}, "", {});
          return func;
        } catch (e) {
        }
      })();
      module.exports = defineProperty;
    }
  });

  // node_modules/lodash/_baseAssignValue.js
  var require_baseAssignValue = __commonJS({
    "node_modules/lodash/_baseAssignValue.js"(exports, module) {
      var defineProperty = require_defineProperty();
      function baseAssignValue(object, key, value) {
        if (key == "__proto__" && defineProperty) {
          defineProperty(object, key, {
            "configurable": true,
            "enumerable": true,
            "value": value,
            "writable": true
          });
        } else {
          object[key] = value;
        }
      }
      module.exports = baseAssignValue;
    }
  });

  // node_modules/lodash/eq.js
  var require_eq = __commonJS({
    "node_modules/lodash/eq.js"(exports, module) {
      function eq(value, other) {
        return value === other || value !== value && other !== other;
      }
      module.exports = eq;
    }
  });

  // node_modules/lodash/_assignValue.js
  var require_assignValue = __commonJS({
    "node_modules/lodash/_assignValue.js"(exports, module) {
      var baseAssignValue = require_baseAssignValue();
      var eq = require_eq();
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      function assignValue(object, key, value) {
        var objValue = object[key];
        if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) {
          baseAssignValue(object, key, value);
        }
      }
      module.exports = assignValue;
    }
  });

  // node_modules/lodash/isArray.js
  var require_isArray = __commonJS({
    "node_modules/lodash/isArray.js"(exports, module) {
      var isArray = Array.isArray;
      module.exports = isArray;
    }
  });

  // node_modules/lodash/isObjectLike.js
  var require_isObjectLike = __commonJS({
    "node_modules/lodash/isObjectLike.js"(exports, module) {
      function isObjectLike(value) {
        return value != null && typeof value == "object";
      }
      module.exports = isObjectLike;
    }
  });

  // node_modules/lodash/isSymbol.js
  var require_isSymbol = __commonJS({
    "node_modules/lodash/isSymbol.js"(exports, module) {
      var baseGetTag = require_baseGetTag();
      var isObjectLike = require_isObjectLike();
      var symbolTag = "[object Symbol]";
      function isSymbol(value) {
        return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
      }
      module.exports = isSymbol;
    }
  });

  // node_modules/lodash/_isKey.js
  var require_isKey = __commonJS({
    "node_modules/lodash/_isKey.js"(exports, module) {
      var isArray = require_isArray();
      var isSymbol = require_isSymbol();
      var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
      var reIsPlainProp = /^\w*$/;
      function isKey(value, object) {
        if (isArray(value)) {
          return false;
        }
        var type = typeof value;
        if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
          return true;
        }
        return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
      }
      module.exports = isKey;
    }
  });

  // node_modules/lodash/_nativeCreate.js
  var require_nativeCreate = __commonJS({
    "node_modules/lodash/_nativeCreate.js"(exports, module) {
      var getNative = require_getNative();
      var nativeCreate = getNative(Object, "create");
      module.exports = nativeCreate;
    }
  });

  // node_modules/lodash/_hashClear.js
  var require_hashClear = __commonJS({
    "node_modules/lodash/_hashClear.js"(exports, module) {
      var nativeCreate = require_nativeCreate();
      function hashClear() {
        this.__data__ = nativeCreate ? nativeCreate(null) : {};
        this.size = 0;
      }
      module.exports = hashClear;
    }
  });

  // node_modules/lodash/_hashDelete.js
  var require_hashDelete = __commonJS({
    "node_modules/lodash/_hashDelete.js"(exports, module) {
      function hashDelete(key) {
        var result = this.has(key) && delete this.__data__[key];
        this.size -= result ? 1 : 0;
        return result;
      }
      module.exports = hashDelete;
    }
  });

  // node_modules/lodash/_hashGet.js
  var require_hashGet = __commonJS({
    "node_modules/lodash/_hashGet.js"(exports, module) {
      var nativeCreate = require_nativeCreate();
      var HASH_UNDEFINED = "__lodash_hash_undefined__";
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      function hashGet(key) {
        var data = this.__data__;
        if (nativeCreate) {
          var result = data[key];
          return result === HASH_UNDEFINED ? void 0 : result;
        }
        return hasOwnProperty.call(data, key) ? data[key] : void 0;
      }
      module.exports = hashGet;
    }
  });

  // node_modules/lodash/_hashHas.js
  var require_hashHas = __commonJS({
    "node_modules/lodash/_hashHas.js"(exports, module) {
      var nativeCreate = require_nativeCreate();
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      function hashHas(key) {
        var data = this.__data__;
        return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
      }
      module.exports = hashHas;
    }
  });

  // node_modules/lodash/_hashSet.js
  var require_hashSet = __commonJS({
    "node_modules/lodash/_hashSet.js"(exports, module) {
      var nativeCreate = require_nativeCreate();
      var HASH_UNDEFINED = "__lodash_hash_undefined__";
      function hashSet(key, value) {
        var data = this.__data__;
        this.size += this.has(key) ? 0 : 1;
        data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
        return this;
      }
      module.exports = hashSet;
    }
  });

  // node_modules/lodash/_Hash.js
  var require_Hash = __commonJS({
    "node_modules/lodash/_Hash.js"(exports, module) {
      var hashClear = require_hashClear();
      var hashDelete = require_hashDelete();
      var hashGet = require_hashGet();
      var hashHas = require_hashHas();
      var hashSet = require_hashSet();
      function Hash(entries) {
        var index = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      Hash.prototype.clear = hashClear;
      Hash.prototype["delete"] = hashDelete;
      Hash.prototype.get = hashGet;
      Hash.prototype.has = hashHas;
      Hash.prototype.set = hashSet;
      module.exports = Hash;
    }
  });

  // node_modules/lodash/_listCacheClear.js
  var require_listCacheClear = __commonJS({
    "node_modules/lodash/_listCacheClear.js"(exports, module) {
      function listCacheClear() {
        this.__data__ = [];
        this.size = 0;
      }
      module.exports = listCacheClear;
    }
  });

  // node_modules/lodash/_assocIndexOf.js
  var require_assocIndexOf = __commonJS({
    "node_modules/lodash/_assocIndexOf.js"(exports, module) {
      var eq = require_eq();
      function assocIndexOf(array, key) {
        var length = array.length;
        while (length--) {
          if (eq(array[length][0], key)) {
            return length;
          }
        }
        return -1;
      }
      module.exports = assocIndexOf;
    }
  });

  // node_modules/lodash/_listCacheDelete.js
  var require_listCacheDelete = __commonJS({
    "node_modules/lodash/_listCacheDelete.js"(exports, module) {
      var assocIndexOf = require_assocIndexOf();
      var arrayProto = Array.prototype;
      var splice = arrayProto.splice;
      function listCacheDelete(key) {
        var data = this.__data__, index = assocIndexOf(data, key);
        if (index < 0) {
          return false;
        }
        var lastIndex = data.length - 1;
        if (index == lastIndex) {
          data.pop();
        } else {
          splice.call(data, index, 1);
        }
        --this.size;
        return true;
      }
      module.exports = listCacheDelete;
    }
  });

  // node_modules/lodash/_listCacheGet.js
  var require_listCacheGet = __commonJS({
    "node_modules/lodash/_listCacheGet.js"(exports, module) {
      var assocIndexOf = require_assocIndexOf();
      function listCacheGet(key) {
        var data = this.__data__, index = assocIndexOf(data, key);
        return index < 0 ? void 0 : data[index][1];
      }
      module.exports = listCacheGet;
    }
  });

  // node_modules/lodash/_listCacheHas.js
  var require_listCacheHas = __commonJS({
    "node_modules/lodash/_listCacheHas.js"(exports, module) {
      var assocIndexOf = require_assocIndexOf();
      function listCacheHas(key) {
        return assocIndexOf(this.__data__, key) > -1;
      }
      module.exports = listCacheHas;
    }
  });

  // node_modules/lodash/_listCacheSet.js
  var require_listCacheSet = __commonJS({
    "node_modules/lodash/_listCacheSet.js"(exports, module) {
      var assocIndexOf = require_assocIndexOf();
      function listCacheSet(key, value) {
        var data = this.__data__, index = assocIndexOf(data, key);
        if (index < 0) {
          ++this.size;
          data.push([key, value]);
        } else {
          data[index][1] = value;
        }
        return this;
      }
      module.exports = listCacheSet;
    }
  });

  // node_modules/lodash/_ListCache.js
  var require_ListCache = __commonJS({
    "node_modules/lodash/_ListCache.js"(exports, module) {
      var listCacheClear = require_listCacheClear();
      var listCacheDelete = require_listCacheDelete();
      var listCacheGet = require_listCacheGet();
      var listCacheHas = require_listCacheHas();
      var listCacheSet = require_listCacheSet();
      function ListCache(entries) {
        var index = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      ListCache.prototype.clear = listCacheClear;
      ListCache.prototype["delete"] = listCacheDelete;
      ListCache.prototype.get = listCacheGet;
      ListCache.prototype.has = listCacheHas;
      ListCache.prototype.set = listCacheSet;
      module.exports = ListCache;
    }
  });

  // node_modules/lodash/_Map.js
  var require_Map = __commonJS({
    "node_modules/lodash/_Map.js"(exports, module) {
      var getNative = require_getNative();
      var root = require_root();
      var Map = getNative(root, "Map");
      module.exports = Map;
    }
  });

  // node_modules/lodash/_mapCacheClear.js
  var require_mapCacheClear = __commonJS({
    "node_modules/lodash/_mapCacheClear.js"(exports, module) {
      var Hash = require_Hash();
      var ListCache = require_ListCache();
      var Map = require_Map();
      function mapCacheClear() {
        this.size = 0;
        this.__data__ = {
          "hash": new Hash(),
          "map": new (Map || ListCache)(),
          "string": new Hash()
        };
      }
      module.exports = mapCacheClear;
    }
  });

  // node_modules/lodash/_isKeyable.js
  var require_isKeyable = __commonJS({
    "node_modules/lodash/_isKeyable.js"(exports, module) {
      function isKeyable(value) {
        var type = typeof value;
        return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
      }
      module.exports = isKeyable;
    }
  });

  // node_modules/lodash/_getMapData.js
  var require_getMapData = __commonJS({
    "node_modules/lodash/_getMapData.js"(exports, module) {
      var isKeyable = require_isKeyable();
      function getMapData(map, key) {
        var data = map.__data__;
        return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
      }
      module.exports = getMapData;
    }
  });

  // node_modules/lodash/_mapCacheDelete.js
  var require_mapCacheDelete = __commonJS({
    "node_modules/lodash/_mapCacheDelete.js"(exports, module) {
      var getMapData = require_getMapData();
      function mapCacheDelete(key) {
        var result = getMapData(this, key)["delete"](key);
        this.size -= result ? 1 : 0;
        return result;
      }
      module.exports = mapCacheDelete;
    }
  });

  // node_modules/lodash/_mapCacheGet.js
  var require_mapCacheGet = __commonJS({
    "node_modules/lodash/_mapCacheGet.js"(exports, module) {
      var getMapData = require_getMapData();
      function mapCacheGet(key) {
        return getMapData(this, key).get(key);
      }
      module.exports = mapCacheGet;
    }
  });

  // node_modules/lodash/_mapCacheHas.js
  var require_mapCacheHas = __commonJS({
    "node_modules/lodash/_mapCacheHas.js"(exports, module) {
      var getMapData = require_getMapData();
      function mapCacheHas(key) {
        return getMapData(this, key).has(key);
      }
      module.exports = mapCacheHas;
    }
  });

  // node_modules/lodash/_mapCacheSet.js
  var require_mapCacheSet = __commonJS({
    "node_modules/lodash/_mapCacheSet.js"(exports, module) {
      var getMapData = require_getMapData();
      function mapCacheSet(key, value) {
        var data = getMapData(this, key), size = data.size;
        data.set(key, value);
        this.size += data.size == size ? 0 : 1;
        return this;
      }
      module.exports = mapCacheSet;
    }
  });

  // node_modules/lodash/_MapCache.js
  var require_MapCache = __commonJS({
    "node_modules/lodash/_MapCache.js"(exports, module) {
      var mapCacheClear = require_mapCacheClear();
      var mapCacheDelete = require_mapCacheDelete();
      var mapCacheGet = require_mapCacheGet();
      var mapCacheHas = require_mapCacheHas();
      var mapCacheSet = require_mapCacheSet();
      function MapCache(entries) {
        var index = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      MapCache.prototype.clear = mapCacheClear;
      MapCache.prototype["delete"] = mapCacheDelete;
      MapCache.prototype.get = mapCacheGet;
      MapCache.prototype.has = mapCacheHas;
      MapCache.prototype.set = mapCacheSet;
      module.exports = MapCache;
    }
  });

  // node_modules/lodash/memoize.js
  var require_memoize = __commonJS({
    "node_modules/lodash/memoize.js"(exports, module) {
      var MapCache = require_MapCache();
      var FUNC_ERROR_TEXT = "Expected a function";
      function memoize(func, resolver) {
        if (typeof func != "function" || resolver != null && typeof resolver != "function") {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        var memoized = function() {
          var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
          if (cache.has(key)) {
            return cache.get(key);
          }
          var result = func.apply(this, args);
          memoized.cache = cache.set(key, result) || cache;
          return result;
        };
        memoized.cache = new (memoize.Cache || MapCache)();
        return memoized;
      }
      memoize.Cache = MapCache;
      module.exports = memoize;
    }
  });

  // node_modules/lodash/_memoizeCapped.js
  var require_memoizeCapped = __commonJS({
    "node_modules/lodash/_memoizeCapped.js"(exports, module) {
      var memoize = require_memoize();
      var MAX_MEMOIZE_SIZE = 500;
      function memoizeCapped(func) {
        var result = memoize(func, function(key) {
          if (cache.size === MAX_MEMOIZE_SIZE) {
            cache.clear();
          }
          return key;
        });
        var cache = result.cache;
        return result;
      }
      module.exports = memoizeCapped;
    }
  });

  // node_modules/lodash/_stringToPath.js
  var require_stringToPath = __commonJS({
    "node_modules/lodash/_stringToPath.js"(exports, module) {
      var memoizeCapped = require_memoizeCapped();
      var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
      var reEscapeChar = /\\(\\)?/g;
      var stringToPath = memoizeCapped(function(string) {
        var result = [];
        if (string.charCodeAt(0) === 46) {
          result.push("");
        }
        string.replace(rePropName, function(match, number, quote, subString) {
          result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
        });
        return result;
      });
      module.exports = stringToPath;
    }
  });

  // node_modules/lodash/_arrayMap.js
  var require_arrayMap = __commonJS({
    "node_modules/lodash/_arrayMap.js"(exports, module) {
      function arrayMap(array, iteratee) {
        var index = -1, length = array == null ? 0 : array.length, result = Array(length);
        while (++index < length) {
          result[index] = iteratee(array[index], index, array);
        }
        return result;
      }
      module.exports = arrayMap;
    }
  });

  // node_modules/lodash/_baseToString.js
  var require_baseToString = __commonJS({
    "node_modules/lodash/_baseToString.js"(exports, module) {
      var Symbol2 = require_Symbol();
      var arrayMap = require_arrayMap();
      var isArray = require_isArray();
      var isSymbol = require_isSymbol();
      var INFINITY = 1 / 0;
      var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
      var symbolToString = symbolProto ? symbolProto.toString : void 0;
      function baseToString(value) {
        if (typeof value == "string") {
          return value;
        }
        if (isArray(value)) {
          return arrayMap(value, baseToString) + "";
        }
        if (isSymbol(value)) {
          return symbolToString ? symbolToString.call(value) : "";
        }
        var result = value + "";
        return result == "0" && 1 / value == -INFINITY ? "-0" : result;
      }
      module.exports = baseToString;
    }
  });

  // node_modules/lodash/toString.js
  var require_toString = __commonJS({
    "node_modules/lodash/toString.js"(exports, module) {
      var baseToString = require_baseToString();
      function toString(value) {
        return value == null ? "" : baseToString(value);
      }
      module.exports = toString;
    }
  });

  // node_modules/lodash/_castPath.js
  var require_castPath = __commonJS({
    "node_modules/lodash/_castPath.js"(exports, module) {
      var isArray = require_isArray();
      var isKey = require_isKey();
      var stringToPath = require_stringToPath();
      var toString = require_toString();
      function castPath(value, object) {
        if (isArray(value)) {
          return value;
        }
        return isKey(value, object) ? [value] : stringToPath(toString(value));
      }
      module.exports = castPath;
    }
  });

  // node_modules/lodash/_isIndex.js
  var require_isIndex = __commonJS({
    "node_modules/lodash/_isIndex.js"(exports, module) {
      var MAX_SAFE_INTEGER = 9007199254740991;
      var reIsUint = /^(?:0|[1-9]\d*)$/;
      function isIndex(value, length) {
        var type = typeof value;
        length = length == null ? MAX_SAFE_INTEGER : length;
        return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
      }
      module.exports = isIndex;
    }
  });

  // node_modules/lodash/_toKey.js
  var require_toKey = __commonJS({
    "node_modules/lodash/_toKey.js"(exports, module) {
      var isSymbol = require_isSymbol();
      var INFINITY = 1 / 0;
      function toKey(value) {
        if (typeof value == "string" || isSymbol(value)) {
          return value;
        }
        var result = value + "";
        return result == "0" && 1 / value == -INFINITY ? "-0" : result;
      }
      module.exports = toKey;
    }
  });

  // node_modules/lodash/_baseSet.js
  var require_baseSet = __commonJS({
    "node_modules/lodash/_baseSet.js"(exports, module) {
      var assignValue = require_assignValue();
      var castPath = require_castPath();
      var isIndex = require_isIndex();
      var isObject = require_isObject();
      var toKey = require_toKey();
      function baseSet(object, path, value, customizer) {
        if (!isObject(object)) {
          return object;
        }
        path = castPath(path, object);
        var index = -1, length = path.length, lastIndex = length - 1, nested = object;
        while (nested != null && ++index < length) {
          var key = toKey(path[index]), newValue = value;
          if (key === "__proto__" || key === "constructor" || key === "prototype") {
            return object;
          }
          if (index != lastIndex) {
            var objValue = nested[key];
            newValue = customizer ? customizer(objValue, key, nested) : void 0;
            if (newValue === void 0) {
              newValue = isObject(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
            }
          }
          assignValue(nested, key, newValue);
          nested = nested[key];
        }
        return object;
      }
      module.exports = baseSet;
    }
  });

  // node_modules/lodash/set.js
  var require_set = __commonJS({
    "node_modules/lodash/set.js"(exports, module) {
      var baseSet = require_baseSet();
      function set2(object, path, value) {
        return object == null ? object : baseSet(object, path, value);
      }
      module.exports = set2;
    }
  });

  // vendor/lodash-set/index.cjs
  var require_lodash_set = __commonJS({
    "vendor/lodash-set/index.cjs"(exports, module) {
      module.exports = require_set();
    }
  });

  // node_modules/lodash/last.js
  var require_last = __commonJS({
    "node_modules/lodash/last.js"(exports, module) {
      function last(array) {
        var length = array == null ? 0 : array.length;
        return length ? array[length - 1] : void 0;
      }
      module.exports = last;
    }
  });

  // node_modules/lodash/_baseGet.js
  var require_baseGet = __commonJS({
    "node_modules/lodash/_baseGet.js"(exports, module) {
      var castPath = require_castPath();
      var toKey = require_toKey();
      function baseGet(object, path) {
        path = castPath(path, object);
        var index = 0, length = path.length;
        while (object != null && index < length) {
          object = object[toKey(path[index++])];
        }
        return index && index == length ? object : void 0;
      }
      module.exports = baseGet;
    }
  });

  // node_modules/lodash/_baseSlice.js
  var require_baseSlice = __commonJS({
    "node_modules/lodash/_baseSlice.js"(exports, module) {
      function baseSlice(array, start, end) {
        var index = -1, length = array.length;
        if (start < 0) {
          start = -start > length ? 0 : length + start;
        }
        end = end > length ? length : end;
        if (end < 0) {
          end += length;
        }
        length = start > end ? 0 : end - start >>> 0;
        start >>>= 0;
        var result = Array(length);
        while (++index < length) {
          result[index] = array[index + start];
        }
        return result;
      }
      module.exports = baseSlice;
    }
  });

  // node_modules/lodash/_parent.js
  var require_parent = __commonJS({
    "node_modules/lodash/_parent.js"(exports, module) {
      var baseGet = require_baseGet();
      var baseSlice = require_baseSlice();
      function parent(object, path) {
        return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
      }
      module.exports = parent;
    }
  });

  // node_modules/lodash/_baseUnset.js
  var require_baseUnset = __commonJS({
    "node_modules/lodash/_baseUnset.js"(exports, module) {
      var castPath = require_castPath();
      var last = require_last();
      var parent = require_parent();
      var toKey = require_toKey();
      var objectProto = Object.prototype;
      var hasOwnProperty = objectProto.hasOwnProperty;
      function baseUnset(object, path) {
        path = castPath(path, object);
        var index = -1, length = path.length;
        if (!length) {
          return true;
        }
        while (++index < length) {
          var key = toKey(path[index]);
          if (key === "__proto__" && !hasOwnProperty.call(object, "__proto__")) {
            return false;
          }
          if ((key === "constructor" || key === "prototype") && index < length - 1) {
            return false;
          }
        }
        var obj = parent(object, path);
        return obj == null || delete obj[toKey(last(path))];
      }
      module.exports = baseUnset;
    }
  });

  // node_modules/lodash/unset.js
  var require_unset = __commonJS({
    "node_modules/lodash/unset.js"(exports, module) {
      var baseUnset = require_baseUnset();
      function unset2(object, path) {
        return object == null ? true : baseUnset(object, path);
      }
      module.exports = unset2;
    }
  });

  // vendor/lodash-unset/index.cjs
  var require_lodash_unset = __commonJS({
    "vendor/lodash-unset/index.cjs"(exports, module) {
      module.exports = require_unset();
    }
  });

  // node_modules/lodash.get/index.js
  var require_lodash = __commonJS({
    "node_modules/lodash.get/index.js"(exports, module) {
      var FUNC_ERROR_TEXT = "Expected a function";
      var HASH_UNDEFINED = "__lodash_hash_undefined__";
      var INFINITY = 1 / 0;
      var funcTag = "[object Function]";
      var genTag = "[object GeneratorFunction]";
      var symbolTag = "[object Symbol]";
      var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
      var reIsPlainProp = /^\w*$/;
      var reLeadingDot = /^\./;
      var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
      var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
      var reEscapeChar = /\\(\\)?/g;
      var reIsHostCtor = /^\[object .+?Constructor\]$/;
      var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
      var freeSelf = typeof self == "object" && self && self.Object === Object && self;
      var root = freeGlobal || freeSelf || Function("return this")();
      function getValue(object, key) {
        return object == null ? void 0 : object[key];
      }
      function isHostObject(value) {
        var result = false;
        if (value != null && typeof value.toString != "function") {
          try {
            result = !!(value + "");
          } catch (e) {
          }
        }
        return result;
      }
      var arrayProto = Array.prototype;
      var funcProto = Function.prototype;
      var objectProto = Object.prototype;
      var coreJsData = root["__core-js_shared__"];
      var maskSrcKey = (function() {
        var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
        return uid ? "Symbol(src)_1." + uid : "";
      })();
      var funcToString = funcProto.toString;
      var hasOwnProperty = objectProto.hasOwnProperty;
      var objectToString = objectProto.toString;
      var reIsNative = RegExp(
        "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
      );
      var Symbol2 = root.Symbol;
      var splice = arrayProto.splice;
      var Map = getNative(root, "Map");
      var nativeCreate = getNative(Object, "create");
      var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
      var symbolToString = symbolProto ? symbolProto.toString : void 0;
      function Hash(entries) {
        var index = -1, length = entries ? entries.length : 0;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      function hashClear() {
        this.__data__ = nativeCreate ? nativeCreate(null) : {};
      }
      function hashDelete(key) {
        return this.has(key) && delete this.__data__[key];
      }
      function hashGet(key) {
        var data = this.__data__;
        if (nativeCreate) {
          var result = data[key];
          return result === HASH_UNDEFINED ? void 0 : result;
        }
        return hasOwnProperty.call(data, key) ? data[key] : void 0;
      }
      function hashHas(key) {
        var data = this.__data__;
        return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
      }
      function hashSet(key, value) {
        var data = this.__data__;
        data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
        return this;
      }
      Hash.prototype.clear = hashClear;
      Hash.prototype["delete"] = hashDelete;
      Hash.prototype.get = hashGet;
      Hash.prototype.has = hashHas;
      Hash.prototype.set = hashSet;
      function ListCache(entries) {
        var index = -1, length = entries ? entries.length : 0;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      function listCacheClear() {
        this.__data__ = [];
      }
      function listCacheDelete(key) {
        var data = this.__data__, index = assocIndexOf(data, key);
        if (index < 0) {
          return false;
        }
        var lastIndex = data.length - 1;
        if (index == lastIndex) {
          data.pop();
        } else {
          splice.call(data, index, 1);
        }
        return true;
      }
      function listCacheGet(key) {
        var data = this.__data__, index = assocIndexOf(data, key);
        return index < 0 ? void 0 : data[index][1];
      }
      function listCacheHas(key) {
        return assocIndexOf(this.__data__, key) > -1;
      }
      function listCacheSet(key, value) {
        var data = this.__data__, index = assocIndexOf(data, key);
        if (index < 0) {
          data.push([key, value]);
        } else {
          data[index][1] = value;
        }
        return this;
      }
      ListCache.prototype.clear = listCacheClear;
      ListCache.prototype["delete"] = listCacheDelete;
      ListCache.prototype.get = listCacheGet;
      ListCache.prototype.has = listCacheHas;
      ListCache.prototype.set = listCacheSet;
      function MapCache(entries) {
        var index = -1, length = entries ? entries.length : 0;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      function mapCacheClear() {
        this.__data__ = {
          "hash": new Hash(),
          "map": new (Map || ListCache)(),
          "string": new Hash()
        };
      }
      function mapCacheDelete(key) {
        return getMapData(this, key)["delete"](key);
      }
      function mapCacheGet(key) {
        return getMapData(this, key).get(key);
      }
      function mapCacheHas(key) {
        return getMapData(this, key).has(key);
      }
      function mapCacheSet(key, value) {
        getMapData(this, key).set(key, value);
        return this;
      }
      MapCache.prototype.clear = mapCacheClear;
      MapCache.prototype["delete"] = mapCacheDelete;
      MapCache.prototype.get = mapCacheGet;
      MapCache.prototype.has = mapCacheHas;
      MapCache.prototype.set = mapCacheSet;
      function assocIndexOf(array, key) {
        var length = array.length;
        while (length--) {
          if (eq(array[length][0], key)) {
            return length;
          }
        }
        return -1;
      }
      function baseGet(object, path) {
        path = isKey(path, object) ? [path] : castPath(path);
        var index = 0, length = path.length;
        while (object != null && index < length) {
          object = object[toKey(path[index++])];
        }
        return index && index == length ? object : void 0;
      }
      function baseIsNative(value) {
        if (!isObject(value) || isMasked(value)) {
          return false;
        }
        var pattern = isFunction(value) || isHostObject(value) ? reIsNative : reIsHostCtor;
        return pattern.test(toSource(value));
      }
      function baseToString(value) {
        if (typeof value == "string") {
          return value;
        }
        if (isSymbol(value)) {
          return symbolToString ? symbolToString.call(value) : "";
        }
        var result = value + "";
        return result == "0" && 1 / value == -INFINITY ? "-0" : result;
      }
      function castPath(value) {
        return isArray(value) ? value : stringToPath(value);
      }
      function getMapData(map, key) {
        var data = map.__data__;
        return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
      }
      function getNative(object, key) {
        var value = getValue(object, key);
        return baseIsNative(value) ? value : void 0;
      }
      function isKey(value, object) {
        if (isArray(value)) {
          return false;
        }
        var type = typeof value;
        if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
          return true;
        }
        return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
      }
      function isKeyable(value) {
        var type = typeof value;
        return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
      }
      function isMasked(func) {
        return !!maskSrcKey && maskSrcKey in func;
      }
      var stringToPath = memoize(function(string) {
        string = toString(string);
        var result = [];
        if (reLeadingDot.test(string)) {
          result.push("");
        }
        string.replace(rePropName, function(match, number, quote, string2) {
          result.push(quote ? string2.replace(reEscapeChar, "$1") : number || match);
        });
        return result;
      });
      function toKey(value) {
        if (typeof value == "string" || isSymbol(value)) {
          return value;
        }
        var result = value + "";
        return result == "0" && 1 / value == -INFINITY ? "-0" : result;
      }
      function toSource(func) {
        if (func != null) {
          try {
            return funcToString.call(func);
          } catch (e) {
          }
          try {
            return func + "";
          } catch (e) {
          }
        }
        return "";
      }
      function memoize(func, resolver) {
        if (typeof func != "function" || resolver && typeof resolver != "function") {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        var memoized = function() {
          var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
          if (cache.has(key)) {
            return cache.get(key);
          }
          var result = func.apply(this, args);
          memoized.cache = cache.set(key, result);
          return result;
        };
        memoized.cache = new (memoize.Cache || MapCache)();
        return memoized;
      }
      memoize.Cache = MapCache;
      function eq(value, other) {
        return value === other || value !== value && other !== other;
      }
      var isArray = Array.isArray;
      function isFunction(value) {
        var tag = isObject(value) ? objectToString.call(value) : "";
        return tag == funcTag || tag == genTag;
      }
      function isObject(value) {
        var type = typeof value;
        return !!value && (type == "object" || type == "function");
      }
      function isObjectLike(value) {
        return !!value && typeof value == "object";
      }
      function isSymbol(value) {
        return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
      }
      function toString(value) {
        return value == null ? "" : baseToString(value);
      }
      function get2(object, path, defaultValue) {
        var result = object == null ? void 0 : baseGet(object, path);
        return result === void 0 ? defaultValue : result;
      }
      module.exports = get2;
    }
  });

  // node_modules/lodash.clonedeep/index.js
  var require_lodash2 = __commonJS({
    "node_modules/lodash.clonedeep/index.js"(exports, module) {
      var LARGE_ARRAY_SIZE = 200;
      var HASH_UNDEFINED = "__lodash_hash_undefined__";
      var MAX_SAFE_INTEGER = 9007199254740991;
      var argsTag = "[object Arguments]";
      var arrayTag = "[object Array]";
      var boolTag = "[object Boolean]";
      var dateTag = "[object Date]";
      var errorTag = "[object Error]";
      var funcTag = "[object Function]";
      var genTag = "[object GeneratorFunction]";
      var mapTag = "[object Map]";
      var numberTag = "[object Number]";
      var objectTag = "[object Object]";
      var promiseTag = "[object Promise]";
      var regexpTag = "[object RegExp]";
      var setTag = "[object Set]";
      var stringTag = "[object String]";
      var symbolTag = "[object Symbol]";
      var weakMapTag = "[object WeakMap]";
      var arrayBufferTag = "[object ArrayBuffer]";
      var dataViewTag = "[object DataView]";
      var float32Tag = "[object Float32Array]";
      var float64Tag = "[object Float64Array]";
      var int8Tag = "[object Int8Array]";
      var int16Tag = "[object Int16Array]";
      var int32Tag = "[object Int32Array]";
      var uint8Tag = "[object Uint8Array]";
      var uint8ClampedTag = "[object Uint8ClampedArray]";
      var uint16Tag = "[object Uint16Array]";
      var uint32Tag = "[object Uint32Array]";
      var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
      var reFlags = /\w*$/;
      var reIsHostCtor = /^\[object .+?Constructor\]$/;
      var reIsUint = /^(?:0|[1-9]\d*)$/;
      var cloneableTags = {};
      cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
      cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
      var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
      var freeSelf = typeof self == "object" && self && self.Object === Object && self;
      var root = freeGlobal || freeSelf || Function("return this")();
      var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
      var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
      var moduleExports = freeModule && freeModule.exports === freeExports;
      function addMapEntry(map, pair) {
        map.set(pair[0], pair[1]);
        return map;
      }
      function addSetEntry(set2, value) {
        set2.add(value);
        return set2;
      }
      function arrayEach(array, iteratee) {
        var index = -1, length = array ? array.length : 0;
        while (++index < length) {
          if (iteratee(array[index], index, array) === false) {
            break;
          }
        }
        return array;
      }
      function arrayPush(array, values) {
        var index = -1, length = values.length, offset = array.length;
        while (++index < length) {
          array[offset + index] = values[index];
        }
        return array;
      }
      function arrayReduce(array, iteratee, accumulator, initAccum) {
        var index = -1, length = array ? array.length : 0;
        if (initAccum && length) {
          accumulator = array[++index];
        }
        while (++index < length) {
          accumulator = iteratee(accumulator, array[index], index, array);
        }
        return accumulator;
      }
      function baseTimes(n, iteratee) {
        var index = -1, result = Array(n);
        while (++index < n) {
          result[index] = iteratee(index);
        }
        return result;
      }
      function getValue(object, key) {
        return object == null ? void 0 : object[key];
      }
      function isHostObject(value) {
        var result = false;
        if (value != null && typeof value.toString != "function") {
          try {
            result = !!(value + "");
          } catch (e) {
          }
        }
        return result;
      }
      function mapToArray(map) {
        var index = -1, result = Array(map.size);
        map.forEach(function(value, key) {
          result[++index] = [key, value];
        });
        return result;
      }
      function overArg(func, transform) {
        return function(arg) {
          return func(transform(arg));
        };
      }
      function setToArray(set2) {
        var index = -1, result = Array(set2.size);
        set2.forEach(function(value) {
          result[++index] = value;
        });
        return result;
      }
      var arrayProto = Array.prototype;
      var funcProto = Function.prototype;
      var objectProto = Object.prototype;
      var coreJsData = root["__core-js_shared__"];
      var maskSrcKey = (function() {
        var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
        return uid ? "Symbol(src)_1." + uid : "";
      })();
      var funcToString = funcProto.toString;
      var hasOwnProperty = objectProto.hasOwnProperty;
      var objectToString = objectProto.toString;
      var reIsNative = RegExp(
        "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
      );
      var Buffer2 = moduleExports ? root.Buffer : void 0;
      var Symbol2 = root.Symbol;
      var Uint8Array2 = root.Uint8Array;
      var getPrototype = overArg(Object.getPrototypeOf, Object);
      var objectCreate = Object.create;
      var propertyIsEnumerable = objectProto.propertyIsEnumerable;
      var splice = arrayProto.splice;
      var nativeGetSymbols = Object.getOwnPropertySymbols;
      var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
      var nativeKeys = overArg(Object.keys, Object);
      var DataView = getNative(root, "DataView");
      var Map = getNative(root, "Map");
      var Promise2 = getNative(root, "Promise");
      var Set2 = getNative(root, "Set");
      var WeakMap = getNative(root, "WeakMap");
      var nativeCreate = getNative(Object, "create");
      var dataViewCtorString = toSource(DataView);
      var mapCtorString = toSource(Map);
      var promiseCtorString = toSource(Promise2);
      var setCtorString = toSource(Set2);
      var weakMapCtorString = toSource(WeakMap);
      var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
      var symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
      function Hash(entries) {
        var index = -1, length = entries ? entries.length : 0;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      function hashClear() {
        this.__data__ = nativeCreate ? nativeCreate(null) : {};
      }
      function hashDelete(key) {
        return this.has(key) && delete this.__data__[key];
      }
      function hashGet(key) {
        var data = this.__data__;
        if (nativeCreate) {
          var result = data[key];
          return result === HASH_UNDEFINED ? void 0 : result;
        }
        return hasOwnProperty.call(data, key) ? data[key] : void 0;
      }
      function hashHas(key) {
        var data = this.__data__;
        return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
      }
      function hashSet(key, value) {
        var data = this.__data__;
        data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
        return this;
      }
      Hash.prototype.clear = hashClear;
      Hash.prototype["delete"] = hashDelete;
      Hash.prototype.get = hashGet;
      Hash.prototype.has = hashHas;
      Hash.prototype.set = hashSet;
      function ListCache(entries) {
        var index = -1, length = entries ? entries.length : 0;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      function listCacheClear() {
        this.__data__ = [];
      }
      function listCacheDelete(key) {
        var data = this.__data__, index = assocIndexOf(data, key);
        if (index < 0) {
          return false;
        }
        var lastIndex = data.length - 1;
        if (index == lastIndex) {
          data.pop();
        } else {
          splice.call(data, index, 1);
        }
        return true;
      }
      function listCacheGet(key) {
        var data = this.__data__, index = assocIndexOf(data, key);
        return index < 0 ? void 0 : data[index][1];
      }
      function listCacheHas(key) {
        return assocIndexOf(this.__data__, key) > -1;
      }
      function listCacheSet(key, value) {
        var data = this.__data__, index = assocIndexOf(data, key);
        if (index < 0) {
          data.push([key, value]);
        } else {
          data[index][1] = value;
        }
        return this;
      }
      ListCache.prototype.clear = listCacheClear;
      ListCache.prototype["delete"] = listCacheDelete;
      ListCache.prototype.get = listCacheGet;
      ListCache.prototype.has = listCacheHas;
      ListCache.prototype.set = listCacheSet;
      function MapCache(entries) {
        var index = -1, length = entries ? entries.length : 0;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      function mapCacheClear() {
        this.__data__ = {
          "hash": new Hash(),
          "map": new (Map || ListCache)(),
          "string": new Hash()
        };
      }
      function mapCacheDelete(key) {
        return getMapData(this, key)["delete"](key);
      }
      function mapCacheGet(key) {
        return getMapData(this, key).get(key);
      }
      function mapCacheHas(key) {
        return getMapData(this, key).has(key);
      }
      function mapCacheSet(key, value) {
        getMapData(this, key).set(key, value);
        return this;
      }
      MapCache.prototype.clear = mapCacheClear;
      MapCache.prototype["delete"] = mapCacheDelete;
      MapCache.prototype.get = mapCacheGet;
      MapCache.prototype.has = mapCacheHas;
      MapCache.prototype.set = mapCacheSet;
      function Stack2(entries) {
        this.__data__ = new ListCache(entries);
      }
      function stackClear() {
        this.__data__ = new ListCache();
      }
      function stackDelete(key) {
        return this.__data__["delete"](key);
      }
      function stackGet(key) {
        return this.__data__.get(key);
      }
      function stackHas(key) {
        return this.__data__.has(key);
      }
      function stackSet(key, value) {
        var cache = this.__data__;
        if (cache instanceof ListCache) {
          var pairs = cache.__data__;
          if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
            pairs.push([key, value]);
            return this;
          }
          cache = this.__data__ = new MapCache(pairs);
        }
        cache.set(key, value);
        return this;
      }
      Stack2.prototype.clear = stackClear;
      Stack2.prototype["delete"] = stackDelete;
      Stack2.prototype.get = stackGet;
      Stack2.prototype.has = stackHas;
      Stack2.prototype.set = stackSet;
      function arrayLikeKeys(value, inherited) {
        var result = isArray(value) || isArguments(value) ? baseTimes(value.length, String) : [];
        var length = result.length, skipIndexes = !!length;
        for (var key in value) {
          if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == "length" || isIndex(key, length)))) {
            result.push(key);
          }
        }
        return result;
      }
      function assignValue(object, key, value) {
        var objValue = object[key];
        if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) {
          object[key] = value;
        }
      }
      function assocIndexOf(array, key) {
        var length = array.length;
        while (length--) {
          if (eq(array[length][0], key)) {
            return length;
          }
        }
        return -1;
      }
      function baseAssign(object, source) {
        return object && copyObject(source, keys(source), object);
      }
      function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
        var result;
        if (customizer) {
          result = object ? customizer(value, key, object, stack) : customizer(value);
        }
        if (result !== void 0) {
          return result;
        }
        if (!isObject(value)) {
          return value;
        }
        var isArr = isArray(value);
        if (isArr) {
          result = initCloneArray(value);
          if (!isDeep) {
            return copyArray(value, result);
          }
        } else {
          var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
          if (isBuffer(value)) {
            return cloneBuffer(value, isDeep);
          }
          if (tag == objectTag || tag == argsTag || isFunc && !object) {
            if (isHostObject(value)) {
              return object ? value : {};
            }
            result = initCloneObject(isFunc ? {} : value);
            if (!isDeep) {
              return copySymbols(value, baseAssign(result, value));
            }
          } else {
            if (!cloneableTags[tag]) {
              return object ? value : {};
            }
            result = initCloneByTag(value, tag, baseClone, isDeep);
          }
        }
        stack || (stack = new Stack2());
        var stacked = stack.get(value);
        if (stacked) {
          return stacked;
        }
        stack.set(value, result);
        if (!isArr) {
          var props = isFull ? getAllKeys(value) : keys(value);
        }
        arrayEach(props || value, function(subValue, key2) {
          if (props) {
            key2 = subValue;
            subValue = value[key2];
          }
          assignValue(result, key2, baseClone(subValue, isDeep, isFull, customizer, key2, value, stack));
        });
        return result;
      }
      function baseCreate(proto) {
        return isObject(proto) ? objectCreate(proto) : {};
      }
      function baseGetAllKeys(object, keysFunc, symbolsFunc) {
        var result = keysFunc(object);
        return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
      }
      function baseGetTag(value) {
        return objectToString.call(value);
      }
      function baseIsNative(value) {
        if (!isObject(value) || isMasked(value)) {
          return false;
        }
        var pattern = isFunction(value) || isHostObject(value) ? reIsNative : reIsHostCtor;
        return pattern.test(toSource(value));
      }
      function baseKeys(object) {
        if (!isPrototype(object)) {
          return nativeKeys(object);
        }
        var result = [];
        for (var key in Object(object)) {
          if (hasOwnProperty.call(object, key) && key != "constructor") {
            result.push(key);
          }
        }
        return result;
      }
      function cloneBuffer(buffer, isDeep) {
        if (isDeep) {
          return buffer.slice();
        }
        var result = new buffer.constructor(buffer.length);
        buffer.copy(result);
        return result;
      }
      function cloneArrayBuffer(arrayBuffer) {
        var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
        new Uint8Array2(result).set(new Uint8Array2(arrayBuffer));
        return result;
      }
      function cloneDataView(dataView, isDeep) {
        var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
        return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
      }
      function cloneMap(map, isDeep, cloneFunc) {
        var array = isDeep ? cloneFunc(mapToArray(map), true) : mapToArray(map);
        return arrayReduce(array, addMapEntry, new map.constructor());
      }
      function cloneRegExp(regexp) {
        var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
        result.lastIndex = regexp.lastIndex;
        return result;
      }
      function cloneSet(set2, isDeep, cloneFunc) {
        var array = isDeep ? cloneFunc(setToArray(set2), true) : setToArray(set2);
        return arrayReduce(array, addSetEntry, new set2.constructor());
      }
      function cloneSymbol(symbol) {
        return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
      }
      function cloneTypedArray(typedArray, isDeep) {
        var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
        return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
      }
      function copyArray(source, array) {
        var index = -1, length = source.length;
        array || (array = Array(length));
        while (++index < length) {
          array[index] = source[index];
        }
        return array;
      }
      function copyObject(source, props, object, customizer) {
        object || (object = {});
        var index = -1, length = props.length;
        while (++index < length) {
          var key = props[index];
          var newValue = customizer ? customizer(object[key], source[key], key, object, source) : void 0;
          assignValue(object, key, newValue === void 0 ? source[key] : newValue);
        }
        return object;
      }
      function copySymbols(source, object) {
        return copyObject(source, getSymbols(source), object);
      }
      function getAllKeys(object) {
        return baseGetAllKeys(object, keys, getSymbols);
      }
      function getMapData(map, key) {
        var data = map.__data__;
        return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
      }
      function getNative(object, key) {
        var value = getValue(object, key);
        return baseIsNative(value) ? value : void 0;
      }
      var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;
      var getTag = baseGetTag;
      if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set2 && getTag(new Set2()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
        getTag = function(value) {
          var result = objectToString.call(value), Ctor = result == objectTag ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : void 0;
          if (ctorString) {
            switch (ctorString) {
              case dataViewCtorString:
                return dataViewTag;
              case mapCtorString:
                return mapTag;
              case promiseCtorString:
                return promiseTag;
              case setCtorString:
                return setTag;
              case weakMapCtorString:
                return weakMapTag;
            }
          }
          return result;
        };
      }
      function initCloneArray(array) {
        var length = array.length, result = array.constructor(length);
        if (length && typeof array[0] == "string" && hasOwnProperty.call(array, "index")) {
          result.index = array.index;
          result.input = array.input;
        }
        return result;
      }
      function initCloneObject(object) {
        return typeof object.constructor == "function" && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
      }
      function initCloneByTag(object, tag, cloneFunc, isDeep) {
        var Ctor = object.constructor;
        switch (tag) {
          case arrayBufferTag:
            return cloneArrayBuffer(object);
          case boolTag:
          case dateTag:
            return new Ctor(+object);
          case dataViewTag:
            return cloneDataView(object, isDeep);
          case float32Tag:
          case float64Tag:
          case int8Tag:
          case int16Tag:
          case int32Tag:
          case uint8Tag:
          case uint8ClampedTag:
          case uint16Tag:
          case uint32Tag:
            return cloneTypedArray(object, isDeep);
          case mapTag:
            return cloneMap(object, isDeep, cloneFunc);
          case numberTag:
          case stringTag:
            return new Ctor(object);
          case regexpTag:
            return cloneRegExp(object);
          case setTag:
            return cloneSet(object, isDeep, cloneFunc);
          case symbolTag:
            return cloneSymbol(object);
        }
      }
      function isIndex(value, length) {
        length = length == null ? MAX_SAFE_INTEGER : length;
        return !!length && (typeof value == "number" || reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
      }
      function isKeyable(value) {
        var type = typeof value;
        return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
      }
      function isMasked(func) {
        return !!maskSrcKey && maskSrcKey in func;
      }
      function isPrototype(value) {
        var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
        return value === proto;
      }
      function toSource(func) {
        if (func != null) {
          try {
            return funcToString.call(func);
          } catch (e) {
          }
          try {
            return func + "";
          } catch (e) {
          }
        }
        return "";
      }
      function cloneDeep2(value) {
        return baseClone(value, true, true);
      }
      function eq(value, other) {
        return value === other || value !== value && other !== other;
      }
      function isArguments(value) {
        return isArrayLikeObject(value) && hasOwnProperty.call(value, "callee") && (!propertyIsEnumerable.call(value, "callee") || objectToString.call(value) == argsTag);
      }
      var isArray = Array.isArray;
      function isArrayLike(value) {
        return value != null && isLength(value.length) && !isFunction(value);
      }
      function isArrayLikeObject(value) {
        return isObjectLike(value) && isArrayLike(value);
      }
      var isBuffer = nativeIsBuffer || stubFalse;
      function isFunction(value) {
        var tag = isObject(value) ? objectToString.call(value) : "";
        return tag == funcTag || tag == genTag;
      }
      function isLength(value) {
        return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
      }
      function isObject(value) {
        var type = typeof value;
        return !!value && (type == "object" || type == "function");
      }
      function isObjectLike(value) {
        return !!value && typeof value == "object";
      }
      function keys(object) {
        return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
      }
      function stubArray() {
        return [];
      }
      function stubFalse() {
        return false;
      }
      module.exports = cloneDeep2;
    }
  });

  // js/pattern-source.js
  var pattern_source_exports = {};
  __export(pattern_source_exports, {
    customer: () => customer,
    distance: () => distance,
    flatten: () => flatten,
    generate: () => generate,
    limits: () => limits,
    operations: () => operations,
    version: () => version2
  });

  // node_modules/bezier-js/src/utils.js
  var { abs, cos, sin, acos, atan2, sqrt, pow } = Math;
  function crt(v2) {
    return v2 < 0 ? -pow(-v2, 1 / 3) : pow(v2, 1 / 3);
  }
  var pi = Math.PI;
  var tau = 2 * pi;
  var quart = pi / 2;
  var epsilon = 1e-6;
  var nMax = Number.MAX_SAFE_INTEGER || 9007199254740991;
  var nMin = Number.MIN_SAFE_INTEGER || -9007199254740991;
  var ZERO = { x: 0, y: 0, z: 0 };
  var utils = {
    // Legendre-Gauss abscissae with n=24 (x_i values, defined at i=n as the roots of the nth order Legendre polynomial Pn(x))
    Tvalues: [
      -0.06405689286260563,
      0.06405689286260563,
      -0.1911188674736163,
      0.1911188674736163,
      -0.3150426796961634,
      0.3150426796961634,
      -0.4337935076260451,
      0.4337935076260451,
      -0.5454214713888396,
      0.5454214713888396,
      -0.6480936519369755,
      0.6480936519369755,
      -0.7401241915785544,
      0.7401241915785544,
      -0.820001985973903,
      0.820001985973903,
      -0.8864155270044011,
      0.8864155270044011,
      -0.9382745520027328,
      0.9382745520027328,
      -0.9747285559713095,
      0.9747285559713095,
      -0.9951872199970213,
      0.9951872199970213
    ],
    // Legendre-Gauss weights with n=24 (w_i values, defined by a function linked to in the Bezier primer article)
    Cvalues: [
      0.12793819534675216,
      0.12793819534675216,
      0.1258374563468283,
      0.1258374563468283,
      0.12167047292780339,
      0.12167047292780339,
      0.1155056680537256,
      0.1155056680537256,
      0.10744427011596563,
      0.10744427011596563,
      0.09761865210411388,
      0.09761865210411388,
      0.08619016153195327,
      0.08619016153195327,
      0.0733464814110803,
      0.0733464814110803,
      0.05929858491543678,
      0.05929858491543678,
      0.04427743881741981,
      0.04427743881741981,
      0.028531388628933663,
      0.028531388628933663,
      0.0123412297999872,
      0.0123412297999872
    ],
    arcfn: function(t2, derivativeFn) {
      const d = derivativeFn(t2);
      let l = d.x * d.x + d.y * d.y;
      if (typeof d.z !== "undefined") {
        l += d.z * d.z;
      }
      return sqrt(l);
    },
    compute: function(t2, points, _3d) {
      if (t2 === 0) {
        points[0].t = 0;
        return points[0];
      }
      const order = points.length - 1;
      if (t2 === 1) {
        points[order].t = 1;
        return points[order];
      }
      const mt = 1 - t2;
      let p = points;
      if (order === 0) {
        points[0].t = t2;
        return points[0];
      }
      if (order === 1) {
        const ret = {
          x: mt * p[0].x + t2 * p[1].x,
          y: mt * p[0].y + t2 * p[1].y,
          t: t2
        };
        if (_3d) {
          ret.z = mt * p[0].z + t2 * p[1].z;
        }
        return ret;
      }
      if (order < 4) {
        let mt2 = mt * mt, t22 = t2 * t2, a2, b, c2, d = 0;
        if (order === 2) {
          p = [p[0], p[1], p[2], ZERO];
          a2 = mt2;
          b = mt * t2 * 2;
          c2 = t22;
        } else if (order === 3) {
          a2 = mt2 * mt;
          b = mt2 * t2 * 3;
          c2 = mt * t22 * 3;
          d = t2 * t22;
        }
        const ret = {
          x: a2 * p[0].x + b * p[1].x + c2 * p[2].x + d * p[3].x,
          y: a2 * p[0].y + b * p[1].y + c2 * p[2].y + d * p[3].y,
          t: t2
        };
        if (_3d) {
          ret.z = a2 * p[0].z + b * p[1].z + c2 * p[2].z + d * p[3].z;
        }
        return ret;
      }
      const dCpts = JSON.parse(JSON.stringify(points));
      while (dCpts.length > 1) {
        for (let i = 0; i < dCpts.length - 1; i++) {
          dCpts[i] = {
            x: dCpts[i].x + (dCpts[i + 1].x - dCpts[i].x) * t2,
            y: dCpts[i].y + (dCpts[i + 1].y - dCpts[i].y) * t2
          };
          if (typeof dCpts[i].z !== "undefined") {
            dCpts[i].z = dCpts[i].z + (dCpts[i + 1].z - dCpts[i].z) * t2;
          }
        }
        dCpts.splice(dCpts.length - 1, 1);
      }
      dCpts[0].t = t2;
      return dCpts[0];
    },
    computeWithRatios: function(t2, points, ratios, _3d) {
      const mt = 1 - t2, r = ratios, p = points;
      let f1 = r[0], f2 = r[1], f3 = r[2], f4 = r[3], d;
      f1 *= mt;
      f2 *= t2;
      if (p.length === 2) {
        d = f1 + f2;
        return {
          x: (f1 * p[0].x + f2 * p[1].x) / d,
          y: (f1 * p[0].y + f2 * p[1].y) / d,
          z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z) / d,
          t: t2
        };
      }
      f1 *= mt;
      f2 *= 2 * mt;
      f3 *= t2 * t2;
      if (p.length === 3) {
        d = f1 + f2 + f3;
        return {
          x: (f1 * p[0].x + f2 * p[1].x + f3 * p[2].x) / d,
          y: (f1 * p[0].y + f2 * p[1].y + f3 * p[2].y) / d,
          z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z + f3 * p[2].z) / d,
          t: t2
        };
      }
      f1 *= mt;
      f2 *= 1.5 * mt;
      f3 *= 3 * mt;
      f4 *= t2 * t2 * t2;
      if (p.length === 4) {
        d = f1 + f2 + f3 + f4;
        return {
          x: (f1 * p[0].x + f2 * p[1].x + f3 * p[2].x + f4 * p[3].x) / d,
          y: (f1 * p[0].y + f2 * p[1].y + f3 * p[2].y + f4 * p[3].y) / d,
          z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z + f3 * p[2].z + f4 * p[3].z) / d,
          t: t2
        };
      }
    },
    derive: function(points, _3d) {
      const dpoints = [];
      for (let p = points, d = p.length, c2 = d - 1; d > 1; d--, c2--) {
        const list = [];
        for (let j = 0, dpt; j < c2; j++) {
          dpt = {
            x: c2 * (p[j + 1].x - p[j].x),
            y: c2 * (p[j + 1].y - p[j].y)
          };
          if (_3d) {
            dpt.z = c2 * (p[j + 1].z - p[j].z);
          }
          list.push(dpt);
        }
        dpoints.push(list);
        p = list;
      }
      return dpoints;
    },
    between: function(v2, m, M) {
      return m <= v2 && v2 <= M || utils.approximately(v2, m) || utils.approximately(v2, M);
    },
    approximately: function(a2, b, precision) {
      return abs(a2 - b) <= (precision || epsilon);
    },
    length: function(derivativeFn) {
      const z = 0.5, len = utils.Tvalues.length;
      let sum = 0;
      for (let i = 0, t2; i < len; i++) {
        t2 = z * utils.Tvalues[i] + z;
        sum += utils.Cvalues[i] * utils.arcfn(t2, derivativeFn);
      }
      return z * sum;
    },
    map: function(v2, ds, de, ts, te) {
      const d1 = de - ds, d2 = te - ts, v22 = v2 - ds, r = v22 / d1;
      return ts + d2 * r;
    },
    lerp: function(r, v1, v2) {
      const ret = {
        x: v1.x + r * (v2.x - v1.x),
        y: v1.y + r * (v2.y - v1.y)
      };
      if (v1.z !== void 0 && v2.z !== void 0) {
        ret.z = v1.z + r * (v2.z - v1.z);
      }
      return ret;
    },
    pointToString: function(p) {
      let s = p.x + "/" + p.y;
      if (typeof p.z !== "undefined") {
        s += "/" + p.z;
      }
      return s;
    },
    pointsToString: function(points) {
      return "[" + points.map(utils.pointToString).join(", ") + "]";
    },
    copy: function(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    angle: function(o, v1, v2) {
      const dx1 = v1.x - o.x, dy1 = v1.y - o.y, dx2 = v2.x - o.x, dy2 = v2.y - o.y, cross = dx1 * dy2 - dy1 * dx2, dot = dx1 * dx2 + dy1 * dy2;
      return atan2(cross, dot);
    },
    // round as string, to avoid rounding errors
    round: function(v2, d) {
      const s = "" + v2;
      const pos = s.indexOf(".");
      return parseFloat(s.substring(0, pos + 1 + d));
    },
    dist: function(p1, p2) {
      const dx = p1.x - p2.x, dy = p1.y - p2.y;
      return sqrt(dx * dx + dy * dy);
    },
    closest: function(LUT, point) {
      let mdist = pow(2, 63), mpos, d;
      LUT.forEach(function(p, idx) {
        d = utils.dist(point, p);
        if (d < mdist) {
          mdist = d;
          mpos = idx;
        }
      });
      return { mdist, mpos };
    },
    abcratio: function(t2, n) {
      if (n !== 2 && n !== 3) {
        return false;
      }
      if (typeof t2 === "undefined") {
        t2 = 0.5;
      } else if (t2 === 0 || t2 === 1) {
        return t2;
      }
      const bottom = pow(t2, n) + pow(1 - t2, n), top = bottom - 1;
      return abs(top / bottom);
    },
    projectionratio: function(t2, n) {
      if (n !== 2 && n !== 3) {
        return false;
      }
      if (typeof t2 === "undefined") {
        t2 = 0.5;
      } else if (t2 === 0 || t2 === 1) {
        return t2;
      }
      const top = pow(1 - t2, n), bottom = pow(t2, n) + top;
      return top / bottom;
    },
    lli8: function(x1, y1, x2, y2, x3, y3, x4, y4) {
      const nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4), ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4), d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
      if (d == 0) {
        return false;
      }
      return { x: nx / d, y: ny / d };
    },
    lli4: function(p1, p2, p3, p4) {
      const x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y, x3 = p3.x, y3 = p3.y, x4 = p4.x, y4 = p4.y;
      return utils.lli8(x1, y1, x2, y2, x3, y3, x4, y4);
    },
    lli: function(v1, v2) {
      return utils.lli4(v1, v1.c, v2, v2.c);
    },
    makeline: function(p1, p2) {
      return new Bezier(
        p1.x,
        p1.y,
        (p1.x + p2.x) / 2,
        (p1.y + p2.y) / 2,
        p2.x,
        p2.y
      );
    },
    findbbox: function(sections) {
      let mx = nMax, my = nMax, MX = nMin, MY = nMin;
      sections.forEach(function(s) {
        const bbox = s.bbox();
        if (mx > bbox.x.min) mx = bbox.x.min;
        if (my > bbox.y.min) my = bbox.y.min;
        if (MX < bbox.x.max) MX = bbox.x.max;
        if (MY < bbox.y.max) MY = bbox.y.max;
      });
      return {
        x: { min: mx, mid: (mx + MX) / 2, max: MX, size: MX - mx },
        y: { min: my, mid: (my + MY) / 2, max: MY, size: MY - my }
      };
    },
    shapeintersections: function(s1, bbox1, s2, bbox2, curveIntersectionThreshold) {
      if (!utils.bboxoverlap(bbox1, bbox2)) return [];
      const intersections = [];
      const a1 = [s1.startcap, s1.forward, s1.back, s1.endcap];
      const a2 = [s2.startcap, s2.forward, s2.back, s2.endcap];
      a1.forEach(function(l1) {
        if (l1.virtual) return;
        a2.forEach(function(l2) {
          if (l2.virtual) return;
          const iss = l1.intersects(l2, curveIntersectionThreshold);
          if (iss.length > 0) {
            iss.c1 = l1;
            iss.c2 = l2;
            iss.s1 = s1;
            iss.s2 = s2;
            intersections.push(iss);
          }
        });
      });
      return intersections;
    },
    makeshape: function(forward, back2, curveIntersectionThreshold) {
      const bpl = back2.points.length;
      const fpl = forward.points.length;
      const start = utils.makeline(back2.points[bpl - 1], forward.points[0]);
      const end = utils.makeline(forward.points[fpl - 1], back2.points[0]);
      const shape = {
        startcap: start,
        forward,
        back: back2,
        endcap: end,
        bbox: utils.findbbox([start, forward, back2, end])
      };
      shape.intersections = function(s2) {
        return utils.shapeintersections(
          shape,
          shape.bbox,
          s2,
          s2.bbox,
          curveIntersectionThreshold
        );
      };
      return shape;
    },
    getminmax: function(curve, d, list) {
      if (!list) return { min: 0, max: 0 };
      let min2 = nMax, max2 = nMin, t2, c2;
      if (list.indexOf(0) === -1) {
        list = [0].concat(list);
      }
      if (list.indexOf(1) === -1) {
        list.push(1);
      }
      for (let i = 0, len = list.length; i < len; i++) {
        t2 = list[i];
        c2 = curve.get(t2);
        if (c2[d] < min2) {
          min2 = c2[d];
        }
        if (c2[d] > max2) {
          max2 = c2[d];
        }
      }
      return { min: min2, mid: (min2 + max2) / 2, max: max2, size: max2 - min2 };
    },
    align: function(points, line2) {
      const tx = line2.p1.x, ty = line2.p1.y, a2 = -atan2(line2.p2.y - ty, line2.p2.x - tx), d = function(v2) {
        return {
          x: (v2.x - tx) * cos(a2) - (v2.y - ty) * sin(a2),
          y: (v2.x - tx) * sin(a2) + (v2.y - ty) * cos(a2)
        };
      };
      return points.map(d);
    },
    roots: function(points, line2) {
      line2 = line2 || { p1: { x: 0, y: 0 }, p2: { x: 1, y: 0 } };
      const order = points.length - 1;
      const aligned = utils.align(points, line2);
      const reduce = function(t2) {
        return 0 <= t2 && t2 <= 1;
      };
      if (order === 2) {
        const a3 = aligned[0].y, b2 = aligned[1].y, c3 = aligned[2].y, d2 = a3 - 2 * b2 + c3;
        if (d2 !== 0) {
          const m1 = -sqrt(b2 * b2 - a3 * c3), m2 = -a3 + b2, v12 = -(m1 + m2) / d2, v2 = -(-m1 + m2) / d2;
          return [v12, v2].filter(reduce);
        } else if (b2 !== c3 && d2 === 0) {
          return [(2 * b2 - c3) / (2 * b2 - 2 * c3)].filter(reduce);
        }
        return [];
      }
      const pa = aligned[0].y, pb = aligned[1].y, pc = aligned[2].y, pd = aligned[3].y;
      let d = -pa + 3 * pb - 3 * pc + pd, a2 = 3 * pa - 6 * pb + 3 * pc, b = -3 * pa + 3 * pb, c2 = pa;
      if (utils.approximately(d, 0)) {
        if (utils.approximately(a2, 0)) {
          if (utils.approximately(b, 0)) {
            return [];
          }
          return [-c2 / b].filter(reduce);
        }
        const q3 = sqrt(b * b - 4 * a2 * c2), a22 = 2 * a2;
        return [(q3 - b) / a22, (-b - q3) / a22].filter(reduce);
      }
      a2 /= d;
      b /= d;
      c2 /= d;
      const p = (3 * b - a2 * a2) / 3, p3 = p / 3, q = (2 * a2 * a2 * a2 - 9 * a2 * b + 27 * c2) / 27, q2 = q / 2, discriminant = q2 * q2 + p3 * p3 * p3;
      let u1, v1, x1, x2, x3;
      if (discriminant < 0) {
        const mp3 = -p / 3, mp33 = mp3 * mp3 * mp3, r = sqrt(mp33), t2 = -q / (2 * r), cosphi = t2 < -1 ? -1 : t2 > 1 ? 1 : t2, phi = acos(cosphi), crtr = crt(r), t1 = 2 * crtr;
        x1 = t1 * cos(phi / 3) - a2 / 3;
        x2 = t1 * cos((phi + tau) / 3) - a2 / 3;
        x3 = t1 * cos((phi + 2 * tau) / 3) - a2 / 3;
        return [x1, x2, x3].filter(reduce);
      } else if (discriminant === 0) {
        u1 = q2 < 0 ? crt(-q2) : -crt(q2);
        x1 = 2 * u1 - a2 / 3;
        x2 = -u1 - a2 / 3;
        return [x1, x2].filter(reduce);
      } else {
        const sd = sqrt(discriminant);
        u1 = crt(-q2 + sd);
        v1 = crt(q2 + sd);
        return [u1 - v1 - a2 / 3].filter(reduce);
      }
    },
    droots: function(p) {
      if (p.length === 3) {
        const a2 = p[0], b = p[1], c2 = p[2], d = a2 - 2 * b + c2;
        if (d !== 0) {
          const m1 = -sqrt(b * b - a2 * c2), m2 = -a2 + b, v1 = -(m1 + m2) / d, v2 = -(-m1 + m2) / d;
          return [v1, v2];
        } else if (b !== c2 && d === 0) {
          return [(2 * b - c2) / (2 * (b - c2))];
        }
        return [];
      }
      if (p.length === 2) {
        const a2 = p[0], b = p[1];
        if (a2 !== b) {
          return [a2 / (a2 - b)];
        }
        return [];
      }
      return [];
    },
    curvature: function(t2, d1, d2, _3d, kOnly) {
      let num, dnm, adk, dk, k = 0, r = 0;
      const d = utils.compute(t2, d1);
      const dd = utils.compute(t2, d2);
      const qdsum = d.x * d.x + d.y * d.y;
      if (_3d) {
        num = sqrt(
          pow(d.y * dd.z - dd.y * d.z, 2) + pow(d.z * dd.x - dd.z * d.x, 2) + pow(d.x * dd.y - dd.x * d.y, 2)
        );
        dnm = pow(qdsum + d.z * d.z, 3 / 2);
      } else {
        num = d.x * dd.y - d.y * dd.x;
        dnm = pow(qdsum, 3 / 2);
      }
      if (num === 0 || dnm === 0) {
        return { k: 0, r: 0 };
      }
      k = num / dnm;
      r = dnm / num;
      if (!kOnly) {
        const pk = utils.curvature(t2 - 1e-3, d1, d2, _3d, true).k;
        const nk = utils.curvature(t2 + 1e-3, d1, d2, _3d, true).k;
        dk = (nk - k + (k - pk)) / 2;
        adk = (abs(nk - k) + abs(k - pk)) / 2;
      }
      return { k, r, dk, adk };
    },
    inflections: function(points) {
      if (points.length < 4) return [];
      const p = utils.align(points, { p1: points[0], p2: points.slice(-1)[0] }), a2 = p[2].x * p[1].y, b = p[3].x * p[1].y, c2 = p[1].x * p[2].y, d = p[3].x * p[2].y, v1 = 18 * (-3 * a2 + 2 * b + 3 * c2 - d), v2 = 18 * (3 * a2 - b - 3 * c2), v3 = 18 * (c2 - a2);
      if (utils.approximately(v1, 0)) {
        if (!utils.approximately(v2, 0)) {
          let t2 = -v3 / v2;
          if (0 <= t2 && t2 <= 1) return [t2];
        }
        return [];
      }
      const d2 = 2 * v1;
      if (utils.approximately(d2, 0)) return [];
      const trm = v2 * v2 - 4 * v1 * v3;
      if (trm < 0) return [];
      const sq = Math.sqrt(trm);
      return [(sq - v2) / d2, -(v2 + sq) / d2].filter(function(r) {
        return 0 <= r && r <= 1;
      });
    },
    bboxoverlap: function(b1, b2) {
      const dims = ["x", "y"], len = dims.length;
      for (let i = 0, dim, l, t2, d; i < len; i++) {
        dim = dims[i];
        l = b1[dim].mid;
        t2 = b2[dim].mid;
        d = (b1[dim].size + b2[dim].size) / 2;
        if (abs(l - t2) >= d) return false;
      }
      return true;
    },
    expandbox: function(bbox, _bbox) {
      if (_bbox.x.min < bbox.x.min) {
        bbox.x.min = _bbox.x.min;
      }
      if (_bbox.y.min < bbox.y.min) {
        bbox.y.min = _bbox.y.min;
      }
      if (_bbox.z && _bbox.z.min < bbox.z.min) {
        bbox.z.min = _bbox.z.min;
      }
      if (_bbox.x.max > bbox.x.max) {
        bbox.x.max = _bbox.x.max;
      }
      if (_bbox.y.max > bbox.y.max) {
        bbox.y.max = _bbox.y.max;
      }
      if (_bbox.z && _bbox.z.max > bbox.z.max) {
        bbox.z.max = _bbox.z.max;
      }
      bbox.x.mid = (bbox.x.min + bbox.x.max) / 2;
      bbox.y.mid = (bbox.y.min + bbox.y.max) / 2;
      if (bbox.z) {
        bbox.z.mid = (bbox.z.min + bbox.z.max) / 2;
      }
      bbox.x.size = bbox.x.max - bbox.x.min;
      bbox.y.size = bbox.y.max - bbox.y.min;
      if (bbox.z) {
        bbox.z.size = bbox.z.max - bbox.z.min;
      }
    },
    pairiteration: function(c1, c2, curveIntersectionThreshold) {
      const c1b = c1.bbox(), c2b = c2.bbox(), r = 1e5, threshold = curveIntersectionThreshold || 0.5;
      if (c1b.x.size + c1b.y.size < threshold && c2b.x.size + c2b.y.size < threshold) {
        return [
          (r * (c1._t1 + c1._t2) / 2 | 0) / r + "/" + (r * (c2._t1 + c2._t2) / 2 | 0) / r
        ];
      }
      let cc1 = c1.split(0.5), cc2 = c2.split(0.5), pairs = [
        { left: cc1.left, right: cc2.left },
        { left: cc1.left, right: cc2.right },
        { left: cc1.right, right: cc2.right },
        { left: cc1.right, right: cc2.left }
      ];
      pairs = pairs.filter(function(pair) {
        return utils.bboxoverlap(pair.left.bbox(), pair.right.bbox());
      });
      let results = [];
      if (pairs.length === 0) return results;
      pairs.forEach(function(pair) {
        results = results.concat(
          utils.pairiteration(pair.left, pair.right, threshold)
        );
      });
      results = results.filter(function(v2, i) {
        return results.indexOf(v2) === i;
      });
      return results;
    },
    getccenter: function(p1, p2, p3) {
      const dx1 = p2.x - p1.x, dy1 = p2.y - p1.y, dx2 = p3.x - p2.x, dy2 = p3.y - p2.y, dx1p = dx1 * cos(quart) - dy1 * sin(quart), dy1p = dx1 * sin(quart) + dy1 * cos(quart), dx2p = dx2 * cos(quart) - dy2 * sin(quart), dy2p = dx2 * sin(quart) + dy2 * cos(quart), mx1 = (p1.x + p2.x) / 2, my1 = (p1.y + p2.y) / 2, mx2 = (p2.x + p3.x) / 2, my2 = (p2.y + p3.y) / 2, mx1n = mx1 + dx1p, my1n = my1 + dy1p, mx2n = mx2 + dx2p, my2n = my2 + dy2p, arc2 = utils.lli8(mx1, my1, mx1n, my1n, mx2, my2, mx2n, my2n), r = utils.dist(arc2, p1);
      let s = atan2(p1.y - arc2.y, p1.x - arc2.x), m = atan2(p2.y - arc2.y, p2.x - arc2.x), e = atan2(p3.y - arc2.y, p3.x - arc2.x), _;
      if (s < e) {
        if (s > m || m > e) {
          s += tau;
        }
        if (s > e) {
          _ = e;
          e = s;
          s = _;
        }
      } else {
        if (e < m && m < s) {
          _ = e;
          e = s;
          s = _;
        } else {
          e += tau;
        }
      }
      arc2.s = s;
      arc2.e = e;
      arc2.r = r;
      return arc2;
    },
    numberSort: function(a2, b) {
      return a2 - b;
    }
  };

  // node_modules/bezier-js/src/poly-bezier.js
  var PolyBezier = class _PolyBezier {
    constructor(curves) {
      this.curves = [];
      this._3d = false;
      if (!!curves) {
        this.curves = curves;
        this._3d = this.curves[0]._3d;
      }
    }
    valueOf() {
      return this.toString();
    }
    toString() {
      return "[" + this.curves.map(function(curve) {
        return utils.pointsToString(curve.points);
      }).join(", ") + "]";
    }
    addCurve(curve) {
      this.curves.push(curve);
      this._3d = this._3d || curve._3d;
    }
    length() {
      return this.curves.map(function(v2) {
        return v2.length();
      }).reduce(function(a2, b) {
        return a2 + b;
      });
    }
    curve(idx) {
      return this.curves[idx];
    }
    bbox() {
      const c2 = this.curves;
      var bbox = c2[0].bbox();
      for (var i = 1; i < c2.length; i++) {
        utils.expandbox(bbox, c2[i].bbox());
      }
      return bbox;
    }
    offset(d) {
      const offset = [];
      this.curves.forEach(function(v2) {
        offset.push(...v2.offset(d));
      });
      return new _PolyBezier(offset);
    }
  };

  // node_modules/bezier-js/src/bezier.js
  var { abs: abs2, min, max, cos: cos2, sin: sin2, acos: acos2, sqrt: sqrt2 } = Math;
  var pi2 = Math.PI;
  var Bezier = class _Bezier {
    constructor(coords) {
      let args = coords && coords.forEach ? coords : Array.from(arguments).slice();
      let coordlen = false;
      if (typeof args[0] === "object") {
        coordlen = args.length;
        const newargs = [];
        args.forEach(function(point2) {
          ["x", "y", "z"].forEach(function(d) {
            if (typeof point2[d] !== "undefined") {
              newargs.push(point2[d]);
            }
          });
        });
        args = newargs;
      }
      let higher = false;
      const len = args.length;
      if (coordlen) {
        if (coordlen > 4) {
          if (arguments.length !== 1) {
            throw new Error(
              "Only new Bezier(point[]) is accepted for 4th and higher order curves"
            );
          }
          higher = true;
        }
      } else {
        if (len !== 6 && len !== 8 && len !== 9 && len !== 12) {
          if (arguments.length !== 1) {
            throw new Error(
              "Only new Bezier(point[]) is accepted for 4th and higher order curves"
            );
          }
        }
      }
      const _3d = this._3d = !higher && (len === 9 || len === 12) || coords && coords[0] && typeof coords[0].z !== "undefined";
      const points = this.points = [];
      for (let idx = 0, step = _3d ? 3 : 2; idx < len; idx += step) {
        var point = {
          x: args[idx],
          y: args[idx + 1]
        };
        if (_3d) {
          point.z = args[idx + 2];
        }
        points.push(point);
      }
      const order = this.order = points.length - 1;
      const dims = this.dims = ["x", "y"];
      if (_3d) dims.push("z");
      this.dimlen = dims.length;
      const aligned = utils.align(points, { p1: points[0], p2: points[order] });
      const baselength = utils.dist(points[0], points[order]);
      this._linear = aligned.reduce((t2, p) => t2 + abs2(p.y), 0) < baselength / 50;
      this._lut = [];
      this._t1 = 0;
      this._t2 = 1;
      this.update();
    }
    static quadraticFromPoints(p1, p2, p3, t2) {
      if (typeof t2 === "undefined") {
        t2 = 0.5;
      }
      if (t2 === 0) {
        return new _Bezier(p2, p2, p3);
      }
      if (t2 === 1) {
        return new _Bezier(p1, p2, p2);
      }
      const abc = _Bezier.getABC(2, p1, p2, p3, t2);
      return new _Bezier(p1, abc.A, p3);
    }
    static cubicFromPoints(S, B, E, t2, d1) {
      if (typeof t2 === "undefined") {
        t2 = 0.5;
      }
      const abc = _Bezier.getABC(3, S, B, E, t2);
      if (typeof d1 === "undefined") {
        d1 = utils.dist(B, abc.C);
      }
      const d2 = d1 * (1 - t2) / t2;
      const selen = utils.dist(S, E), lx = (E.x - S.x) / selen, ly = (E.y - S.y) / selen, bx1 = d1 * lx, by1 = d1 * ly, bx2 = d2 * lx, by2 = d2 * ly;
      const e1 = { x: B.x - bx1, y: B.y - by1 }, e2 = { x: B.x + bx2, y: B.y + by2 }, A = abc.A, v1 = { x: A.x + (e1.x - A.x) / (1 - t2), y: A.y + (e1.y - A.y) / (1 - t2) }, v2 = { x: A.x + (e2.x - A.x) / t2, y: A.y + (e2.y - A.y) / t2 }, nc1 = { x: S.x + (v1.x - S.x) / t2, y: S.y + (v1.y - S.y) / t2 }, nc2 = {
        x: E.x + (v2.x - E.x) / (1 - t2),
        y: E.y + (v2.y - E.y) / (1 - t2)
      };
      return new _Bezier(S, nc1, nc2, E);
    }
    static getUtils() {
      return utils;
    }
    getUtils() {
      return _Bezier.getUtils();
    }
    static get PolyBezier() {
      return PolyBezier;
    }
    valueOf() {
      return this.toString();
    }
    toString() {
      return utils.pointsToString(this.points);
    }
    toSVG() {
      if (this._3d) return false;
      const p = this.points, x = p[0].x, y = p[0].y, s = ["M", x, y, this.order === 2 ? "Q" : "C"];
      for (let i = 1, last = p.length; i < last; i++) {
        s.push(p[i].x);
        s.push(p[i].y);
      }
      return s.join(" ");
    }
    setRatios(ratios) {
      if (ratios.length !== this.points.length) {
        throw new Error("incorrect number of ratio values");
      }
      this.ratios = ratios;
      this._lut = [];
    }
    verify() {
      const print = this.coordDigest();
      if (print !== this._print) {
        this._print = print;
        this.update();
      }
    }
    coordDigest() {
      return this.points.map(function(c2, pos) {
        return "" + pos + c2.x + c2.y + (c2.z ? c2.z : 0);
      }).join("");
    }
    update() {
      this._lut = [];
      this.dpoints = utils.derive(this.points, this._3d);
      this.computedirection();
    }
    computedirection() {
      const points = this.points;
      const angle = utils.angle(points[0], points[this.order], points[1]);
      this.clockwise = angle > 0;
    }
    length() {
      return utils.length(this.derivative.bind(this));
    }
    static getABC(order = 2, S, B, E, t2 = 0.5) {
      const u = utils.projectionratio(t2, order), um = 1 - u, C = {
        x: u * S.x + um * E.x,
        y: u * S.y + um * E.y
      }, s = utils.abcratio(t2, order), A = {
        x: B.x + (B.x - C.x) / s,
        y: B.y + (B.y - C.y) / s
      };
      return { A, B, C, S, E };
    }
    getABC(t2, B) {
      B = B || this.get(t2);
      let S = this.points[0];
      let E = this.points[this.order];
      return _Bezier.getABC(this.order, S, B, E, t2);
    }
    getLUT(steps) {
      this.verify();
      steps = steps || 100;
      if (this._lut.length === steps + 1) {
        return this._lut;
      }
      this._lut = [];
      steps++;
      this._lut = [];
      for (let i = 0, p, t2; i < steps; i++) {
        t2 = i / (steps - 1);
        p = this.compute(t2);
        p.t = t2;
        this._lut.push(p);
      }
      return this._lut;
    }
    on(point, error) {
      error = error || 5;
      const lut = this.getLUT(), hits = [];
      for (let i = 0, c2, t2 = 0; i < lut.length; i++) {
        c2 = lut[i];
        if (utils.dist(c2, point) < error) {
          hits.push(c2);
          t2 += i / lut.length;
        }
      }
      if (!hits.length) return false;
      return t /= hits.length;
    }
    project(point) {
      const LUT = this.getLUT(), l = LUT.length - 1, closest = utils.closest(LUT, point), mpos = closest.mpos, t1 = (mpos - 1) / l, t2 = (mpos + 1) / l, step = 0.1 / l;
      let mdist = closest.mdist, t3 = t1, ft = t3, p;
      mdist += 1;
      for (let d; t3 < t2 + step; t3 += step) {
        p = this.compute(t3);
        d = utils.dist(point, p);
        if (d < mdist) {
          mdist = d;
          ft = t3;
        }
      }
      ft = ft < 0 ? 0 : ft > 1 ? 1 : ft;
      p = this.compute(ft);
      p.t = ft;
      p.d = mdist;
      return p;
    }
    get(t2) {
      return this.compute(t2);
    }
    point(idx) {
      return this.points[idx];
    }
    compute(t2) {
      if (this.ratios) {
        return utils.computeWithRatios(t2, this.points, this.ratios, this._3d);
      }
      return utils.compute(t2, this.points, this._3d, this.ratios);
    }
    raise() {
      const p = this.points, np = [p[0]], k = p.length;
      for (let i = 1, pi3, pim; i < k; i++) {
        pi3 = p[i];
        pim = p[i - 1];
        np[i] = {
          x: (k - i) / k * pi3.x + i / k * pim.x,
          y: (k - i) / k * pi3.y + i / k * pim.y
        };
      }
      np[k] = p[k - 1];
      return new _Bezier(np);
    }
    derivative(t2) {
      return utils.compute(t2, this.dpoints[0], this._3d);
    }
    dderivative(t2) {
      return utils.compute(t2, this.dpoints[1], this._3d);
    }
    align() {
      let p = this.points;
      return new _Bezier(utils.align(p, { p1: p[0], p2: p[p.length - 1] }));
    }
    curvature(t2) {
      return utils.curvature(t2, this.dpoints[0], this.dpoints[1], this._3d);
    }
    inflections() {
      return utils.inflections(this.points);
    }
    normal(t2) {
      return this._3d ? this.__normal3(t2) : this.__normal2(t2);
    }
    __normal2(t2) {
      const d = this.derivative(t2);
      const q = sqrt2(d.x * d.x + d.y * d.y);
      return { t: t2, x: -d.y / q, y: d.x / q };
    }
    __normal3(t2) {
      const r1 = this.derivative(t2), r2 = this.derivative(t2 + 0.01), q1 = sqrt2(r1.x * r1.x + r1.y * r1.y + r1.z * r1.z), q2 = sqrt2(r2.x * r2.x + r2.y * r2.y + r2.z * r2.z);
      r1.x /= q1;
      r1.y /= q1;
      r1.z /= q1;
      r2.x /= q2;
      r2.y /= q2;
      r2.z /= q2;
      const c2 = {
        x: r2.y * r1.z - r2.z * r1.y,
        y: r2.z * r1.x - r2.x * r1.z,
        z: r2.x * r1.y - r2.y * r1.x
      };
      const m = sqrt2(c2.x * c2.x + c2.y * c2.y + c2.z * c2.z);
      c2.x /= m;
      c2.y /= m;
      c2.z /= m;
      const R = [
        c2.x * c2.x,
        c2.x * c2.y - c2.z,
        c2.x * c2.z + c2.y,
        c2.x * c2.y + c2.z,
        c2.y * c2.y,
        c2.y * c2.z - c2.x,
        c2.x * c2.z - c2.y,
        c2.y * c2.z + c2.x,
        c2.z * c2.z
      ];
      const n = {
        t: t2,
        x: R[0] * r1.x + R[1] * r1.y + R[2] * r1.z,
        y: R[3] * r1.x + R[4] * r1.y + R[5] * r1.z,
        z: R[6] * r1.x + R[7] * r1.y + R[8] * r1.z
      };
      return n;
    }
    hull(t2) {
      let p = this.points, _p = [], q = [], idx = 0;
      q[idx++] = p[0];
      q[idx++] = p[1];
      q[idx++] = p[2];
      if (this.order === 3) {
        q[idx++] = p[3];
      }
      while (p.length > 1) {
        _p = [];
        for (let i = 0, pt, l = p.length - 1; i < l; i++) {
          pt = utils.lerp(t2, p[i], p[i + 1]);
          q[idx++] = pt;
          _p.push(pt);
        }
        p = _p;
      }
      return q;
    }
    split(t1, t2) {
      if (t1 === 0 && !!t2) {
        return this.split(t2).left;
      }
      if (t2 === 1) {
        return this.split(t1).right;
      }
      const q = this.hull(t1);
      const result = {
        left: this.order === 2 ? new _Bezier([q[0], q[3], q[5]]) : new _Bezier([q[0], q[4], q[7], q[9]]),
        right: this.order === 2 ? new _Bezier([q[5], q[4], q[2]]) : new _Bezier([q[9], q[8], q[6], q[3]]),
        span: q
      };
      result.left._t1 = utils.map(0, 0, 1, this._t1, this._t2);
      result.left._t2 = utils.map(t1, 0, 1, this._t1, this._t2);
      result.right._t1 = utils.map(t1, 0, 1, this._t1, this._t2);
      result.right._t2 = utils.map(1, 0, 1, this._t1, this._t2);
      if (!t2) {
        return result;
      }
      t2 = utils.map(t2, t1, 1, 0, 1);
      return result.right.split(t2).left;
    }
    extrema() {
      const result = {};
      let roots = [];
      this.dims.forEach(
        function(dim) {
          let mfn = function(v2) {
            return v2[dim];
          };
          let p = this.dpoints[0].map(mfn);
          result[dim] = utils.droots(p);
          if (this.order === 3) {
            p = this.dpoints[1].map(mfn);
            result[dim] = result[dim].concat(utils.droots(p));
          }
          result[dim] = result[dim].filter(function(t2) {
            return t2 >= 0 && t2 <= 1;
          });
          roots = roots.concat(result[dim].sort(utils.numberSort));
        }.bind(this)
      );
      result.values = roots.sort(utils.numberSort).filter(function(v2, idx) {
        return roots.indexOf(v2) === idx;
      });
      return result;
    }
    bbox() {
      const extrema = this.extrema(), result = {};
      this.dims.forEach(
        function(d) {
          result[d] = utils.getminmax(this, d, extrema[d]);
        }.bind(this)
      );
      return result;
    }
    overlaps(curve) {
      const lbbox = this.bbox(), tbbox = curve.bbox();
      return utils.bboxoverlap(lbbox, tbbox);
    }
    offset(t2, d) {
      if (typeof d !== "undefined") {
        const c2 = this.get(t2), n = this.normal(t2);
        const ret = {
          c: c2,
          n,
          x: c2.x + n.x * d,
          y: c2.y + n.y * d
        };
        if (this._3d) {
          ret.z = c2.z + n.z * d;
        }
        return ret;
      }
      if (this._linear) {
        const nv = this.normal(0), coords = this.points.map(function(p) {
          const ret = {
            x: p.x + t2 * nv.x,
            y: p.y + t2 * nv.y
          };
          if (p.z && nv.z) {
            ret.z = p.z + t2 * nv.z;
          }
          return ret;
        });
        return [new _Bezier(coords)];
      }
      return this.reduce().map(function(s) {
        if (s._linear) {
          return s.offset(t2)[0];
        }
        return s.scale(t2);
      });
    }
    simple() {
      if (this.order === 3) {
        const a1 = utils.angle(this.points[0], this.points[3], this.points[1]);
        const a2 = utils.angle(this.points[0], this.points[3], this.points[2]);
        if (a1 > 0 && a2 < 0 || a1 < 0 && a2 > 0) return false;
      }
      const n1 = this.normal(0);
      const n2 = this.normal(1);
      let s = n1.x * n2.x + n1.y * n2.y;
      if (this._3d) {
        s += n1.z * n2.z;
      }
      return abs2(acos2(s)) < pi2 / 3;
    }
    reduce() {
      let i, t1 = 0, t2 = 0, step = 0.01, segment, pass1 = [], pass2 = [];
      let extrema = this.extrema().values;
      if (extrema.indexOf(0) === -1) {
        extrema = [0].concat(extrema);
      }
      if (extrema.indexOf(1) === -1) {
        extrema.push(1);
      }
      for (t1 = extrema[0], i = 1; i < extrema.length; i++) {
        t2 = extrema[i];
        segment = this.split(t1, t2);
        segment._t1 = t1;
        segment._t2 = t2;
        pass1.push(segment);
        t1 = t2;
      }
      pass1.forEach(function(p1) {
        t1 = 0;
        t2 = 0;
        while (t2 <= 1) {
          for (t2 = t1 + step; t2 <= 1 + step; t2 += step) {
            segment = p1.split(t1, t2);
            if (!segment.simple()) {
              t2 -= step;
              if (abs2(t1 - t2) < step) {
                return [];
              }
              segment = p1.split(t1, t2);
              segment._t1 = utils.map(t1, 0, 1, p1._t1, p1._t2);
              segment._t2 = utils.map(t2, 0, 1, p1._t1, p1._t2);
              pass2.push(segment);
              t1 = t2;
              break;
            }
          }
        }
        if (t1 < 1) {
          segment = p1.split(t1, 1);
          segment._t1 = utils.map(t1, 0, 1, p1._t1, p1._t2);
          segment._t2 = p1._t2;
          pass2.push(segment);
        }
      });
      return pass2;
    }
    translate(v2, d1, d2) {
      d2 = typeof d2 === "number" ? d2 : d1;
      const o = this.order;
      let d = this.points.map((_, i) => (1 - i / o) * d1 + i / o * d2);
      return new _Bezier(
        this.points.map((p, i) => ({
          x: p.x + v2.x * d[i],
          y: p.y + v2.y * d[i]
        }))
      );
    }
    scale(d) {
      const order = this.order;
      let distanceFn = false;
      if (typeof d === "function") {
        distanceFn = d;
      }
      if (distanceFn && order === 2) {
        return this.raise().scale(distanceFn);
      }
      const clockwise = this.clockwise;
      const points = this.points;
      if (this._linear) {
        return this.translate(
          this.normal(0),
          distanceFn ? distanceFn(0) : d,
          distanceFn ? distanceFn(1) : d
        );
      }
      const r1 = distanceFn ? distanceFn(0) : d;
      const r2 = distanceFn ? distanceFn(1) : d;
      const v2 = [this.offset(0, 10), this.offset(1, 10)];
      const np = [];
      const o = utils.lli4(v2[0], v2[0].c, v2[1], v2[1].c);
      if (!o) {
        throw new Error("cannot scale this curve. Try reducing it first.");
      }
      [0, 1].forEach(function(t2) {
        const p = np[t2 * order] = utils.copy(points[t2 * order]);
        p.x += (t2 ? r2 : r1) * v2[t2].n.x;
        p.y += (t2 ? r2 : r1) * v2[t2].n.y;
      });
      if (!distanceFn) {
        [0, 1].forEach((t2) => {
          if (order === 2 && !!t2) return;
          const p = np[t2 * order];
          const d2 = this.derivative(t2);
          const p2 = { x: p.x + d2.x, y: p.y + d2.y };
          np[t2 + 1] = utils.lli4(p, p2, o, points[t2 + 1]);
        });
        return new _Bezier(np);
      }
      [0, 1].forEach(function(t2) {
        if (order === 2 && !!t2) return;
        var p = points[t2 + 1];
        var ov = {
          x: p.x - o.x,
          y: p.y - o.y
        };
        var rc = distanceFn ? distanceFn((t2 + 1) / order) : d;
        if (distanceFn && !clockwise) rc = -rc;
        var m = sqrt2(ov.x * ov.x + ov.y * ov.y);
        ov.x /= m;
        ov.y /= m;
        np[t2 + 1] = {
          x: p.x + rc * ov.x,
          y: p.y + rc * ov.y
        };
      });
      return new _Bezier(np);
    }
    outline(d1, d2, d3, d4) {
      d2 = d2 === void 0 ? d1 : d2;
      if (this._linear) {
        const n = this.normal(0);
        const start = this.points[0];
        const end = this.points[this.points.length - 1];
        let s, mid, e;
        if (d3 === void 0) {
          d3 = d1;
          d4 = d2;
        }
        s = { x: start.x + n.x * d1, y: start.y + n.y * d1 };
        e = { x: end.x + n.x * d3, y: end.y + n.y * d3 };
        mid = { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 };
        const fline = [s, mid, e];
        s = { x: start.x - n.x * d2, y: start.y - n.y * d2 };
        e = { x: end.x - n.x * d4, y: end.y - n.y * d4 };
        mid = { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 };
        const bline = [e, mid, s];
        const ls2 = utils.makeline(bline[2], fline[0]);
        const le2 = utils.makeline(fline[2], bline[0]);
        const segments2 = [ls2, new _Bezier(fline), le2, new _Bezier(bline)];
        return new PolyBezier(segments2);
      }
      const reduced = this.reduce(), len = reduced.length, fcurves = [];
      let bcurves = [], p, alen = 0, tlen = this.length();
      const graduated = typeof d3 !== "undefined" && typeof d4 !== "undefined";
      function linearDistanceFunction(s, e, tlen2, alen2, slen) {
        return function(v2) {
          const f1 = alen2 / tlen2, f2 = (alen2 + slen) / tlen2, d = e - s;
          return utils.map(v2, 0, 1, s + f1 * d, s + f2 * d);
        };
      }
      reduced.forEach(function(segment) {
        const slen = segment.length();
        if (graduated) {
          fcurves.push(
            segment.scale(linearDistanceFunction(d1, d3, tlen, alen, slen))
          );
          bcurves.push(
            segment.scale(linearDistanceFunction(-d2, -d4, tlen, alen, slen))
          );
        } else {
          fcurves.push(segment.scale(d1));
          bcurves.push(segment.scale(-d2));
        }
        alen += slen;
      });
      bcurves = bcurves.map(function(s) {
        p = s.points;
        if (p[3]) {
          s.points = [p[3], p[2], p[1], p[0]];
        } else {
          s.points = [p[2], p[1], p[0]];
        }
        return s;
      }).reverse();
      const fs = fcurves[0].points[0], fe = fcurves[len - 1].points[fcurves[len - 1].points.length - 1], bs = bcurves[len - 1].points[bcurves[len - 1].points.length - 1], be = bcurves[0].points[0], ls = utils.makeline(bs, fs), le = utils.makeline(fe, be), segments = [ls].concat(fcurves).concat([le]).concat(bcurves);
      return new PolyBezier(segments);
    }
    outlineshapes(d1, d2, curveIntersectionThreshold) {
      d2 = d2 || d1;
      const outline = this.outline(d1, d2).curves;
      const shapes = [];
      for (let i = 1, len = outline.length; i < len / 2; i++) {
        const shape = utils.makeshape(
          outline[i],
          outline[len - i],
          curveIntersectionThreshold
        );
        shape.startcap.virtual = i > 1;
        shape.endcap.virtual = i < len / 2 - 1;
        shapes.push(shape);
      }
      return shapes;
    }
    intersects(curve, curveIntersectionThreshold) {
      if (!curve) return this.selfintersects(curveIntersectionThreshold);
      if (curve.p1 && curve.p2) {
        return this.lineIntersects(curve);
      }
      if (curve instanceof _Bezier) {
        curve = curve.reduce();
      }
      return this.curveintersects(
        this.reduce(),
        curve,
        curveIntersectionThreshold
      );
    }
    lineIntersects(line2) {
      const mx = min(line2.p1.x, line2.p2.x), my = min(line2.p1.y, line2.p2.y), MX = max(line2.p1.x, line2.p2.x), MY = max(line2.p1.y, line2.p2.y);
      return utils.roots(this.points, line2).filter((t2) => {
        var p = this.get(t2);
        return utils.between(p.x, mx, MX) && utils.between(p.y, my, MY);
      });
    }
    selfintersects(curveIntersectionThreshold) {
      const reduced = this.reduce(), len = reduced.length - 2, results = [];
      for (let i = 0, result, left, right; i < len; i++) {
        left = reduced.slice(i, i + 1);
        right = reduced.slice(i + 2);
        result = this.curveintersects(left, right, curveIntersectionThreshold);
        results.push(...result);
      }
      return results;
    }
    curveintersects(c1, c2, curveIntersectionThreshold) {
      const pairs = [];
      c1.forEach(function(l) {
        c2.forEach(function(r) {
          if (l.overlaps(r)) {
            pairs.push({ left: l, right: r });
          }
        });
      });
      let intersections = [];
      pairs.forEach(function(pair) {
        const result = utils.pairiteration(
          pair.left,
          pair.right,
          curveIntersectionThreshold
        );
        if (result.length > 0) {
          intersections = intersections.concat(result);
        }
      });
      return intersections;
    }
    arcs(errorThreshold) {
      errorThreshold = errorThreshold || 0.5;
      return this._iterate(errorThreshold, []);
    }
    _error(pc, np1, s, e) {
      const q = (e - s) / 4, c1 = this.get(s + q), c2 = this.get(e - q), ref = utils.dist(pc, np1), d1 = utils.dist(pc, c1), d2 = utils.dist(pc, c2);
      return abs2(d1 - ref) + abs2(d2 - ref);
    }
    _iterate(errorThreshold, circles) {
      let t_s = 0, t_e = 1, safety;
      do {
        safety = 0;
        t_e = 1;
        let np1 = this.get(t_s), np2, np3, arc2, prev_arc;
        let curr_good = false, prev_good = false, done;
        let t_m = t_e, prev_e = 1, step = 0;
        do {
          prev_good = curr_good;
          prev_arc = arc2;
          t_m = (t_s + t_e) / 2;
          step++;
          np2 = this.get(t_m);
          np3 = this.get(t_e);
          arc2 = utils.getccenter(np1, np2, np3);
          arc2.interval = {
            start: t_s,
            end: t_e
          };
          let error = this._error(arc2, np1, t_s, t_e);
          curr_good = error <= errorThreshold;
          done = prev_good && !curr_good;
          if (!done) prev_e = t_e;
          if (curr_good) {
            if (t_e >= 1) {
              arc2.interval.end = prev_e = 1;
              prev_arc = arc2;
              if (t_e > 1) {
                let d = {
                  x: arc2.x + arc2.r * cos2(arc2.e),
                  y: arc2.y + arc2.r * sin2(arc2.e)
                };
                arc2.e += utils.angle({ x: arc2.x, y: arc2.y }, d, this.get(1));
              }
              break;
            }
            t_e = t_e + (t_e - t_s) / 2;
          } else {
            t_e = t_m;
          }
        } while (!done && safety++ < 100);
        if (safety >= 100) {
          break;
        }
        prev_arc = prev_arc ? prev_arc : arc2;
        circles.push(prev_arc);
        t_s = prev_e;
      } while (t_e < 1);
      return circles;
    }
  };

  // node_modules/@freesewing/core/src/bezier.mjs
  var Bezier2 = class extends Bezier {
    reduce() {
      const utils2 = this.getUtils();
      const EPSILON = 1e-3;
      if (!(this.length() > 0)) {
        return [];
      }
      function reduceStep(bezier) {
        const splitTs = [];
        let t12 = 0;
        if (!(bezier._t2 - bezier._t1 >= EPSILON)) {
          return [];
        }
        if (bezier.simple()) {
          return [bezier];
        }
        while (t12 < 1) {
          const remaining = bezier.split(t12, 1);
          if (remaining.simple()) {
            break;
          }
          let low = t12 + EPSILON;
          let high = 1;
          let best = t12 + EPSILON;
          if (low > high) {
            break;
          }
          for (let i2 = 0; i2 < 20; i2++) {
            const mid = (low + high) / 2;
            const segment2 = bezier.split(t12, mid);
            if (segment2.simple()) {
              best = mid;
              low = mid;
            } else {
              high = mid;
            }
            if (t12 !== best && i2 >= 5) {
              break;
            }
          }
          splitTs.push(best);
          t12 = best;
        }
        splitTs.push(1);
        const parts = [];
        let prevT = 0;
        for (const t3 of splitTs) {
          const segment2 = bezier.split(prevT, t3);
          segment2._t1 = utils2.map(prevT, 0, 1, bezier._t1, bezier._t2);
          segment2._t2 = utils2.map(t3, 0, 1, bezier._t1, bezier._t2);
          parts.push(segment2);
          prevT = t3;
        }
        return parts;
      }
      let i, t1, t2 = 0, segment, pass1 = [], pass2 = [];
      let extrema = this.extrema().values;
      while (extrema[0] < EPSILON) {
        extrema.shift();
      }
      while (extrema[extrema.length - 1] > 1 - EPSILON) {
        extrema.shift();
      }
      extrema.unshift(0);
      extrema.push(1);
      for (t1 = extrema[0], i = 1; i < extrema.length; i++) {
        t2 = extrema[i];
        segment = this.split(t1, t2);
        segment._t1 = t1;
        segment._t2 = t2;
        pass1.push(segment);
        t1 = t2;
      }
      pass1.forEach(function(p1) {
        pass2.push(...reduceStep(p1));
      });
      return pass2;
    }
  };

  // node_modules/@freesewing/core/src/attributes.mjs
  function Attributes() {
    this.list = {};
    return this;
  }
  Attributes.prototype.add = function(name, value) {
    if (typeof this.list[name] === "undefined") {
      this.list[name] = [];
    }
    this.list[name].push(value);
    return this;
  };
  Attributes.prototype.asPropsIfPrefixIs = function(prefix = "") {
    let props = {};
    let prefixLen = prefix.length;
    for (let key in this.list) {
      if (key.substr(0, prefixLen) === prefix) {
        let propKey = key.substr(prefixLen);
        if (propKey === "class") propKey = "className";
        props[propKey] = this.get(key);
      }
    }
    return props;
  };
  Attributes.prototype.asRenderProps = function() {
    const props = {
      list: this.list,
      forSvg: this.render()
    };
    const circle = this.getAsArray("data-circle");
    if (circle) {
      props.circle = circle;
      props.circleProps = this.asPropsIfPrefixIs("data-circle-");
    }
    const text = this.getAsArray("data-text");
    if (text) {
      props.text = text;
      props.textProps = this.asPropsIfPrefixIs("data-text-");
    }
    return props;
  };
  Attributes.prototype.clone = function() {
    let clone = new Attributes();
    clone.list = JSON.parse(JSON.stringify(this.list));
    return clone;
  };
  Attributes.prototype.get = function(name) {
    if (typeof this.list[name] === "undefined") return false;
    else return this.list[name].join(" ");
  };
  Attributes.prototype.getAsArray = function(name) {
    if (typeof this.list[name] === "undefined") return false;
    else return this.list[name];
  };
  Attributes.prototype.remove = function(name) {
    delete this.list[name];
    return this;
  };
  Attributes.prototype.render = function() {
    let svg = "";
    for (let key in this.list) {
      svg += ` ${key}="${this.list[key].join(" ")}"`;
    }
    return svg;
  };
  Attributes.prototype.renderAsCss = function() {
    let css = "";
    for (let key in this.list) {
      css += ` ${key}:${this.list[key].join(" ")};`;
    }
    return css;
  };
  Attributes.prototype.renderIfPrefixIs = function(prefix = "") {
    let svg = "";
    let prefixLen = prefix.length;
    for (let key in this.list) {
      if (key.substr(0, prefixLen) === prefix) {
        svg += ` ${key.substr(prefixLen)}="${this.list[key].join(" ")}"`;
      }
    }
    return svg;
  };
  Attributes.prototype.set = function(name, value) {
    this.list[name] = [value];
    return this;
  };
  Attributes.prototype.setIfUnset = function(name, value) {
    if (typeof this.list[name] === "undefined") this.list[name] = [value];
    return this;
  };

  // node_modules/@freesewing/core/src/utils.mjs
  var utils_exports = {};
  __export(utils_exports, {
    __addNonEnumProp: () => __addNonEnumProp,
    __asNumber: () => __asNumber,
    __isCoord: () => __isCoord,
    __macroName: () => __macroName,
    __stringify: () => __stringify,
    applyTransformToPoint: () => applyTransformToPoint,
    beamIntersectsCircle: () => beamIntersectsCircle,
    beamIntersectsCurve: () => beamIntersectsCurve,
    beamIntersectsLine: () => beamIntersectsLine,
    beamIntersectsX: () => beamIntersectsX,
    beamIntersectsY: () => beamIntersectsY,
    beamsIntersect: () => beamsIntersect,
    capitalize: () => capitalize,
    cbqc: () => cbqc,
    circlesIntersect: () => circlesIntersect,
    combineTransforms: () => combineTransforms,
    curveEdge: () => curveEdge,
    curveIntersectsX: () => curveIntersectsX,
    curveIntersectsY: () => curveIntersectsY,
    curveParameterFromPoint: () => curveParameterFromPoint,
    curvesIntersect: () => curvesIntersect,
    deg2rad: () => deg2rad,
    generateStackTransform: () => generateStackTransform,
    getSnappedPercentageValue: () => getSnappedPercentageValue,
    getTransformedBounds: () => getTransformedBounds,
    goldenRatio: () => goldenRatio,
    lineIntersectsCircle: () => lineIntersectsCircle,
    lineIntersectsCurve: () => lineIntersectsCurve,
    linesIntersect: () => linesIntersect,
    mergeI18n: () => mergeI18n,
    mergeOptions: () => mergeOptions,
    pctBasedOn: () => pctBasedOn,
    pctBasedOnSa: () => pctBasedOnSa,
    pointOnBeam: () => pointOnBeam,
    pointOnCurve: () => pointOnCurve,
    pointOnLine: () => pointOnLine,
    projectPointOntoCurve: () => projectPointOntoCurve,
    projectPointOntoLine: () => projectPointOntoLine,
    rad2deg: () => rad2deg,
    round: () => round,
    snappedPctOption: () => snappedPctOption,
    splitCurve: () => splitCurve,
    stretchToScale: () => stretchToScale,
    units: () => units
  });

  // node_modules/@freesewing/core/src/point.mjs
  function Point(x, y) {
    this.x = x;
    this.y = y;
    this.attributes = new Attributes();
  }
  Point.prototype.addCircle = function(radius = false, className = false) {
    if (radius) this.attributes.add("data-circle", radius);
    if (className) this.attributes.add("data-circle-class", className);
    return this.__check();
  };
  Point.prototype.addText = function(text = "", className = false) {
    this.attributes.add("data-text", __stringify(text));
    if (className) this.attributes.add("data-text-class", className);
    return this.__check();
  };
  Point.prototype.angle = function(that) {
    let rad = Math.atan2(-1 * this.__check().dy(that.__check()), this.dx(that));
    while (rad < 0) rad += 2 * Math.PI;
    return rad2deg(rad);
  };
  Point.prototype.attr = function(name, value, overwrite = false) {
    if (overwrite) this.attributes.set(name, value);
    else this.attributes.add(name, value);
    return this.__check();
  };
  Point.prototype.clone = function() {
    this.__check();
    const clone = new Point(this.x, this.y).__withLog(this.log);
    clone.attributes = this.attributes.clone();
    return clone;
  };
  Point.prototype.copy = function() {
    return new Point(this.__check().x, this.y).__withLog(this.log);
  };
  Point.prototype.dist = function(that) {
    const dx = this.__check().x - that.__check().x;
    const dy = this.y - that.y;
    return Math.hypot(dx, dy);
  };
  Point.prototype.dx = function(that) {
    return that.__check().x - this.__check().x;
  };
  Point.prototype.dy = function(that) {
    return that.__check().y - this.__check().y;
  };
  Point.prototype.flipX = function(that = false) {
    this.__check();
    if (that) {
      if (that instanceof Point !== true)
        this.log.warn("Called `Point.flipX(that)` but `that` is not a `Point` object");
      that.__check();
    }
    if (that === false || that.x === 0) return new Point(this.x * -1, this.y).__withLog(this.log);
    else return new Point(that.x + this.dx(that), this.y).__withLog(this.log);
  };
  Point.prototype.flipY = function(that = false) {
    this.__check();
    if (that) {
      if (that instanceof Point !== true)
        this.log.warn("Called `Point.flipY(that)` but `that` is not a `Point` object");
      that.__check();
    }
    if (that === false || that.y === 0) return new Point(this.x, this.y * -1).__withLog(this.log);
    else return new Point(this.x, that.y + this.dy(that)).__withLog(this.lo);
  };
  Point.prototype.rotate = function(deg, that) {
    if (typeof deg !== "number")
      this.log.warn("Called `Point.rotate(deg,that)` but `deg` is not a number");
    if (that instanceof Point !== true)
      this.log.warn("Called `Point.rotate(deg,that)` but `that` is not a `Point` object");
    const radius = this.__check().dist(that.__check());
    const angle = this.angle(that);
    const x = that.x + radius * Math.cos(deg2rad(angle + deg)) * -1;
    const y = that.y + radius * Math.sin(deg2rad(angle + deg));
    return new Point(x, y).__withLog(this.log);
  };
  Point.prototype.setCircle = function(radius = false, className = false) {
    if (radius) this.attributes.set("data-circle", radius);
    if (className) this.attributes.set("data-circle-class", className);
    return this.__check();
  };
  Point.prototype.setText = function(text = "", className = false) {
    this.attributes.set("data-text", text);
    if (className) this.attributes.set("data-text-class", className);
    return this.__check();
  };
  Point.prototype.shift = function(deg, dist) {
    deg = __asNumber(deg, "deg", "Point.shift", this.log);
    dist = __asNumber(dist, "dist", "Point.shift", this.log);
    let p = this.__check().copy();
    p.x += dist;
    return p.rotate(deg, this);
  };
  Point.prototype.shiftFractionTowards = function(that, fraction) {
    if (that instanceof Point !== true)
      this.log.warn(
        "Called `Point.shiftFractionTowards(that, fraction)` but `that` is not a `Point` object"
      );
    if (typeof fraction !== "number")
      this.log.warn("Called `Point.shiftFractionTowards` but `fraction` is not a number");
    return this.__check().shiftTowards(that.__check(), this.dist(that) * fraction);
  };
  Point.prototype.shiftOutwards = function(that, distance2) {
    distance2 = __asNumber(distance2, "distance", "Point.shiftOutwards", this.log);
    if (that instanceof Point !== true)
      this.log.warn("Called `Point.shiftOutwards(that, distance)` but `that` is not a `Point` object");
    this.__check();
    that.__check();
    return this.__check().shiftTowards(that.__check(), this.dist(that) + distance2);
  };
  Point.prototype.shiftTowards = function(that, dist) {
    dist = __asNumber(dist, "dist", "Point.shiftTowards", this.log);
    if (that instanceof Point !== true)
      this.log.warn("Called `Point.shiftTowards(that, distance)` but `that` is not a `Point` object");
    return this.__check().shift(this.angle(that.__check()), dist);
  };
  Point.prototype.sitsOn = function(that) {
    if (that instanceof Point !== true)
      this.log.warn("Called `Point.sitsOn(that)` but `that` is not a `Point` object");
    if (this.__check().x === that.__check().x && this.y === that.y) return true;
    else return false;
  };
  Point.prototype.sitsRoughlyOn = function(that) {
    if (that instanceof Point !== true)
      this.log.warn("Called `Point.sitsRoughlyOn(that)` but `that` is not a `Point` object");
    if (Math.round(this.__check().x) === Math.round(that.__check().x) && Math.round(this.y) === Math.round(that.y))
      return true;
    else return false;
  };
  Point.prototype.slope = function(that) {
    return (that.__check().y - this.__check().y) / (that.x - this.x);
  };
  Point.prototype.translate = function(x, y) {
    this.__check();
    if (typeof x !== "number") this.log.warn("Called `Point.translate(x,y)` but `x` is not a number");
    if (typeof y !== "number") this.log.warn("Called `Point.translate(x,y)` but `y` is not a number");
    const p = this.copy();
    p.x += x;
    p.y += y;
    return p;
  };
  Point.prototype.asRenderProps = function() {
    return {
      x: this.x,
      y: this.y,
      attributes: this.attributes.asRenderProps()
    };
  };
  Point.prototype.__check = function() {
    if (typeof this.x !== "number") this.log.warn("X value of `Point` is not a number");
    if (typeof this.y !== "number") this.log.warn("Y value of `Point` is not a number");
    return this;
  };
  Point.prototype.__withLog = function(log = false) {
    if (log) Object.defineProperty(this, "log", { value: log });
    return this;
  };
  function pointsProxy(points, log) {
    return {
      get: function(...args) {
        return Reflect.get(...args);
      },
      set: (points2, name, value) => {
        if (value instanceof Point !== true)
          log.warn(`\`points.${name}\` was set with a value that is not a \`Point\` object`);
        if (value?.x == null || !__isCoord(value.x))
          log.warn(`\`points.${name}\` was set with a \`x\` parameter that is not a \`number\``);
        if (value?.y == null || !__isCoord(value.y))
          log.warn(`\`points.${name}\` was set with a \`y\` parameter that is not a \`number\``);
        try {
          value.name = name;
        } catch (err) {
          log.warn(`Could not set \`name\` property on \`points.${name}\``);
        }
        return points2[name] = value;
      }
    };
  }

  // node_modules/@freesewing/core/src/path.mjs
  function Path() {
    this.hidden = false;
    this.ops = [];
    this.attributes = new Attributes();
    this.topLeft = false;
    this.bottomRight = false;
    return this;
  }
  Path.prototype._curve = function(cp2, to) {
    if (to instanceof Point !== true)
      this.log.warn("Called `Path._curve(cp2, to)` but `to` is not a `Point` object");
    if (cp2 instanceof Point !== true)
      this.log.warn("Called `Path._curve(cp2, to)` but `cp2` is not a `Point` object");
    let cp1 = this.ops.slice(-1).pop().to;
    this.ops.push({ type: "curve", cp1, cp2, to });
    return this;
  };
  Path.prototype.addClass = function(className = false) {
    if (className) this.attributes.add("class", className);
    return this;
  };
  Path.prototype.addText = function(text = "", className = false) {
    this.attributes.add("data-text", __stringify(text));
    if (className) this.attributes.add("data-text-class", className);
    return this;
  };
  Path.prototype.asPathstring = function() {
    let d = "";
    for (let op of this.ops) {
      switch (op.type) {
        case "move":
          d += `M ${round(op.to.x)},${round(op.to.y)}`;
          break;
        case "line":
          d += ` L ${round(op.to.x)},${round(op.to.y)}`;
          break;
        case "curve":
          d += ` C ${round(op.cp1.x)},${round(op.cp1.y)} ${round(op.cp2.x)},${round(
            op.cp2.y
          )} ${round(op.to.x)},${round(op.to.y)}`;
          break;
        case "close":
          d += " z";
          break;
      }
    }
    return d;
  };
  var opAsrenderProp = (op) => {
    const props = { type: op.type };
    for (const p of ["from", "to", "cp1", "cp2"]) {
      if (op[p]) props[p] = op[p].asRenderProps();
    }
    if (op.id) props.id = op.id;
    return props;
  };
  Path.prototype.asRenderProps = function() {
    return {
      attributes: this.attributes.asRenderProps(),
      hidden: this.hidden,
      name: this.name,
      ops: this.ops.map((op) => opAsrenderProp(op)),
      topLeft: this.topLeft,
      bottomRight: this.bottomRight,
      width: this.bottomRight.x - this.topLeft.x,
      height: this.bottomRight.y - this.topLeft.y,
      d: this.asPathstring()
    };
  };
  Path.prototype.attr = function(name, value, overwrite = false) {
    if (!name)
      this.log.warn(
        "Called `Path.attr(name, value, overwrite=false)` but `name` is undefined or false"
      );
    if (typeof value === "undefined")
      this.log.warn("Called `Path.attr(name, value, overwrite=false)` but `value` is undefined");
    if (overwrite)
      this.log.debug(
        `Overwriting \`Path.attribute.${name}\` with ${value} (was: ${this.attributes.get(name)})`
      );
    if (overwrite) this.attributes.set(name, value);
    else this.attributes.add(name, value);
    return this;
  };
  Path.prototype.bbox = function() {
    let bbs = [];
    let current;
    for (let i in this.ops) {
      let op = this.ops[i];
      if (op.type === "line") {
        bbs.push(__lineBoundingBox({ from: current, to: op.to }));
      } else if (op.type === "curve") {
        bbs.push(
          __curveBoundingBox(
            new Bezier2(
              { x: current.x, y: current.y },
              { x: op.cp1.x, y: op.cp1.y },
              { x: op.cp2.x, y: op.cp2.y },
              { x: op.to.x, y: op.to.y }
            )
          )
        );
      }
      if (op.to) current = op.to;
    }
    if (bbs.length === 0 && current) {
      bbs.push(__lineBoundingBox({ from: current, to: current }));
    }
    return __bbbbox(bbs);
  };
  Path.prototype.circleSegment = function(deg, origin) {
    const radius = this.end().dist(origin);
    const steps = Math.ceil(Math.abs(deg / 90));
    const stepAngle = deg / steps;
    const stepAngleRad = deg2rad(stepAngle);
    const distance2 = radius * (4 / 3) * Math.tan(stepAngleRad / 4);
    for (let i = 0; i < steps; i++) {
      const startPoint = this.end();
      const endPoint = startPoint.rotate(stepAngle, origin);
      const startAngle = startPoint.angle(origin) - 90;
      const endAngle = endPoint.angle(origin) + 90;
      const cp1 = startPoint.shift(startAngle, distance2);
      const cp2 = endPoint.shift(endAngle, distance2);
      this.curve(cp1, cp2, endPoint);
    }
    return this;
  };
  Path.prototype.clean = function() {
    const ops = [];
    let cur;
    for (const i in this.ops) {
      const op = this.ops[i];
      if (["move", "close", "noop"].includes(op.type)) ops.push(op);
      else if (op.type === "line") {
        if (!op.to.sitsRoughlyOn(cur)) ops.push(op);
      } else if (op.type === "curve") {
        if (!(op.cp1.sitsRoughlyOn(cur) && op.cp2.sitsRoughlyOn(cur) && op.to.sitsRoughlyOn(cur)))
          ops.push(op);
      }
      cur = op.to;
    }
    if (ops.length < this.ops.length) this.ops = ops;
    return ops.length === 0 || ops.length === 1 && ops[0].type === "move" ? false : this;
  };
  Path.prototype.clone = function() {
    let clone = new Path().__withLog(this.log).setHidden(this.hidden);
    if (this.topLeft) clone.topLeft = this.topLeft.clone();
    else clone.topLeft = false;
    if (this.bottomRight) clone.bottomRight = this.bottomRight.clone();
    else clone.bottomRight = false;
    clone.attributes = this.attributes.clone();
    clone.ops = [];
    for (let i in this.ops) {
      let op = this.ops[i];
      clone.ops[i] = { type: op.type };
      if (op.type === "move" || op.type === "line") {
        clone.ops[i].to = op.to.clone();
      } else if (op.type === "curve") {
        clone.ops[i].to = op.to.clone();
        clone.ops[i].cp1 = op.cp1.clone();
        clone.ops[i].cp2 = op.cp2.clone();
      } else if (op.type === "noop") {
        clone.ops[i].id = op.id;
      }
    }
    return clone;
  };
  Path.prototype.close = function() {
    this.ops.push({ type: "close" });
    return this;
  };
  Path.prototype.combine = function(...paths) {
    return __combinePaths(this, ...paths);
  };
  Path.prototype.curve = function(cp1, cp2, to) {
    if (to instanceof Point !== true)
      this.log.warn("Called `Path.curve(cp1, cp2, to)` but `to` is not a `Point` object");
    if (cp1 instanceof Point !== true)
      this.log.warn("Called `Path.curve(cp1, cp2, to)` but `cp1` is not a `Point` object");
    if (cp2 instanceof Point !== true)
      this.log.warn("Called `Path.curve(cp1, cp2, to)` but `cp2` is not a `Point` object");
    this.ops.push({ type: "curve", cp1, cp2, to });
    return this;
  };
  Path.prototype.curve_ = function(cp1, to) {
    if (to instanceof Point !== true)
      this.log.warn("Called `Path.curve_(cp1, to)` but `to` is not a `Point` object");
    if (cp1 instanceof Point !== true)
      this.log.warn("Called `Path.curve_(cp1, to)` but `cp1` is not a `Point` object");
    let cp2 = to.copy();
    this.ops.push({ type: "curve", cp1, cp2, to });
    return this;
  };
  Path.prototype.divide = function() {
    let paths = [];
    let current, start;
    for (let i in this.ops) {
      let op = this.ops[i];
      if (op.type === "move") {
        start = op.to;
      } else if (op.type === "line") {
        if (!op.to.sitsRoughlyOn(current))
          paths.push(new Path().__withLog(this.log).move(current).line(op.to));
      } else if (op.type === "curve") {
        paths.push(new Path().__withLog(this.log).move(current).curve(op.cp1, op.cp2, op.to));
      } else if (op.type === "close") {
        paths.push(new Path().__withLog(this.log).move(current).line(start));
      }
      if (op.to) current = op.to;
    }
    return paths;
  };
  Path.prototype.projectPoint = function(p) {
    if (!(p instanceof Point)) {
      this.log.error("Called `Path.projectPoint(p)` but `p` is not a `Point` object");
      return null;
    }
    let closest = this.start();
    let minDist = Infinity;
    let current = closest, start = closest;
    for (let i in this.ops) {
      let op = this.ops[i];
      if (op.type === "move") {
        start = op.to;
      } else if (op.type === "line") {
        let proj = projectPointOntoLine(p, current, op.to);
        let dist = proj.dist(p);
        if (dist < minDist) {
          minDist = dist;
          closest = proj;
        }
      } else if (op.type === "curve") {
        let proj = projectPointOntoCurve(p, current, op.cp1, op.cp2, op.to);
        let dist = proj.dist(p);
        if (dist < minDist) {
          minDist = dist;
          closest = proj;
        }
      } else if (op.type === "close") {
        let proj = projectPointOntoLine(p, current, start);
        let dist = proj.dist(p);
        if (dist < minDist) {
          minDist = dist;
          closest = proj;
        }
      }
      if (op.to) current = op.to;
    }
    return closest;
  };
  Path.prototype.measureAlong = function(p) {
    if (!(p instanceof Point)) {
      this.log.error("Called `Path.measureAlong(p)` but `p` is not a `Point` object");
      return null;
    }
    let offset = 0;
    let current = this.start();
    let start = current;
    for (let i in this.ops) {
      let op = this.ops[i];
      if (op.type === "move") {
        start = op.to;
      } else if (op.type === "line") {
        if (pointOnLine(current, op.to, p)) {
          offset += current.dist(p);
          return offset;
        }
        offset += current.dist(op.to);
      } else if (op.type === "curve") {
        let bezier = new Bezier2(
          { x: current.x, y: current.y },
          { x: op.cp1.x, y: op.cp1.y },
          { x: op.cp2.x, y: op.cp2.y },
          { x: op.to.x, y: op.to.y }
        );
        const result = bezier.project({ x: p.x, y: p.y });
        if (result.d < 1) {
          offset += bezier.split(result.t).left.length();
          return offset;
        }
        offset += bezier.length();
      } else if (op.type === "close") {
        if (pointOnLine(current, start, p)) {
          offset += current.dist(p);
          return offset;
        }
        offset += current.dist(start);
      }
      if (op.to) current = op.to;
    }
    return null;
  };
  Path.prototype.edge = function(side) {
    this.__boundary();
    if (side === "topLeft") return this.topLeft;
    else if (side === "bottomRight") return this.bottomRight;
    else if (side === "topRight") return new Point(this.bottomRight.x, this.topLeft.y);
    else if (side === "bottomLeft") return new Point(this.topLeft.x, this.bottomRight.y);
    else {
      let s = side + "Op";
      if (this[s].type === "move") return this[s].to;
      else if (this[s].type === "line") {
        if (side === "top") {
          if (this.topOp.to.y < this.topOp.from.y) return this.topOp.to;
          else return this.topOp.from;
        } else if (side === "left") {
          if (this.leftOp.to.x < this.leftOp.from.x) return this.leftOp.to;
          else return this.leftOp.from;
        } else if (side === "bottom") {
          if (this.bottomOp.to.y > this.bottomOp.from.y) return this.bottomOp.to;
          else return this.bottomOp.from;
        } else if (side === "right") {
          if (this.rightOp.to.x > this.rightOp.from.x) return this.rightOp.to;
          else return this.rightOp.from;
        }
      } else if (this[s].type === "curve")
        return curveEdge(
          new Bezier2(
            { x: this[s].from.x, y: this[s].from.y },
            { x: this[s].cp1.x, y: this[s].cp1.y },
            { x: this[s].cp2.x, y: this[s].cp2.y },
            { x: this[s].to.x, y: this[s].to.y }
          ),
          side
        );
    }
  };
  Path.prototype.end = function() {
    if (this.ops.length < 1)
      this.log.error("Called `Path.end()` but this path has no drawing operations");
    let op = this.ops[this.ops.length - 1];
    if (op.type === "close") return this.start();
    else return op.to;
  };
  Path.prototype.hide = function() {
    this.hidden = true;
    return this;
  };
  Path.prototype.insop = function(noopId, path) {
    if (!noopId) this.log.warn("Called `Path.insop(noopId, path)` but `noopId` is undefined or false");
    if (path instanceof Path !== true)
      this.log.warn("Called `Path.insop(noopId, path) but `path` is not a `Path` object");
    let newPath = this.clone();
    for (let i in newPath.ops) {
      if (newPath.ops[i].type === "noop" && newPath.ops[i].id === noopId) {
        newPath.ops = newPath.ops.slice(0, i).concat(path.ops).concat(newPath.ops.slice(Number(i) + 1));
      }
    }
    return newPath;
  };
  Path.prototype.intersects = function(path) {
    if (this === path)
      this.log.error("You called Path.intersects(path)` but `path` and `this` are the same object");
    let intersections = [];
    for (let pathA of this.divide()) {
      for (let pathB of path.divide()) {
        if (pathA.ops[1].type === "line") {
          if (pathB.ops[1].type === "line") {
            __addIntersectionsToArray(
              linesIntersect(pathA.ops[0].to, pathA.ops[1].to, pathB.ops[0].to, pathB.ops[1].to),
              intersections
            );
          } else if (pathB.ops[1].type === "curve") {
            __addIntersectionsToArray(
              lineIntersectsCurve(
                pathA.ops[0].to,
                pathA.ops[1].to,
                pathB.ops[0].to,
                pathB.ops[1].cp1,
                pathB.ops[1].cp2,
                pathB.ops[1].to
              ),
              intersections
            );
          }
        } else if (pathA.ops[1].type === "curve") {
          if (pathB.ops[1].type === "line") {
            __addIntersectionsToArray(
              lineIntersectsCurve(
                pathB.ops[0].to,
                pathB.ops[1].to,
                pathA.ops[0].to,
                pathA.ops[1].cp1,
                pathA.ops[1].cp2,
                pathA.ops[1].to
              ),
              intersections
            );
          } else if (pathB.ops[1].type === "curve") {
            __addIntersectionsToArray(
              curvesIntersect(
                pathA.ops[0].to,
                pathA.ops[1].cp1,
                pathA.ops[1].cp2,
                pathA.ops[1].to,
                pathB.ops[0].to,
                pathB.ops[1].cp1,
                pathB.ops[1].cp2,
                pathB.ops[1].to
              ),
              intersections
            );
          }
        }
      }
    }
    return intersections;
  };
  Path.prototype.intersectsBeam = function(start, end) {
    let intersections = [];
    for (let pathA of this.divide()) {
      if (pathA.ops[1].type === "line") {
        __addIntersectionsToArray(
          beamIntersectsLine(start, end, pathA.ops[0].to, pathA.ops[1].to),
          intersections
        );
      } else if (pathA.ops[1].type === "curve") {
        __addIntersectionsToArray(
          beamIntersectsCurve(
            start,
            end,
            pathA.ops[0].to,
            pathA.ops[1].cp1,
            pathA.ops[1].cp2,
            pathA.ops[1].to
          ),
          intersections
        );
      }
    }
    return intersections;
  };
  Path.prototype.intersectsX = function(x) {
    if (typeof x !== "number") this.log.error("Called `Path.intersectsX(x)` but `x` is not a number");
    return this.__intersectsAxis(x, "x");
  };
  Path.prototype.intersectsY = function(y) {
    if (typeof y !== "number") this.log.error("Called `Path.intersectsX(y)` but `y` is not a number");
    return this.__intersectsAxis(y, "y");
  };
  Path.prototype.join = function(...paths) {
    if (paths.length < 1) {
      this.log.error("Called `Path.join(that)` but `that` is not a `Path` object");
      return this;
    }
    if (paths.length === 2 && [true, false].includes(paths[1])) {
      this.log.warn(
        "`Path.join()` was called with the legacy signature passing a bool as second parameter. This is deprecated and will be removed in FreeSewing v4"
      );
      return paths[1] ? __joinPaths([this, paths[0]]).close() : __joinPaths([this, paths[0]]);
    }
    let i = 0;
    for (const path of paths) {
      if (path instanceof Path !== true)
        this.log.error(
          `Called \`Path.join(paths)\` but the path with index \`${i}\` is not a \`Path\` object`
        );
      i++;
    }
    return __joinPaths([this, ...paths]);
  };
  Path.prototype.length = function(withMoves = false) {
    let current, start;
    let length = 0;
    for (let i in this.ops) {
      let op = this.ops[i];
      if (op.type === "move") {
        if (typeof start === "undefined") start = op.to;
        else if (withMoves) length += current.dist(op.to);
      } else if (op.type === "line") {
        length += current.dist(op.to);
      } else if (op.type === "curve") {
        length += new Bezier2(
          { x: current.x, y: current.y },
          { x: op.cp1.x, y: op.cp1.y },
          { x: op.cp2.x, y: op.cp2.y },
          { x: op.to.x, y: op.to.y }
        ).length();
      } else if (op.type === "close") {
        length += current.dist(start);
      }
      if (op.to) current = op.to;
    }
    return length;
  };
  Path.prototype.line = function(to) {
    if (to instanceof Point !== true)
      this.log.warn("Called `Path.line(to)` but `to` is not a `Point` object");
    this.ops.push({ type: "line", to });
    return this;
  };
  Path.prototype.move = function(to) {
    if (to instanceof Point !== true)
      this.log.warn("Called `Path.move(to)` but `to` is not a `Point` object");
    this.ops.push({ type: "move", to });
    return this;
  };
  Path.prototype.noop = function(id = false) {
    this.ops.push({ type: "noop", id });
    return this;
  };
  Path.prototype.offset = function(distance2) {
    distance2 = __asNumber(distance2, "distance", "Path.offset", this.log);
    return __pathOffset(this, distance2, this.log);
  };
  Path.prototype.reverse = function(cloneAttributes = false) {
    let sections = [];
    let current;
    let closed = false;
    for (let i in this.ops) {
      let op = this.ops[i];
      if (op.type === "line") {
        if (!op.to.sitsOn(current))
          sections.push(new Path().__withLog(this.log).move(op.to).line(current));
      } else if (op.type === "curve") {
        sections.push(new Path().__withLog(this.log).move(op.to).curve(op.cp2, op.cp1, current));
      } else if (op.type === "close") {
        closed = true;
      }
      if (op.to) current = op.to;
    }
    let rev = new Path().__withLog(this.log).move(current);
    for (let section of sections.reverse()) {
      if (rev.end().sitsOn(section.ops[0].to)) rev.ops.push(section.ops[1]);
      else rev.ops.push(...section.ops);
    }
    if (closed) rev.close();
    if (cloneAttributes) rev.attributes = this.attributes.clone();
    return rev;
  };
  Path.prototype.rotate = function(deg, rotationOrigin, cloneAttributes = false) {
    deg = __asNumber(deg, "deg", "Path.rotate", this.log);
    if (!(rotationOrigin instanceof Point))
      this.log.warn("Called `Path.rotate(deg,that)` but `rotationOrigin` is not a `Point` object");
    const rotatedPath = new Path().__withLog(this.log);
    for (const op of this.ops) {
      if (op.type === "move") {
        const to = op.to.rotate(deg, rotationOrigin);
        rotatedPath.move(to);
      } else if (op.type === "line") {
        const to = op.to.rotate(deg, rotationOrigin);
        rotatedPath.line(to);
      } else if (op.type === "curve") {
        const cp1 = op.cp1.rotate(deg, rotationOrigin);
        const cp2 = op.cp2.rotate(deg, rotationOrigin);
        const to = op.to.rotate(deg, rotationOrigin);
        rotatedPath.curve(cp1, cp2, to);
      } else if (op.type === "close") {
        rotatedPath.close();
      }
    }
    if (cloneAttributes) rotatedPath.attributes = this.attributes.clone();
    return rotatedPath;
  };
  Path.prototype.roughLength = function() {
    let current, start;
    let length = 0;
    for (let i in this.ops) {
      let op = this.ops[i];
      if (op.type === "move") {
        start = op.to;
      } else if (op.type === "line") {
        length += current.dist(op.to);
      } else if (op.type === "curve") {
        length += current.dist(op.cp1);
        length += op.cp1.dist(op.cp2);
        length += op.cp2.dist(op.to);
      } else if (op.type === "close") {
        length += current.dist(start);
      }
      if (op.to) current = op.to;
    }
    return length;
  };
  Path.prototype.setClass = function(className = false) {
    if (className) this.attributes.set("class", className);
    return this;
  };
  Path.prototype.setHidden = function(hidden = false) {
    if (hidden) this.hidden = true;
    else this.hidden = false;
    return this;
  };
  Path.prototype.setText = function(text = "", className = false) {
    this.attributes.set("data-text", text);
    if (className) this.attributes.set("data-text-class", className);
    return this;
  };
  Path.prototype.shiftAlong = function(distance2, stepsPerMm = 10) {
    distance2 = __asNumber(distance2, "distance", "Path.shiftAlong", this.log);
    let len = 0;
    let current;
    for (let i in this.ops) {
      let op = this.ops[i];
      if (op.type === "line") {
        let thisLen = op.to.dist(current);
        if (Math.abs(len + thisLen - distance2) < 0.1) return op.to;
        if (len + thisLen > distance2) return current.shiftTowards(op.to, distance2 - len);
        len += thisLen;
      } else if (op.type === "curve") {
        let bezier = new Bezier2(
          { x: current.x, y: current.y },
          { x: op.cp1.x, y: op.cp1.y },
          { x: op.cp2.x, y: op.cp2.y },
          { x: op.to.x, y: op.to.y }
        );
        let thisLen = bezier.length();
        if (Math.abs(len + thisLen - distance2) < 0.1) return op.to;
        if (len + thisLen > distance2)
          return __shiftAlongBezier(distance2 - len, bezier, thisLen * stepsPerMm);
        len += thisLen;
      }
      current = op.to;
    }
    this.log.error(
      `Called \`Path.shiftAlong(distance)\` with a \`distance\` of \`${distance2}\` but \`Path.length()\` is only \`${this.length()}\``
    );
  };
  Path.prototype.shiftFractionAlong = function(fraction, stepsPerMm = 10) {
    if (typeof fraction !== "number")
      this.log.error("Called `Path.shiftFractionAlong(fraction)` but `fraction` is not a number");
    return this.shiftAlong(this.length() * fraction, stepsPerMm);
  };
  Path.prototype.smurve = function(cp2, to) {
    if (to instanceof Point !== true)
      this.log.warn("Called `Path.smurve(cp2, to)` but `to` is not a `Point` object");
    if (cp2 instanceof Point !== true)
      this.log.warn("Called `Path.smurve(cp2, to)` but `cp2` is not a `Point` object");
    const prevOp = this.ops.slice(-1).pop();
    const cp1 = prevOp.cp2.rotate(180, prevOp.to);
    this.ops.push({ type: "curve", cp1, cp2, to });
    return this;
  };
  Path.prototype.smurve_ = function(to) {
    if (to instanceof Point !== true)
      this.log.warn("Called `Path.smurve_(to)` but `to` is not a `Point` object");
    const prevOp = this.ops.slice(-1).pop();
    const cp1 = prevOp.cp2.rotate(180, prevOp.to);
    const cp2 = to;
    this.ops.push({ type: "curve", cp1, cp2, to });
    return this;
  };
  Path.prototype.split = function(point) {
    if (point instanceof Point !== true)
      this.log.error("Called `Path.split(point)` but `point` is not a `Point` object");
    let divided = this.divide();
    let firstHalf = [];
    let secondHalf = [];
    for (let pi3 = 0; pi3 < divided.length; pi3++) {
      let path = divided[pi3];
      if (path.ops[0].to.sitsRoughlyOn(point)) {
        divided[pi3].ops[0].to = point.copy();
        if (pi3 > 0) {
          divided[pi3 - 1].ops[1].to = point.copy();
        }
        firstHalf = divided.slice(0, pi3);
        secondHalf = divided.slice(pi3);
        break;
      }
      if (path.ops[1].type === "line") {
        if (path.ops[1].to.sitsRoughlyOn(point)) {
          pi3++;
          firstHalf = divided.slice(0, pi3);
          secondHalf = divided.slice(pi3);
          break;
        } else if (pointOnLine(path.ops[0].to, path.ops[1].to, point)) {
          firstHalf = divided.slice(0, pi3);
          firstHalf.push(new Path().__withLog(this.log).move(path.ops[0].to).line(point));
          pi3++;
          secondHalf = divided.slice(pi3);
          secondHalf.unshift(new Path().__withLog(this.log).move(point).line(path.ops[1].to));
          break;
        }
      } else if (path.ops[1].type === "curve") {
        let t2 = curveParameterFromPoint(
          path.ops[0].to,
          path.ops[1].cp1,
          path.ops[1].cp2,
          path.ops[1].to,
          point
        );
        if (t2 !== false) {
          let curve = new Bezier2(
            { x: path.ops[0].to.x, y: path.ops[0].to.y },
            { x: path.ops[1].cp1.x, y: path.ops[1].cp1.y },
            { x: path.ops[1].cp2.x, y: path.ops[1].cp2.y },
            { x: path.ops[1].to.x, y: path.ops[1].to.y }
          );
          let split = curve.split(t2);
          firstHalf = divided.slice(0, pi3);
          firstHalf.push(
            new Path().__withLog(this.log).move(new Point(split.left.points[0].x, split.left.points[0].y)).curve(
              new Point(split.left.points[1].x, split.left.points[1].y),
              new Point(split.left.points[2].x, split.left.points[2].y),
              point.copy()
            )
          );
          pi3++;
          secondHalf = divided.slice(pi3);
          secondHalf.unshift(
            new Path().__withLog(this.log).move(point.copy()).curve(
              new Point(split.right.points[1].x, split.right.points[1].y),
              new Point(split.right.points[2].x, split.right.points[2].y),
              new Point(split.right.points[3].x, split.right.points[3].y)
            )
          );
          break;
        }
      }
    }
    firstHalf = firstHalf.length > 0 && firstHalf[0].ops.length > 1 ? __joinPaths(firstHalf) : null;
    secondHalf = secondHalf.length > 0 && secondHalf[0].ops.length > 1 ? __joinPaths(secondHalf) : null;
    return [firstHalf, secondHalf];
  };
  Path.prototype.angleAt = function(point) {
    if (!(point instanceof Point))
      this.log.error("Called `Path.angleAt(point)` but `point` is not a `Point` object");
    let divided = this.divide();
    for (let pi3 = 0; pi3 < divided.length; pi3++) {
      let path = divided[pi3];
      if (path.ops[1].type === "line") {
        if (pointOnLine(path.ops[0].to, path.ops[1].to, point)) {
          return path.ops[0].to.angle(path.ops[1].to);
        }
      } else if (path.ops[1].type === "curve") {
        let t2 = curveParameterFromPoint(
          path.ops[0].to,
          path.ops[1].cp1,
          path.ops[1].cp2,
          path.ops[1].to,
          point
        );
        if (t2 !== false) {
          const curve = new Bezier2(
            { x: path.ops[0].to.x, y: path.ops[0].to.y },
            { x: path.ops[1].cp1.x, y: path.ops[1].cp1.y },
            { x: path.ops[1].cp2.x, y: path.ops[1].cp2.y },
            { x: path.ops[1].to.x, y: path.ops[1].to.y }
          );
          let normal = curve.normal(t2);
          return Math.atan2(normal.x, normal.y) / Math.PI * 180;
        }
      }
    }
    return false;
  };
  Path.prototype.start = function() {
    if (this.ops.length < 1 || typeof this.ops[0].to === "undefined")
      this.log.error("Called `Path.start()` but this path has no drawing operations");
    return this.ops[0].to;
  };
  Path.prototype.translate = function(x, y) {
    if (typeof x !== "number") this.log.warn("Called `Path.translate(x, y)` but `x` is not a number");
    if (typeof y !== "number") this.log.warn("Called `Path.translate(x, y)` but `y` is not a number");
    let clone = this.clone();
    for (let op of clone.ops) {
      if (op.type !== "close") {
        op.to = op.to.translate(x, y);
      }
      if (op.type === "curve") {
        op.cp1 = op.cp1.translate(x, y);
        op.cp2 = op.cp2.translate(x, y);
      }
    }
    return clone;
  };
  Path.prototype.trim = function() {
    let chunks = this.divide();
    for (let i = 0; i < chunks.length; i++) {
      let firstCandidate = parseInt(i) + 2;
      let lastCandidate = parseInt(chunks.length) - 1;
      for (let j = firstCandidate; j < lastCandidate; j++) {
        let intersections = chunks[i].intersects(chunks[j]);
        if (intersections.length > 0) {
          let intersection = intersections.pop();
          let trimmedStart = chunks.slice(0, i);
          let trimmedEnd = chunks.slice(parseInt(j) + 1);
          let glue = new Path().__withLog(this.log);
          let first = true;
          for (let k of [i, j]) {
            let ops = chunks[k].ops;
            if (ops[1].type === "line") {
              glue.line(intersection);
            } else if (ops[1].type === "curve") {
              let curve = new Bezier2(
                { x: ops[0].to.x, y: ops[0].to.y },
                { x: ops[1].cp1.x, y: ops[1].cp1.y },
                { x: ops[1].cp2.x, y: ops[1].cp2.y },
                { x: ops[1].to.x, y: ops[1].to.y }
              );
              let t2 = curveParameterFromPoint(
                ops[0].to,
                ops[1].cp1,
                ops[1].cp2,
                ops[1].to,
                intersection
              );
              let split = curve.split(t2);
              let side;
              if (first) side = split.left;
              else side = split.right;
              glue.curve(
                new Point(side.points[1].x, side.points[1].y),
                new Point(side.points[2].x, side.points[2].y),
                new Point(side.points[3].x, side.points[3].y)
              );
            }
            first = false;
          }
          let joint;
          if (trimmedStart.length > 0) joint = __joinPaths(trimmedStart).join(glue);
          else joint = glue;
          if (trimmedEnd.length > 0) joint = joint.join(__joinPaths(trimmedEnd));
          return joint.trim();
        }
      }
    }
    return this;
  };
  Path.prototype.unhide = function() {
    this.hidden = false;
    return this;
  };
  Path.prototype.__boundary = function() {
    if (this.topOp) return this;
    let current;
    let topLeft = new Point(Infinity, Infinity);
    let bottomRight = new Point(-Infinity, -Infinity);
    let edges = [];
    for (let i in this.ops) {
      let op = this.ops[i];
      if (op.type === "move" || op.type === "line") {
        if (op.to.x < topLeft.x) {
          topLeft.x = op.to.x;
          edges["leftOp"] = i;
        }
        if (op.to.y < topLeft.y) {
          topLeft.y = op.to.y;
          edges["topOp"] = i;
        }
        if (op.to.x > bottomRight.x) {
          bottomRight.x = op.to.x;
          edges["rightOp"] = i;
        }
        if (op.to.y > bottomRight.y) {
          bottomRight.y = op.to.y;
          edges["bottomOp"] = i;
        }
      } else if (op.type === "curve") {
        let bb = new Bezier2(
          { x: current.x, y: current.y },
          { x: op.cp1.x, y: op.cp1.y },
          { x: op.cp2.x, y: op.cp2.y },
          { x: op.to.x, y: op.to.y }
        ).bbox();
        if (bb.x.min < topLeft.x) {
          topLeft.x = bb.x.min;
          edges["leftOp"] = i;
        }
        if (bb.y.min < topLeft.y) {
          topLeft.y = bb.y.min;
          edges["topOp"] = i;
        }
        if (bb.x.max > bottomRight.x) {
          bottomRight.x = bb.x.max;
          edges["rightOp"] = i;
        }
        if (bb.y.max > bottomRight.y) {
          bottomRight.y = bb.y.max;
          edges["bottomOp"] = i;
        }
      }
      if (op.to) current = op.to;
    }
    this.topLeft = topLeft;
    this.bottomRight = bottomRight;
    for (let side of ["top", "left", "bottom", "right"]) {
      let s = side + "Op";
      this[s] = this.ops[edges[s]];
      this[s].from = this[s].type === "move" ? this[s].to : this.ops[edges[s] - 1].to;
    }
    return this;
  };
  Path.prototype.__intersectsAxis = function(val = false, mode) {
    let intersections = [];
    let lineStart = mode === "x" ? new Point(val, -1e5) : new Point(-1e4, val);
    let lineEnd = mode === "x" ? new Point(val, 1e5) : new Point(1e5, val);
    for (let path of this.divide()) {
      if (path.ops[1].type === "line") {
        __addIntersectionsToArray(
          linesIntersect(path.ops[0].to, path.ops[1].to, lineStart, lineEnd),
          intersections
        );
      } else if (path.ops[1].type === "curve") {
        __addIntersectionsToArray(
          lineIntersectsCurve(
            lineStart,
            lineEnd,
            path.ops[0].to,
            path.ops[1].cp1,
            path.ops[1].cp2,
            path.ops[1].to
          ),
          intersections
        );
      }
    }
    return intersections;
  };
  Path.prototype.__withLog = function(log = false) {
    if (log) __addNonEnumProp(this, "log", log);
    return this;
  };
  function pathsProxy(paths, log) {
    return {
      get: function(...args) {
        return Reflect.get(...args);
      },
      set: (paths2, name, value) => {
        if (value instanceof Path !== true)
          log.warn(`\`paths.${name}\` was set with a value that is not a \`Path\` object`);
        try {
          value.name = name;
        } catch (err) {
          log.warn(`Could not set \`name\` property on \`paths.${name}\``);
        }
        return paths2[name] = value;
      }
    };
  }
  function __addIntersectionsToArray(candidates, intersections) {
    if (!candidates) return;
    if (typeof candidates === "object") {
      if (typeof candidates.x === "number") {
        if (!(intersections.length > 0 && Math.abs(candidates.x - intersections[intersections.length - 1].x) < 1e-3 && Math.abs(candidates.y - intersections[intersections.length - 1].y) < 1e-3)) {
          intersections.push(candidates);
        }
      } else {
        if (intersections.length > 0 && Math.abs(candidates[0].x - intersections[intersections.length - 1].x) < 1e-3 && Math.abs(candidates[0].y - intersections[intersections.length - 1].y) < 1e-3) {
          candidates.shift();
        }
        for (let candidate of candidates) intersections.push(candidate);
      }
    }
  }
  function __asPath(bezier, log = false) {
    return new Path().__withLog(log).move(new Point(bezier.points[0].x, bezier.points[0].y)).curve(
      new Point(bezier.points[1].x, bezier.points[1].y),
      new Point(bezier.points[2].x, bezier.points[2].y),
      new Point(bezier.points[3].x, bezier.points[3].y)
    ).clean();
  }
  function __bbbbox(boxes) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let box of boxes) {
      if (box.topLeft.x < minX) minX = box.topLeft.x;
      if (box.topLeft.y < minY) minY = box.topLeft.y;
      if (box.bottomRight.x > maxX) maxX = box.bottomRight.x;
      if (box.bottomRight.y > maxY) maxY = box.bottomRight.y;
    }
    return { topLeft: new Point(minX, minY), bottomRight: new Point(maxX, maxY) };
  }
  function __combinePaths(...paths) {
    const joint = new Path().__withLog(paths[0].log);
    for (const path of paths) joint.ops.push(...path.ops);
    return joint;
  }
  function __curveBoundingBox(curve) {
    let bb = curve.bbox();
    return {
      topLeft: new Point(bb.x.min, bb.y.min),
      bottomRight: new Point(bb.x.max, bb.y.max)
    };
  }
  function __joinPaths(paths) {
    let joint = new Path().__withLog(paths[0].log).move(paths[0].ops[0].to);
    let current;
    for (let p of paths) {
      for (let op of p.ops) {
        if (op.type === "curve") {
          joint.curve(op.cp1, op.cp2, op.to);
        } else if (op.type === "noop") {
          joint.noop(op.id);
        } else if (op.type !== "close") {
          if (current && !op.to.sitsRoughlyOn(current)) joint.line(op.to);
        } else {
          let err = "Cannot join a closed path with another";
          joint.log.error(err);
          throw new Error(err);
        }
        if (op.to) current = op.to;
      }
    }
    return joint;
  }
  function __lineBoundingBox(line2) {
    let from = line2.from;
    let to = line2.to;
    if (from.x === to.x) {
      if (from.y < to.y) return { topLeft: from, bottomRight: to };
      else return { topLeft: to, bottomRight: from };
    } else if (from.y === to.y) {
      if (from.x < to.x) return { topLeft: from, bottomRight: to };
      else return { topLeft: to, bottomRight: from };
    } else if (from.x < to.x) {
      if (from.y < to.y) return { topLeft: from, bottomRight: to };
      else
        return {
          topLeft: new Point(from.x, to.y),
          bottomRight: new Point(to.x, from.y)
        };
    } else if (from.x > to.x) {
      if (from.y < to.y)
        return {
          topLeft: new Point(to.x, from.y),
          bottomRight: new Point(from.x, to.y)
        };
      else
        return {
          topLeft: new Point(to.x, to.y),
          bottomRight: new Point(from.x, from.y)
        };
    }
  }
  function __offsetLine(from, to, distance2, log = false) {
    if (from.x === to.x && from.y === to.y) return false;
    let angle = from.angle(to) - 90;
    return new Path().__withLog(log).move(from.shift(angle, distance2)).line(to.shift(angle, distance2));
  }
  function __pathOffset(path, distance2, log) {
    let offset = [];
    let current;
    let start = false;
    let closed = false;
    for (let i in path.ops) {
      let op = path.ops[i];
      if (op.type === "line") {
        let segment = __offsetLine(current, op.to, distance2, path.log);
        if (segment) offset.push(segment);
      } else if (op.type === "curve") {
        let cp1, cp2;
        if (current.sitsRoughlyOn(op.cp1)) {
          cp1 = new Path().__withLog(path.log).move(current).curve(op.cp1, op.cp2, op.to);
          cp1 = cp1.shiftAlong(cp1.length() > 2 ? 2 : cp1.length() / 10);
        } else cp1 = op.cp1;
        if (op.cp2.sitsRoughlyOn(op.to)) {
          cp2 = new Path().__withLog(path.log).move(op.to).curve(op.cp2, op.cp1, current);
          cp2 = cp2.shiftAlong(cp2.length() > 2 ? 2 : cp2.length() / 10);
        } else cp2 = op.cp2;
        let b = new Bezier2(
          { x: current.x, y: current.y },
          { x: cp1.x, y: cp1.y },
          { x: cp2.x, y: cp2.y },
          { x: op.to.x, y: op.to.y }
        );
        for (let bezier of b.offset(distance2)) {
          const segment = __asPath(bezier, path.log);
          if (segment) offset.push(segment);
        }
      } else if (op.type === "close") {
        let segment = __offsetLine(current, start, distance2, path.log);
        if (segment) offset.push(segment);
        closed = true;
      }
      if (op.to) current = op.to;
      if (!start || op.type === "move") start = current;
    }
    let result;
    if (offset.length !== 0) {
      result = __joinPaths(offset);
    } else {
      let segment = __offsetLine(start, current, distance2, path.log);
      if (segment) {
        result = segment;
      } else {
        result = new Path().move(start).line(current);
        log.warn(`Could not properly calculate offset path, the given path is likely too short.`);
      }
    }
    return closed ? result.close() : result;
  }
  function __shiftAlongBezier(distance2, bezier, steps) {
    let previous, next, t2, thisLen;
    let len = 0;
    for (let i = 0; i <= steps; i++) {
      t2 = i / steps;
      next = bezier.get(t2);
      next = new Point(next.x, next.y);
      if (i > 0) {
        thisLen = next.dist(previous);
        if (len + thisLen > distance2) return next;
        else len += thisLen;
      }
      previous = next;
    }
  }

  // node_modules/@freesewing/core/src/utils.mjs
  var goldenRatio = 1.618034;
  var cbqc = 0.55191502449351;
  function beamIntersectsCircle(c2, r, p1, p2, sort = "x") {
    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;
    let A = Math.pow(dx, 2) + Math.pow(dy, 2);
    let B = 2 * (dx * (p1.x - c2.x) + dy * (p1.y - c2.y));
    let C = Math.pow(p1.x - c2.x, 2) + Math.pow(p1.y - c2.y, 2) - Math.pow(r, 2);
    let det = Math.pow(B, 2) - 4 * A * C;
    if (A <= 1e-7 || det < 0) return false;
    else if (det === 0) {
      let t2 = -1 * B / (2 * A);
      let i1 = new Point(p1.x + t2 * dx, p1.y + t2 * dy);
      return [i1];
    } else {
      let t2 = (-1 * B + Math.sqrt(det)) / (2 * A);
      let i1 = new Point(p1.x + t2 * dx, p1.y + t2 * dy);
      t2 = (-1 * B - Math.sqrt(det)) / (2 * A);
      let i2 = new Point(p1.x + t2 * dx, p1.y + t2 * dy);
      if (sort === "x" && i1.x <= i2.x || sort === "y" && i1.y <= i2.y) return [i1, i2];
      else return [i2, i1];
    }
  }
  function beamIntersectsX(from, to, x) {
    if (from.x === to.x) return false;
    let top = new Point(x, -10);
    let bottom = new Point(x, 10);
    return beamsIntersect(from, to, top, bottom);
  }
  function beamIntersectsY(from, to, y) {
    if (from.y === to.y) return false;
    let left = new Point(-10, y);
    let right = new Point(10, y);
    return beamsIntersect(from, to, left, right);
  }
  function beamsIntersect(a1, a2, b1, b2) {
    const intersection = beamIntersection(a1, a2, b1, b2);
    if (!intersection) return false;
    return intersection.p;
  }
  function beamIntersection(a1, a2, b1, b2) {
    function crossProduct(v1, v2) {
      return v1.x * v2.y - v1.y * v2.x;
    }
    const r = { x: a2.x - a1.x, y: a2.y - a1.y };
    const s = { x: b2.x - b1.x, y: b2.y - b1.y };
    const ab = { x: b1.x - a1.x, y: b1.y - a1.y };
    const rCrossS = crossProduct(r, s);
    const EPSILON = 1e-10;
    if (Math.abs(rCrossS) < EPSILON) {
      return false;
    }
    const t2 = crossProduct(ab, s) / rCrossS;
    const u = crossProduct(ab, r) / rCrossS;
    return {
      p: new Point(a1.x + t2 * r.x, a1.y + t2 * r.y),
      t: t2,
      u
    };
  }
  function beamIntersectsCurve(start, end, from, cp1, cp2, to) {
    let intersections = [];
    let bz = new Bezier2(
      { x: from.x, y: from.y },
      { x: cp1.x, y: cp1.y },
      { x: cp2.x, y: cp2.y },
      { x: to.x, y: to.y }
    );
    let line2 = {
      p1: { x: start.x, y: start.y },
      p2: { x: end.x, y: end.y }
    };
    for (let t2 of Bezier2.getUtils().roots(bz.points, line2)) {
      let isect = bz.get(t2);
      intersections.push(new Point(isect.x, isect.y));
    }
    if (intersections.length === 0) return false;
    else if (intersections.length === 1) return intersections[0];
    else return intersections;
  }
  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  function circlesIntersect(c1, r1, c2, r2, sort = "x") {
    let dx = c1.dx(c2);
    let dy = c1.dy(c2);
    let dist = c1.dist(c2);
    if (dist > parseFloat(r1) + parseFloat(r2)) return false;
    if (dist < Math.abs(parseFloat(r2) - parseFloat(r1))) return false;
    if (dist === 0 && r1 === r2) return false;
    let chorddistance = (Math.pow(r1, 2) - Math.pow(r2, 2) + Math.pow(dist, 2)) / (2 * dist);
    let halfchordlength = Math.sqrt(Math.pow(r1, 2) - Math.pow(chorddistance, 2));
    let chordmidpointx = c1.x + chorddistance * dx / dist;
    let chordmidpointy = c1.y + chorddistance * dy / dist;
    let i1 = new Point(
      chordmidpointx + halfchordlength * dy / dist,
      chordmidpointy - halfchordlength * dx / dist
    );
    let i2 = new Point(
      chordmidpointx - halfchordlength * dy / dist,
      chordmidpointy + halfchordlength * dx / dist
    );
    if (sort === "x" && i1.x <= i2.x || sort === "y" && i1.y <= i2.y) return [i1, i2];
    else return [i2, i1];
  }
  function curveEdge(curve, edge) {
    const extremaPoints = [
      curve.point(0),
      ...curve.extrema().values.map((e) => curve.get(e)),
      curve.point(3)
    ];
    let x = Infinity;
    let y = Infinity;
    if (edge === "bottom") y = -Infinity;
    if (edge === "right") x = -Infinity;
    for (const p of extremaPoints) {
      if (edge === "top" && p.y < y || edge === "bottom" && p.y > y || edge === "right" && p.x > x || edge === "left" && p.x < x) {
        x = p.x;
        y = p.y;
      }
    }
    return new Point(x, y);
  }
  function curveIntersectsX(from, cp1, cp2, to, x) {
    let start = new Point(x, -1e4);
    let end = new Point(x, 1e4);
    return lineIntersectsCurve(start, end, from, cp1, cp2, to);
  }
  function curveIntersectsY(from, cp1, cp2, to, y) {
    let start = new Point(-1e4, y);
    let end = new Point(1e4, y);
    return lineIntersectsCurve(start, end, from, cp1, cp2, to);
  }
  function curvesIntersect(fromA, cp1A, cp2A, toA, fromB, cp1B, cp2B, toB) {
    let precision = 5e-3;
    let intersections = [];
    let curveA = new Bezier2(
      { x: fromA.x, y: fromA.y },
      { x: cp1A.x, y: cp1A.y },
      { x: cp2A.x, y: cp2A.y },
      { x: toA.x, y: toA.y }
    );
    let curveB = new Bezier2(
      { x: fromB.x, y: fromB.y },
      { x: cp1B.x, y: cp1B.y },
      { x: cp2B.x, y: cp2B.y },
      { x: toB.x, y: toB.y }
    );
    for (let tvalues of curveA.intersects(curveB, precision)) {
      let intersection = curveA.get(tvalues.substr(0, tvalues.indexOf("/")));
      intersections.push(new Point(intersection.x, intersection.y));
    }
    if (intersections.length === 0) return false;
    else if (intersections.length === 1) return intersections.shift();
    else {
      let unique = [];
      for (let i of intersections) {
        let dupe = false;
        for (let u of unique) {
          if (i.sitsRoughlyOn(u)) dupe = true;
        }
        if (!dupe) unique.push(i);
      }
      return unique.length === 1 ? unique.shift() : unique;
    }
  }
  function deg2rad(degrees) {
    return degrees * (Math.PI / 180);
  }
  function generateStackTransform(x = 0, y = 0, rotate = 0, flipX = false, flipY = false, stack) {
    const transforms = [];
    let xTotal = x || 0;
    let yTotal = y || 0;
    let scaleX = 1;
    let scaleY = 1;
    if (flipX) {
      xTotal += stack.topLeft.x;
      xTotal += stack.bottomRight.x;
      scaleX = -1;
    }
    if (flipY) {
      yTotal += stack.topLeft.y;
      yTotal += stack.bottomRight.y;
      scaleY = -1;
    }
    if (scaleX + scaleY < 2) {
      transforms.push(`scale(${scaleX}, ${scaleY})`);
    }
    if (rotate) {
      const center = {
        x: stack.topLeft.x + stack.width / 2,
        y: stack.topLeft.y + stack.height / 2
      };
      transforms.push(`rotate(${rotate}, ${center.x}, ${center.y})`);
    }
    if (xTotal !== 0 || yTotal !== 0) transforms.unshift(`translate(${xTotal}, ${yTotal})`);
    return transforms;
  }
  function getSnappedPercentageValue(abs3, conf, units2) {
    let snapConf = conf.snap;
    if (!Array.isArray(snapConf) && snapConf.metric && snapConf.imperial) {
      snapConf = units2 === "imperial" ? snapConf.imperial : snapConf.metric;
    }
    if (typeof snapConf === "number") return Math.round(abs3 / snapConf) * snapConf;
    if (Array.isArray(snapConf) && snapConf.length > 1) {
      for (const snap of snapConf.sort((a2, b) => a2 - b).map((snap2, i) => {
        const margin = i < snapConf.length - 1 ? (snapConf[Number(i) + 1] - snap2) / 2 : (snap2 - snapConf[i - 1]) / 2;
        return {
          min: snap2 - margin,
          max: snap2 + Number(margin),
          snap: snap2
        };
      }))
        if (abs3 <= snap.max && abs3 >= snap.min) return snap.snap;
    }
    return abs3;
  }
  function lineIntersectsCircle(c2, r, p1, p2, sort = "x") {
    let intersections = beamIntersectsCircle(c2, r, p1, p2, sort);
    if (intersections === false) return false;
    else {
      if (intersections.length === 1) {
        if (pointOnLine(p1, p2, intersections[0])) return intersections;
        else return false;
      } else {
        let i1 = intersections[0];
        let i2 = intersections[1];
        if (!pointOnLine(p1, p2, i1, 5) && !pointOnLine(p1, p2, i2, 5)) return false;
        else if (pointOnLine(p1, p2, i1, 5) && pointOnLine(p1, p2, i2, 5)) {
          if (sort === "x" && i1.x <= i2.x || sort === "y" && i1.y <= i2.y) return [i1, i2];
          else return [i2, i1];
        } else if (pointOnLine(p1, p2, i1, 5)) return [i1];
        else if (pointOnLine(p1, p2, i2, 5)) return [i2];
      }
    }
  }
  function linesIntersect(a1, a2, b1, b2) {
    const intersection = beamIntersection(a1, a2, b1, b2);
    if (!intersection) return false;
    const EPSILON = 1e-10;
    if (intersection.t < -EPSILON || intersection.t > 1 + EPSILON) return false;
    if (intersection.u < -EPSILON || intersection.u > 1 + EPSILON) return false;
    return intersection.p;
  }
  function beamIntersectsLine(a1, a2, b1, b2) {
    const intersection = beamIntersection(a1, a2, b1, b2);
    if (!intersection) return false;
    const EPSILON = 1e-10;
    if (intersection.u < -EPSILON || intersection.u > 1 + EPSILON) return false;
    return intersection.p;
  }
  function lineIntersectsCurve(start, end, from, cp1, cp2, to) {
    let intersections = [];
    let bz = new Bezier2(
      { x: from.x, y: from.y },
      { x: cp1.x, y: cp1.y },
      { x: cp2.x, y: cp2.y },
      { x: to.x, y: to.y }
    );
    let line2 = {
      p1: { x: start.x, y: start.y },
      p2: { x: end.x, y: end.y }
    };
    for (let t2 of bz.intersects(line2)) {
      let isect = bz.get(t2);
      intersections.push(new Point(isect.x, isect.y));
    }
    if (intersections.length === 0) return false;
    else if (intersections.length === 1) return intersections[0];
    else return intersections;
  }
  function mergeI18n(designs, options) {
    const i18n3 = {};
    for (const design of designs) {
      for (const lang in design) {
        const obj = design[lang];
        if (typeof i18n3[lang] === "undefined") i18n3[lang] = {};
        if (obj.t) i18n3[lang].t = obj.t;
        if (obj.d) i18n3[lang].d = obj.d;
        for (const section of "spo") {
          if (obj[section]) {
            if (typeof i18n3[lang][section] === "undefined") i18n3[lang][section] = {};
            for (const [key, val] of Object.entries(obj[section])) {
              if (__keepTranslation(key, options?.[section])) i18n3[lang][section][key] = val;
            }
          }
        }
      }
    }
    return i18n3;
  }
  function mergeOptions(settings = {}, optionsConfig) {
    let merged = {};
    for (const [key, option] of Object.entries(optionsConfig)) {
      if (typeof option === "object") {
        if (typeof option.pct !== "undefined") merged[key] = option.pct / 100;
        else if (typeof option.mm !== "undefined") merged[key] = option.mm;
        else if (typeof option.deg !== "undefined") merged[key] = option.deg;
        else if (typeof option.count !== "undefined") merged[key] = option.count;
        else if (typeof option.bool !== "undefined") merged[key] = option.bool;
        else if (typeof option.dflt !== "undefined") merged[key] = option.dflt;
      } else merged[key] = option;
    }
    if (typeof settings.options === "object") merged = { ...merged, ...settings.options };
    return merged;
  }
  function pctBasedOn(measurement) {
    return {
      toAbs: (val, { measurements: measurements3 }) => measurements3[measurement] * val,
      fromAbs: (val, { measurements: measurements3 }) => Math.round(1e4 * val / measurements3[measurement]) / 1e4
    };
  }
  function pctBasedOnSa() {
    return {
      toAbs: (val, { sa }) => (sa || 10) * val,
      fromAbs: (val, { sa }) => Math.round(1e4 * val / (sa || 10)) / 1e4
    };
  }
  function snappedPctOption(measurement, config) {
    return {
      ...config,
      toAbs: (val, { measurements: measurements3, units: units2 }) => {
        const abs3 = measurements3[measurement] * val;
        return getSnappedPercentageValue(abs3, config, units2);
      },
      fromAbs: (val, { measurements: measurements3 }) => Math.round(1e4 * val / measurements3[measurement]) / 1e4
    };
  }
  function pointOnBeam(from, to, check, precision = 1e6) {
    if (from.sitsOn(check)) return true;
    if (to.sitsOn(check)) return true;
    let cross = check.dx(from) * to.dy(from) - check.dy(from) * to.dx(from);
    if (Math.abs(Math.round(cross * precision) / precision) === 0) return true;
    else return false;
  }
  function pointOnCurve(start, cp1, cp2, end, check) {
    return curveParameterFromPoint(start, cp1, cp2, end, check) !== false;
  }
  function curveParameterFromPoint(start, cp1, cp2, end, check) {
    if (start.sitsOn(check)) return 0;
    if (end.sitsOn(check)) return 1;
    let curve = new Bezier2(
      { x: start.x, y: start.y },
      { x: cp1.x, y: cp1.y },
      { x: cp2.x, y: cp2.y },
      { x: end.x, y: end.y }
    );
    let intersections = curve.intersects({
      p1: { x: check.x - 1, y: check.y },
      p2: { x: check.x + 1, y: check.y }
    });
    if (intersections.length === 0) {
      intersections = curve.intersects({
        p1: { x: check.x, y: check.y - 1 },
        p2: { x: check.x, y: check.y + 1 }
      });
    }
    if (intersections.length > 0) return intersections.shift();
    else return false;
  }
  function pointOnLine(from, to, check, precision = 1e6) {
    if (!pointOnBeam(from, to, check, precision)) return false;
    let lenA = from.dist(to);
    let lenB = from.dist(check) + check.dist(to);
    return Math.round(Math.abs(lenA - lenB) * precision) === 0;
  }
  function rad2deg(radians) {
    return radians / Math.PI * 180;
  }
  function round(value) {
    return Math.round(value * 100) / 100;
  }
  function splitCurve(start, cp1, cp2, end, split) {
    let [c1, c2] = new Path().move(start).curve(cp1, cp2, end).split(split);
    return [
      {
        start: c1.ops[0].to,
        cp1: c1.ops[1].cp1,
        cp2: c1.ops[1].cp2,
        end: c1.ops[1].to
      },
      {
        start: c2.ops[0].to,
        cp1: c2.ops[1].cp1,
        cp2: c2.ops[1].cp2,
        end: c2.ops[1].to
      }
    ];
  }
  function stretchToScale(stretch) {
    return 1 / (1 + parseFloat(stretch));
  }
  function units(value, to = "metric") {
    if (to === "imperial") return round(value / 25.4) + "&quot;";
    else return round(value / 10) + "cm";
  }
  function __addNonEnumProp(obj, name, value) {
    Object.defineProperty(obj, name, {
      enumerable: false,
      configurable: false,
      writable: true,
      value
    });
    return obj;
  }
  function __asNumber(value, param, method, log) {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      log.warn(
        `Called \`${method}(${param})\` but \`${param}\` is not a number. Will attempt to cast to Number`
      );
      try {
        value = Number(value);
        return value;
      } catch {
        log.error(
          `Called \`${method}(${param})\` but \`${param}\` is not a number nor can it be cast to one`
        );
      }
    } else log.error(`Called \`${method}(${param})\` but \`${param}\` is not a number`);
    return value;
  }
  function __stringify(str) {
    if (typeof str === "string") return str;
    if (Array.isArray(str)) {
      return str.map((s) => __stringify(s));
    }
    return `${str}`;
  }
  function __isCoord(value) {
    return value === value ? typeof value === "number" : false;
  }
  function __macroName(name) {
    return `__macro_${name.toLowerCase()}`;
  }
  function __keepTranslation(key, options) {
    if (options?.drop && options.drop.includes(key)) return false;
    if (options?.keep && !options.keep.includes(key)) return false;
    return true;
  }
  function __parseTransform(transform) {
    const parts = transform.match(/(\w+)\(([^)]+)\)/);
    const name = parts[1];
    const values = parts[2].split(/,\s*/).map(parseFloat);
    return { parts, name, values };
  }
  function matrixTransform(transformationType, matrix, values) {
    switch (transformationType) {
      case "matrix":
        matrix = [
          matrix[0] * values[0] + matrix[2] * values[1],
          matrix[1] * values[0] + matrix[3] * values[1],
          matrix[0] * values[2] + matrix[2] * values[3],
          matrix[1] * values[2] + matrix[3] * values[3],
          matrix[0] * values[4] + matrix[2] * values[5] + matrix[4],
          matrix[1] * values[4] + matrix[3] * values[5] + matrix[5]
        ];
        break;
      case "translate":
        matrix[4] += matrix[0] * values[0] + matrix[2] * values[1];
        matrix[5] += matrix[1] * values[0] + matrix[3] * values[1];
        break;
      case "scale":
        matrix[0] *= values[0];
        matrix[1] *= values[0];
        matrix[2] *= values[1];
        matrix[3] *= values[1];
        break;
      case "rotate": {
        const angle = values[0] * Math.PI / 180;
        const centerX = values[1];
        const centerY = values[2];
        if (centerX !== void 0) {
          matrix = matrixTransform("translate", matrix, [centerX, centerY]);
        }
        const cos3 = Math.cos(angle);
        const sin3 = Math.sin(angle);
        matrix = [
          matrix[0] * cos3 + matrix[2] * sin3,
          matrix[1] * cos3 + matrix[3] * sin3,
          matrix[0] * -sin3 + matrix[2] * cos3,
          matrix[1] * -sin3 + matrix[3] * cos3,
          matrix[4],
          matrix[5]
        ];
        if (centerX !== void 0) {
          matrix = matrixTransform("translate", matrix, [-centerX, -centerY]);
        }
        break;
      }
      case "skewX":
        matrix[2] += matrix[0] * Math.tan(values[0] * Math.PI / 180);
        matrix[3] += matrix[1] * Math.tan(values[0] * Math.PI / 180);
        break;
      case "skewY":
        matrix[0] += matrix[2] * Math.tan(values[0] * Math.PI / 180);
        matrix[1] += matrix[3] * Math.tan(values[0] * Math.PI / 180);
        break;
    }
    return matrix;
  }
  function combineTransforms(transforms = []) {
    if (transforms.length < 1) return "";
    let matrix = [1, 0, 0, 1, 0, 0];
    for (let i = 0; i < transforms.length; i++) {
      const { name, values } = __parseTransform(transforms[i]);
      matrix = matrixTransform(name, matrix, values);
    }
    return "matrix(" + matrix.join(", ") + ")";
  }
  function applyTransformToPoint(transform, point) {
    const { name, values } = __parseTransform(transform);
    let matrix = [1, 0, 0, 1, 0, 0];
    matrix = matrixTransform(name, matrix, values);
    const newX = point.x * matrix[0] + point.y * matrix[2] + matrix[4];
    const newY = point.x * matrix[1] + point.y * matrix[3] + matrix[5];
    point.x = newX;
    point.y = newY;
    return point;
  }
  function getTransformedBounds(boundsObj, transforms = false) {
    if (!boundsObj.topLeft) return {};
    let tl = boundsObj.topLeft;
    let br = boundsObj.bottomRight;
    let tr = new Point(br.x, tl.y);
    let bl = new Point(tl.x, br.y);
    if (transforms) {
      const combinedTransform = combineTransforms(transforms);
      tl = applyTransformToPoint(combinedTransform, tl.copy());
      br = applyTransformToPoint(combinedTransform, br.copy());
      tr = applyTransformToPoint(combinedTransform, tr.copy());
      bl = applyTransformToPoint(combinedTransform, bl.copy());
    }
    const transformedTl = new Point(
      Math.min(tl.x, br.x, bl.x, tr.x),
      Math.min(tl.y, br.y, bl.y, tr.y)
    );
    const transformedBr = new Point(
      Math.max(tl.x, br.x, bl.x, tr.x),
      Math.max(tl.y, br.y, bl.y, tr.y)
    );
    return {
      topLeft: transformedTl,
      bottomRight: transformedBr
    };
  }
  function projectPointOntoLine(p, from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return from.copy();
    const t2 = ((p.x - from.x) * dx + (p.y - from.y) * dy) / lenSq;
    const tClamped = Math.max(0, Math.min(1, t2));
    return new Point(from.x + tClamped * dx, from.y + tClamped * dy);
  }
  function projectPointOntoCurve(p, from, cp1, cp2, to) {
    let curve = new Bezier2(
      { x: from.x, y: from.y },
      { x: cp1.x, y: cp1.y },
      { x: cp2.x, y: cp2.y },
      { x: to.x, y: to.y }
    );
    const result = curve.project({ x: p.x, y: p.y });
    return new Point(result.x, result.y);
  }

  // node_modules/@freesewing/core/src/snippet.mjs
  function Snippet(def, anchor, force = false) {
    this.def = def;
    this.anchor = anchor;
    this.attributes = new Attributes();
    if (force) this.attributes.set("data-force", 1);
    return this;
  }
  Snippet.prototype.attr = function(name, value, overwrite = false) {
    if (overwrite) this.attributes.set(name, value);
    else this.attributes.add(name, value);
    return this;
  };
  Snippet.prototype.clone = function() {
    let clone = new Snippet(this.def, this.anchor.clone()).__withLog(this.log);
    clone.attributes = this.attributes.clone();
    return clone;
  };
  Snippet.prototype.scale = function(scale, overwrite = true) {
    return this.attr("data-scale", scale, overwrite);
  };
  Snippet.prototype.rotate = function(rotation, overwrite = true) {
    return this.attr("data-rotate", rotation, overwrite);
  };
  Snippet.prototype.asRenderProps = function() {
    return {
      def: this.def,
      anchor: this.anchor.asRenderProps(),
      attributes: this.attributes.asRenderProps()
    };
  };
  Snippet.prototype.__withLog = function(log = false) {
    if (log) Object.defineProperty(this, "log", { value: log });
    return this;
  };
  function snippetsProxy(snippets, log) {
    return {
      get: function(...args) {
        return Reflect.get(...args);
      },
      set: (snippets2, name, value) => {
        if (value instanceof Snippet !== true)
          log.warn(`\`snippets.${name}\` was set with a value that is not a \`Snippet\` object`);
        if (typeof value.def !== "string")
          log.warn(`\`snippets.${name}\` was set with a \`def\` parameter that is not a \`string\``);
        if (value.anchor instanceof Point !== true)
          log.warn(
            `\`snippets.${name}\` was set with an \`anchor\` parameter that is not a \`Point\``
          );
        try {
          value.name = name;
        } catch (err) {
          log.warn(`Could not set \`name\` property on \`snippets.${name}\``);
        }
        return snippets2[name] = value;
      }
    };
  }

  // node_modules/@freesewing/core/src/store.mjs
  var import_lodash = __toESM(require_lodash_set(), 1);
  var import_lodash2 = __toESM(require_lodash_unset(), 1);
  var import_lodash3 = __toESM(require_lodash(), 1);
  var avoid = ["set", "setIfUnset", "push", "unset", "get", "extend"];
  function Store(methods = []) {
    const logs = {
      debug: [],
      info: [],
      warn: [],
      error: []
    };
    this.log = {
      debug: function(...data) {
        logs.debug.push(...data);
      },
      info: function(...data) {
        logs.info.push(...data);
      },
      warn: function(...data) {
        logs.warn.push(...data);
      },
      error: function(...data) {
        if (typeof window !== "undefined") console.error(...data[0]);
        logs.error.push(...data);
      }
    };
    this.logs = logs;
    this.generateMacroIds = function(keys, id, macro = false) {
      if (!macro) macro = this.get("activeMacro");
      const ids = {};
      for (const key of keys) ids[key] = `__macro_${macro}_${id}_${key}`;
      return ids;
    };
    this.storeMacroIds = function(id, ids, macro = false, part = false) {
      if (!macro) macro = this.get("activeMacro");
      if (!part) part = this.get("activePart");
      this.set(["parts", part, "macros", macro, "ids", id], ids);
    };
    this.getMacroIds = function(id, macro = false, part = false) {
      if (!macro) macro = this.get("activeMacro");
      if (!part) part = this.get("activePart");
      return this.get(["parts", part, "macros", macro.toLowerCase(), "ids", id], false);
    };
    this.removeMacroNodes = function(id, macro, part) {
      const toRemove = this.getMacroIds(id, macro, part.name);
      if (toRemove) {
        if (toRemove.points) {
          for (const nodeId of Object.values(toRemove.points)) delete part.points[nodeId];
        }
        if (toRemove.paths) {
          for (const nodeId of Object.values(toRemove.paths)) delete part.paths[nodeId];
        }
      }
      return this.getMacroIds(id, macro);
    };
    this.pack = fallbackPacker;
    for (const [path, method] of methods) {
      if (avoid.indexOf(path) !== -1) {
        this.log.warn(`You cannot overwrite \`store.${path}()\``);
      } else (0, import_lodash.default)(this, path, method);
    }
    return this;
  }
  Store.prototype.extend = function(methods) {
    for (const [path, method] of methods) {
      if (avoid.indexOf(path) !== -1) {
        this.log.warn(`You cannot overwrite \`store.${path}()\``);
      } else {
        this.log.debug(`Extending store with \`${path}\``);
        (0, import_lodash.default)(this, path, (...args) => method(this, ...args));
      }
    }
    return this;
  };
  Store.prototype.get = function(path, dflt2, prefix = "") {
    path = prefixStorePath(prefix, path);
    const val = (0, import_lodash3.default)(this, path, dflt2);
    if (typeof val === "undefined") {
      this.log.warn(`Store.get(key) on key \`${path}\`, which is undefined`);
    }
    return val;
  };
  Store.prototype.push = function(path, ...values) {
    const arr = (0, import_lodash3.default)(this, path);
    if (Array.isArray(arr)) {
      return this.set(path, [...arr, ...values]);
    } else {
      this.log.warn(`Store.push(value) on key \`${path}\`, but key does not hold an array`);
    }
    return this;
  };
  Store.prototype.set = function(path, value, prefix) {
    path = prefixStorePath(prefix, path);
    if (typeof value === "undefined") {
      this.log.warn(`Store.set(value) on key \`${path}\`, but value is undefined`);
    }
    (0, import_lodash.default)(this, path, value);
    return this;
  };
  Store.prototype.setIfUnset = function(path, value, prefix = "") {
    path = prefixStorePath(prefix, path);
    if (typeof value === "undefined") {
      this.log.warn(`Store.setIfUnset(value) on key \`${path}\`, but value is undefined`);
    }
    if (typeof (0, import_lodash3.default)(this, path) === "undefined") {
      return (0, import_lodash.default)(this, path, value);
    }
    return this;
  };
  Store.prototype.unset = function(path, prefix = "") {
    (0, import_lodash2.default)(this, prefixStorePath(prefix, path));
    return this;
  };
  function fallbackPacker(items) {
    let w = 0;
    let h = 0;
    for (const item of items) {
      if (item.width > w) w = item.width;
      if (item.height > w) w = item.height;
    }
    return { w, h };
  }
  function prefixStorePath(prefix, path) {
    if (!prefix) return path;
    if (Array.isArray(path)) {
      if (Array.isArray(prefix)) path = [...prefix, ...path];
      else path = [prefix, ...path];
    } else {
      if (Array.isArray(prefix)) path = prefix.join(".") + path;
      else path = prefix + path;
    }
    return path;
  }

  // node_modules/@freesewing/core/src/config.mjs
  var __loadDesignDefaults = () => ({
    parts: [],
    data: {}
  });
  var __loadPatternDefaults = () => ({
    complete: true,
    expand: true,
    idPrefix: "fs-",
    stackPrefix: "",
    locale: "en",
    units: "metric",
    margin: 2,
    scale: 1,
    layout: true,
    options: {},
    absoluteOptions: {},
    measurements: {}
  });

  // node_modules/@freesewing/core/src/hooks.mjs
  function Hooks() {
    return {
      preInit: [],
      postInit: [],
      preDraft: [],
      preSetDraft: [],
      prePartDraft: [],
      postPartDraft: [],
      postSetDraft: [],
      postDraft: [],
      preSample: [],
      postSample: [],
      preRender: [],
      preLayout: [],
      postLayout: [],
      postRender: [],
      insertText: []
    };
  }

  // node_modules/@freesewing/plugin-annotations/about.json
  var about_default = {
    id: "plugin-annotations",
    description: "A FreeSewing plugin that provides pattern annotations",
    version: "4.10.1"
  };

  // node_modules/@freesewing/plugin-annotations/src/buttons.mjs
  var buttonsDefs = [
    {
      name: "button",
      def: (scale) => `
<g id="button"
transform="scale(${scale})">
  <circle
    cx="0" cy="0" r="3.4"
    class="mark"
  ></circle>
  <circle cx="-1" cy="-1" r="0.5" class="no-stroke fill-mark"></circle>
  <circle cx="1"  cy="-1" r="0.5" class="no-stroke fill-mark"></circle>
  <circle cx="1"  cy="1"  r="0.5" class="no-stroke fill-mark"></circle>
  <circle cx="-1" cy="1"  r="0.5" class="no-stroke fill-mark"></circle>
</g>`
    },
    {
      name: "buttonhole",
      def: (scale) => `
<g id="buttonhole"
transform="scale(${scale})">
  <path
    class="mark"
    d="M -1,-5 L 1,-5 L 1,5 L -1,5 z"
  ></path>
</g>`
    },
    {
      name: "buttonhole-start",
      def: (scale) => `
<g id="buttonhole-start"
transform="scale(${scale})">
  <path
    class="mark"
    d="M -1,-10 L 1,-10 L 1,0 L -1,0 z"
  ></path>
</g>`
    },
    {
      name: "buttonhole-end",
      def: (scale) => `
<g id="buttonhole-end"
transform="scale(${scale})">
  <path
    class="mark"
    d="M -1,0 L 1,0 L 1,10 L -1,10 z"
  ></path>
</g>`
    },
    {
      name: "snap-stud-grad",
      def: (scale) => `
<radialGradient id="snap-stud-grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"
transform="scale(${scale})">
  <stop offset="30%" style="stop-color:rgb(235,235,235); stop-opacity:1"></stop>
  <stop offset="80%" style="stop-color:rgb(100,100,100);stop-opacity:1"></stop>
</radialGradient>`
    },
    {
      name: "snap-stud",
      def: (scale) => `
<g id="snap-stud"
transform="scale(${scale})">
  <circle id="snap-stud-circle-edge" cx="0" cy="0" r="3.4"
    style="stroke:#666;fill:#dddddd;stroke-width:0.3;"
  ></circle>
  <circle id="snap-stud-circle-middle" cx="0" cy="0" r="1.8"
    style="stroke:none;fill:url(#snap-stud-grad);"
  ></circle>
  <path
    id="snap-stud-lines" style="fill:none;stroke:#666; stroke-width:0.2;"
    d="M -2,0 L -3,0 M 2,0 L 3,0 M 0,2 L 0,3 M 0,-2 L 0,-3 M 1.5,1.5 L 2.1,2.1 M -1.5,1.5 L -2.1,2.1 M -1.5,-1.5 L -2.1,-2.1 M 1.5,-1.5 L 2.1,-2.1"
  ></path>
</g>`
    },
    {
      name: "snap-socket",
      def: (scale) => `
<g id="snap-socket"
transform="scale(${scale})">
  <circle id="snap-socket-circle-edge" cx="0" cy="0" r="3.4"
    style="stroke:#666;fill:#bbbbbb;stroke-width:0.3;"
  ></circle>
  <circle id="snap-socket-circle-middle" cx="0" cy="0" r="2"
    style="stroke:#666;fill:#dddddd; stroke-width:0.4;"
  ></circle>
  <path
    style="fill:none;stroke:#666; stroke-width:0.5;"
    d="M -1.7,-1 L -1.7,1 M 1.7,-1 L 1.7,1" id="snap-socket-lines"
  ></path>
</g>`
    },
    {
      name: "eyelet",
      def: `
<g id="eyelet">
  <circle id="eyelet-circle" cx="0" cy="0" r="3.4" class="no-full stroke-mark mark" stroke-width="1" fill="none" stroke="currentColor">
  </circle>
</g>`
    }
  ];

  // node_modules/@freesewing/config/src/control.mjs
  var dflt = 3;
  var account = {
    fields: {
      data: {
        bookmarks: 2,
        sets: 1,
        patterns: 1
      },
      info: {
        img: 2,
        bio: 2,
        email: 3,
        username: 2
      },
      settings: {
        consent: 2,
        compare: 3,
        newsletter: 2,
        units: 2,
        control: 1
      },
      security: {
        apikeys: 4,
        mfa: 3,
        password: 2
      },
      identities: {
        codeberg: 3,
        mastodon: 3,
        website: 3
      }
    },
    sets: {
      name: 1,
      img: 1,
      public: 3,
      units: 1,
      notes: 2,
      createdAt: 2,
      updatedAt: 2,
      uuid: 4
    },
    patterns: {
      name: 1,
      img: 1,
      public: 3,
      notes: 2,
      createdAt: 2,
      updatedAt: 2,
      uuid: 4
    },
    statuses: {
      0: {
        name: "inactive",
        color: "neutral"
      },
      1: {
        name: "active",
        color: "success"
      },
      "-1": {
        name: "paused",
        color: "warning"
      },
      "-2": {
        name: "disabled",
        color: "error"
      }
    }
  };
  var editor = {
    core: {
      sa: 2,
      paperless: 2,
      locale: 3,
      units: 1,
      complete: 4,
      expand: 4,
      only: 4,
      scale: 4,
      margin: 4
    },
    ui: {
      renderer: 4,
      kiosk: 2
    },
    views: {
      draft: 1,
      measies: 1,
      test: 3,
      time: 3,
      print: 1,
      export: 1,
      save: 1,
      edit: 4,
      logs: 2,
      inspect: 4,
      docs: 1
    }
  };
  var control = {
    account,
    editor,
    dflt,
    flat: {
      ...account.fields.data,
      ...account.fields.info,
      ...account.fields.settings,
      ...account.fields.security,
      ...account.fields.identities,
      sets: account.sets,
      core: editor.core,
      ui: editor.ui,
      views: editor.views
    }
  };

  // node_modules/@freesewing/config/src/logo.mjs
  var logoPath = "m18.56 0c-0.4945 0.3515-0.469 0.3065-0.8685 0.437-0.916 0.2995-1.7945 0.135-2.837 0.048-0.3135-0.035-0.6245-0.0555-0.928-0.0575-1.5325-0.0105-2.834 0.439-3.0805 1.694-0.4545 0.2755-0.8725 0.609-1.2865 0.943-0.884 0.6975-1.5495 1.55-2.0035 2.5775-0.62 1.5175-0.06 3.146 0.2175 4.684 0.066 0.36 0.135 0.703 0.172 0.8355 0.0525 0.1865 0.145 0.3645 0.2455 0.5245 0.0235 4e-3 0.1475-0.187 0.177-0.2715 0.043-0.123 0.0385-0.3205-0.0085-0.4905-0.104-0.3825-0.203-0.693-0.2115-0.849-0.015-0.293 0.042-0.5635 0.149-0.6975 0.038-0.0475 0.125 0.1975 0.1025 0.2885-0.0265 0.1095-0.0465 0.297-0.038 0.3835 0.0235 0.293 0.0665 0.6065 0.12 0.8805 0.0685 0.3535 0.098 0.5805 0.0855 0.6685-9e-3 0.064-0.039 0.1285-0.154 0.3265-0.1 0.1735-0.152 0.314-0.16 0.438-0.0085 0.121 0.028 0.4235 0.062 0.4975 0.0495 0.1155 0.1985 0.237 0.3285 0.267 0.1245 0.0475 0.187 0.146 0.251 0.2565 0.1555 0.2965 0.2755 0.6575 0.3945 1.2015 0.058 0.2605 0.1065 0.493 0.122 0.615-0.96 1e-3 -2.1895 0.0015-3.3095 0.0015-0.377 6e-3 -1.058-0.171-1.6825-0.212-0.0905-0.977-0.5195-2.112-1.2535-2.178-0.501-0.0455-0.9165 0.145-1.268 0.9365l0.01 0.0425c0.2075-0.1735 0.4265-0.704 1.2155-0.6675 0.606 0.0275 0.808 1.1745 0.868 1.8645-0.369 0.027-0.683 0.1405-0.847 0.424h-0.0035c0 5e-4 0 0.0015 0.0015 0.0025-0.0015 1e-3 -0.0015 2e-3 -0.0015 3e-3h0.0035c0.169 0.2905 0.4945 0.403 0.877 0.4255 0.2555 7.225 7.047 8.157 8.903 8.157 6.924 0 9.348-4.705 9.7125-6.5685 0.1705 0.794-0.3665 1.8055-0.495 2.552 1.4605-1.6885 1.1965-3.312 0.9295-4.945 0.222 0.264 0.5225 0.4275 0.93 0.337-0.2905-0.194-0.6845-0.058-0.9205-0.8765-0.103-0.3535-0.192-0.6185-0.2805-0.841-0.191-0.7165-0.462-1.401-0.795-2.068-0.281-0.7235-0.0955-1.1925-0.1235-1.8135 0.5055 1.667 0.8215 2.1105 1.4115 2.285-1.484-1.788-0.976-4.5565-1.8145-7.0275 0.3795 0.223 0.8125 0.29 1.2735 0.0175-0.446-0.127-0.891 0.2085-1.531-0.732-0.5405-1.0515-1.3235-1.828-2.2735-2.513-0.509-0.332-1.074-0.555-1.642-0.762 0.5785-0.145 1.2245-0.66 1.2545-1.0445zm-0.9705 5.5535c0.762 0.278 1.602 1.334 1.5925 2.37v0.058c-0.0205 1.407-0.66 2.1635-0.633 3.1005 0.0345 1.1035 0.5095 1.4885 0.604 1.6725-0.162-0.6805-0.257-1.5365-0.043-2.2145 0.275-0.872 0.5525-1.594 0.5325-2.277-0.01-0.16-0.078-0.7585-0.1235-1.0235 0.817 1.179-0.177 2.8935 0.109 4.0155 0.497 1.9545 2.7245 2.2015 2.0615 6.1395-0.5835 3.462-4.5815 6.0895-8.6795 6.0895-3.038 0-8.3025-1.6815-8.5625-7.646 0.6175-0.044 1.2815-0.216 1.654-0.21 1.126 0 2.412 5e-4 3.381 1e-3 0.182 0.821 0.3185 1.019 1.009 1.566 0.768 0.604 0.947 0.6775 2.083 0.6885 1.1365 0.0115 1.4735-0.232 2.576-1.275 0.238-0.279 0.341-0.6445 0.4565-0.988 1.134-0.0105 1.961-0.0305 2.7745-0.0685 0.8285-0.0375 0.9455 0 2.2805-0.1375-1.335-0.1375-1.452-0.1-2.2805-0.138-0.792-0.036-1.594-0.0565-2.6785-0.0665 0.091-0.4085 0.221-0.8075 0.3595-1.202 0.0855-0.2325 0.186-0.459 0.289-0.6845l0.1125-0.035c0.217-0.077 0.409-0.242 0.4855-0.465 0.0985-0.2955 0.0285-0.6275-0.162-0.869-0.0655-0.0905-0.147-0.206-0.1805-0.257-0.1005-0.159-0.103-0.2475-0.018-0.8385 0.0715-0.495 0.0795-0.754 0.03-1.005-0.01-0.1435-0.011-0.4385-0.0155-0.518 0.038 0.021 0.1205 0.209 0.204 0.4635 0.083 0.2555 0.0965 0.3085 0.1155 0.526 0.021 0.247-0.0715 0.43-0.1475 0.7985-0.038 0.19-0.0715 0.3665-0.0715 0.3905 0 0.0255 0.018 0.0795 0.037 0.1215 0.0445 0.094 0.128 0.226 0.1435 0.226 0.2725-0.3005 0.4325-0.6715 0.575-1.048 0.15-0.426 0.194-0.878 0.299-1.3165 0.085-0.382 0.183-0.7645 0.2135-1.1565 0.0615-0.765 0.0255-1.305-0.1435-2.102-0.0405-0.18-0.1575-0.5235-0.239-0.6855zm-2.68 3.7685c0.2925-0.0035 0.582 0.032 0.8575 0.1115 0.3745 0.1435 0.427 0.478 0.496 0.8535 0.0385 0.24 0.037 0.4125-0.0065 0.6945-0.0305 0.409-0.193 0.7255-0.548 0.948-0.5355 0.099-1.108 0.1945-1.562-0.16-0.381-0.525-0.6105-1.1885-0.523-1.8355 0.0555-0.2655 0.179-0.4035 0.433-0.486 0.2735-0.0785 0.563-0.1215 0.853-0.126zm-4.4415 0.0475c0.2735-0.0025 0.55 0.0265 0.702 0.1235 0.6525 0.4415 0.443 1.16 0.185 1.7905-0.3755 0.8255-1.1875 0.795-1.9745 0.7885-0.4355-0.1275-0.4755-0.4845-0.5385-0.866-0.054-0.3685-0.169-0.7635-0.073-1.134 0.2465-0.596 1.1475-0.6645 1.699-0.7025zm9.9515 0.103c0.0035 1.5865 0.2745 2.366 0.8185 3.4895-0.3205-0.6115-0.7785-0.9595-0.949-1.6905-0.326-1.4115 0.0255-1.3325 0.1305-1.799zm-7.9065 1.149c0.086 0.087 0.1275 0.207 0.202 0.3025 0.0575-0.0985 0.1165-0.1965 0.1905-0.284 0.0385 1e-3 0.0855 0.077 0.128 0.213 0.182 0.503 0.2175 1.0565 0.4535 1.54 0.2205 0.35-0.0805 0.554-0.411 0.57-0.241-5e-4 -0.343-0.165-0.4845-0.328-0.0365 0.1065-0.106 0.175-0.189 0.247-0.211 0.177-0.6245 0.1115-0.6885-0.1675 0.085-0.533 0.3565-1.0225 0.5345-1.5335 0.0885-0.1865 0.0895-0.3295 0.2645-0.5595zm-3.096 2.6925c0.1065 0 0.399 0.1985 0.4585 0.3105 0.041 0.0745 0.1345 0.3645 0.141 0.435 0.0105 0.084-0.015 0.283-0.041 0.337-0.019 0.0385-0.0335 0.044-0.0555 0.019-0.0185-0.021-0.2635-0.491-0.42-0.802-0.123-0.249-0.136-0.2995-0.083-0.2995zm6.111 0.1555c4e-3 5e-4 0.01 2e-3 0.0155 0.0035 0.033 0.0135 0.01 0.1305-0.114 0.5555-0.0235 0.128-0.0805 0.229-0.164 0.313-0.0275 0-0.04-0.032-0.083-0.2095-0.0365-0.1515-0.0405-0.2865-0.015-0.4075 0.044-0.1515 0.222-0.198 0.3605-0.255zm-0.7415 0.9265c0.0105-2e-3 0.0205 0.0035 0.0335 0.014 0.045 0.0315 0.0515 0.1145 0.0215 0.277-0.0365 0.209-0.0445 0.232-0.0985 0.2535-0.0235 0.0105-0.0655 0.018-0.0935 0.018-0.0505-9e-3 -0.0635-0.05-0.0515-0.112 0-0.13 0.038-0.243 0.124-0.3765 0.0325-0.05 0.049-0.0715 0.0645-0.074zm-4.3165 0.0095c0.0345 0 0.1385 0.075 0.177 0.127 0.043 0.055 0.092 0.3825 0.0645 0.439-0.0315 0.071-0.1855 0.0355-0.228-0.053-0.026-0.053-0.0875-0.339-0.0875-0.407 0-0.063 0.0305-0.106 0.074-0.106zm3.9455 0.0865c0.042 0.06 0.053 0.137 0.044 0.306l-0.0085 0.154-0.044 0.044c-0.0265 0.0245-0.0715 0.0545-0.0985 0.067-0.0595 0.028-0.105 0.0305-0.1135 8e-3 -0.01-0.03 7e-3 -0.221 0.0255-0.2855 0.0215-0.0665 0.118-0.265 0.15-0.307 0.0145-0.0385 0.0315 0.0095 0.045 0.0135zm-2.5105-9e-3c0.0905 0.023 0.1305 0.1045 0.18 0.1785l0.0335 0.066-0.047 0.1635c-0.025 0.09-0.0515 0.171-0.0595 0.18-9e-3 0.01-0.0425 0.015-0.092 0.0145-0.132-0.0035-0.147-9e-3 -0.1825-0.063l-0.033-0.049 0.028-0.1375c0.0405-0.198 0.06-0.2575 0.105-0.3085 0.0235-0.0275 0.047-0.0425 0.0675-0.0445zm-0.8355 0.1415 0.0745 0.0745 0.0125 0.1685c0.0065 0.092 0.0095 0.1775 0.0045 0.188-0.0045 0.0145-0.0315 0.0185-0.115 0.0185h-0.1085c-0.058-0.0635-0.076-0.141-0.1005-0.221-0.057-0.2405-0.057-0.35 2e-3 -0.3645 0.0965 6e-3 0.16 0.076 0.2305 0.136zm2.9-0.1155c0.118 0.0315 0.0945 0.219 0.094 0.353-9e-3 0.217-0.0175 0.262-0.0455 0.29-0.0485 0.0485-0.1835 0.0215-0.249-0.0505-0.0215-0.026-0.0235-0.034-0.0065-0.1395 0.0195-0.1285 0.0445-0.2085 0.1-0.3185 0.0405-0.079 0.0785-0.1285 0.107-0.1345zm-2.663 0.01c0.0065-5e-4 0.017 0 0.027 1e-3 0.075 6e-3 0.145 0.055 0.207 0.145l0.05 0.0735c0.0045 0.1205 0 0.2475-0.0215 0.3595-0.013 0.0065-0.067 0.0165-0.12 0.0215-0.092 0.0085-0.1005 0.0065-0.1325-0.0215-0.0445-0.038-0.057-0.1085-0.068-0.3425-0.0065-0.191-2e-3 -0.2335 0.058-0.2365zm1.1345 0.04c0.0805 0.017 0.1315 0.06 0.154 0.1305 0.018 0.0605 0.029 0.399 0.0115 0.4225-6e-3 0.01-0.044 0.0225-0.0875 0.028-0.162 0.0205-0.305 5e-3 -0.319-0.0335-0.018-0.044 0.1025-0.48 0.147-0.534 0.019-0.042 0.065-0.0095 0.094-0.0135zm1.049 3e-3c0.0355-0.0035 0.0735 0.0305 0.1105 0.103 0.03 0.0605 0.0345 0.0815 0.0345 0.217 0 0.108-0.0065 0.1545-0.018 0.1645-0.01 8e-3 -0.0505 0.0225-0.0935 0.0335-0.075 0.0195-0.0915 0.0215-0.115 0.0135l-0.1125-0.0205 0.0085-0.067c8e-3 -0.0875 0.0655-0.2815 0.106-0.3655 0.024-0.05 0.0515-0.075 0.0795-0.0785zm-0.489 0.0015c0.0235-1e-3 0.0345 0.0045 0.0495 0.021 0.0355 0.042 0.0805 0.166 0.109 0.2985 0.038 0.1865 0.038 0.186-0.0435 0.2105-0.0355 0.011-0.1105 0.0225-0.164 0.0255-0.1765 9e-3 -0.19-0.0015-0.1685-0.1575 0.017-0.139 0.0855-0.358 0.115-0.374 0.032-0.017 0.069-0.0165 0.1025-0.024zm-8.9965 0.7045c0.0015-5e-4 0.0035 0 0.0035 0 0.0045 0.0975 0.0045 0.196 0.0065 0.294-0.2475-0.019-0.4295-0.078-0.4295-0.1475 0-0.0685 0.1755-0.127 0.4195-0.1465zm0.4325 0.0085c0.2005 0.025 0.339 0.0775 0.3365 0.138 0 0.061-0.134 0.113-0.333 0.1375-2e-3 -0.0915-2e-3 -0.1835-0.0035-0.2755zm9.363 0.2665c0.017-0.0015 0.0245-3e-3 0.0505-5e-4 0.104 0.0105 0.119 0.017 0.119 0.052 0 0.046-0.079 0.1845-0.1325 0.2325-0.025 0.024-0.0595 0.044-0.0715 0.044-0.06 0-0.095-0.1265-0.067-0.243 0.017-0.063 0.048-0.0825 0.1015-0.085zm-0.3775 0.0415c0.0465-4e-3 0.0915 0.0085 0.1365 0.0145-0.013 0.1315-0.072 0.239-0.1815 0.3105-0.027 0-0.0405-0.0515-0.0405-0.164 0-0.134 7e-3 -0.1595 0.0855-0.161zm-0.414 0.0485c0.0965 0 0.1815 0.0045 0.1855 0.01 0.018 0.017-0.034 0.146-0.1105 0.277-0.0655 0.1165-0.075 0.125-0.1155 0.128-0.159-0.018-0.1545-0.2045-0.179-0.3325 0-0.076 0.017-0.0825 0.2195-0.0825zm-1.5045 0.0145c0.1105 2e-3 0.1535 0.0185 0.1535 0.061 0 0.054-0.041 0.1615-0.0645 0.175-0.0355 0.0195-0.0385 0.0185-0.1085-0.0545-0.1105-0.124-0.123-0.147 0.0195-0.1815zm0.532 0.0055c2e-3 3e-3 0.0235 0.042 0.045 0.086 0.047 0.0915 0.0505 0.1315 0.017 0.162-0.079 0.045-0.0955 0.0195-0.167-0.026-0.083-0.0785-0.1485-0.184-0.127-0.206 0.074-0.0265 0.1555-0.0165 0.232-0.016zm0.211 0.0025 0.1975 0.0035c0.077 0 0.1435 4e-3 0.147 0.01 0.0135 0.012-0.03 0.269-0.0535 0.327-0.027 0.065-0.1215 0.0655-0.1705-0.0115-0.07-0.1105-0.116-0.2035-0.1175-0.2675z";

  // node_modules/@freesewing/config/src/measurements.mjs
  var degreeMeasurements = ["shoulderSlope"];

  // node_modules/@freesewing/plugin-annotations/src/logo.mjs
  var logoDefs = [
    {
      name: "logo",
      def: (scale) => `<g id="logo" transform="scale(${2 * scale}) translate(-12.55 -18)"><path class="logo" fill="currentColor" d="${logoPath}"/></g>`
    }
  ];

  // node_modules/@freesewing/plugin-annotations/src/notches.mjs
  var notchesDefs = [
    {
      name: "notch",
      def: (scale) => `
<g id="notch" transform="scale(${scale})">
  <circle cy="0" cx="0" r="1.4" class="fill-note"></circle>
  <circle cy="0" cx="0" r="2.8" class="note"></circle>
</g>`
    },
    {
      name: "bnotch",
      def: (scale) => `
<g id="bnotch" transform="scale(${scale})">
  <path d="M -1.1 -1.1 L 1.1 1.1 M 1.1 -1.1 L -1.1 1.1" class="note"></path>
  <circle cy="0" cx="0" r="2.8" class="note"></circle>
</g>`
    }
  ];

  // node_modules/@freesewing/plugin-annotations/src/banner.mjs
  var macroDefaults = {
    classes: "center",
    dy: -1,
    force: false,
    id: "banner",
    repeat: 10,
    spaces: 12
  };
  var rmbanner = (id = macroDefaults.id, { store: store2, part }) => store2.removeMacroNodes(id, "banner", part);
  var banner = function(config, { paths, store: store2, complete }) {
    if (!complete && !config.force) return;
    const mc = { ...macroDefaults, ...config };
    const ids = store2.generateMacroIds(["banner"], mc.id);
    paths[ids.banner] = mc.path.clone().setClass("hidden").attr("data-text-dy", mc.dy).attr("data-text-class", mc.classes);
    const spacer = "&#160;".repeat(mc.spaces);
    for (let i = 0; i < mc.repeat; i++) paths[ids.banner].addText(mc.text).addText(spacer);
    paths[ids.banner].addText(mc.text);
    store2.storeMacroIds(mc.id, { paths: ids });
    return store2.getMacroIds(mc.id);
  };
  var bannerMacros = { banner, rmbanner };

  // node_modules/@freesewing/plugin-annotations/src/bannerbox.mjs
  var macroDefaults2 = {
    classes: {
      text: "text-xs fill-note",
      box: "stroke-xs stroke-note lashed"
    },
    dy: 4,
    id: "bannerbox",
    margin: 15,
    repeat: 99,
    spaces: 12,
    text: ""
  };
  var rmbannerbox = (id = macroDefaults2.id, { macro, store: store2, part }) => {
    macro("rmbanner", id);
    return store2.removeMacroNodes(id, "bannerbox", part);
  };
  var bannerbox = function(config, { Point: Point2, paths, Path: Path2, macro, log, store: store2, complete }) {
    if (!complete && !config.force) return;
    const mc = {
      ...macroDefaults2,
      ...config,
      classes: macroDefaults2.classes
    };
    if (config.classes) mc.classes = { ...mc.classes, ...config.classes };
    if (!mc.topLeft || typeof mc.topLeft.attr !== "function") {
      log.warn(`Bannerbox macro called without a valid topLeft point. Using (0,0) for topLeft.`);
      mc.topLeft = new Point2(0, 0);
    }
    if (!mc.bottomRight || typeof mc.bottomRight.attr !== "function") {
      log.warn(
        `Bannerbox macro called without a valid bottomRight point. Using (6660,666) for bottomRight.`
      );
      mc.bottomRight = new Point2(666, 666);
    }
    const ids = store2.generateMacroIds(["box"], mc.id);
    const offset = Math.sqrt(2 * Math.pow(mc.margin, 2));
    paths[ids.box] = new Path2().move(mc.topLeft.shift(135, offset)).line(new Point2(mc.bottomRight.x, mc.topLeft.y).shift(45, offset)).line(mc.bottomRight.shift(315, offset)).line(new Point2(mc.topLeft.x, mc.bottomRight.y).shift(225, offset)).line(mc.topLeft.shift(135, offset)).close().addClass(mc.classes.box);
    macro("banner", {
      id: mc.id,
      path: paths[ids.box],
      text: mc.text,
      className: mc.classes.text,
      repeat: mc.repeat,
      spaces: mc.spaces,
      dy: mc.dy
    });
    store2.storeMacroIds(mc.id, { paths: ids });
    return store2.getMacroIds(mc.id);
  };
  var bannerboxMacros = { bannerbox, rmbannerbox };

  // node_modules/@freesewing/plugin-annotations/src/bartack.mjs
  var macroDefaults3 = {
    anchor: false,
    angle: 0,
    bartackAlong: false,
    bartackFractionAlong: false,
    classes: "stroke-sm stroke-mark",
    density: 3,
    end: 1,
    from: false,
    id: "bartack",
    length: 15,
    path: false,
    start: 0,
    to: false,
    width: 3
  };
  var drawBartack = (pointList, { Path: Path2 }) => {
    let path = new Path2().move(pointList.path1[0]);
    for (const i in pointList.path1) {
      if (pointList.path1[i]) path = path.line(pointList.path1[i]);
      if (pointList.path2[i]) path = path.line(pointList.path2[i]);
    }
    return path;
  };
  var getPoints = (path, mc) => {
    let path1 = path.offset(mc.width / 2);
    let path2 = path.offset(mc.width / -2);
    let len = path1.length();
    let len2 = path2.length();
    if (len2 > len) {
      let tmp = path2;
      path2 = path1;
      path1 = tmp;
      len = len2;
    }
    let points = {
      path1: [path1.start()],
      path2: [path2.start()]
    };
    let steps = Math.ceil(len / mc.width * mc.density);
    for (let i = 1; i < steps; i++) {
      points.path1.push(path1.shiftFractionAlong(1 / steps * i));
      points.path2.push(path2.shiftFractionAlong(1 / steps * i));
    }
    return points;
  };
  var bartackPath = (path, mc, props) => path ? drawBartack(getPoints(path, mc), props) : null;
  function createBartack(config, props) {
    if (!props.complete && !config.force) return;
    const mc = { ...macroDefaults3, ...config };
    const { Path: Path2, paths } = props;
    if (mc.angle < 0) mc.angle = 360 + mc.angle % -360;
    let guide = false;
    if (mc.anchor)
      guide = new Path2().move(mc.anchor).line(mc.anchor.shift(mc.angle, mc.length));
    else if (mc.from && mc.to)
      guide = new Path2().move(mc.from).line(mc.to);
    else if (mc.path) {
      let start = false;
      let end = false;
      if (mc.bartackAlong) guide = mc.path.clone();
      else if (mc.bartackFractionAlong) {
        if (mc.start === mc.end) return null;
        if (mc.start > mc.end) {
          const newEnd = mc.start;
          mc.start = mc.end;
          mc.end = newEnd;
        }
        if (mc.start > 0) start = mc.path.shiftFractionAlong(mc.start);
        if (mc.end < 1) end = mc.path.shiftFractionAlong(mc.end);
        if (start && end) guide = mc.path.split(start).pop().split(end).shift();
        else if (start) guide = mc.path.split(start).pop();
        else if (end) guide = mc.path.split(end).shift();
        else guide = mc.path.clone();
      }
    }
    const ids = props.store.generateMacroIds(["stitches"], mc.id);
    paths[ids.stitches] = bartackPath(guide, mc, props).attr("class", mc.classes);
    props.store.storeMacroIds(mc.id, { paths: ids });
    return props.store.getMacroIds(mc.id);
  }
  var removeBartack = (name = "bartack", id = macroDefaults3.id, { store: store2, part }) => store2.removeMacroNodes(id, name, part);
  var rmbartack = (id, props) => removeBartack("bartack", id, props);
  var rmbartackAlong = (id, props) => removeBartack("bartackalong", id, props);
  var rmbartackFractionAlong = (id, props) => removeBartack("bartackfractionalong", id, props);
  var bartack = (config, props) => createBartack(config, props);
  var bartackAlong = (config, props) => createBartack(
    {
      ...config,
      id: "bartackalong",
      bartackFractionAlong: false,
      bartackAlong: true,
      anchor: false,
      from: false,
      to: false
    },
    props
  );
  var bartackFractionAlong = (config, props) => createBartack(
    {
      ...config,
      id: "bartackfractionalong",
      bartackFractionAlong: true,
      bartackAlong: false,
      anchor: false,
      from: false,
      to: false
    },
    props
  );
  var bartackMacros = {
    bartack,
    bartackAlong,
    bartackFractionAlong,
    rmbartack,
    rmbartackAlong,
    rmbartackFractionAlong
  };

  // node_modules/@freesewing/plugin-annotations/src/crossbox.mjs
  var macroDefaults4 = {
    classes: {
      box: "lining dotted stroke-sm",
      cross: "lining dotted stroke-sm",
      text: "center fill-lining"
    },
    id: "crossbox",
    offset: 0.1,
    text: ""
  };
  var rmcrossbox = (id = macroDefaults4.id, { store: store2, part }) => store2.removeMacroNodes(id, "crossbox", part);
  var crossbox = function(config, { points, Point: Point2, paths, Path: Path2, complete, store: store2, log }) {
    if (!complete && !config.force) return;
    const mc = {
      ...macroDefaults4,
      ...config,
      classes: macroDefaults4.classes
    };
    if (config.classes) mc.classes = { ...mc.classes, ...config.classes };
    if (!mc.topLeft || typeof mc.topLeft.attr !== "function") {
      log.warn(`Crossbox macro called without a valid topLeft point. Using (0,0) for topLeft.`);
      mc.topLeft = new Point2(0, 0);
    }
    if (!mc.bottomRight || typeof mc.bottomRight.attr !== "function") {
      log.warn(
        `Crossbox macro called without a valid bottomRight point. Using (666,666) for bottomRight.`
      );
      mc.bottomRight = new Point2(666, 666);
    }
    const flatIds = store2.generateMacroIds(["box", "cross", "text"], mc.id);
    const ids = {
      paths: {
        box: flatIds.box,
        cross: flatIds.cross
      },
      points: { text: flatIds.text }
    };
    const offset = Math.abs(mc.topLeft.dx(mc.bottomRight)) > Math.abs(mc.topLeft.dy(mc.bottomRight)) ? Math.abs(mc.topLeft.dx(mc.bottomRight)) * mc.offset : Math.abs(mc.topLeft.dy(mc.bottomRight)) * mc.offset;
    paths[ids.paths.box] = new Path2().move(mc.topLeft).line(new Point2(mc.topLeft.x, mc.bottomRight.y)).line(mc.bottomRight).line(new Point2(mc.bottomRight.x, mc.topLeft.y)).line(mc.topLeft).close().attr("class", mc.classes.box);
    paths[ids.paths.cross] = new Path2().move(mc.topLeft.shift(315, offset)).line(new Point2(mc.bottomRight.x, mc.topLeft.y).shift(225, offset)).line(mc.bottomRight.shift(135, offset)).line(new Point2(mc.topLeft.x, mc.bottomRight.y).shift(45, offset)).line(mc.topLeft.shift(315, offset)).line(mc.bottomRight.shift(135, offset)).move(new Point2(mc.bottomRight.x, mc.topLeft.y).shift(225, offset)).line(new Point2(mc.topLeft.x, mc.bottomRight.y).shift(45, offset)).attr("class", mc.classes.box);
    if (mc.text)
      points[ids.points.text] = mc.topLeft.shiftFractionTowards(mc.bottomRight, 0.5).addText(mc.text, mc.classes.text);
    else delete ids.points.text;
    store2.storeMacroIds(mc.id, ids);
    return store2.getMacroIds(mc.id);
  };
  var crossboxMacros = { crossbox, rmcrossbox };

  // node_modules/@freesewing/plugin-annotations/src/cutlist.mjs
  var cutlistStores = [
    ["cutlist.addCut", addCut],
    ["cutlist.setCut", setCut],
    ["cutlist.removeCut", removeCut],
    ["cutlist.setGrain", setGrain],
    ["cutlist.removeGrain", removeGrain],
    ["cutlist.getGrainOrigin", getGrainOrigin],
    ["cutlist.setCutOnFold", setCutOnFold],
    ["cutlist.removeCutOnFold", removeCutOnFold],
    ["cutlist.getCutFabrics", getCutFabrics]
  ];
  var cutlistHooks = {
    prePartDraft: [
      function(pattern) {
        const injectedPart = pattern.config.inject[pattern.activePart];
        if (!injectedPart) return;
        const store2 = pattern.setStores[pattern.activeSet];
        const injectedCutlist = store2.get(["cutlist", injectedPart], {});
        store2.set(["cutlist", pattern.activePart], { ...injectedCutlist });
      }
    ]
  };
  function addCut(store2, so = {}) {
    if (Array.isArray(so)) {
      for (const cut2 of so) addCut(store2, cut2);
      return store2;
    }
    const { cut = 2, from = "fabric", identical = false, onBias = false, onFold = false } = so;
    const partName = store2.get("activePart");
    if (cut === false) {
      if (from === false) store2.unset(["cutlist", partName, "materials"]);
      else store2.unset(["cutlist", partName, "materials", from]);
      return store2;
    }
    if (!(Number.isInteger(cut) && cut > -1)) {
      store2.log.error(`Tried to set cut to a value that is not a positive integer`);
      return store2;
    }
    if (typeof from !== "string") {
      store2.log.warn(`Tried to set material to a value that is not a string`);
      return store2;
    }
    const path = ["cutlist", partName, "materials", from];
    const existing = store2.get(path, []);
    store2.set(path, existing.concat({ cut, identical, onBias, onFold }));
    return store2;
  }
  function removeCut(store2, from = false) {
    return addCut(store2, { cut: false, from });
  }
  function setCut(store2, so) {
    removeCut(store2);
    return addCut(store2, so);
  }
  function setGrain(store2, grain = false, origin = "grainline") {
    const partName = store2.get("activePart");
    const path = ["cutlist", partName, "grain"];
    if (grain === false) {
      store2.log.warn("Using setGrain() to remove the grain is deprecated. Use removeGrain() instead");
      return store2.unset(path);
    }
    if (typeof grain !== "number") {
      store2.log.error("Called part.setGrain() with a value that is not a number");
      return store2;
    }
    store2.set(["cutlist", partName, "grainOrigin"], origin);
    return store2.set(path, grain);
  }
  function getGrainOrigin(store2) {
    return store2.get(["cutlist", store2.get("activePart"), "grainOrigin"], null);
  }
  function removeGrain(store2) {
    return store2.unset(["cutlist", store2.get("activePart"), "grain"]);
  }
  function setCutOnFold(store2, p1, p2) {
    const partName = store2.get("activePart");
    const path = ["cutlist", partName, "cutOnFold"];
    if (p1 === false && typeof p2 === "undefined") {
      store2.log.warn(
        "Using setCutOnFold() to remove the cutonfold is deprecated. Use removeCutOnFold() instead"
      );
      return store2.unset(path);
    }
    if (!isNaN(p1.x) && !isNaN(p1.y) && !isNaN(p2.x) && !isNaN(p2.y)) {
      store2.set(path, [p1, p2]);
    } else
      store2.log.error("Called part.setCutOnFold() but at least one parameter is not a Point instance");
    return store2;
  }
  function removeCutOnFold(store2) {
    return store2.unset(["cutlist", store2.get("activePart"), "cutOnFold"]);
  }
  function getCutFabrics(store2, settings) {
    const cutlist = store2.get("cutlist");
    const list = settings.only ? [].concat(settings.only) : Object.keys(cutlist);
    const fabrics = [];
    list.forEach((partName) => {
      if (!cutlist[partName]?.materials) {
        return;
      }
      for (var m in cutlist[partName].materials) {
        if (!fabrics.includes(m)) fabrics.push(m);
      }
    });
    return fabrics;
  }

  // node_modules/@freesewing/plugin-annotations/src/scalebox.mjs
  var macroDefaults5 = {
    classes: {
      lead: "text-xs bold",
      title: "text bold",
      text: "text-xs",
      link: "text-sm fill-note bold",
      metric: "text-xs center",
      imperial: "text-xs center",
      imperialBox: "scalebox imperial fill-current",
      metricBox: "scalebox metric fill-bg"
    },
    lead: "FreeSewing",
    link: "FreeSewing.org/patrons/join",
    text: "plugin-annotations:supportFreeSewingBecomeAPatron",
    title: false,
    force: false
  };
  var sizes = {
    scalebox: {
      metric: [
        [10, 5, "1cm", "0.5cm"],
        [20, 10, "2cm", "1cm"],
        [30, 15, "3cm", "1.5cm"],
        [40, 20, "4cm", "2cm"],
        [50, 25, "5cm", "2.5cm"],
        [60, 30, "6cm", "3cm"],
        [70, 35, "7cm", "3.5cm"],
        [80, 40, "8cm", "4cm"],
        [90, 45, "9cm", "4.5cm"],
        [100, 50, "10cm", "5cm"]
      ],
      imperial: [
        [25.4 * 0.5, 25.4 * 0.25, '1/2"', '1/4"'],
        [25.4 * 0.875, 25.4 * 0.5, '7/8"', '1/2"'],
        [25.4 * 1.25, 25.4 * 0.625, '1 1/4"', '5/8"'],
        [25.4 * 1.625, 25.4 * 0.875, '1 5/8"', '7/8"'],
        [25.4 * 2, 25.4 * 1, '2"', '1"'],
        [25.4 * 2.375, 25.4 * 1.25, '2 3/8"', '1 1/4"'],
        [25.4 * 2.875, 25.4 * 1.5, '2 7/8"', '1 1/2"'],
        [25.4 * 3.25, 25.4 * 1.625, '3 1/4"', '1 5/8"'],
        [25.4 * 3.625, 25.4 * 1.875, '3 5/8"', '1 7/8"'],
        [25.4 * 4, 25.4 * 2, '4"', '2"']
      ]
    },
    miniscale: [
      [10, "1cm", 25.4 * 0.375, '3/8"'],
      [13, "1.3cm", 25.4 * 0.5, '1/2"'],
      [16, "1.6cm", 25.4 * 0.625, '5/8"'],
      [19, "1.9cm", 25.4 * 0.75, '3/4"'],
      [22, "2.2cm", 25.4 * 0.875, '7/8"'],
      [25, "2.5cm", 25.4 * 1, '1"']
    ]
  };
  var removeScaleAnnotation = function(id = false, { store: store2, part }, type) {
    if (!id) id = type;
    return store2.removeMacroNodes(id, type, part);
  };
  var scalebox = function(config, { store: store2, points, paths, scale, Point: Point2, Path: Path2, complete, log }) {
    if (!complete && !config.force) return;
    const mc = {
      ...macroDefaults5,
      id: "scalebox",
      ...config,
      classes: macroDefaults5.classes
    };
    if (config.classes) mc.classes = { ...mc.classes, ...config.classes };
    const scaleIndex = Math.round(10 * Math.max(0.1, Math.min(1, scale))) - 1;
    const [mw, mh, mdw, mdh] = sizes.scalebox.metric[scaleIndex];
    const [iw, ih, idw, idh] = sizes.scalebox.imperial[scaleIndex];
    if (!mc.at || typeof mc.at.attr !== "function") {
      log.warn(`Scalebox macro called without a valid at point. Using (0,0) for at.`);
      mc.at = new Point2(0, 0);
    }
    const ids = store2.generateMacroIds(
      [
        "metric",
        "imperial",
        "textLead",
        "textMetric",
        "textImperial",
        "textTitle",
        "textText",
        "textLink"
      ],
      mc.id
    );
    const box = {
      mtl: new Point2(mc.at.x - mw / 2, mc.at.y - mh / 2),
      mtr: new Point2(mc.at.x + mw / 2, mc.at.y - mh / 2),
      mbl: new Point2(mc.at.x - mw / 2, mc.at.y + mh / 2),
      mbr: new Point2(mc.at.x + mw / 2, mc.at.y + mh / 2),
      itl: new Point2(mc.at.x - iw / 2, mc.at.y - ih / 2),
      itr: new Point2(mc.at.x + iw / 2, mc.at.y - ih / 2),
      ibl: new Point2(mc.at.x - iw / 2, mc.at.y + ih / 2),
      ibr: new Point2(mc.at.x + iw / 2, mc.at.y + ih / 2)
    };
    const text = {
      lead: new Point2(mc.at.x - 45 * scale, mc.at.y - 15 * scale),
      metric: new Point2(mc.at.x, mc.at.y + 20 * scale),
      imperial: new Point2(mc.at.x, mc.at.y + 24 * scale)
    };
    text.title = text.lead.shift(-90, 10 * scale);
    text.text = text.title.shift(-90, 12 * scale);
    text.link = text.text.shift(-90, 5 * scale);
    if (mc.rotate) {
      mc.rotate = Number(mc.rotate);
      for (const pid in box) box[pid] = box[pid].rotate(mc.rotate, mc.at);
      for (const pid in text) {
        text[pid] = text[pid].rotate(mc.rotate, mc.at);
        text[pid].attr(
          "data-text-transform",
          `rotate(${mc.rotate * -1}, ${text[pid].x}, ${text[pid].y})`,
          true
        );
      }
    }
    paths[ids.imperial] = new Path2().addClass(mc.classes.imperialBox).move(box.itl).line(box.ibl).line(box.ibr).line(box.itr).line(box.itl).close();
    paths[ids.metric] = new Path2().addClass(mc.classes.metricBox).move(box.mtl).line(box.mbl).line(box.mbr).line(box.mtr).line(box.mtl).close();
    points[ids.textLead] = text.lead.addText(mc.lead, mc.classes.lead);
    let title2 = mc.title;
    if (!title2) {
      title2 = store2.data?.name || "plugin-annotations:noName";
      if (title2.indexOf("@freesewing/") !== -1) title2 = title2.replace("@freesewing/", "");
    }
    points[ids.textTitle] = text.title.addText(title2, mc.classes.title).attr("data-text", "v" + (store2.data?.version || "No Version"));
    points[ids.textText] = text.text.addText(mc.text, mc.classes.text);
    points[ids.textLink] = text.link.addText(mc.link, mc.classes.link).attr("data-text-lineheight", 4);
    points[ids.textMetric] = text.metric.attr("data-text", "plugin-annotations:theWhiteInsideOfThisBoxShouldMeasure").attr("data-text", mdw).attr("data-text", "x").attr("data-text", mdh).attr("data-text-class", mc.classes.metric);
    points[ids.textImperial] = text.imperial.attr("data-text", "plugin-annotations:theBlackOutsideOfThisBoxShouldMeasure").attr("data-text", idw).attr("data-text", "x").attr("data-text", idh).attr("data-text-class", mc.classes.imperial);
    store2.storeMacroIds(mc.id, {
      points: {
        textLead: ids.textLead,
        textMetric: ids.textMetric,
        textImperial: ids.textImperial,
        textTitle: ids.textTitle,
        textText: ids.textText,
        textLink: ids.textLink
      },
      paths: {
        metric: ids.metric,
        imperial: ids.imperial
      }
    });
    return store2.getMacroIds(mc.id);
  };
  var miniscale = function(config, { points, paths, scale, Point: Point2, Path: Path2, complete, log, store: store2 }) {
    if (!complete && !config.force) return;
    const mc = {
      ...macroDefaults5,
      id: "miniscale",
      ...config,
      classes: macroDefaults5.classes
    };
    if (config.classes) mc.classes = { ...mc.classes, ...config.classes };
    const scaleIndex = Math.ceil(6 * Math.max(0.1, Math.min(1, scale))) - 1;
    const [ms, mds, is, imds] = sizes.miniscale[scaleIndex];
    if (!mc.at || typeof mc.at.attr !== "function") {
      log.warn(`Scalebox macro called without a valid at point. Using (0,0) for at.`);
      mc.at = new Point2(0, 0);
    }
    const ids = store2.generateMacroIds(["metric", "imperial", "textMetric", "textImperial"], mc.id);
    const box = {
      mtl: new Point2(mc.at.x - ms / 2, mc.at.y - ms / 2),
      mtr: new Point2(mc.at.x + ms / 2, mc.at.y - ms / 2),
      mbl: new Point2(mc.at.x - ms / 2, mc.at.y + ms / 2),
      mbr: new Point2(mc.at.x + ms / 2, mc.at.y + ms / 2),
      itl: new Point2(mc.at.x - is / 2, mc.at.y - is / 2),
      itr: new Point2(mc.at.x + is / 2, mc.at.y - is / 2),
      ibl: new Point2(mc.at.x - is / 2, mc.at.y + is / 2),
      ibr: new Point2(mc.at.x + is / 2, mc.at.y + is / 2)
    };
    const text = {
      metric: new Point2(mc.at.x, mc.at.y - 2 * scale),
      imperial: new Point2(mc.at.x, mc.at.y + 8 * scale)
    };
    if (mc.rotate) {
      mc.rotate = Number(mc.rotate);
      for (const pid in box) box[pid] = box[pid].rotate(mc.rotate, mc.at);
      for (const pid in text) {
        text[pid] = text[pid].rotate(mc.rotate, mc.at).attr(
          "data-text-transform",
          `rotate(${mc.rotate * -1}, ${text[pid].x}, ${text[pid].y})`,
          true
        );
      }
    }
    paths[ids.imperial] = new Path2().attr("class", "scalebox imperial fill-current").move(box.itl).line(box.ibl).line(box.ibr).line(box.itr).line(box.itl).close();
    paths[ids.metric] = new Path2().attr("class", "scalebox metric fill-bg").move(box.mtl).line(box.mbl).line(box.mbr).line(box.mtr).line(box.mtl).close();
    points[ids.textMetric] = text.metric.addText(`${mds} x ${mds}`, mc.classes.metric);
    points[ids.textImperial] = text.imperial.addText(`${imds} x ${imds}`, mc.classes.imperial);
    store2.storeMacroIds(mc.id, {
      points: {
        textMetric: ids.textMetric,
        textImperial: ids.textImperial
      },
      paths: {
        metric: ids.metric,
        imperial: ids.imperial
      }
    });
    return store2.getMacroIds(mc.id);
  };
  var scaleboxMacros = {
    scalebox,
    miniscale,
    rmscalebox: (id, props) => removeScaleAnnotation(id, props, "scalebox"),
    rmminiscale: (id, props) => removeScaleAnnotation(id, props, "miniscale")
  };

  // node_modules/@freesewing/plugin-annotations/src/title.mjs
  var capitalize2 = (string) => typeof string === "string" ? string.charAt(0).toUpperCase() + string.slice(1) : "";
  var macroDefaults6 = {
    align: "left",
    append: false,
    cutlist: true,
    dy: 8,
    id: "title",
    force: false,
    nr: 1,
    rotation: 0,
    scale: 1,
    title: "plugin-annotations:noName",
    notes: false,
    brand: "FreeSewing",
    classes: {
      notes: "text-md fill-current",
      date: "text-sm fill-current",
      name: "fill-note",
      nr: "text-4xl fill-note font-bold",
      title: "text-lg fill-current font-bold"
    }
  };
  var title = function(config, { Point: Point2, points, scale, locale, store: store2, part, log, complete }) {
    if (!complete && !config.force) return;
    const mc = {
      ...macroDefaults6,
      ...config,
      classes: macroDefaults6.classes
    };
    if (config.classes) mc.classes = { ...mc.classes, ...config.classes };
    mc.scale = mc.scale * scale;
    if (!mc.at || typeof mc.at.attr !== "function") {
      log.warn(`Title macro called without a valid anchor point. Anchoring title at (0,0).`);
      mc.at = new Point2(0, 0);
    }
    if (!["left", "right", "center"].includes(mc.align)) {
      log.warn(`Title macro called with invalid alignement (${mc.align}). Left-aligning title.`);
      mc.align = "left";
    }
    const transform = `matrix(${mc.scale}, 0, 0, ${mc.scale}, ${mc.at.x - mc.scale * mc.at.x}, ${mc.at.y - mc.scale * mc.at.y}) rotate(${mc.rotation} ${mc.at.x} ${mc.at.y})`;
    const ids = store2.generateMacroIds(["nr", "date", "title", "name", "notes"], mc.id);
    let shift = mc.dy;
    if (typeof mc.nr !== "undefined") {
      points[ids.nr] = mc.at.clone().attr("data-text", mc.nr, mc.append ? false : true).attr("data-text-class", `${mc.classes.nr} ${mc.align}`).attr("data-text-transform", transform).attr("data-render-always", 1);
      store2.set(["partNumbers", part.name], mc.nr);
    } else delete ids.nr;
    points[ids.date] = mc.at.shift(-90, shift / 2).addText(
      (/* @__PURE__ */ new Date()).toLocaleString(locale || "en", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric"
      }),
      `${mc.classes.date} ${mc.align}`
    ).attr("data-text-transform", transform).attr("data-render-always", 1);
    shift += mc.dy;
    if (mc.title) {
      points[ids.title] = mc.at.clone().shift(-90, shift).attr("data-text-transform", transform).attr("data-render-always", 1);
      if (mc.append) points[ids.title].addText(mc.title, `${mc.classes.title} ${mc.align}`);
      else points[ids.title].setText(mc.title, `${mc.classes.title} ${mc.align}`);
      shift += mc.dy;
      store2.set(["partTitles", part.name], mc.title);
    } else delete ids.title;
    const settings = part.context.settings;
    points[ids.name] = mc.at.clone().shift(-90, shift).addText(
      `${mc.brand} ${capitalize2(
        (store2.data?.name || "plugin-annotations:noName").replace("@freesewing/", "")
      )} v${store2.data?.version || "plugin-annotations:noVersion"} (`,
      `${mc.classes.name} ${mc.align}`
    ).addText(settings.metadata?.setName ? settings.metadata.setName : "ephemeral").addText(")").attr("data-text-transform", transform).attr("data-render-always", 1);
    shift += mc.dy;
    const notes = [];
    if (mc.cutlist) {
      points[ids.notes] = mc.at.clone().shift(-90, shift);
      const partCutlist = store2.get(["cutlist", part.name], null);
      if (partCutlist?.materials) {
        for (const [material, instructions] of Object.entries(partCutlist.materials)) {
          instructions.forEach(({ cut, identical, onBias, onFold }) => {
            notes.push("plugin-annotations:cut");
            notes.push(cut);
            if (!identical && cut > 1) notes.push("plugin-annotations:mirrored");
            if (onFold)
              notes.push(onBias ? "plugin-annotations:onFoldAndBias" : "plugin-annotations:onFold");
            else if (onBias) notes.push("plugin-annotations:onBias");
            notes.push(
              "plugin-annotations:from",
              (material.includes(":") ? "" : "plugin-annotations:") + material
            );
            notes.push("\n");
          });
        }
      }
    }
    if (mc.notes) {
      if (Array.isArray(mc.notes)) notes.push(...mc.notes);
      else notes.push(mc.notes);
    }
    if (notes.length > 0) {
      points[ids.notes].addText(notes, `${mc.classes.notes} ${mc.align}`).attr("data-text-transform", transform).attr("data-render-always", 1).attr("data-text-lineheight", mc.dy);
    } else delete ids.cutlist;
    store2.storeMacroIds(mc.id, { points: ids });
    return store2.getMacroIds(mc.id);
  };
  var titleMacros = {
    title,
    rmtitle: (id = macroDefaults6.id, { store: store2, part }) => store2.removeMacroNodes(id, "title", part)
  };

  // node_modules/@freesewing/plugin-annotations/src/cutonfold.mjs
  var macroDefaults7 = {
    classes: {
      line: "note",
      text: "center fill-note"
    },
    id: "cutonfold",
    grainline: false,
    margin: 0.05,
    offset: 15,
    reverse: false
  };
  var cutonfoldDefs = [
    {
      name: "cutonfoldFrom",
      def: (scale) => `
<marker orient="auto" refY="0" refX="0" id="cutonfoldFrom" style="overflow:visible;" markerWidth="12" markerHeight="8" transform="scale(${scale})">
	<path class="note fill-note" d="M 0,0 L 12,-4 C 10,-2 10,2 12,4 z" transform="scale(${scale})"/>
</marker>`
    },
    {
      name: "cutonfoldTo",
      def: (scale) => `
<marker orient="auto" refY="0" refX="0" id="cutonfoldTo" style="overflow:visible;" markerWidth="12" markerHeight="8" transform="scale(${scale})">
	<path class="note fill-note" d="M 0,0 L -12,-4 C -10,-2 -10,2 -12,4 z" transform="scale(${scale})"/>
</marker>`
    }
  ];
  var rmcutonfold = (id = macroDefaults7.id, { store: store2, part }) => {
    if (store2.cutlist.getGrainOrigin() === "cutonfold") store2.cutlist.removeGrain();
    store2.cutlist.removeCutOnFold();
    return store2.removeMacroNodes(id, "cutonfold", part);
  };
  var cutonfold = function(config, { paths, Path: Path2, complete, store: store2, scale, log, Point: Point2 }) {
    if (!complete && !config.force) return;
    const mc = {
      ...macroDefaults7,
      text: config.grainline ? "plugin-annotations:cutOnFoldAndGrainline" : "plugin-annotations:cutOnFold",
      ...config,
      classes: macroDefaults7.classes
    };
    if (config.classes) mc.classes = { ...mc.classes, ...config.classes };
    if (!mc.from || typeof mc.from.attr !== "function") {
      log.warn(`Cutonfold macro called without a valid from point. Using (0,0) for from.`);
      mc.from = new Point2(0, 0);
    }
    if (!mc.to || typeof mc.to.attr !== "function") {
      log.warn(`Cutonfold macro called without a valid to point. Using (6660,666) for to.`);
      mc.to = new Point2(666, 666);
    }
    store2.cutlist.setCutOnFold(mc.from, mc.to);
    if (mc.grainline) store2.cutlist.setGrain(mc.from.angle(mc.to), "cutonfold");
    const ids = store2.generateMacroIds(["line"], mc.id);
    const from = mc.from.shiftFractionTowards(mc.to, mc.margin);
    const to = mc.to.shiftFractionTowards(mc.from, mc.margin);
    const via1 = from.shiftTowards(mc.from, mc.offset * scale).rotate(-90, from);
    const via2 = to.shiftTowards(mc.to, mc.offset * scale).rotate(90, to);
    paths[ids.line] = new Path2().move(from).line(via1).line(via2).line(to);
    if (mc.reverse) paths[ids.line] = paths[ids.line].reverse();
    paths[ids.line] = paths[ids.line].attr("class", mc.classes.line).attr("marker-start", "url(#cutonfoldFrom)").attr("marker-end", "url(#cutonfoldTo)").addText(mc.text, mc.classes.text);
    store2.storeMacroIds(mc.id, { paths: ids });
    return store2.getMacroIds(mc.id);
  };
  var cutonfoldMacros = { cutonfold, rmcutonfold };

  // node_modules/@freesewing/plugin-annotations/src/dimensions.mjs
  var dimensionsDefs = [
    {
      name: "dimensionFrom",
      def: (scale) => `
<marker orient="auto" refY="0" refX="0" id="dimensionFrom" style="overflow:visible;" markerWidth="12" markerHeight="8">
	<path class="mark fill-mark" d="M 0,0 L 12,-4 C 10,-2 10,2 12,4 z" transform="scale(${scale})"/>
</marker>`
    },
    {
      name: "dimensionTo",
      def: (scale) => `
<marker orient="auto" refY="0" refX="0" id="dimensionTo" style="overflow:visible;" markerWidth="12" markerHeight="8">
	<path class="mark fill-mark" d="M 0,0 L -12,-4 C -10,-2 -10,2  -12,4 z" transform="scale(${scale})"/>
</marker>`
    }
  ];
  var macroDefaults8 = {
    text: false,
    noStartMarker: false,
    noEndMarker: false,
    classes: {
      line: "mark",
      leaders: "mark dotted",
      text: "fill-mark center"
    }
  };
  var leaders = {
    hd: function hleader(so, type, props, id) {
      let point;
      if (typeof so.y === "undefined" || so[type].y === so.y) point = so[type];
      else {
        point = new props.Point(so[type].x, so.y);
        drawLeader(props, so[type], point, id);
      }
      return point;
    },
    vd: function vleader(so, type, props, id) {
      let point;
      if (typeof so.x === "undefined" || so[type].x === so.x) point = so[type];
      else {
        point = new props.Point(so.x, so[type].y);
        drawLeader(props, so[type], point, id);
      }
      return point;
    },
    ld: function lleader(so, type, props, id) {
      let point, rot, other;
      if (type === "from") {
        rot = 1;
        other = "to";
      } else {
        rot = -1;
        other = "from";
      }
      if (typeof so.d === "undefined") point = so[type];
      else {
        point = so[type].shiftTowards(so[other], so.d).rotate(90 * rot, so[type]);
        drawLeader(props, so[type], point, id);
      }
      return point;
    }
  };
  function drawLeader({ paths, Path: Path2 }, from, to, id) {
    paths[id] = new Path2().move(from).line(to).attr("class", "mark dotted");
  }
  function drawDimension(from, to, so, { Path: Path2, units: units2 }) {
    const dimension = new Path2().move(from).line(to).attr("class", "mark").attr("data-text", so.text || units2(from.dist(to))).attr("data-text-class", "fill-mark center").attr("data-macro-id", so.id);
    if (!so.noStartMarker) dimension.attributes.set("marker-start", "url(#dimensionFrom)");
    if (!so.noEndMarker) dimension.attributes.set("marker-end", "url(#dimensionTo)");
    return dimension;
  }
  var addDimension = (config, props, type) => {
    if (!props.paperless && !config.force) return;
    const mc = {
      ...macroDefaults8[type],
      id: type,
      ...config,
      classes: macroDefaults8.classes
    };
    if (config.classes) mc.classes = { ...mc.classes, ...config.classes };
    const ids = props.store.generateMacroIds(["line", "from", "to"], mc.id);
    if (type === "pd") {
      if (typeof mc.d === "undefined") mc.d = 10 * props.scale;
      props.paths[ids.line] = mc.path.offset(mc.d).attr("class", mc.classes.line).addText(mc.text || props.units(mc.path.length()), mc.classes.text);
      if (!mc.noStartMarker)
        props.paths[ids.line].attributes.set("marker-start", "url(#dimensionFrom)");
      if (!mc.noEndMarker) props.paths[ids.line].attributes.set("marker-end", "url(#dimensionTo)");
      drawLeader(props, mc.path.start(), props.paths[ids.line].start(), ids.from);
      drawLeader(props, mc.path.end(), props.paths[ids.line].end(), ids.to);
    } else {
      props.paths[ids.line] = drawDimension(
        leaders[type](mc, "from", props, ids.from),
        leaders[type](mc, "to", props, ids.to),
        mc,
        props
      );
    }
    props.store.storeMacroIds(mc.id, { paths: ids });
    return props.store.getMacroIds(mc.id);
  };
  var removeDimension = function(id = macroDefaults8.id, { store: store2, part }, type) {
    return store2.removeMacroNodes(id, type, part);
  };
  var removeDimensionType = function({ store: store2, part }, type) {
    const ids = store2.get(["parts", part.name, "macros", type, "ids"], {});
    for (const id in ids) store2.removeMacroNodes(id, type, part);
  };
  var removeAllDimensions = function({ macro }) {
    macro("rmahd");
    macro("rmald");
    macro("rmavd");
    macro("rmapd");
  };
  var dimensionsMacros = {
    hd: (config, props) => addDimension(config, props, "hd"),
    ld: (config, props) => addDimension(config, props, "ld"),
    vd: (config, props) => addDimension(config, props, "vd"),
    pd: (config, props) => addDimension(config, props, "pd"),
    rmhd: (id, props) => removeDimension(id, props, "hd"),
    rmld: (id, props) => removeDimension(id, props, "ld"),
    rmvd: (id, props) => removeDimension(id, props, "vd"),
    rmpd: (id, props) => removeDimension(id, props, "pd"),
    rmahd: (config, props) => removeDimensionType(props, "hd"),
    rmald: (config, props) => removeDimensionType(props, "ld"),
    rmavd: (config, props) => removeDimensionType(props, "vd"),
    rmapd: (config, props) => removeDimensionType(props, "pd"),
    rmad: (config, props) => removeAllDimensions(props)
  };

  // node_modules/@freesewing/plugin-annotations/src/grainline.mjs
  var macroDefaults9 = {
    classes: {
      line: "note",
      text: "center fill-note"
    },
    id: "grainline",
    margin: 0.05,
    text: "plugin-annotations:grainline"
  };
  var grainlineDefs = [
    {
      name: "grainlineFrom",
      def: (scale) => `
<marker orient="auto" refY="0" refX="0" id="grainlineFrom" style="overflow:visible;" markerWidth="12" markerHeight="8">
	<path class="note fill-note" d="M -10,0 L 2,-4 C 0,-2 0,2  2,4 z" transform="scale(${scale})"/>
</marker>`
    },
    {
      name: "grainlineTo",
      def: (scale) => `
<marker orient="auto" refY="0" refX="0" id="grainlineTo" style="overflow:visible;" markerWidth="12" markerHeight="8">
	<path class="note fill-note" d="M 10,0 L -2,-4 C 0,-2 -2,2  -2,4 z" transform="scale(${scale})"/>
</marker>`
    }
  ];
  var rmgrainline = (id = macroDefaults9.id, { store: store2, part }) => {
    if (store2.cutlist.getGrainOrigin() === "grainline") store2.cutlist.removeGrain();
    return store2.removeMacroNodes(id, "grainline", part);
  };
  var grainline = function(config = {}, { paths, Path: Path2, Point: Point2, complete, store: store2, log }) {
    if (!complete && !config.force) return;
    const mc = {
      ...macroDefaults9,
      ...config,
      classes: macroDefaults9.classes
    };
    if (config.classes) mc.classes = { ...mc.classes, ...config.classes };
    if (!mc.from || typeof mc.from.attr !== "function") {
      log.warn(`Grainline macro called without a valid from point. Using (0,0) for from.`);
      mc.from = new Point2(0, 0);
    }
    if (!mc.to || typeof mc.to.attr !== "function") {
      log.warn(`Grainline macro called without a valid to point. Using (666,666) for to.`);
      mc.to = new Point2(666, 666);
    }
    store2.cutlist.setGrain(mc.from.angle(mc.to), "grainline");
    const ids = store2.generateMacroIds(["line"], mc.id);
    const from = mc.from.shiftFractionTowards(mc.to, 0.05);
    const to = mc.to.shiftFractionTowards(mc.from, 0.05);
    paths[ids.line] = new Path2().move(from).line(to).attr("class", mc.classes.line).attr("marker-start", "url(#grainlineFrom)").attr("marker-end", "url(#grainlineTo)").addText(mc.text, mc.classes.text);
    store2.storeMacroIds(mc.id, { paths: ids });
    return store2.getMacroIds(mc.id);
  };
  var grainlineMacros = { grainline, rmgrainline };

  // node_modules/@freesewing/plugin-annotations/src/pleat.mjs
  var macroDefaults10 = {
    classes: {
      arrow: "note",
      from: "note",
      to: "note dashed"
    },
    id: "pleat",
    margin: 35,
    reverse: false
  };
  var pleatDefs = [
    {
      name: "pleat",
      def: (scale) => `
<marker id="pleatTo" markerWidth="10" markerHeight="6" orient="auto" refY="3" refX="10">
	<path d="M 10,3 L 0,0 C 2,2 2,4 0,6 z" class="fill-note note" transform="scale(${scale})" />
</marker>
`
    }
  ];
  var rmpleat = (id = macroDefaults10.id, { store: store2, part }) => store2.removeMacroNodes(id, "rmpleat", part);
  var pleat = function(config, { paths, Path: Path2, log, Point: Point2, complete, scale, store: store2 }) {
    if (!complete && !config.force) return;
    const mc = {
      ...macroDefaults10,
      ...config,
      classes: macroDefaults10.classes
    };
    if (config.classes) mc.classes = { ...mc.classes, ...config.classes };
    if (!mc.from || typeof mc.from.attr !== "function") {
      log.warn(`Pleat macro called without a valid from point. Using (0,0) for from.`);
      mc.from = new Point2(0, 0);
    }
    if (!mc.to || typeof mc.to.attr !== "function") {
      log.warn(`Pleat macro called without a valid to point. Using (666,666) for to.`);
      mc.to = new Point2(666, 666);
    }
    const ids = store2.generateMacroIds(["from", "to", "arrow"], mc.id);
    const toIn = mc.to.shift(mc.from.shiftTowards(mc.to, 0.1).angle(mc.to) + 90, mc.margin * scale);
    const fromIn = mc.from.shift(
      mc.from.shiftTowards(mc.to, 0.1).angle(mc.from) + 270,
      mc.margin * scale
    );
    paths[ids.from] = new Path2().move(mc.from).line(fromIn).attr("class", mc.reverse ? mc.classes.to : mc.classes.from);
    paths[ids.to] = new Path2().move(mc.to).line(toIn).attr("class", mc.reverse ? mc.classes.from : mc.classes.to);
    paths[ids.arrow] = mc.reverse ? new Path2().move(mc.to.shiftFractionTowards(toIn, 0.25)).line(mc.from.shiftFractionTowards(toIn, 0.25)) : new Path2().move(mc.from.shiftFractionTowards(fromIn, 0.25)).line(mc.to.shiftFractionTowards(fromIn, 0.25));
    paths[ids.arrow].attr("class", mc.classes.arrow).attr("marker-end", "url(#pleatTo)");
    store2.storeMacroIds(mc.id, { paths: ids });
    return store2.getMacroIds(mc.id);
  };
  var pleatMacros = { pleat, rmpleat };

  // node_modules/@freesewing/plugin-annotations/src/sewtogether.mjs
  var macroDefaults11 = {
    classes: {
      curve: "dotted note stroke-sm",
      hinge: "note dotted stroke-sm",
      text: "center fill-note text-xs"
    },
    id: "sewtogether",
    force: false,
    text: "plugin-annotations:sewTogether"
  };
  var sewtogetherDefs = [
    {
      name: "sewTogetherStart",
      def: (scale) => `
<marker id="sewTogetherStart" markerWidth="10" markerHeight="6" orient="auto" refX="1" refY="2">
	<path d="M 0,2 L 6,0 C 5,1 5,3 6,4 z" class="fill-note note" transform="scale(${scale})" />
</marker>`
    },
    {
      name: "sewTogetherEnd",
      def: (scale) => `
<marker id="sewTogetherEnd" markerWidth="10" markerHeight="6" orient="auto" refX="6" refY="2">
	<path d="M 6,2 L 0,0 C 1,1 1,3 0,4 z" class="fill-note note" transform="scale(${scale})" />
</marker>`
    },
    {
      name: "sewTogetherCross",
      def: (scale) => `
<marker id="sewTogetherCross" markerWidth="5" markerHeight="5" orient="auto" refX="2.5" refY="2.5">
  <path d="M 0,0 L 5,5 M 5,0 L 0,5" class="note" transform="scale(${scale})" />
</marker>`
    }
  ];
  var rmsewtogether = (id = macroDefaults11.id, { store: store2, part }) => store2.removeMacroNodes(id, "sewtogether", part);
  var sewtogether = function(config, { paths, Path: Path2, log, Point: Point2, complete, sa, store: store2 }) {
    if (!complete && !config.force) return;
    const mc = {
      ...macroDefaults11,
      ...config,
      classes: macroDefaults11.classes
    };
    if (config.classes) mc.classes = { ...mc.classes, ...config.classes };
    if (!mc.from || typeof mc.from.attr !== "function") {
      log.warn(`Sewtogether macro called without a valid from point. Using (0,0) for from.`);
      mc.from = new Point2(0, 0);
    }
    if (!mc.to || typeof mc.to.attr !== "function") {
      log.warn(`Sewtogether macro called without a valid to point. Using (666,666) for to.`);
      mc.to = new Point2(666, 666);
    }
    if (!mc.middle) mc.middle = mc.from.shiftFractionTowards(mc.to, 0.5);
    const ids = store2.generateMacroIds(["curve", "hinge"], mc.id);
    const fromCp = mc.from.shift(mc.from.angle(mc.middle) + 90, mc.from.dist(mc.middle) / 1.5);
    const toCp = mc.to.shift(mc.to.angle(mc.middle) - 90, mc.to.dist(mc.middle) / 1.5);
    paths[ids.curve] = new Path2().move(mc.from).curve(fromCp, toCp, mc.to).attr("class", mc.classes.curve).attr("marker-start", "url(#sewTogetherStart)").attr("marker-end", "url(#sewTogetherEnd)").addText(mc.text, mc.classes.text);
    if (mc.hinge) {
      const hinge = mc.middle.shift(
        mc.middle.angle(mc.to) + Math.abs(mc.middle.angle(mc.from) - mc.middle.angle(mc.to)) / 2 + (sa ? 180 : 0),
        sa ? sa : mc.from.dist(mc.middle) / 4
      );
      paths[ids.hinge] = new Path2().move(mc.middle).line(hinge).attr("marker-start", "url(#sewTogetherCross)").attr("class", mc.classes.hinge);
    } else delete ids.hinge;
    store2.storeMacroIds(mc.id, { paths: ids });
    return store2.getMacroIds(mc.id);
  };
  var sewtogetherMacros = { sewtogether, rmsewtogether };

  // node_modules/@freesewing/plugin-annotations/src/flag.mjs
  var storeRoot = ["plugins", "plugin-annotations", "flags"];
  var flagStores = [
    ["flag.info", (store2, data) => flag("info", store2, data)],
    ["flag.tip", (store2, data) => flag("tip", store2, data)],
    ["flag.note", (store2, data) => flag("note", store2, data)],
    ["flag.warn", (store2, data) => flag("warn", store2, data)],
    ["flag.fixme", (store2, data) => flag("fixme", store2, data)],
    ["flag.error", (store2, data) => flag("error", store2, data)],
    ["flag.preset", (store2, preset) => flag("preset", store2, preset)],
    ["unflag.info", (store2, id) => unflag("info", store2, id)],
    ["unflag.tip", (store2, id) => unflag("tip", store2, id)],
    ["unflag.note", (store2, id) => unflag("note", store2, id)],
    ["unflag.warn", (store2, id) => unflag("warn", store2, id)],
    ["unflag.fixme", (store2, id) => unflag("fixme", store2, id)],
    ["unflag.error", (store2, id) => unflag("error", store2, id)],
    ["unflag.preset", (store2, preset) => unflag("preset", store2, preset)]
  ];
  function flag(type, store2, data) {
    if (type === "preset" && presets[data]) {
      data = presets[data];
      type = data.type;
    }
    if (data.msg) {
      data.title = data.msg + ".t";
      data.desc = data.msg + ".d";
      delete data.msg;
    }
    if (!data.id && !data.title) {
      store2.log.warn(`store.flag.${type} called without an id or title property`);
      return;
    }
    store2.set([...storeRoot, type, data.id ? data.id : data.title], data);
  }
  function unflag(type, store2, id) {
    if (type === "preset" && presets[id]) {
      type = presets[id].type;
      id = presets[id].id || presets[id].title;
    }
    store2.unset([...storeRoot, type, id]);
  }
  var presets = {
    expandIsOff: {
      type: "tip",
      title: "flag:expandIsOff.t",
      desc: "flag:expandIsOff.d",
      suggest: {
        text: "flag:enable",
        icon: "expand",
        update: {
          settings: ["expand", 1]
        }
      }
    },
    expandIsOn: {
      type: "tip",
      title: "flag:expandIsOn.t",
      desc: "flag:expandIsOn.d",
      suggest: {
        text: "flag:disable",
        icon: "compact",
        update: {
          settings: ["expand", 0]
        }
      }
    }
  };

  // node_modules/@freesewing/plugin-annotations/src/index.mjs
  var plugin = {
    name: about_default.id,
    version: about_default.version,
    hooks: {
      preRender: [
        function(svg) {
          const defs = [
            ...buttonsDefs,
            ...cutonfoldDefs,
            ...dimensionsDefs,
            ...grainlineDefs,
            ...logoDefs,
            ...notchesDefs,
            ...pleatDefs,
            ...sewtogetherDefs
          ];
          for (const def of defs) {
            svg.defs.setIfUnset(
              def.name,
              typeof def.def === "function" ? def.def(svg.pattern.settings[0].scale) : def.def
            );
          }
        }
      ],
      prePartDraft: [...cutlistHooks.prePartDraft]
    },
    macros: {
      ...bannerMacros,
      ...bannerboxMacros,
      ...bartackMacros,
      ...crossboxMacros,
      ...scaleboxMacros,
      ...cutonfoldMacros,
      ...dimensionsMacros,
      ...grainlineMacros,
      ...pleatMacros,
      ...sewtogetherMacros,
      ...titleMacros
    },
    store: [...cutlistStores, ...flagStores]
  };
  var annotationsPlugin = plugin;

  // node_modules/@freesewing/plugin-measurements/about.json
  var about_default2 = {
    id: "plugin-measurements",
    description: "A FreeSewing plugin that adds additional measurements that can be calculated from existing ones",
    version: "4.10.1"
  };

  // node_modules/@freesewing/plugin-measurements/src/index.mjs
  var plugin2 = {
    name: about_default2.id,
    version: about_default2.version,
    hooks: {
      preDraft: function({ settings }) {
        for (const set2 of settings) {
          if (set2.measurements) {
            if (typeof set2.measurements.seatBack !== "undefined" && typeof set2.measurements.seat !== "undefined") {
              set2.measurements.seatFront = set2.measurements.seat - set2.measurements.seatBack;
              set2.measurements.seatBackArc = set2.measurements.seatBack / 2;
              set2.measurements.seatFrontArc = set2.measurements.seatFront / 2;
            }
            if (typeof set2.measurements.waist !== "undefined" && typeof set2.measurements.waistBack !== "undefined") {
              set2.measurements.waistFront = set2.measurements.waist - set2.measurements.waistBack;
              set2.measurements.waistBackArc = set2.measurements.waistBack / 2;
              set2.measurements.waistFrontArc = set2.measurements.waistFront / 2;
            }
            if (typeof set2.measurements.crossSeam !== "undefined" && typeof set2.measurements.crossSeamFront !== "undefined") {
              set2.measurements.crossSeamBack = set2.measurements.crossSeam - set2.measurements.crossSeamFront;
            }
          }
        }
      }
    }
  };
  var measurementsPlugin = plugin2;

  // node_modules/@freesewing/plugin-mirror/about.json
  var about_default3 = {
    id: "plugin-mirror",
    description: "A FreeSewing plugin to mirror points or paths",
    version: "4.10.1"
  };

  // node_modules/@freesewing/plugin-mirror/src/index.mjs
  var lineValues = (start, end) => {
    const { x: x1, y: y1 } = start;
    const { x: x2, y: y2 } = end;
    const [A, B] = [-(y2 - y1), x2 - x1];
    const C = -(A * x1 + B * y1);
    return [A, B, C];
  };
  var mirrorGen = (start, end) => {
    const [A, B, C] = lineValues(start, end);
    return (point) => {
      const { x, y } = point;
      const uNom = (B ** 2 - A ** 2) * x - 2 * A * B * y - 2 * A * C;
      const vNom = (A ** 2 - B ** 2) * y - 2 * A * B * x - 2 * B * C;
      const denom = A ** 2 + B ** 2;
      point.x = uNom / denom;
      point.y = vNom / denom;
      const mirrorCount = Number(point.attributes.get("data-mirrored"));
      if (mirrorCount > 0 && point.log)
        point.log.warn(
          `Point ${point.name} was mirrored more than once (${mirrorCount + 1}) which can lead to hard to trace bugs`
        );
      point.attributes.set("data-mirrored", mirrorCount + 1);
      return point;
    };
  };
  var capFirst = (string) => string.charAt(0).toUpperCase() + string.slice(1);
  var plugin3 = {
    name: about_default3.id,
    version: about_default3.version,
    macros: {
      mirror: function({
        mirror,
        clone = true,
        points = [],
        paths = [],
        snippets = [],
        prefix = "mirrored",
        nameFormat = void 0,
        reverse = false
      }) {
        const [start, end] = mirror;
        const mirrorPoint = mirrorGen(start, end);
        for (const pathId of paths) {
          if (this.paths[pathId]) {
            let path = clone ? this.paths[pathId].clone() : this.paths[pathId];
            path = reverse ? path.reverse() : path;
            const newId = clone ? typeof nameFormat == "function" ? nameFormat(pathId, "path") : `${prefix}${capFirst(pathId)}` : pathId;
            for (const op of path.ops) {
              switch (op.type) {
                case "move":
                case "line":
                  op.to = mirrorPoint(op.to);
                  break;
                case "curve":
                  op.to = mirrorPoint(op.to);
                  op.cp1 = mirrorPoint(op.cp1);
                  op.cp2 = mirrorPoint(op.cp2);
                  break;
                default:
              }
            }
            this.paths[newId] = path;
          }
        }
        for (const pointId of points) {
          if (this.points[pointId]) {
            const point = clone ? mirrorPoint(this.points[pointId].clone()) : mirrorPoint(this.points[pointId]);
            const newId = clone ? typeof nameFormat == "function" ? nameFormat(pointId, "point") : `${prefix}${capFirst(pointId)}` : pointId;
            this.points[newId] = point;
          }
        }
        for (const snippetId of snippets) {
          if (this.snippets[snippetId]) {
            const pointId = this.snippets[snippetId].anchor.name;
            const snippet = clone ? this.snippets[snippetId].clone() : this.snippets[snippetId];
            const newSnippetId = clone ? typeof nameFormat == "function" ? nameFormat(snippetId, "snippet") : `${prefix}${capFirst(snippetId)}` : snippetId;
            this.snippets[newSnippetId] = snippet;
            const point = mirrorPoint(snippet.anchor);
            if (this.points[pointId]) {
              const newPointId = clone ? typeof nameFormat == "function" ? nameFormat(pointId, "point") : `${prefix}${capFirst(pointId)}` : pointId;
              this.points[newPointId] = point;
              snippet.anchor = this.points[newPointId];
            } else {
              snippet.anchor = point;
            }
          }
        }
      }
    },
    methods: { lineValues, mirrorGen }
  };
  var mirrorPlugin = plugin3;

  // node_modules/@freesewing/plugin-transform/about.json
  var about_default4 = {
    id: "plugin-transform",
    description: "A FreeSewing plugin to transform (translate, rotate, or scale) points or paths",
    version: "4.10.1"
  };

  // node_modules/@freesewing/plugin-transform/src/index.mjs
  var scalePoint = (p, x, y, c2) => {
    p.x = (p.x - c2.x) * x + c2.x;
    p.y = (p.y - c2.y) * y + c2.y;
    return p;
  };
  var plugin4 = {
    name: about_default4.id,
    version: about_default4.version,
    macros: {
      transform: function({
        transform = Object.freeze({ rotate: "rotate", translate: "translate", scale: "scale" }),
        x = 0,
        y,
        angle = 0,
        c: c2 = new this.Point(0, 0),
        clone = true,
        points = [],
        paths = [],
        prefix = "transformed_"
      }) {
        if (y === void 0) y = x;
        for (const pathId of paths) {
          if (this.paths[pathId]) {
            const path = clone ? this.paths[pathId].clone() : this.paths[pathId];
            const newId = clone ? typeof prefix == "function" ? prefix(pathId, "path") : `${prefix}${pathId}` : pathId;
            switch (transform) {
              case "rotate":
                this.paths[newId] = path.rotate(angle, c2);
                break;
              case "translate":
                this.paths[newId] = path.translate(x, y);
                break;
              case "scale":
                for (const op of path.ops) {
                  switch (op.type) {
                    case "curve":
                      op.cp1 = scalePoint(op.cp1, x, y, c2);
                      op.cp2 = scalePoint(op.cp2, x, y, c2);
                    case "move":
                    case "line":
                      op.to = scalePoint(op.to, x, y, c2);
                  }
                }
                this.paths[newId] = path;
            }
          }
        }
        for (const pointId of points) {
          if (this.points[pointId]) {
            const point = clone ? this.points[pointId].clone() : this.points[pointId];
            const newId = clone ? typeof prefix == "function" ? prefix(pointId, "point") : `${prefix}${pointId}` : pointId;
            switch (transform) {
              case "rotate":
                this.points[newId] = point.rotate(angle, c2);
                break;
              case "translate":
                this.points[newId] = point.translate(x, y);
                break;
              case "scale":
                this.points[newId] = scalePoint(point, x, y, c2);
                break;
            }
          }
        }
      }
    }
  };
  var transformPlugin = plugin4;

  // node_modules/@freesewing/plugin-round/about.json
  var about_default5 = {
    id: "plugin-round",
    description: "A FreeSewing plugin to round corners",
    version: "4.10.1"
  };

  // node_modules/@freesewing/plugin-round/src/index.mjs
  var pointKeys = ["start", "cp1", "cp2", "end"];
  var pathKeys = ["path"];
  var plugin5 = {
    name: about_default5.id,
    version: about_default5.version,
    macros: {
      round: function(mc, { points, paths, Point: Point2, Path: Path2, store: store2 }) {
        const C = 0.55191502449;
        const {
          from = new Point2(0, 0),
          to = new Point2(666, 666),
          via = new Point2(666, 0),
          id = "round",
          classes = "",
          hide = true
        } = mc;
        let { radius = 66.6 } = mc;
        const pointIds = store2.generateMacroIds(pointKeys, id);
        const pathIds = store2.generateMacroIds(pathKeys, id);
        const ids = { ...pointIds, ...pathIds };
        const fd = from.dist(via);
        const td = to.dist(via);
        if (radius > fd || radius > td) radius = fd > td ? td : fd;
        points[ids.start] = via.shiftTowards(from, radius);
        points[ids.cp1] = via.shiftTowards(from, radius * (1 - C));
        points[ids.cp2] = via.shiftTowards(to, radius * (1 - C));
        points[ids.end] = via.shiftTowards(to, radius);
        paths[ids.path] = new Path2().move(this.points[ids.start]).curve(points[ids.cp1], points[ids.cp2], points[ids.end]).addClass(classes);
        if (hide) paths[ids.path].hide();
        else paths[ids.path].unhide();
        store2.storeMacroIds(mc.id, {
          paths: pathIds,
          points: pointIds
        });
        return store2.getMacroIds(mc.id);
      }
    }
  };
  var roundPlugin = plugin5;

  // node_modules/@freesewing/plugin-sprinkle/about.json
  var about_default6 = {
    id: "plugin-sprinkle",
    description: "A FreeSewing plugin to bulk-add snippets to your pattern",
    version: "4.10.1"
  };

  // node_modules/@freesewing/plugin-sprinkle/src/index.mjs
  var plugin6 = {
    name: about_default6.id,
    version: about_default6.version,
    macros: {
      sprinkle: function(so, { snippets, Snippet: Snippet2, points }) {
        for (let pid of so.on) {
          snippets[pid + "-" + so.snippet] = new Snippet2(so.snippet, points[pid]);
          if (so.scale) snippets[pid + "-" + so.snippet].attr("data-scale", so.scale);
          if (so.rotate) snippets[pid + "-" + so.snippet].attr("data-rotate", so.rotate);
        }
      }
    }
  };
  var sprinklePlugin = plugin6;

  // node_modules/@freesewing/plugin-bin-pack/about.json
  var about_default7 = {
    id: "plugin-bin-pack",
    description: "A FreeSewing plugin that adds a bin-pack algorithm to the core library",
    version: "4.10.1"
  };

  // node_modules/@freesewing/plugin-bin-pack/src/growing-packer.mjs
  var GrowingPacker = function({ maxWidth = Infinity, maxHeight = Infinity, strictMax = false }) {
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this.strictMax = strictMax;
    this.ensureSquare = maxWidth === Infinity && maxHeight === Infinity;
  };
  GrowingPacker.prototype = {
    fit: function(blocks) {
      let len = blocks.length;
      if (len === 0) {
        return;
      }
      let n, node, block, fit;
      let width = this.strictMax && this.maxWidth < Infinity ? Math.max(blocks[0].width, this.maxWidth) : blocks[0].width;
      let height = this.strictMax && this.maxHeight < Infinity ? this.maxHeight : blocks[0].height;
      this.root = { x: 0, y: 0, width, height };
      for (n = 0; n < len; n++) {
        block = blocks[n];
        if (node = this.findNode(this.root, block.width, block.height)) {
          fit = this.splitNode(node, block.width, block.height);
          block.x = fit.x;
          block.y = fit.y;
        } else {
          fit = this.growNode(block.width, block.height);
          block.x = fit.x;
          block.y = fit.y;
        }
      }
    },
    findNode: function(root, width, height) {
      if (root.used)
        return this.findNode(root.right, width, height) || this.findNode(root.down, width, height);
      else if (width <= root.width && height <= root.height) return root;
      else return null;
    },
    splitNode: function(node, width, height) {
      node.used = true;
      const downY = node.y + height;
      node.down = {
        x: node.x,
        y: downY,
        width: node.width,
        height: Math.min(node.height - height, this.maxHeight - downY)
      };
      const rightX = node.x + width;
      node.right = {
        x: rightX,
        y: node.y,
        width: Math.min(node.width - width, this.maxWidth - rightX),
        height
      };
      return node;
    },
    growNode: function(width, height) {
      let canGrowDown = width <= this.root.width;
      let canGrowRight = height <= this.root.height;
      const proposedNewWidth = this.root.width + width;
      let shouldGrowRight = canGrowRight && (this.ensureSquare ? this.root.height : this.maxWidth) >= proposedNewWidth;
      const proposedNewHeight = this.root.height + height;
      let shouldGrowDown = canGrowDown && (this.ensureSquare ? this.root.width : this.maxHeight) >= proposedNewHeight;
      if (shouldGrowRight) return this.growRight(width, height);
      else if (shouldGrowDown) return this.growDown(width, height);
      else if (canGrowRight) return this.growRight(width, height);
      else if (canGrowDown) return this.growDown(width, height);
      else return null;
    },
    growRight: function(width, height) {
      this.root = {
        used: true,
        x: 0,
        y: 0,
        width: this.root.width + width,
        height: this.root.height,
        down: this.root,
        right: { x: this.root.width, y: 0, width, height: this.root.height }
      };
      let node;
      if (node = this.findNode(this.root, width, height)) return this.splitNode(node, width, height);
      else return null;
    },
    growDown: function(width, height) {
      this.root = {
        used: true,
        x: 0,
        y: 0,
        width: this.root.width,
        height: this.root.height + height,
        down: { x: 0, y: this.root.height, width: this.root.width, height },
        right: this.root
      };
      let node;
      if (node = this.findNode(this.root, width, height)) return this.splitNode(node, width, height);
      else return null;
    }
  };
  var defaultOptions = { inPlace: true };
  var pack = (store2, items, pattern) => {
    const options = {
      ...defaultOptions,
      ...pattern.pattern.settings[0]
    };
    const packer = new GrowingPacker(options);
    const inPlace = options.inPlace || false;
    let newItems = items.map(function(item) {
      return inPlace ? item : { width: item.width, height: item.height, item };
    });
    const widestWidth = newItems.sort(function(a2, b) {
      return b.width - a2.width;
    })[0].width;
    const widerThanMax = options.maxWidth && widestWidth > options.maxWidth;
    newItems = newItems.sort(function(a2, b) {
      if (options.maxWidth && !options.maxHeight && widerThanMax) return b.width - a2.width;
      if (options.maxWidth && !options.maxHeight) return b.height - a2.height;
      if (options.maxHeight) return b.height - a2.height;
      return b.width * b.height - a2.width * a2.height;
    });
    packer.fit(newItems);
    const w = newItems.reduce(function(curr, item) {
      return Math.max(curr, item.x + item.width);
    }, 0);
    const h = newItems.reduce(function(curr, item) {
      return Math.max(curr, item.y + item.height);
    }, 0);
    const ret = {
      width: w,
      height: h
    };
    if (!inPlace) ret.items = newItems;
    return ret;
  };

  // node_modules/@freesewing/plugin-bin-pack/src/index.mjs
  var plugin7 = {
    name: about_default7.id,
    version: about_default7.version,
    store: [["pack", pack]]
  };
  var binpackPlugin = plugin7;

  // node_modules/@freesewing/core-plugins/about.json
  var about_default8 = {
    id: "core-plugins",
    description: "An umbrella package of essential plugins that are bundled with the FreeSewing core library",
    version: "4.10.1"
  };

  // node_modules/@freesewing/core-plugins/src/index.mjs
  var bundledPlugins = [
    annotationsPlugin,
    measurementsPlugin,
    mirrorPlugin,
    roundPlugin,
    sprinklePlugin,
    transformPlugin,
    binpackPlugin
  ];
  var hooks = {};
  var macros = {};
  var store = [];
  function bundleHooks(plugin9) {
    for (const i in plugin9.hooks) {
      if (typeof hooks[i] === "undefined") hooks[i] = [];
      const hook = plugin9.hooks[i];
      if (typeof hook === "function") hooks[i].push(hook);
      else if (typeof hook === "object") {
        for (let method of hook) hooks[i].push(method);
      }
    }
  }
  function bundleMacros(plugin9) {
    for (const i in plugin9.macros) macros[i] = plugin9.macros[i];
  }
  function bundleStore(plugin9) {
    if (plugin9.store) store.push(...plugin9.store);
  }
  for (const plugin9 of bundledPlugins) {
    bundleHooks(plugin9);
    bundleMacros(plugin9);
    bundleStore(plugin9);
  }
  var plugin8 = {
    name: about_default8.id,
    version: about_default8.version,
    store,
    hooks,
    macros
  };
  var corePlugins = plugin8;

  // node_modules/@freesewing/core/src/pattern/pattern-plugins.mjs
  function getPluginName(plugin9) {
    const toCheck = Array.isArray(plugin9) ? plugin9[0] : plugin9;
    return toCheck.name || toCheck.plugin?.name || false;
  }
  function PatternPlugins(pattern) {
    this.store = pattern.store;
    this.plugins = {};
    this.hooks = new Hooks();
    this.macros = {};
    this.__storeMethods = /* @__PURE__ */ new Set();
    if (!pattern.designConfig.noCorePlugins) this.use(corePlugins);
  }
  PatternPlugins.prototype.loadConfigPlugins = function(config, settings) {
    if (!config.plugins) return this;
    for (const plugin9 in config.plugins)
      this.use(config.plugins[plugin9], config.plugins[plugin9]?.data, settings);
    return this;
  };
  PatternPlugins.prototype.on = function(hook, method, data) {
    for (const added of this.hooks[hook]) {
      if (added.method === method) return this;
    }
    this.hooks[hook].push({ method, data });
    return this;
  };
  PatternPlugins.prototype.use = function(plugin9, data, settings = [{}]) {
    const name = getPluginName(plugin9);
    if (!this.plugins?.[name])
      return plugin9.plugin && plugin9.condition ? this.__useIf(plugin9, data, settings) : this.__loadPlugin(plugin9, data);
    this.store.log.info(`Plugin \`${name}\` was requested, but it's already loaded. Skipping.`);
    return this;
  };
  PatternPlugins.prototype.__loadPlugin = function(plugin9, data) {
    const name = getPluginName(plugin9);
    this.plugins[name] = plugin9;
    if (plugin9.hooks) this.__loadPluginHooks(plugin9, data);
    if (plugin9.macros) this.__loadPluginMacros(plugin9);
    if (plugin9.store) this.__loadPluginStoreMethods(plugin9);
    this.store.log.info(`Loaded plugin \`${plugin9.name}:${plugin9.version}\``);
    return this;
  };
  PatternPlugins.prototype.__loadPluginHooks = function(plugin9, data) {
    for (let hook of Object.keys(this.hooks)) {
      if (typeof plugin9.hooks[hook] === "function") {
        this.on(hook, plugin9.hooks[hook], data);
      } else if (Array.isArray(plugin9.hooks[hook])) {
        for (let method of plugin9.hooks[hook]) {
          this.on(hook, method, data);
        }
      }
    }
    return this;
  };
  PatternPlugins.prototype.__loadPluginMacros = function(plugin9) {
    for (let macro in plugin9.macros) {
      if (typeof plugin9.macros[macro] === "function") {
        this.__macro(macro, plugin9.macros[macro]);
      }
    }
  };
  PatternPlugins.prototype.__loadPluginStoreMethods = function(plugin9) {
    if (Array.isArray(plugin9.store)) {
      for (const method of plugin9.store) this.__storeMethods.add(method);
    } else this.store.log.warn(`Plugin store methods should be an Array`);
    return this;
  };
  PatternPlugins.prototype.__macro = function(key, method) {
    this.macros[key.toLowerCase()] = method;
    return this;
  };
  PatternPlugins.prototype.__useIf = function(plugin9, data, settings = [{}]) {
    let load = 0;
    for (const set2 of settings) {
      if (plugin9.condition(set2)) load++;
    }
    if (load > 0) {
      this.store.log.info(
        `Condition met: Loaded plugin \`${plugin9.plugin.name}:${plugin9.plugin.version}\``
      );
      this.__loadPlugin(plugin9.plugin, data);
    } else {
      this.store.log.info(
        `Condition not met: Skipped loading plugin \`${plugin9.plugin.name}:${plugin9.plugin.version}\``
      );
    }
    return this;
  };

  // node_modules/@freesewing/core/src/pattern/pattern-config.mjs
  var hidePresets = {
    HIDE_ALL: {
      self: true,
      from: true,
      after: true,
      inherited: true
    },
    HIDE_TREE: {
      from: true,
      inherited: true
    }
  };
  function PatternConfig(pattern) {
    this.store = pattern.store;
    this.plugins = { ...pattern.designConfig.plugins || {} };
    this.options = { ...pattern.designConfig.options || {} };
    this.measurements = [...pattern.designConfig.measurements || []];
    this.optionalMeasurements = [...pattern.designConfig.optionalMeasurements || []];
    this.inject = {};
    this.directDependencies = {};
    this.resolvedDependencies = {};
    this.parts = {};
    this.partHide = {};
    this.draftOrder = [];
    __addNonEnumProp(this, "__mutated", {
      optionDistance: {},
      partDistance: {},
      hideDistance: {}
    });
    __addNonEnumProp(this, "__hiding", {
      from: {},
      after: {},
      inherited: {},
      always: {},
      never: {}
    });
  }
  PatternConfig.prototype.isPartValid = function(part) {
    if (typeof part?.draft !== "function") {
      this.store.log.error(`Part must have a draft() method`);
      return false;
    }
    if (!part.name) {
      this.store.log.error(`Part must have a name`);
      return false;
    }
    return true;
  };
  PatternConfig.prototype.addPart = function(part) {
    if (this.isPartValid(part)) this.__addPart([part]);
    return this;
  };
  PatternConfig.prototype.logPartDistances = function() {
    const priorities = {};
    for (const partName of Object.keys(this.parts)) {
      const p = this.__mutated.partDistance[partName];
      if (typeof priorities[p] === "undefined") priorities[p] = /* @__PURE__ */ new Set();
      priorities[p].add(partName);
    }
    for (const p of Object.keys(priorities))
      this.store.log.debug(
        `\u26AA\uFE0F  Options priority __${p}__ : ${[...priorities[p]].map((p2) => "`" + p2 + "`").join(", ")}`
      );
  };
  PatternConfig.prototype.asConfig = function() {
    return {
      parts: this.parts,
      plugins: this.plugins,
      measurements: this.measurements,
      options: this.options,
      optionalMeasurements: this.optionalMeasurements,
      resolvedDependencies: this.resolvedDependencies,
      directDependencies: this.directDependencies,
      inject: this.inject,
      draftOrder: this.draftOrder,
      partHide: this.partHide
    };
  };
  PatternConfig.prototype.__addPart = function(depChain) {
    const part = depChain[0];
    if (this.parts[part.name]) return;
    this.parts[part.name] = Object.freeze(part);
    if (typeof this.__mutated.partDistance[part.name] === "undefined") {
      this.__mutated.partDistance[part.name] = depChain.length;
    }
    this.__resolvePartHiding(part);
    this.__resolvePartDependencies(depChain);
    this.__addPartConfig(part);
    if (depChain.length === 1) {
      for (var i = this.resolvedDependencies[part.name].length - 1; i >= 0; i--) {
        let dep = this.resolvedDependencies[part.name][i];
        if (this.draftOrder.indexOf(dep) === -1) this.draftOrder.push(dep);
      }
      this.draftOrder.push(part.name);
    }
  };
  PatternConfig.prototype.__addPartConfig = function(part) {
    return this.__addPartOptions(part).__addPartMeasurements(part, false).__addPartMeasurements(part, true).__addPartPlugins(part);
  };
  PatternConfig.prototype.__addPartOptions = function(part) {
    if (!part.options) return this;
    const partDistance = this.__mutated.partDistance?.[part.name];
    for (const optionName in part.options) {
      const option = part.options[optionName];
      const optionDistance = this.__mutated.optionDistance[optionName];
      if (!optionDistance || optionDistance > partDistance) {
        this.options[optionName] = Object.freeze(option);
        this.__mutated.optionDistance[optionName] = partDistance;
        this.store.log.debug(
          optionDistance ? `\u{1F7E3}  __${optionName}__ option overwritten by \`${part.name}\`` : `\u{1F535}  __${optionName}__ option loaded from part \`${part.name}\``
        );
      }
    }
    return this;
  };
  PatternConfig.prototype.__addPartMeasurements = function(part, optional = false) {
    const listType = optional ? "optionalMeasurements" : "measurements";
    if (part[listType]) {
      part[listType].forEach((m) => {
        const isInReqList = this.measurements.indexOf(m) !== -1;
        if (isInReqList) return;
        const optInd = this.optionalMeasurements.indexOf(m);
        const isInOptList = optInd !== -1;
        if (optional && !isInOptList) this.optionalMeasurements.push(m);
        if (!optional) {
          this.measurements.push(m);
          if (isInOptList) this.optionalMeasurements.splice(optInd, 1);
        }
        this.store.log.debug(
          `\u{1F7E0}  __${m}__ measurement is ${optional ? "optional" : "required"} in \`${part.name}\``
        );
      });
    }
    return this;
  };
  PatternConfig.prototype.__addPartPlugins = function(part) {
    if (!part.plugins) return this;
    const plugins = this.plugins;
    let partPlugins = part.plugins;
    if (!Array.isArray(partPlugins)) partPlugins = [partPlugins];
    for (let plugin9 of partPlugins) {
      const name = getPluginName(plugin9);
      this.store.log.debug(
        plugin9.plugin ? `\u{1F50C}  Resolved __${name}__ conditional plugin in \`${part.name}\`` : `\u{1F50C}  Resolved __${name}__ plugin in \`${part.name}\``
      );
      if (Array.isArray(plugin9)) {
        const pluginObj = { ...plugin9[0], data: plugin9[1] };
        plugin9 = pluginObj;
      }
      if (!plugins[name]) {
        plugins[name] = plugin9;
        this.store.log.info(
          plugin9.condition ? `New plugin conditionally added: \`${name}\`` : `New plugin added: \`${name}\``
        );
      } else {
        if (plugin9.plugin && plugin9.condition) {
          if (plugins[name]?.condition) {
            plugins[name + "_"] = plugin9;
            this.store.log.info(
              `Plugin \`${name}\` was conditionally added again. Renaming to ${name}_.`
            );
          } else
            this.store.log.info(
              `Plugin \`${name}\` was requested conditionally, but is already added explicitly. Not loading.`
            );
        } else if (plugins[name].condition) {
          plugins[name] = plugin9;
          this.store.log.info(`Plugin \`${name}\` was explicitly added. Changing from conditional.`);
        }
      }
    }
    return this;
  };
  var depTypes = ["from", "after"];
  var exceptionTypes = ["never", "always"];
  PatternConfig.prototype.__resolvePartHiding = function(part) {
    let hide = part.hide;
    if (typeof hide === "string") hide = hidePresets[hide];
    if (!hide) return;
    const partDistance = this.__mutated.partDistance?.[part.name];
    const neverDistance = this.__hiding.never[part.name] || Infinity;
    const alwaysDistance = this.__hiding.always[part.name] || Infinity;
    if (hide.self && (neverDistance > partDistance || alwaysDistance <= neverDistance))
      this.partHide[part.name] = true;
    exceptionTypes.forEach((e, i) => {
      if (hide[e]) {
        hide[e].forEach((p) => {
          const otherDistance = this.__hiding[exceptionTypes[Math.abs(i - 1)]][p] || Infinity;
          if (otherDistance > partDistance) {
            const thisDistance = this.__hiding[e][p] || Infinity;
            this.__hiding[e][p] = Math.min(thisDistance, partDistance);
            this.partHide[p] = i == 1;
          }
        });
      }
    });
    depTypes.concat("inherited").forEach((k) => {
      if (this.__hiding[k][part.name] === void 0) this.__hiding[k][part.name] = hide[k];
    });
  };
  PatternConfig.prototype.__resolvePartDependencies = function(depChain) {
    const part = depChain[0];
    this.resolvedDependencies[part.name] = this.resolvedDependencies[part.name] || [];
    depTypes.forEach((d) => {
      if (part[d]) {
        const depsOfType = [].concat(part[d]);
        for (var i = depsOfType.length - 1; i >= 0; i--) {
          const dot = depsOfType[i];
          this.__addDependency("directDependencies", part.name, dot.name);
          depChain.forEach((c2) => this.__addDependency("resolvedDependencies", c2.name, dot.name));
          this.__handlePartDependencyOfType(part, dot.name, d);
          if (!this.parts[dot.name]) {
            this.__addPart([dot, ...depChain]);
          } else {
            this.__resolvePartDependencies([dot, ...depChain]);
          }
        }
      }
    });
    this.__resolveMutatedPartDistance(part.name);
  };
  PatternConfig.prototype.__addDependency = function(dependencyList, partName, depName) {
    this[dependencyList][partName] = this[dependencyList][partName] || [];
    const depIndex = this[dependencyList][partName].indexOf(depName);
    if (depIndex !== -1) this[dependencyList][partName].splice(depIndex, 1);
    this[dependencyList][partName].push(depName);
  };
  PatternConfig.prototype.__handlePartDependencyOfType = function(part, depName, depType) {
    if (this.__hiding[depType][part.name] === true && this.partHide[depName] === void 0) {
      this.partHide[depName] = true;
    }
    const hideInherited = this.__hiding.inherited[part.name];
    if (depType === "from") {
      this.inject[part.name] = depName;
      this.__hiding.after[depName] = hideInherited;
    }
    this.__hiding.from[depName] = hideInherited;
    this.__hiding.inherited[depName] = hideInherited;
  };
  PatternConfig.prototype.__resolveMutatedPartDistance = function(partName) {
    if (!this.directDependencies[partName]) return;
    let proposedDependencyDistance = this.__mutated.partDistance[partName] + 1;
    this.directDependencies[partName].forEach((dependency) => {
      if (typeof this.__mutated.partDistance[dependency] === "undefined" || this.__mutated.partDistance[dependency] < proposedDependencyDistance) {
        this.__mutated.partDistance[dependency] = proposedDependencyDistance;
        this.__resolveMutatedPartDistance(dependency);
      }
    });
  };

  // node_modules/@freesewing/core/src/part.mjs
  function Part() {
    __addNonEnumProp(this, "freeId", 0);
    __addNonEnumProp(this, "topLeft", false);
    __addNonEnumProp(this, "bottomRight", false);
    __addNonEnumProp(this, "width", false);
    __addNonEnumProp(this, "height", false);
    __addNonEnumProp(this, "utils", utils_exports);
    __addNonEnumProp(this, "layout", { move: { x: 0, y: 0 } });
    __addNonEnumProp(this, "Point", Point);
    __addNonEnumProp(this, "Path", Path);
    __addNonEnumProp(this, "Snippet", Snippet);
    __addNonEnumProp(this, "hooks", new Hooks());
    this.hidden = false;
    this.attributes = new Attributes();
    this.points = {};
    this.paths = {};
    this.snippets = {};
    this.name = null;
    return this;
  }
  Part.prototype.asRenderProps = function() {
    const paths = {};
    for (const i in this.paths) paths[i] = this.paths[i].asRenderProps();
    const points = {};
    for (const i in this.points) points[i] = this.points[i].asRenderProps();
    const snippets = {};
    for (const i in this.snippets) snippets[i] = this.snippets[i].asRenderProps();
    return {
      paths,
      points,
      snippets,
      anchor: points.anchor ?? new Point(0, 0),
      attributes: this.attributes.asRenderProps(),
      height: this.height,
      width: this.width,
      bottomRight: this.bottomRight.asRenderProps(),
      topLeft: this.topLeft.asRenderProps()
    };
  };
  Part.prototype.attr = function(name, value, overwrite = false) {
    if (overwrite) this.attributes.set(name, value);
    else this.attributes.add(name, value);
    return this;
  };
  Part.prototype.getId = function(prefix = "") {
    return this.__getIdClosure()(prefix);
  };
  Part.prototype.hide = function() {
    this.hidden = true;
    return this;
  };
  Part.prototype.setHidden = function(hidden = false) {
    if (hidden) this.hidden = true;
    else this.hidden = false;
    return this;
  };
  Part.prototype.shorthand = function() {
    let self2 = this;
    const complete = this.context.settings?.complete ? true : false;
    const expand = this.context.settings?.expand ? true : false;
    const paperless = this.context.settings?.paperless ? true : false;
    const sa = this.context.settings?.sa || 0;
    const shorthand = {
      complete,
      context: this.context,
      expand,
      getId: this.__getIdClosure(),
      log: this.context.store.log,
      paperless,
      part: this,
      sa,
      scale: this.context.settings?.scale,
      store: this.context.store.extend([
        // Add prefixed getter
        [
          "pget",
          function(s, path, dflt2) {
            const prefix = self2.context.settings.options.storePrefix ? self2.context.settings.options.storePrefix : self2.context.store.activePart + ".";
            const val = self2.context.store.get(path, dflt2, prefix);
            return self2.context.store.get(path, dflt2, prefix);
          }
        ],
        // Add prefixed setter
        [
          "pset",
          function(s, path, value) {
            const prefix = self2.context.settings.options.storePrefix ? self2.context.settings.options.storePrefix : self2.context.store.activePart + ".";
            return self2.context.store.set(path, value, prefix);
          }
        ]
      ]),
      units: this.__unitsClosure(),
      utils: utils_exports,
      Bezier: Bezier2
    };
    shorthand.Point = function(x, y) {
      Point.apply(this, [x, y]);
      Object.defineProperty(this, "log", { value: self2.context.store.log });
    };
    shorthand.Point.prototype = Object.create(Point.prototype);
    shorthand.Path = function() {
      Path.apply(this, [true]);
      Object.defineProperty(this, "log", { value: self2.context.store.log });
    };
    shorthand.Path.prototype = Object.create(Path.prototype);
    shorthand.Snippet = function(def, anchor) {
      Snippet.apply(this, [def, anchor, true]);
      Snippet.apply(this, arguments);
      Object.defineProperty(this, "log", { value: self2.context.store.log });
    };
    shorthand.Snippet.prototype = Object.create(Snippet.prototype);
    shorthand.points = new Proxy(this.points, pointsProxy(self2.points, self2.context.store.log));
    shorthand.paths = new Proxy(this.paths, pathsProxy(self2.paths, self2.context.store.log));
    shorthand.snippets = new Proxy(
      this.snippets,
      snippetsProxy(self2.snippets, self2.context.store.log)
    );
    shorthand.measurements = new Proxy(this.context.settings.measurements, {
      get: function(measurements3, name) {
        if (typeof measurements3[name] === "undefined")
          self2.context.store.log.warn(
            `${self2.name} tried to access \`measurements.${name}\` but it is \`undefined\``
          );
        return Reflect.get(...arguments);
      },
      set: (measurements3, name, value) => self2.context.settings.measurements[name] = value
    });
    shorthand.options = new Proxy(this.context.settings.options, {
      get: function(options, name, receiver) {
        const prefixedName = self2.context.store.activePart.replace(".", "_") + "_" + name;
        if (typeof options[prefixedName] === "undefined") {
          if (typeof options[name] === "undefined") {
            self2.context.store.log.warn(`Tried to access \`options.${name}\` but it is \`undefined\``);
          }
          return Reflect.get(...arguments);
        }
        return options[prefixedName];
      },
      set: (options, name, value) => self2.context.settings.options[name] = value
    });
    shorthand.absoluteOptions = new Proxy(this.context.settings.absoluteOptions, {
      get: function(absoluteOptions, name) {
        if (typeof absoluteOptions[name] === "undefined")
          self2.context.store.log.warn(
            `Tried to access \`absoluteOptions.${name}\` but it is \`undefined\``
          );
        return Reflect.get(...arguments);
      },
      set: (absoluteOptions, name, value) => self2.context.settings.absoluteOptions[name] = value
    });
    shorthand.macro = this.__macroClosure(shorthand);
    return shorthand;
  };
  Part.prototype.unhide = function() {
    this.hidden = false;
    return this;
  };
  Part.prototype.units = function(input) {
    return units(input, this.context.settings.units);
  };
  Part.prototype.__boundary = function() {
    if (this.topLeft) return this;
    let topLeft = new Point(Infinity, Infinity);
    let bottomRight = new Point(-Infinity, -Infinity);
    for (let key in this.paths) {
      try {
        let path = this.paths[key].__boundary();
        if (!path.hidden) {
          if (path.topLeft.x < topLeft.x) topLeft.x = path.topLeft.x;
          if (path.topLeft.y < topLeft.y) topLeft.y = path.topLeft.y;
          if (path.bottomRight.x > bottomRight.x) bottomRight.x = path.bottomRight.x;
          if (path.bottomRight.y > bottomRight.y) bottomRight.y = path.bottomRight.y;
        }
      } catch (err) {
        this.context.store.log.error(
          `Could not calculate boundary of \`paths.${key}\` in part ${this.name}: ${err}`
        );
      }
    }
    for (let key in this.points) {
      let point = this.points[key];
      let radius = point.attributes.get("data-circle");
      if (radius) {
        radius = parseFloat(radius);
        if (point.x - radius < topLeft.x) topLeft.x = point.x - radius;
        if (point.y - radius < topLeft.y) topLeft.y = point.y - radius;
        if (point.x + radius > bottomRight.x) bottomRight.x = point.x + radius;
        if (point.y + radius > bottomRight.y) bottomRight.y = point.y + radius;
      }
    }
    if (topLeft.x === Infinity) topLeft.x = 0;
    if (topLeft.y === Infinity) topLeft.y = 0;
    if (bottomRight.x === -Infinity) bottomRight.x = 0;
    if (bottomRight.y === -Infinity) bottomRight.y = 0;
    this.topLeft = topLeft;
    this.bottomRight = bottomRight;
    this.width = this.bottomRight.x - this.topLeft.x;
    this.height = this.bottomRight.y - this.topLeft.y;
    return this;
  };
  Part.prototype.__getIdClosure = function() {
    const self2 = this;
    const method = function(prefix = "") {
      self2.freeId += 1;
      return prefix + self2.freeId;
    };
    return method;
  };
  Part.prototype.__inject = function(orig) {
    const findBasePoint = (p) => {
      for (let i in orig.points) {
        if (orig.points[i] === p) return i;
      }
    };
    this.freeId = orig.freeId;
    for (let i in orig.points) this.points[i] = orig.points[i].clone();
    for (let i in orig.paths) {
      this.paths[i] = orig.paths[i].clone();
      for (let j in orig.paths[i].ops) {
        let op = orig.paths[i].ops[j];
        if (op.type !== "close") {
          let toPoint = findBasePoint(op.to);
          if (toPoint) this.paths[i].ops[j].to = this.points[toPoint];
        }
        if (op.type === "curve") {
          let cp1Point = findBasePoint(op.cp1);
          if (cp1Point) this.paths[i].ops[j].cp1 = this.points[cp1Point];
          let cp2Point = findBasePoint(op.cp2);
          if (cp2Point) this.paths[i].ops[j].cp2 = this.points[cp2Point];
        }
      }
    }
    for (let i in orig.snippets) {
      this.snippets[i] = orig.snippets[i].clone();
    }
    if (orig.context.store.parts?.[orig.name]) {
      this.context.store.parts[this.name] = JSON.parse(
        JSON.stringify(orig.context.store.parts[orig.name])
      );
    }
    return this;
  };
  Part.prototype.__macroClosure = function(props) {
    const self2 = this;
    const method = function(key, args) {
      const macro = __macroName(key.toLowerCase());
      let parentMacro;
      if (typeof self2[macro] === "function") {
        if ("context" in self2) {
          parentMacro = self2.context.store.get("activeMacro", false);
          self2.context.store.set("activeMacro", key.toLowerCase());
        }
        const result = self2[macro](args, props);
        if ("context" in self2) {
          if (parentMacro) self2.context.store.set("activeMacro", parentMacro);
          else self2.context.store.unset("activeMacro");
        }
        return result;
      } else if ("context" in self2)
        self2.context.store.log.warn("Unknown macro `" + key.toLowerCase() + "` used in " + self2.name);
    };
    return method;
  };
  Part.prototype.__unitsClosure = function() {
    const self2 = this;
    const method = function(value) {
      if (typeof value !== "number")
        self2.context.store.log.warn(
          `Calling \`units(value)\` but \`value\` is not a number (\`${typeof value}\`)`
        );
      return units(value, self2.context.settings.units);
    };
    return method;
  };

  // node_modules/@freesewing/core/src/pattern/pattern-drafter.mjs
  function PatternDrafter(pattern) {
    this.pattern = pattern;
  }
  PatternDrafter.prototype.draft = function() {
    this.pattern.__runHooks("preDraft");
    this.pattern.parts = [];
    this.pattern.__extendPatternStore();
    for (const set2 in this.pattern.settings) {
      this.pattern.setStores[set2] = this.pattern.__createSetStore();
      this.__useSet(set2);
      this.activeStore.log.debug(`\u{1F5C3}\uFE0F Initialized store for set \`${set2}\``);
      this.pattern.__runHooks("preSetDraft");
      this.activeStore.log.debug(`\u{1F4D0} Drafting pattern for set \`${set2}\``);
      this.pattern.parts[set2] = {};
      this.__loadAbsoluteOptionsSet(set2);
      for (const partName of this.pattern.config.draftOrder) {
        if (this.pattern.__needs(partName, set2)) {
          this.draftPartForSet(partName, set2);
        } else {
          this.activeStore.log.debug(`Part \`${partName}\` is not needed. Skipping part`);
        }
      }
      this.pattern.__runHooks("postSetDraft");
    }
    this.pattern.__runHooks("postDraft");
  };
  PatternDrafter.prototype.draftPartForSet = function(partName, set2) {
    if (set2 === "__proto__") {
      throw new Error("malicious attempt at altering Object.prototype. Stopping action");
    }
    this.__useSet(set2);
    this.__createPartForSet(partName, set2);
    const configPart = this.pattern.config.parts?.[partName];
    if (typeof configPart?.draft !== "function") {
      this.activeStore.log.error(
        `Unable to draft pattern part \`${partName}\`. Part.draft() is not callable`
      );
      return;
    }
    this.pattern.activePart = partName;
    this.activeStore.set("activePart", partName);
    try {
      this.pattern.__runHooks("prePartDraft");
      const result = configPart.draft(this.pattern.parts[set2][partName].shorthand());
      if (typeof result === "undefined") {
        this.activeStore.log.error(
          `Result of drafting part \`${partName}\` was undefined. Did you forget to return the part?`
        );
      } else {
        if (!this.pattern.__wants(partName, set2)) result.hide();
        this.pattern.__runHooks("postPartDraft");
        this.pattern.parts[set2][partName] = result;
      }
      return result;
    } catch (err) {
      this.activeStore.log.error([`Unable to draft part \`${partName}\` (set \`${set2}\`)`, err]);
    }
  };
  PatternDrafter.prototype.__createPartForSet = function(partName, set2 = 0) {
    if (set2 === "__proto__") {
      throw new Error("malicious attempt at altering Object.prototype. Stopping action");
    }
    this.activeStore.log.debug(`\u{1F4E6} Creating part \`${partName}\` (set \`${set2}\`)`);
    this.pattern.parts[set2][partName] = this.pattern.parts[set2][partName] || this.__createPartWithContext(partName, set2);
    const parent = this.pattern.config.inject[partName];
    if (typeof parent === "string") {
      this.activeStore.log.debug(`\u{1FA86} Creating part \`${partName}\` from part \`${parent}\``);
      try {
        this.pattern.parts[set2][partName].__inject(this.pattern.parts[set2][parent]);
      } catch (err) {
        this.activeStore.log.error([
          `Could not inject part \`${parent}\` into part \`${partName}\``,
          err
        ]);
      }
    }
  };
  PatternDrafter.prototype.__createPartWithContext = function(name, set2) {
    const part = new Part();
    part.name = name;
    part.set = set2;
    part.stack = this.pattern.config.parts[name]?.stack || name;
    part.context = {
      parts: this.pattern.parts[set2],
      config: this.pattern.config,
      settings: this.pattern.settings[set2],
      store: this.pattern.setStores[set2],
      macros: this.pattern.plugins.macros
    };
    if (this.pattern.settings[set2]?.partClasses) {
      part.attr("class", this.pattern.settings[set2].partClasses);
    }
    for (const macro in this.pattern.plugins.macros) {
      part[__macroName(macro)] = this.pattern.plugins.macros[macro];
    }
    return part;
  };
  PatternDrafter.prototype.__loadAbsoluteOptionsSet = function(set2) {
    for (const optionName in this.pattern.settings[set2].options) {
      const option = this.pattern.config.options[optionName];
      if (typeof option !== "undefined" && option.toAbs instanceof Function) {
        if (typeof option.snap !== "undefined") {
          this.pattern.settings[set2].absoluteOptions[optionName] = this.__snappedPercentageOption(
            optionName,
            set2
          );
          this.pattern.setStores[set2].log.debug(
            `\u{1F9F2} Snapped __${optionName}__ to \`${this.pattern.settings[set2].absoluteOptions[optionName]}\` for set __${set2}__`
          );
        } else {
          const abs3 = option.toAbs(
            this.pattern.settings[set2].options[optionName],
            this.pattern.settings[set2],
            mergeOptions(this.pattern.settings[set2], this.pattern.config.options)
          );
          this.pattern.settings[set2].absoluteOptions[optionName] = abs3;
          this.pattern.setStores[set2].log.debug(
            `\u{1F9EE} Absolute value of \`${optionName}\` option is \`${abs3}\` for set __${set2}__`
          );
        }
      }
    }
    return this;
  };
  PatternDrafter.prototype.__snappedPercentageOption = function(optionName, set2) {
    const conf = this.pattern.config.options[optionName];
    const abs3 = conf.toAbs(
      this.pattern.settings[set2].options[optionName],
      this.pattern.settings[set2],
      mergeOptions(this.pattern.settings[set2], this.pattern.config.options)
    );
    return getSnappedPercentageValue(abs3, conf, this.pattern.settings[set2].units);
  };
  PatternDrafter.prototype.__useSet = function(set2 = 0) {
    this.pattern.activeSet = set2;
    this.activeStore = this.pattern.setStores[set2];
  };

  // node_modules/@freesewing/core/src/pattern/pattern-sampler.mjs
  function PatternSampler(pattern) {
    this.pattern = pattern;
  }
  PatternSampler.prototype.sampleMeasurement = function(measurementName) {
    this.pattern.store.log.debug(`Sampling measurement \`${measurementName}\``);
    this.pattern.__runHooks("preSample");
    this.pattern.__applySettings(this.__measurementSets(measurementName));
    this.pattern.__init();
    this.pattern.__runHooks("postSample");
    return this.pattern.draft();
  };
  PatternSampler.prototype.sampleModels = function(models, focus = false) {
    this.pattern.store.log.debug(`Sampling models \`${Object.keys(models).join(", ")}\``);
    this.pattern.__runHooks("preSample");
    this.pattern.__applySettings(this.__modelSets(models, focus));
    this.pattern.__init();
    this.pattern.__runHooks("postSample");
    return this.pattern.draft();
  };
  PatternSampler.prototype.sampleOption = function(optionName) {
    this.pattern.store.log.debug(`Sampling option \`${optionName}\``);
    this.pattern.__runHooks("preSample");
    this.pattern.__applySettings(this.__optionSets(optionName));
    this.pattern.__init();
    this.pattern.__runHooks("postSample");
    return this.pattern.draft();
  };
  PatternSampler.prototype.__listBoolOptionSets = function(optionName) {
    let option = this.pattern.config.options[optionName];
    const base2 = this.__setBase();
    const sets = [];
    let run = 1;
    if (typeof option.bool !== "undefined") option = { list: [false, true] };
    for (const choice of option.list) {
      const settings = {
        ...base2,
        options: {
          ...base2.options
        },
        idPrefix: `sample-${run}`,
        partClasses: `sample-${run}`
      };
      settings.options[optionName] = choice;
      sets.push(settings);
      run++;
    }
    return sets;
  };
  PatternSampler.prototype.__measurementSets = function(measurementName) {
    let val = this.pattern.settings[0].measurements[measurementName];
    if (val === void 0)
      this.pattern.store.log.error(
        `Cannot sample measurement \`${measurementName}\` because it's \`undefined\``
      );
    let step = val / 50;
    val = val * 0.9;
    const sets = [];
    const base2 = this.__setBase();
    for (let run = 1; run < 11; run++) {
      const settings = {
        ...base2,
        measurements: {
          ...base2.measurements
        },
        idPrefix: `sample-${run}`,
        partClasses: `sample-${run}`
      };
      settings.measurements[measurementName] = val;
      sets.push(settings);
      val += step;
    }
    return sets;
  };
  PatternSampler.prototype.__modelSets = function(models, focus = false) {
    const sets = [];
    const base2 = this.__setBase();
    let run = 1;
    if (focus) {
      sets.push({
        ...base2,
        measurements: models[focus],
        idPrefix: `sample-${run}`,
        partClasses: `sample-${run} sample-focus`
      });
      run++;
      delete models[focus];
    }
    for (const measurements3 of Object.values(models)) {
      sets.push({
        ...base2,
        measurements: measurements3,
        idPrefix: `sample-${run}`,
        partClasses: `sample-${run}`
      });
    }
    return sets;
  };
  PatternSampler.prototype.__optionSets = function(optionName) {
    const sets = [];
    if (!(optionName in this.pattern.config.options)) return sets;
    let option = this.pattern.config.options[optionName];
    if (typeof option.list === "object" || typeof option.bool !== "undefined")
      return this.__listBoolOptionSets(optionName);
    let factor = 1;
    let step, val;
    let numberRuns = 10;
    let stepFactor = numberRuns - 1;
    if (typeof option.min === "undefined" || typeof option.max === "undefined") {
      const min2 = option * 0.9;
      const max2 = option * 1.1;
      option = { min: min2, max: max2 };
    }
    if (typeof option.pct !== "undefined") factor = 100;
    val = option.min / factor;
    if (typeof option.count !== "undefined" || typeof option.mm !== "undefined") {
      const numberOfCounts = option.max - option.min + 1;
      if (numberOfCounts < 10) {
        numberRuns = numberOfCounts;
        stepFactor = Math.max(numberRuns - 1, 1);
      }
    }
    step = (option.max / factor - val) / stepFactor;
    const base2 = this.__setBase();
    const roundVal = typeof option.count !== "undefined" || typeof option.mm !== "undefined";
    for (let run = 1; run <= numberRuns; run++) {
      const settings = {
        ...base2,
        options: {
          ...base2.options
        },
        idPrefix: `sample-${run}`,
        partClasses: `sample-${run}`
      };
      settings.options[optionName] = roundVal ? Math.ceil(val) : val;
      sets.push(settings);
      val += step;
    }
    return sets;
  };
  PatternSampler.prototype.__setBase = function() {
    return {
      measurements: {},
      options: {},
      ...this.pattern.settings[0]
    };
  };

  // node_modules/@freesewing/core/src/defs.mjs
  function Defs() {
    this.list = {};
    return this;
  }
  Defs.prototype.clone = function() {
    let clone = new Defs();
    clone.list = JSON.parse(JSON.stringify(this.list));
    return clone;
  };
  Defs.prototype.get = function(name) {
    if (typeof this.list[name] === "undefined") return false;
    else return this.list[name];
  };
  Defs.prototype.remove = function(name) {
    delete this.list[name];
    return this;
  };
  Defs.prototype.render = function() {
    let svg = "";
    for (let key in this.list) {
      svg += ` ${key}="${this.list[key]}"`;
    }
    return svg;
  };
  Defs.prototype.set = function(name, value) {
    this.list[name] = value;
    return this;
  };
  Defs.prototype.setIfUnset = function(name, value) {
    if (typeof this.list[name] === "undefined") this.list[name] = value;
    return this;
  };
  Defs.prototype.asRenderProps = function() {
    return {
      list: this.list,
      forSvg: this.render()
    };
  };

  // node_modules/@freesewing/core/src/svg.mjs
  function Svg(pattern) {
    __addNonEnumProp(this, "openGroups", []);
    __addNonEnumProp(this, "freeId", 0);
    __addNonEnumProp(this, "prefix", '<?xml version="1.0" encoding="UTF-8" standalone="no"?>');
    this.pattern = pattern;
    this.attributes = new Attributes();
    this.attributes.add("xmlns", "http://www.w3.org/2000/svg");
    this.attributes.add("xmlns:svg", "http://www.w3.org/2000/svg");
    this.attributes.add("xmlns:xlink", "http://www.w3.org/1999/xlink");
    this.attributes.add("xml:lang", pattern?.settings?.[0]?.locale || "en");
    this.attributes.add("xmlns:freesewing", "http://freesewing.org/namespaces/freesewing");
    this.attributes.add("freesewing", version);
    this.layout = {};
    this.style = "";
    this.defs = new Defs();
  }
  Svg.prototype.asRenderProps = function() {
    return {
      attributes: this.attributes.asRenderProps(),
      layout: this.layout,
      style: this.style,
      defs: this.defs.asRenderProps()
    };
  };
  Svg.prototype.render = function() {
    this.idPrefix = this.pattern?.settings?.[0]?.idPrefix || "fs-";
    this.__runHooks("preRender");
    if (!this.pattern.settings[0].embed) {
      this.attributes.add("width", round(this.pattern.width) + "mm");
      this.attributes.add("height", round(this.pattern.height) + "mm");
    }
    this.attributes.add("viewBox", `0 0 ${round(this.pattern.width)} ${round(this.pattern.height)}`);
    this.head = this.__renderHead();
    this.tail = this.__renderTail();
    this.svg = "";
    this.layout = {};
    this.activeStackIndex = 0;
    for (let stackId in this.pattern.stacks) {
      this.activeStack = stackId;
      this.idPrefix = this.pattern.settings[this.activeStackIndex]?.idPrefix || "fs-";
      const stack = this.pattern.stacks[stackId];
      if (!this.pattern.__isStackHidden(stackId)) {
        const stackSvg = this.__renderStack(stack);
        this.layout[stackId] = {
          svg: stackSvg,
          transform: stack.attributes.getAsArray("transform")
        };
        this.svg += this.__openGroup(`${this.idPrefix}stack-${stackId}`, stack.attributes);
        this.svg += stackSvg;
        this.svg += this.__closeGroup();
      }
      this.activeStackIndex++;
    }
    this.svg = this.prefix + this.__renderSvgTag() + this.head + this.svg + this.tail;
    this.__runHooks("postRender");
    return this.svg;
  };
  Svg.prototype.__closeGroup = function() {
    this.__outdent();
    return `${this.__nl()}</g>${this.__nl()}<!-- end of group #${this.openGroups.pop()} -->`;
  };
  Svg.prototype.__escapeText = function(text) {
    if (Array.isArray(text)) return text.map((t2) => t2 ? t2.replace(/"/g, "&#8220;") : "").join(" ");
    return text.replace(/"/g, "&#8220;");
  };
  Svg.prototype.__getId = function() {
    this.freeId += 1;
    return "" + this.freeId;
  };
  Svg.prototype.__indent = function() {
    this.tabs += 1;
    return this;
  };
  Svg.prototype.__insertText = function(text) {
    if (this.hooks.insertText.length > 0) {
      for (let hook of this.hooks.insertText)
        text = hook.method(
          this.pattern.settings[this.pattern.activeSet].locale || "en",
          text,
          hook.data,
          this.pattern
        );
    }
    return text;
  };
  Svg.prototype.__nl = function() {
    return "\n" + this.__tab();
  };
  Svg.prototype.__outdent = function() {
    this.tabs -= 1;
    return this;
  };
  Svg.prototype.__openGroup = function(id, attributes = false) {
    let svg = this.__nl() + this.__nl();
    svg += `<!-- Start of group #${id} -->`;
    svg += this.__nl();
    svg += `<g id="${id}"`;
    if (attributes) svg += ` ${attributes.render()}`;
    svg += ">";
    this.__indent();
    this.openGroups.push(id);
    return svg;
  };
  Svg.prototype.__renderCircle = function(point) {
    return `<circle cx="${round(point.x)}" cy="${round(point.y)}" r="${point.attributes.get(
      "data-circle"
    )}" ${point.attributes.renderIfPrefixIs("data-circle-")}></circle>`;
  };
  Svg.prototype.__renderDefs = function() {
    let svg = "<defs>";
    this.__indent();
    svg += this.__nl() + this.defs.render();
    this.__outdent();
    svg += this.__nl() + "</defs>" + this.__nl();
    return svg;
  };
  Svg.prototype.__renderHead = function() {
    let svg = this.__renderStyle();
    svg += this.__renderDefs();
    svg += this.__openGroup(this.idPrefix + "container");
    return svg;
  };
  Svg.prototype.__renderPath = function(path) {
    if (!path.attributes.get("id")) path.attributes.add("id", this.idPrefix + this.__getId());
    path.attributes.set("d", path.asPathstring());
    return `${this.__nl()}<path ${path.attributes.render()} />${this.__renderPathText(path)}`;
  };
  Svg.prototype.__renderPathText = function(path) {
    let text = path.attributes.getAsArray("data-text");
    if (!text) return "";
    else this.text = this.__insertText(text);
    let attributes = path.attributes.renderIfPrefixIs("data-text-");
    let offset = "";
    let align = path.attributes.get("data-text-class");
    if (align && align.indexOf("center") > -1) offset = ' startOffset="50%" ';
    else if (align && align.indexOf("right") > -1) offset = ' startOffset="100%" ';
    let svg = this.__nl() + "<text>";
    this.__indent();
    svg += `<textPath xlink:href="#${path.attributes.get(
      "id"
    )}" ${offset}><tspan ${attributes}>${this.__escapeText(this.text)}</tspan></textPath>`;
    this.__outdent();
    svg += this.__nl() + "</text>";
    return svg;
  };
  Svg.prototype.__renderPart = function(part) {
    const attributes = part.attributes.clone();
    attributes.add(
      "transform",
      `translate(${-part.asRenderProps().anchor.x}, ${-part.asRenderProps().anchor.y})`
    );
    let svg = this.__openGroup(
      `${this.idPrefix}stack-${this.activeStack}-part-${part.name}`,
      attributes
    );
    for (let key in part.paths) {
      let path = part.paths[key];
      if (!path.hidden) svg += this.__renderPath(path);
    }
    for (let key in part.points) {
      if (part.points[key].attributes.get("data-text")) {
        svg += this.__renderText(part.points[key]);
      }
      if (part.points[key].attributes.get("data-circle")) {
        svg += this.__renderCircle(part.points[key]);
      }
    }
    for (let key in part.snippets) {
      let snippet = part.snippets[key];
      svg += this.__renderSnippet(snippet, part);
    }
    svg += this.__closeGroup();
    return svg;
  };
  Svg.prototype.__renderSnippet = function(snippet) {
    if (!this.pattern.settings[0].complete && !snippet.attributes.get("data-force")) return "";
    let x = round(snippet.anchor.x);
    let y = round(snippet.anchor.y);
    let scale = snippet.attributes.get("data-scale") || 1;
    scale = scale * (this.pattern.settings.scale || 1);
    if (scale) {
      snippet.attributes.add("transform", `translate(${x}, ${y})`);
      snippet.attributes.add("transform", `scale(${scale})`);
      snippet.attributes.add("transform", `translate(${x * -1}, ${y * -1})`);
    }
    let rotate = snippet.attributes.get("data-rotate");
    if (rotate) {
      snippet.attributes.add("transform", `rotate(${rotate}, ${x}, ${y})`);
    }
    let svg = this.__nl();
    svg += `<use x="${x}" y="${y}" `;
    svg += `xlink:href="#${snippet.def}" ${snippet.attributes.render()}>`;
    svg += "</use>";
    return svg;
  };
  Svg.prototype.__renderStack = function(stack) {
    let svg = "";
    for (const part of stack.parts) svg += this.__renderPart(part);
    return svg;
  };
  Svg.prototype.__renderStyle = function() {
    let svg = '<style type="text/css"> <![CDATA[ ';
    this.__indent();
    svg += this.__nl() + this.style;
    this.__outdent();
    svg += this.__nl() + "]]>" + this.__nl() + "</style>" + this.__nl();
    return svg;
  };
  Svg.prototype.__renderSvgTag = function() {
    let svg = "<svg";
    this.__indent();
    svg += this.__nl() + this.attributes.render();
    this.__outdent();
    svg += this.__nl() + ">" + this.__nl();
    return svg;
  };
  Svg.prototype.__renderTail = function() {
    let svg = "";
    svg += this.__closeGroup();
    svg += this.__nl() + "</svg>";
    return svg;
  };
  Svg.prototype.__renderText = function(point) {
    let text = point.attributes.getAsArray("data-text");
    if (text !== false) {
      let joint = "";
      for (let string of text) {
        this.text = this.__insertText(string);
        joint += this.text + " ";
      }
      this.text = this.__insertText(joint);
    }
    point.attributes.set("data-text-x", round(point.x));
    point.attributes.set("data-text-y", round(point.y));
    let lineHeight = point.attributes.get("data-text-lineheight") || 6 * (this.pattern.settings.scale || 1);
    point.attributes.remove("data-text-lineheight");
    let svg = `${this.__nl()}<text ${point.attributes.renderIfPrefixIs("data-text-")}>`;
    this.__indent();
    if (this.text.indexOf("\n") !== -1) {
      let lines = this.text.split("\n");
      svg += `<tspan>${lines.shift()}</tspan>`;
      for (let line2 of lines) {
        svg += `<tspan x="${round(point.x)}" dy="${lineHeight}">${line2}</tspan>`;
      }
    } else {
      svg += `<tspan>${this.__escapeText(this.text)}</tspan>`;
    }
    this.__outdent();
    svg += this.__nl() + "</text>";
    return svg;
  };
  Svg.prototype.__runHooks = function(hookName, data = false) {
    if (data === false) data = this;
    let hooks2 = this.hooks[hookName];
    if (hooks2.length > 0) {
      for (let hook of hooks2) {
        hook.method(data, hook.data);
      }
    }
  };
  Svg.prototype.__tab = function() {
    let space = "";
    for (let i = 0; i < this.tabs; i++) {
      space += "  ";
    }
    return space;
  };

  // node_modules/@freesewing/core/src/stack.mjs
  function Stack(name = null) {
    __addNonEnumProp(this, "freeId", 0);
    __addNonEnumProp(this, "layout", { move: { x: 0, y: 0 } });
    this.attributes = new Attributes();
    this.parts = /* @__PURE__ */ new Set();
    this.name = name;
    this.topLeft = false;
    this.bottomRight = false;
    this.width = false;
    this.height = false;
    this.anchor = new Point(0, 0);
    return this;
  }
  Stack.prototype.addPart = function(part) {
    if (part) this.parts.add(part);
    return this;
  };
  Stack.prototype.asRenderProps = function() {
    return {
      name: this.name,
      attributes: this.attributes.asRenderProps(),
      topLeft: this.topLeft,
      bottomRight: this.bottomRight,
      width: this.width,
      height: this.height,
      parts: [...this.parts].map((part) => part.asRenderProps())
    };
  };
  Stack.prototype.getPartList = function() {
    return [...this.parts];
  };
  Stack.prototype.getPartNames = function() {
    return [...this.parts].map((p) => p.name);
  };
  Stack.prototype.home = function() {
    if (this.topLeft) return this;
    this.topLeft = new Point(Infinity, Infinity);
    this.bottomRight = new Point(-Infinity, -Infinity);
    for (const part of this.getPartList()) {
      part.__boundary();
      let partAnchor = part.points?.anchor;
      let bounds = part;
      if (partAnchor) {
        bounds = {
          topLeft: part.topLeft.translate(-partAnchor.x, -partAnchor.y),
          bottomRight: part.bottomRight.translate(-partAnchor.x, -partAnchor.y)
        };
      }
      const { topLeft, bottomRight } = getTransformedBounds(
        bounds,
        part.attributes.getAsArray("transform")
      );
      if (!topLeft) {
        continue;
      }
      this.topLeft.x = Math.min(this.topLeft.x, topLeft.x);
      this.topLeft.y = Math.min(this.topLeft.y, topLeft.y);
      this.bottomRight.x = Math.max(this.bottomRight.x, bottomRight.x);
      this.bottomRight.y = Math.max(this.bottomRight.y, bottomRight.y);
    }
    if (this.topLeft.x === Infinity) this.topLeft.x = 0;
    if (this.topLeft.y === Infinity) this.topLeft.y = 0;
    if (this.bottomRight.x === -Infinity) this.bottomRight.x = 0;
    if (this.bottomRight.y === -Infinity) this.bottomRight.y = 0;
    let margin = 0;
    for (const set2 in this.context.settings) {
      if (this.context.settings[set2].margin > margin) margin = this.context.settings[set2].margin;
      if (this.context.settings[set2].paperless && margin < 10) margin = 10;
    }
    this.topLeft.x -= margin;
    this.topLeft.y -= margin;
    this.bottomRight.x += margin;
    this.bottomRight.y += margin;
    this.width = this.bottomRight.x - this.topLeft.x;
    this.height = this.bottomRight.y - this.topLeft.y;
    this.width = this.bottomRight.x - this.topLeft.x;
    this.height = this.bottomRight.y - this.topLeft.y;
    this.anchor = new Point(0, 0);
    if (this.topLeft.x === this.anchor.x && this.topLeft.y === this.anchor.y) return this;
    else {
      this.attr(
        "transform",
        `translate(${this.anchor.x - this.topLeft.x}, ${this.anchor.y - this.topLeft.y})`
      );
      this.layout.move.x = this.anchor.x - this.topLeft.x;
      this.layout.move.y = this.anchor.y - this.topLeft.y;
    }
    return this;
  };
  Stack.prototype.getAnchor = function() {
    let anchorPoint = true;
    let gridAnchorPoint = true;
    const parts = this.getPartList();
    for (const part of parts) {
      if (typeof part.points.anchor === "undefined") anchorPoint = false;
      if (typeof part.points.gridAnchor === "undefined") gridAnchorPoint = false;
    }
    if (anchorPoint) return parts[0].points.anchor;
    if (gridAnchorPoint) return parts[0].points.gridAnchor;
    return new Point(0, 0);
  };
  Stack.prototype.attr = function(name, value, overwrite = false) {
    if (overwrite) this.attributes.set(name, value);
    else this.attributes.add(name, value);
    return this;
  };
  Stack.prototype.generateTransform = function(transforms) {
    const { move, rotate, flipX, flipY } = transforms;
    const generated = generateStackTransform(move?.x, move?.y, rotate, flipX, flipY, this);
    this.attributes.remove("transform");
    generated.forEach((t2) => this.attr("transform", t2));
    return this;
  };

  // node_modules/@freesewing/core/src/pattern/pattern-renderer.mjs
  function PatternRenderer(pattern) {
    this.pattern = pattern;
    this.autoLayout = pattern.autoLayout;
  }
  PatternRenderer.prototype.render = function() {
    this.__startRender();
    this.pattern.svg = this.svg;
    return this.svg.render();
  };
  PatternRenderer.prototype.getRenderProps = function() {
    this.pattern.store.log.info("Gathering render props");
    this.__startRender();
    this.svg.__runHooks("preRender");
    const props = {
      svg: this.svg.asRenderProps(),
      width: this.pattern.width,
      height: this.pattern.height,
      autoLayout: this.pattern.autoLayout,
      settings: this.pattern.settings,
      stacks: {}
    };
    for (let s in this.pattern.stacks) {
      if (!this.pattern.__isStackHidden(s)) {
        props.stacks[s] = this.pattern.stacks[s].asRenderProps();
      } else this.pattern.store.log.info(`Stack ${s} is hidden. Skipping in render props.`);
    }
    this.svg.__runHooks("postRender");
    return props;
  };
  PatternRenderer.prototype.__startRender = function() {
    this.svg = new Svg(this.pattern);
    this.svg.hooks = this.pattern.plugins.hooks;
    this.__pack();
    return this;
  };
  PatternRenderer.prototype.__stack = function() {
    this.stacks = {};
    const settings = this.pattern.settings;
    for (const set2 in settings) {
      for (const [name, part] of Object.entries(this.pattern.parts[set2])) {
        const stackName = settings[set2].stackPrefix + (typeof part.stack === "function" ? part.stack(settings[set2], name) : part.stack);
        if (typeof this.stacks[stackName] === "undefined")
          this.stacks[stackName] = this.__createStackWithContext(stackName, set2);
        this.stacks[stackName].addPart(part);
      }
    }
    this.pattern.stacks = this.stacks;
  };
  PatternRenderer.prototype.__pack = function() {
    this.pattern.__runHooks("preLayout");
    const { settings, setStores, activeSet } = this.pattern;
    for (const set2 in settings) {
      if (setStores[set2].logs.error.length > 0) {
        setStores[set2].log.warn(`One or more errors occured. Not packing pattern parts`);
        return this;
      }
    }
    this.__stack();
    let bins = [];
    for (const [key, stack] of Object.entries(this.stacks)) {
      stack.attributes.remove("transform");
      if (!this.pattern.__isStackHidden(key)) {
        stack.home();
        if (settings[activeSet].layout === true)
          bins.push({ id: key, width: stack.width, height: stack.height });
      }
    }
    if (settings[activeSet].layout === true) {
      const size = bins.length > 0 ? this.pattern.store.pack(bins, this) : { width: 0, height: 0 };
      this.autoLayout.width = size.width;
      this.autoLayout.height = size.height;
      for (let bin of bins) {
        let stack = this.stacks[bin.id];
        this.autoLayout.stacks[bin.id] = {
          move: {
            x: bin.x + stack.layout.move.x,
            y: bin.y + stack.layout.move.y
          }
        };
      }
    }
    const packedLayout = typeof settings[activeSet].layout === "object" ? settings[activeSet].layout : this.autoLayout;
    this.width = packedLayout.width;
    this.height = packedLayout.height;
    for (let stackId of Object.keys(packedLayout.stacks)) {
      if (this.stacks[stackId]) {
        let transforms = packedLayout.stacks[stackId];
        this.stacks[stackId].generateTransform(transforms);
      }
    }
    this.pattern.width = this.width;
    this.pattern.height = this.height;
    this.pattern.autoLayout = this.autoLayout;
    this.pattern.__runHooks("postLayout");
    return this;
  };
  PatternRenderer.prototype.__createStackWithContext = function(name) {
    const stack = new Stack();
    stack.name = name;
    stack.context = {
      config: this.pattern.config,
      settings: this.pattern.settings,
      setStores: this.pattern.setStores
    };
    return stack;
  };

  // node_modules/@freesewing/core/src/pattern/index.mjs
  var import_lodash4 = __toESM(require_lodash2(), 1);
  function Pattern(designConfig = {}) {
    this.designConfig = (0, import_lodash4.default)(designConfig);
    this.config = {};
    this.store = new Store();
    this.setStores = [];
    __addNonEnumProp(this, "width", 0);
    __addNonEnumProp(this, "height", 0);
    __addNonEnumProp(this, "autoLayout", { stacks: {} });
    __addNonEnumProp(this, "is", "");
    __addNonEnumProp(this, "Point", Point);
    __addNonEnumProp(this, "Path", Path);
    __addNonEnumProp(this, "Snippet", Snippet);
    __addNonEnumProp(this, "Attributes", Attributes);
    __addNonEnumProp(this, "__initialized", false);
    __addNonEnumProp(this, "config.parts", {});
    __addNonEnumProp(this, "config.resolvedDependencies", {});
    __addNonEnumProp(this, "plugins", new PatternPlugins(this));
    __addNonEnumProp(this, "__configResolver", new PatternConfig(this));
    return this;
  }
  Pattern.prototype.addPart = function(part, resolveImmediately = true) {
    if (this.__configResolver.isPartValid(part) && !this.designConfig.parts.find((p) => p.name == part.name)) {
      this.store.log.debug(`Adding Part \`${part.name}\` at runtime`);
      this.designConfig.parts.push(part);
      if (resolveImmediately) this.__configResolver.addPart(part);
    }
    return this;
  };
  Pattern.prototype.getConfig = function() {
    return this.__init().config;
  };
  Pattern.prototype.on = function(hook, method, data) {
    this.plugins.on(hook, method, data);
    return this;
  };
  Pattern.prototype.use = function(plugin9, data) {
    this.plugins.use(plugin9, data, this.settings);
    return this;
  };
  Pattern.prototype.draft = function() {
    this.__init();
    new PatternDrafter(this).draft();
    return this;
  };
  Pattern.prototype.draftPartForSet = function(partName, set2) {
    this.__init();
    return new PatternDrafter(this).draftPartForSet(partName, set2);
  };
  Pattern.prototype.render = function() {
    return new PatternRenderer(this).render();
  };
  Pattern.prototype.getRenderProps = function() {
    return new PatternRenderer(this).getRenderProps();
  };
  Pattern.prototype.getLogs = function() {
    return {
      pattern: this.store.logs,
      sets: this.setStores.map((store2) => store2.logs)
    };
  };
  Pattern.prototype.sample = function() {
    this.__init();
    const sampleSetting = this.settings[0].sample;
    if (sampleSetting.type === "option") {
      return this.sampleOption(sampleSetting.option);
    } else if (sampleSetting.type === "measurement") {
      return this.sampleMeasurement(sampleSetting.measurement);
    } else if (sampleSetting.type === "models") {
      return this.sampleModels(sampleSetting.models, sampleSetting.focus || false);
    }
    return this.draft();
  };
  Pattern.prototype.sampleMeasurement = function(measurementName) {
    return new PatternSampler(this).sampleMeasurement(measurementName);
  };
  Pattern.prototype.sampleModels = function(models, focus = false) {
    return new PatternSampler(this).sampleModels(models, focus);
  };
  Pattern.prototype.sampleOption = function(optionName) {
    return new PatternSampler(this).sampleOption(optionName);
  };
  Pattern.prototype.__applySettings = function(sets) {
    if (!Array.isArray(sets)) throw "Sets should be an array of settings objects";
    if (sets.length === 0) sets.push({});
    this.settings = [];
    for (let i = 0; i < sets.length; i++) {
      const set2 = { ...sets[i] };
      if (!set2.options) set2.options = {};
      if (!set2.measurements) set2.measurements = {};
      this.settings.push({
        ...__loadPatternDefaults(),
        ...set2,
        // Force creation of a new objects
        // so we don't reference the original
        options: { ...set2.options },
        measurements: { ...set2.measurements }
      });
    }
    return this;
  };
  Pattern.prototype.__extendPatternStore = function() {
    this.store.extend([...this.plugins.__storeMethods]);
    return this.store;
  };
  Pattern.prototype.__createSetStore = function() {
    const store2 = new Store();
    store2.set("data", this.store.data);
    store2.extend([...this.plugins.__storeMethods]);
    return store2;
  };
  Pattern.prototype.__init = function() {
    if (this.__initialized) return this;
    this.__runHooks("preInit");
    this.store.log.info(
      `New \`${this.designConfig.data?.name || "No Name"}:${this.designConfig.data?.version || "No version"}\` pattern using \`@freesewing/core:${version}\``
    );
    this.designConfig.parts.forEach((p) => this.__configResolver.addPart(p));
    this.__configResolver.logPartDistances();
    this.config = this.__configResolver.asConfig();
    this.plugins.loadConfigPlugins(this.config, this.settings);
    if (this.designConfig.data) this.store.set("data", this.designConfig.data);
    this.__loadOptionDefaults();
    this.store.log.info(
      `Pattern initialized. Draft order is: ${this.config.draftOrder.map((item) => `\`${item}\``).join(", ")}`
    );
    this.__runHooks("postInit");
    this.__initialized = true;
    return this;
  };
  Pattern.prototype.__loadOptionDefaults = function() {
    if (!this.config.options) this.config.options = {};
    if (Object.keys(this.config.options).length < 1) return this;
    for (const i in this.settings) {
      for (const [name, option] of Object.entries(this.config.options)) {
        if (typeof this.settings[i].options[name] === "undefined") {
          if (typeof option === "object") {
            if (typeof option.pct !== "undefined") this.settings[i].options[name] = option.pct / 100;
            else if (typeof option.mm !== "undefined") this.settings[i].options[name] = option.mm;
            else if (typeof option.deg !== "undefined") this.settings[i].options[name] = option.deg;
            else if (typeof option.count !== "undefined")
              this.settings[i].options[name] = option.count;
            else if (typeof option.bool !== "undefined") this.settings[i].options[name] = option.bool;
            else if (typeof option.dflt !== "undefined") this.settings[i].options[name] = option.dflt;
            else {
              let err = "Unknown option type: " + JSON.stringify(option);
              this.store.log.error(err);
              throw new Error(err);
            }
          } else this.settings[i].options[name] = option;
        }
      }
    }
    return this;
  };
  Pattern.prototype.__runHooks = function(hookName, data = false) {
    if (data === false) data = this;
    let hooks2 = this.plugins.hooks[hookName];
    if (hooks2.length > 0) {
      this.store.log.debug(`\u{1FA9D} Running \`${hookName}\` hooks`);
      for (let hook of hooks2) {
        hook.method(data, hook.data);
      }
    }
  };
  Pattern.prototype.__isPartHidden = function(partName) {
    let partForcedVisible = false;
    if (Array.isArray(this.settings[this.activeSet || 0].only)) {
      if (this.settings[this.activeSet || 0].only.includes(partName)) partForcedVisible = true;
    }
    if (!partForcedVisible && this.config.partHide?.[partName]) {
      return true;
    }
    if (!this.parts) {
      return false;
    }
    for (const stack of this.parts) {
      if (!stack[partName]?.hidden) return false;
    }
    return true;
  };
  Pattern.prototype.__isStackHidden = function(stackName) {
    if (!this.stacks[stackName]) return true;
    const parts = this.stacks[stackName].getPartList();
    for (const part of parts) {
      if (!part.hidden) {
        return false;
      }
    }
    return true;
  };
  Pattern.prototype.__needs = function(partName, set2 = 0) {
    if (typeof this.settings[set2].only === "undefined" || this.settings[set2].only === false || Array.isArray(this.settings[set2].only) && this.settings[set2].only.length === 0)
      return true;
    const only = typeof this.settings[set2].only === "string" ? [this.settings[set2].only] : this.settings[set2].only;
    for (const part of only) {
      if (part === partName) return true;
      if (this.config.resolvedDependencies[part]?.indexOf(partName) !== -1) return true;
    }
    return false;
  };
  Pattern.prototype.__wants = function(partName, set2 = 0) {
    if (this.__isPartHidden(partName)) return false;
    else if (typeof this.settings[set2].only === "string") return this.settings[set2].only === partName;
    else if (Array.isArray(this.settings[set2].only)) {
      for (const part of this.settings[set2].only) {
        if (part === partName) return true;
      }
      return false;
    }
    return true;
  };

  // node_modules/@freesewing/core/src/design.mjs
  function Design(designConfig) {
    designConfig = { ...__loadDesignDefaults(), ...designConfig };
    const pattern = function(...sets) {
      Pattern.call(this, designConfig);
      return this.__applySettings(sets);
    };
    pattern.prototype = Object.create(Pattern.prototype);
    pattern.prototype.constructor = pattern;
    pattern.designConfig = designConfig;
    pattern.patternConfig = new pattern().getConfig();
    return pattern;
  }

  // node_modules/@freesewing/core/about.json
  var about_default9 = {
    id: "core",
    description: "A library for creating made-to-measure sewing patterns",
    version: "4.10.1"
  };

  // node_modules/@freesewing/core/src/index.mjs
  var version = about_default9.version;

  // node_modules/@freesewing/bella/src/back.mjs
  var back = {
    name: "bella.back",
    measurements: [
      "highBust",
      "chest",
      "underbust",
      "waist",
      "waistBack",
      "bustSpan",
      "neck",
      "hpsToBust",
      "hpsToWaistFront",
      "hpsToWaistBack",
      "shoulderToShoulder",
      "shoulderSlope"
    ],
    options: {
      // Static
      acrossBackFactor: 0.925,
      shoulderSlopeBack: 1.23,
      neckWidthBack: 0.197,
      neckWidthFront: 0.17,
      backDartLocation: 0.145,
      backCenterWaistReduction: 0.35,
      collarFactor: 0.19,
      // Fit
      bustSpanEase: { pct: 10, min: 0, max: 20, ...pctBasedOn("bustSpan"), menu: "fit" },
      chestEase: { pct: 11, min: 5, max: 20, ...pctBasedOn("chest"), menu: "fit" },
      fullChestEaseReduction: { pct: 4, min: 0, max: 8, menu: "fit" },
      shoulderToShoulderEase: {
        pct: -0.5,
        min: -1,
        max: 5,
        ...pctBasedOn("shoulderToShoulder"),
        menu: "fit"
      },
      waistEase: { pct: 5, min: 1, max: 20, ...pctBasedOn("waist"), menu: "fit" },
      // Darts
      backDartHeight: { pct: 46, min: 38, max: 54, menu: "darts" },
      bustDartCurve: { pct: 100, min: -100, max: 100, menu: "darts" },
      bustDartLength: { pct: 90, min: 75, max: 100, menu: "darts" },
      bustDartAngle: { count: 0, min: -45, max: 45, menu: "darts" },
      bustDartMinimumFabric: { pct: 5, min: 1, max: 50, menu: "darts" },
      waistDartLength: { pct: 90, min: 75, max: 95, menu: "darts" },
      waistDartCurve: { pct: 100, min: -100, max: 100, menu: "darts" },
      // Armhole
      armholeDepth: { pct: 44, min: 38, max: 46, menu: "armhole" },
      backArmholeCurvature: { pct: 63, min: 50, max: 85, menu: "armhole" },
      backArmholePitchDepth: { pct: 35, max: 40, min: 30, menu: "armhole" },
      backArmholeSlant: { deg: 5, min: 1, max: 9, menu: "armhole" },
      frontArmholeCurvature: { pct: 63, min: 50, max: 85, menu: "armhole" },
      frontArmholePitchDepth: { pct: 29, max: 31, min: 27, menu: "armhole" },
      // Advanced
      backHemSlope: { deg: 2.5, min: 0, max: 5, menu: "advanced" },
      backNeckCutout: { pct: 6, min: 3, max: 9, menu: "advanced" },
      frontShoulderWidth: { pct: 95, max: 98, min: 92, menu: "advanced" },
      highBustWidth: { pct: 86, max: 92, min: 80, menu: "advanced" }
    },
    draft: ({
      store: store2,
      sa,
      Point: Point2,
      points,
      Path: Path2,
      paths,
      options,
      macro,
      utils: utils2,
      measurements: measurements3,
      log,
      part
    }) => {
      points.cbNeck = new Point2(0, measurements3.neck * options.backNeckCutout);
      points.hps = new Point2(measurements3.neck * options.neckWidthBack, 0);
      points.cbNeckCp1 = new Point2(points.hps.x * 0.8, points.cbNeck.y);
      let slope = measurements3.shoulderSlope * options.shoulderSlopeBack * -1;
      points.shoulder = utils2.beamsIntersect(
        new Point2(measurements3.shoulderToShoulder * (1 + options.shoulderToShoulderEase) / 2, 0),
        new Point2(measurements3.shoulderToShoulder * (1 + options.shoulderToShoulderEase) / 2, 100),
        points.hps,
        points.hps.shift(slope, 85)
      );
      points.armholePitch = new Point2(
        points.shoulder.x * options.acrossBackFactor,
        measurements3.hpsToWaistBack * options.backArmholePitchDepth
      );
      points.dartTip = new Point2(
        measurements3.underbust * options.backDartLocation,
        measurements3.hpsToWaistBack * options.backDartHeight
      );
      let backWidth = measurements3.underbust / 4 * (1 + options.chestEase);
      let waistWidth = measurements3.waistBack / 2 * (1 + options.waistEase);
      let reduction = backWidth - waistWidth;
      points.cbWaist = new Point2(0, measurements3.hpsToWaistBack);
      points.waistCenter = points.cbWaist.shift(0, reduction * options.backCenterWaistReduction);
      points.waistSide = points.waistCenter.shift(
        options.backHemSlope,
        waistWidth + reduction * (1 - options.backCenterWaistReduction / 2)
      );
      points.dartBottomCenter = utils2.beamIntersectsX(
        points.waistCenter,
        points.waistSide,
        points.dartTip.x
      );
      let backDartWidth = reduction * (1 - options.backCenterWaistReduction * 0.5);
      if (backDartWidth <= 0) {
        backDartWidth = 0;
        log.info(
          "`" + part.name + "`: Back dart omitted (because the calculated dart width was 0.0 mm/inches or less)."
        );
      }
      points.dartBottomLeft = points.dartBottomCenter.shift(180, backDartWidth / 2);
      points.dartBottomRight = points.dartBottomLeft.rotate(180, points.dartBottomCenter);
      points.dartLeftCp = points.dartBottomLeft.shift(
        90,
        points.dartTip.dy(points.dartBottomLeft) / 2
      );
      points.dartRightCp = new Point2(points.dartBottomRight.x, points.dartLeftCp.y);
      let armholeDepth = measurements3.hpsToWaistBack * options.armholeDepth + points.shoulder.y;
      points.cbNeckCp2 = new Point2(0, armholeDepth);
      let dartArmholeDepth = utils2.curveIntersectsY(
        points.dartBottomLeft,
        points.dartLeftCp,
        points.dartTip,
        points.dartTip,
        armholeDepth
      );
      let extra = 0;
      points.cbArmhole = utils2.curveIntersectsY(
        points.cbNeck,
        points.cbNeckCp2,
        points.waistCenter,
        points.waistCenter,
        armholeDepth
      );
      if (dartArmholeDepth) {
        points.dartLeftArmhole = dartArmholeDepth;
        extra = points.dartLeftArmhole.dx(points.dartTip) * 2 + points.cbArmhole.x;
      }
      points.armhole = new Point2(
        measurements3.underbust / 4 * (1 + options.chestEase) + extra,
        armholeDepth
      );
      points.waistSideCp2 = points.waistSide.shift(90, points.armhole.dy(points.waistSide) / 2);
      points.armholeCp2 = points.armhole.shift(180 - options.backArmholeSlant, 40);
      points.armholePitchCp1 = points.armholePitch.shift(-90 - options.backArmholeSlant, 40);
      points.armholeCpTarget = utils2.beamsIntersect(
        points.armhole,
        points.armhole.shift(180 - options.backArmholeSlant, 40),
        points.armholePitch,
        points.armholePitch.shift(-90 - options.backArmholeSlant, 40)
      );
      points.armholeCp2 = points.armhole.shiftFractionTowards(
        points.armholeCpTarget,
        options.backArmholeCurvature
      );
      points.armholePitchCp1 = points.armholePitch.shiftFractionTowards(
        points.armholeCpTarget,
        options.backArmholeCurvature
      );
      points.armholePitchCp2 = points.armholePitchCp1.rotate(180, points.armholePitch);
      if (points.armholePitchCp2.y < points.shoulder.y) {
        points.armholePitchCp2.y = points.shoulder.y + points.shoulder.dy(points.armholePitch) / 2;
      }
      if (measurements3.hpsToBust < points.waistCenter.y) {
        points.bustCenter = utils2.curveIntersectsY(
          points.cbNeck,
          points.cbNeckCp2,
          points.waistCenter,
          points.waistCenter,
          measurements3.hpsToBust
        );
      } else {
        log.warn("Unable to place bust above waist on center back seam. Using waist height instead.");
        store2.flag.warn({ msg: `bella:cbSeamBustBelowWaist` });
        points.bustCenter = points.waistCenter.clone();
      }
      if (points.bustCenter.y < points.armhole.y) {
        points.sideArmhole = points.armhole.clone();
        let sideArmholeTemp = new Path2().move(points.armhole).curve(points.armhole, points.waistSideCp2, points.waistSide).shiftAlong(10);
        points.sideArmhole = sideArmholeTemp.shiftOutwards(points.armhole, 100);
        points.bustSide = utils2.beamIntersectsY(
          points.armhole,
          points.sideArmhole,
          measurements3.hpsToBust
        );
      } else if (measurements3.hpsToBust < points.waistSide.y) {
        points.bustSide = utils2.curveIntersectsY(
          points.waistSide,
          points.waistSideCp2,
          points.armhole,
          points.armhole,
          measurements3.hpsToBust
        );
      } else {
        log.warn("Unable to place bust above waist on side back seam. Using waist height instead.");
        store2.flag.warn({ msg: `bella:sideSeamBustBelowWaist` });
        points.bustSide = points.waistSide.clone();
      }
      if (points.bustCenter.y < points.dartTip.y) {
        points.bustDartLeft = points.bustCenter.clone();
        points.bustDartLeft.x = points.dartTip.x;
      } else if (measurements3.hpsToBust < points.dartBottomLeft.y) {
        points.bustDartLeft = utils2.curveIntersectsY(
          points.dartBottomLeft,
          points.dartLeftCp,
          points.dartTip,
          points.dartTip,
          measurements3.hpsToBust
        );
      } else {
        log.warn("Unable to adjust bottom of dart on back part. Using unadjusted dart instead.");
        store2.flag.warn({ msg: `bella:bustDartCompromise` });
        points.bustDartLeft = points.dartBottomLeft.clone();
      }
      points.bustDartRight = points.bustDartLeft.flipX(points.dartTip);
      store2.set(
        "bustWidthBack",
        points.bustCenter.dx(points.bustDartLeft) + points.bustDartRight.dx(points.bustSide)
      );
      store2.set(
        "sideSeamLength",
        new Path2().move(points.waistSide).curve_(points.waistSideCp2, points.armhole).length()
      );
      store2.set(
        "backHemLength",
        points.waistCenter.dist(points.dartBottomLeft) + points.dartBottomRight.dist(points.waistSide)
      );
      store2.set("sideReduction", points.armhole.x - points.waistSide.x);
      paths.seam = new Path2().move(points.cbNeck).curve_(points.cbNeckCp2, points.waistCenter).line(points.dartBottomLeft);
      if (backDartWidth > 0)
        paths.seam.curve_(points.dartLeftCp, points.dartTip)._curve(points.dartRightCp, points.dartBottomRight);
      else paths.seam.line(points.dartBottomRight);
      paths.seam.line(points.waistSide).curve_(points.waistSideCp2, points.armhole).curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch).curve_(points.armholePitchCp2, points.shoulder).line(points.hps)._curve(points.cbNeckCp1, points.cbNeck).close().attr("class", "fabric");
      paths.saBase = new Path2().move(points.cbNeck).curve_(points.cbNeckCp2, points.waistCenter).line(points.dartBottomLeft).line(points.dartBottomRight).line(points.waistSide).curve_(points.waistSideCp2, points.armhole).curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch).curve_(points.armholePitchCp2, points.shoulder).line(points.hps)._curve(points.cbNeckCp1, points.cbNeck).close().hide();
      macro("grainline", {
        from: new Point2(points.hps.x / 2, points.shoulder.y),
        to: new Point2(points.hps.x / 2, points.waistSide.y)
      });
      if (sa) paths.sa = paths.saBase.offset(sa).attr("class", "fabric sa");
      store2.cutlist.addCut({ cut: 2, from: "fabric", onFold: true });
      points.titleAnchor = new Point2(points.hps.x, points.armholePitchCp2.y);
      macro("title", {
        nr: 2,
        title: "back",
        at: points.titleAnchor
      });
      macro("sprinkle", {
        snippet: "bnotch",
        on: ["armholePitch", "bustCenter"]
      });
      paths.armhole = new Path2().move(points.armhole).curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch).curve_(points.armholePitchCp2, points.shoulder).hide();
      paths.armholeToPitch = new Path2().move(points.armhole).curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch).hide();
      store2.set("library.sleeve.backArmholeLength", paths.armhole.length());
      store2.set("library.sleeve.backArmholeToArmholePitch", paths.armholeToPitch.length());
      macro("vd", {
        id: "hHemToWaistDartTop",
        from: points.waistCenter,
        to: points.dartTip,
        x: points.cbNeck.x - sa - 15
      });
      macro("vd", {
        id: "hHemToBackNeckCutout",
        from: points.waistCenter,
        to: points.cbNeck,
        x: points.cbNeck.x - sa - 30
      });
      macro("vd", {
        id: "hTotal",
        from: points.waistCenter,
        to: points.hps,
        x: points.cbNeck.x - sa - 45
      });
      macro("hd", {
        id: "wCbTopToCnBottom",
        from: points.cbNeck,
        to: points.waistCenter,
        y: points.waistCenter.y + sa + 15
      });
      let dimensionsOffset = 0;
      if (backDartWidth > 0) {
        dimensionsOffset = 30;
        macro("hd", {
          id: "wCbToWaistDartLeft",
          from: points.cbNeck,
          to: points.dartBottomLeft,
          y: points.waistCenter.y + sa + 30
        });
        macro("hd", {
          id: "wCbToWaistDartRight",
          from: points.cbNeck,
          to: points.dartBottomRight,
          y: points.waistCenter.y + sa + 45
        });
        macro("hd", {
          id: "wWaistDart",
          from: points.dartBottomLeft,
          to: points.dartBottomRight,
          y: points.waistCenter.y + sa + 15
        });
      }
      macro("hd", {
        id: "wCbToHemEdge",
        from: points.cbNeck,
        to: points.waistSide,
        y: points.waistCenter.y + sa + 30 + dimensionsOffset
      });
      macro("hd", {
        id: "wTotal",
        from: points.cbNeck,
        to: points.armhole,
        y: points.waistCenter.y + sa + 45 + dimensionsOffset
      });
      macro("vd", {
        id: "hHemRightToArmhole",
        from: points.waistSide,
        to: points.armhole,
        x: points.armhole.x + sa + 15
      });
      macro("vd", {
        id: "hHemRightToArmholePitch",
        from: points.waistSide,
        to: points.armholePitch,
        x: points.armhole.x + sa + 30
      });
      macro("vd", {
        id: "hHemRightToArmholeShoulder",
        from: points.waistSide,
        to: points.shoulder,
        x: points.armhole.x + sa + 45
      });
      macro("vd", {
        id: "hTotal",
        from: points.waistSide,
        to: points.hps,
        x: points.armhole.x + sa + 60
      });
      macro("vd", {
        id: "hemRiseRight",
        from: points.waistCenter,
        to: points.waistSide,
        x: points.waistSide.x + sa + 15
      });
      macro("hd", {
        id: "wCbToHps",
        from: points.cbNeck,
        to: points.hps,
        y: points.hps.y - sa - 15
      });
      macro("hd", {
        id: "wCbToArmholePitch",
        from: points.cbNeck,
        to: points.armholePitch,
        y: points.hps.y - sa - 30
      });
      macro("hd", {
        id: "wCbToShoulder",
        from: points.cbNeck,
        to: points.shoulder,
        y: points.hps.y - sa - 45
      });
      macro("hd", {
        id: "wCbToArmhole",
        from: points.cbNeck,
        to: points.armhole,
        y: points.hps.y - sa - 60
      });
      macro("ld", {
        id: "shoulderLength",
        from: points.hps,
        to: points.shoulder,
        d: 10 + sa
      });
      return part;
    }
  };

  // node_modules/@freesewing/bella/src/front-side-dart.mjs
  var frontSideDart = {
    name: "bella.frontSideDart",
    after: back,
    draft: ({
      store: store2,
      sa,
      Point: Point2,
      points,
      Path: Path2,
      paths,
      options,
      complete,
      macro,
      utils: utils2,
      measurements: measurements3,
      log,
      part
    }) => {
      points.cfNeck = new Point2(0, measurements3.neck * options.collarFactor);
      points.hps = new Point2(measurements3.neck * options.neckWidthFront, 0);
      points.cfNeckCp1 = new Point2(points.hps.x * 0.8, points.cfNeck.y);
      points.hpsCp2 = new Point2(points.hps.x, points.cfNeck.y / 2);
      let slope = measurements3.shoulderSlope * (2 - options.shoulderSlopeBack) * -1;
      let xShoulder = measurements3.shoulderToShoulder * (1 + options.shoulderToShoulderEase) / 2 * options.frontShoulderWidth;
      points.shoulder = utils2.beamsIntersect(
        new Point2(xShoulder, 0),
        new Point2(xShoulder, 100),
        points.hps,
        points.hps.shift(slope, 85)
      );
      points.ex = points.shoulder.shift(180, 10);
      points.armholePitch = new Point2(
        points.shoulder.x * options.acrossBackFactor,
        measurements3.hpsToWaistBack * options.frontArmholePitchDepth
      );
      let armholeDepth = measurements3.hpsToWaistBack * options.armholeDepth + points.shoulder.y;
      points.armhole = new Point2(
        measurements3.highBust / 4 * (1 + options.chestEase) * options.highBustWidth,
        armholeDepth
      );
      points.bust = new Point2(
        measurements3.bustSpan * 0.5 * (1 + options.bustSpanEase),
        measurements3.hpsToBust
      );
      points.armholeCp2 = points.armhole.shift(180, 40);
      points.armholePitchCp1 = points.armholePitch.shift(-90, 40);
      points.armholeCpTarget = utils2.beamsIntersect(
        points.armhole,
        points.armhole.shift(180, 40),
        points.armholePitch,
        points.armholePitch.shift(-90, 40)
      );
      points.armholeCp2 = points.armhole.shiftFractionTowards(
        points.armholeCpTarget,
        options.frontArmholeCurvature
      );
      points.armholePitchCp1 = points.armholePitch.shiftFractionTowards(
        points.armholeCpTarget,
        options.frontArmholeCurvature
      );
      points.armholePitchCp2 = points.armholePitchCp1.rotate(180, points.armholePitch);
      if (points.armholePitchCp2.y < points.shoulder.y) {
        points.armholePitchCp2.y = points.shoulder.y + points.shoulder.dy(points.armholePitch) / 2;
      }
      points.cfHem = new Point2(0, measurements3.hpsToWaistFront);
      points.sideHem = new Point2(points.armhole.x, points.cfHem.y);
      let target = measurements3.chest * (1 + options.chestEase - options.fullChestEaseReduction) / 2 - store2.get("bustWidthBack");
      let rot = ["armhole", "armholeCp2", "armholePitchCp1", "bustB", "sideHem"];
      points.bustA = points.bust.clone();
      points.bustB = points.bust.clone();
      points.bustSide = utils2.beamIntersectsY(points.armhole, points.sideHem, points.bust.y);
      let steps = 0;
      let angle = 0;
      let increment = 0.5;
      while (points.bustSide.x < target && steps < 80) {
        for (const p of rot) points[p] = points[p].rotate(increment, points.armholePitch);
        angle += increment;
        points.bustSide = utils2.beamIntersectsY(points.armhole, points.sideHem, points.bust.y);
        steps++;
      }
      store2.set("bustDartAngleSide", angle);
      points.cfBust = new Point2(0, points.bust.y);
      points.pitchMax = utils2.beamsIntersect(
        points.armholePitchCp1,
        points.armholePitchCp2,
        points.armholePitch,
        points.armholePitch.shift(points.armholePitchCp1.angle(points.armholePitchCp2) - 90, 30)
      );
      points.armholePitch = points.armholePitch.shiftFractionTowards(points.pitchMax, 0.2);
      points.armholePitchCp1 = points.armholePitch.shiftFractionTowards(
        points.armholePitchCp2.rotate(180, points.armholePitch),
        0.8
      );
      const sideSeamLength = store2.get("sideSeamLength");
      const minimumFabric = sideSeamLength * options.bustDartMinimumFabric;
      points.bustDartTop = utils2.beamsIntersect(
        points.armhole,
        points.sideHem,
        points.bust,
        points.bust.shift(Number(options.bustDartAngle), 100)
      );
      if (points.bustDartTop.y < points.armhole.y + minimumFabric) {
        points.bustDartTop = points.armhole.shiftTowards(points.sideHem, minimumFabric);
        log.info(
          part.name + ": Restricted bust dart angle to ensure minimum fabric above the bust dart."
        );
      }
      if (points.armhole.dist(points.bustDartTop) > sideSeamLength - minimumFabric) {
        points.bustDartTop = points.armhole.shiftTowards(
          points.sideHem,
          sideSeamLength - minimumFabric
        );
        log.info(
          part.name + ": Restricted bust dart angle to ensure minimum fabric below the bust dart."
        );
      }
      points.bustDartBottom = points.bustDartTop.rotate(angle * -1, points.bust);
      points.bustDartMiddle = points.bustDartTop.shiftFractionTowards(points.bustDartBottom, 0.5);
      points.bustDartTip = points.bustDartMiddle.shiftFractionTowards(
        points.bust,
        options.bustDartLength
      );
      points.bustDartEdge = utils2.beamsIntersect(
        points.bust,
        points.bustDartMiddle,
        points.armhole,
        points.bustDartTop
      );
      points.bustDartCpTop = points.bust.shiftFractionTowards(points.bustDartTop, 0.666).rotate(5 * options.bustDartCurve, points.bust);
      points.bustDartCpBottom = points.bust.shiftFractionTowards(points.bustDartBottom, 0.666).rotate(-5 * options.bustDartCurve, points.bust);
      const aboveDart = points.armhole.dist(points.bustDartTop);
      const belowDart = sideSeamLength - aboveDart;
      points.sideHemInitial = points.bustDartBottom.shift(-90, belowDart).shift(180, store2.get("sideReduction"));
      points.sideHem = points.bustDartBottom.shiftTowards(points.sideHemInitial, belowDart);
      let hemLen = measurements3.waist / 2 * (1 + options.waistEase) - store2.get("backHemLength");
      let reduce = points.cfHem.dist(points.sideHemInitial) - hemLen;
      let includeWaistDart = true;
      if (reduce <= 0) {
        includeWaistDart = false;
        log.info(
          "`" + part.name + "`: Front waist dart omitted (because the calculated dart width was 0.0 mm/inches or less)."
        );
      }
      points.waistDartHem = new Point2(points.bust.x, points.cfHem.y);
      points.waistDartLeft = points.waistDartHem.shift(180, reduce / 2);
      points.waistDartRight = points.waistDartHem.shift(0, reduce / 2);
      points.waistDartTip = points.waistDartHem.shiftFractionTowards(
        points.bust,
        options.waistDartLength
      );
      points.waistDartLeftCp = points.waistDartLeft.shift(
        90,
        points.waistDartHem.dist(points.bust) / 2
      );
      points.waistDartRightCp = points.waistDartRight.shift(
        90,
        points.waistDartHem.dist(points.bust) / 2
      );
      points.waistDartLeftMid = new Path2().move(points.bust).line(points.waistDartLeft).shiftFractionAlong(0.5);
      points.waistDartRightMid = new Path2().move(points.bust).line(points.waistDartRight).shiftFractionAlong(0.5);
      const waistDartCpWidth = points.waistDartLeftMid.dist(points.waistDartLeftCp) * options.waistDartCurve;
      points.waistDartLeftCp.x = points.waistDartLeftMid.x - waistDartCpWidth;
      points.waistDartRightCp.x = points.waistDartRightMid.x + waistDartCpWidth;
      paths.seam = new Path2().move(points.cfHem);
      if (includeWaistDart)
        paths.seam.line(points.waistDartLeft).curve_(points.waistDartLeftCp, points.waistDartTip)._curve(points.waistDartRightCp, points.waistDartRight).line(points.waistDartRight);
      paths.seam.line(points.sideHem).line(points.bustDartBottom)._curve(points.bustDartCpBottom, points.bustDartTip).curve_(points.bustDartCpTop, points.bustDartTop).line(points.armhole).curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch).curve_(points.armholePitchCp2, points.shoulder).line(points.hps).curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck).line(points.cfHem).close().attr("class", "fabric");
      paths.saBase = new Path2().move(points.cfHem);
      if (includeWaistDart) paths.saBase.line(points.waistDartLeft).line(points.waistDartRight);
      paths.saBase.line(points.sideHem).line(points.bustDartBottom).line(points.bustDartEdge).line(points.bustDartTop).line(points.armhole).curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch).curve_(points.armholePitchCp2, points.shoulder).line(points.hps).curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck).hide();
      if (complete)
        paths.dart = new Path2().move(points.bustDartTop).line(points.bustDartEdge).line(points.bustDartBottom).attr("class", "help");
      if (sa) {
        paths.sa = paths.saBase.offset(sa).line(points.cfNeck).attr("class", "fabric sa");
        paths.sa = paths.sa.move(points.cfHem).line(paths.sa.start());
      }
      store2.cutlist.addCut({ cut: 1, from: "fabric", onFold: true });
      macro("cutonfold", {
        from: points.cfNeck,
        to: points.cfHem,
        grainline: true,
        reverse: true
      });
      points.titleAnchor = new Point2(points.armholePitch.x / 2, points.armholePitchCp2.y);
      macro("title", {
        at: points.titleAnchor,
        nr: 1,
        title: "frontSideDart"
      });
      points.scaleboxAnchor = points.titleAnchor.shift(-90, 70);
      macro("scalebox", { at: points.scaleboxAnchor });
      macro("sprinkle", {
        snippet: "notch",
        on: ["bust", "armholePitch", "cfBust"]
      });
      paths.armhole = new Path2().move(points.armhole).curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch).curve_(points.armholePitchCp2, points.shoulder).hide();
      paths.armholeToPitch = new Path2().move(points.armhole).curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch).hide();
      store2.set("library.sleeve.frontArmholeLength", paths.armhole.length());
      store2.set("library.sleeve.frontArmholeToArmholePitch", paths.armholeToPitch.length());
      store2.set("library.sleeve.title", { nr: 3 });
      let dimensionOffset = 0;
      if (includeWaistDart) {
        dimensionOffset = 15;
        macro("vd", {
          id: "hCfHemToWaistDartTop",
          from: points.cfHem,
          to: points.waistDartTip,
          x: 0 - 15
        });
      }
      macro("vd", {
        id: "hCfHemToBustPoint",
        from: points.cfHem,
        to: points.bust,
        x: 0 - 15 - dimensionOffset
      });
      macro("vd", {
        id: "hCfHemToNeckCutout",
        from: points.cfHem,
        to: points.cfNeck,
        x: 0 - 30 - dimensionOffset
      });
      macro("vd", {
        id: "hTotal",
        from: points.cfHem,
        to: points.hps,
        x: 0 - 45 - dimensionOffset
      });
      macro("hd", {
        id: "wCfToWaistDartTip",
        from: points.cfBust,
        to: points.bust,
        y: points.bust.y - 15
      });
      macro("hd", {
        id: "wCfToBustDartTip",
        from: points.cfBust,
        to: points.bustDartTip,
        y: points.bust.y - 30
      });
      dimensionOffset = 0;
      if (includeWaistDart) {
        dimensionOffset = 30;
        macro("hd", {
          id: "wCfToWaistDartLeft",
          from: points.cfHem,
          to: points.waistDartLeft,
          y: points.cfHem.y + sa + 15
        });
        macro("hd", {
          id: "wCfToWaistDartRight",
          from: points.cfHem,
          to: points.waistDartRight,
          y: points.cfHem.y + sa + 30
        });
      }
      macro("hd", {
        id: "wHemTotal",
        from: points.cfHem,
        to: points.sideHem,
        y: points.cfHem.y + sa + 15 + dimensionOffset
      });
      macro("hd", {
        id: "wCfHemToBustDartBottom",
        from: points.cfHem,
        to: points.bustDartBottom,
        y: points.cfHem.y + sa + 30 + dimensionOffset
      });
      macro("hd", {
        id: "wCfHemToBustDartTop",
        from: points.cfHem,
        to: points.bustDartTop,
        y: points.cfHem.y + sa + 45 + dimensionOffset
      });
      macro("vd", {
        id: "hHemRightToBustDartBottom",
        from: points.sideHem,
        to: points.bustDartBottom,
        x: points.bustDartTop.x + sa + 15
      });
      macro("vd", {
        id: "hHemRightToBustDartTop",
        from: points.sideHem,
        to: points.bustDartTop,
        x: points.bustDartTop.x + sa + 30
      });
      macro("vd", {
        id: "hHemRightToArmhole",
        from: points.sideHem,
        to: points.armhole,
        x: points.bustDartTop.x + sa + 45
      });
      macro("vd", {
        id: "hHemRightToArmholePitch",
        from: points.sideHem,
        to: points.armholePitch,
        x: points.bustDartTop.x + sa + 60
      });
      macro("vd", {
        id: "hHemRightToShoulder",
        from: points.sideHem,
        to: points.shoulder,
        x: points.bustDartTop.x + sa + 75
      });
      macro("hd", {
        id: "wCbToHps",
        from: points.cfNeck,
        to: points.hps,
        y: points.hps.y - sa - 15
      });
      macro("hd", {
        id: "wCbToArmholePitch",
        from: points.cfNeck,
        to: points.armholePitch,
        y: points.hps.y - sa - 30
      });
      macro("hd", {
        id: "wCbToShoulder",
        from: points.cfNeck,
        to: points.shoulder,
        y: points.hps.y - sa - 45
      });
      macro("hd", {
        id: "wCbToArmhole",
        from: points.cfNeck,
        to: points.armhole,
        y: points.hps.y - sa - 60
      });
      return part;
    }
  };

  // node_modules/@freesewing/models/src/neckstimate.mjs
  var CISFEMALE = 0;
  var CISMALE = 1;
  var base = {
    ankle: [245, 235],
    biceps: [270, 350],
    bustFront: [480, 560],
    // FIXME: Estimate
    bustPointToUnderbust: [100, 60],
    // FIXME: Estimate
    bustSpan: [160, 190],
    // FIXME: Estimate
    chest: [925, 1e3],
    crossSeam: [740, 870],
    crossSeamFront: [370, 410],
    crotchDepth: [270, 340],
    heel: [315, 360],
    head: [565, 590],
    highBust: [865, 1030],
    highBustFront: [440, 570],
    // FIXME: Estimate
    hips: [900, 840],
    hpsToBust: [275, 280],
    hpsToWaistBack: [395, 470],
    hpsToWaistFront: [400, 460],
    // FIXME: Estimate
    inseam: [765, 780],
    knee: [380, 410],
    neck: [340, 380],
    seat: [1010, 1020],
    seatBack: [520, 560],
    shoulderSlope: [13, 13],
    shoulderToElbow: [340, 360],
    shoulderToShoulder: [415, 450],
    shoulderToWrist: [590, 630],
    underbust: [780, 980],
    // FIXME: Estimate
    upperLeg: [570, 625],
    waist: [750, 810],
    waistBack: [380, 410],
    waistToArmpit: [170, 210],
    waistToFloor: [1050, 1160],
    waistToHips: [125, 130],
    waistToKnee: [600, 640],
    waistToSeat: [250, 270],
    waistToUnderbust: [80, 55],
    // FIXME: Estimate
    waistToUpperLeg: [285, 340],
    wrist: [165, 175]
  };
  var a = 0.5;
  var c = 1;
  var v = 0.65;
  var ratio = {
    // Arc measurements
    bustFront: a,
    bustBack: a,
    bustPointToUnderbust: a,
    bustSpan: a,
    highBustBack: a,
    highBustFront: a,
    // Circumference measurements
    ankle: c,
    biceps: c,
    chest: c,
    highBust: c,
    hips: c,
    neck: c,
    underbust: c,
    // Vertical measurements
    crotchDepth: v,
    hpsToBust: v,
    hpsToWaistBack: v,
    hpsToWaistFront: v,
    waistToArmpit: v,
    waistToHips: v,
    waistToKnee: v,
    waistToSeat: v,
    waistToUnderbust: v,
    waistToUpperLeg: v,
    // Other
    crossSeam: 0.6,
    crossSeamFront: 0.6,
    crossSeamBack: 0.6,
    head: 0.35,
    heel: 0.25,
    inseam: 0.25,
    knee: 0.65,
    seat: 0.6,
    seatBack: 0.6,
    seatBackArc: 0.6,
    seatFront: 0.6,
    seatFrontArc: 0.6,
    shoulderToElbow: 0.5,
    shoulderToShoulder: 0.65,
    shoulderToWrist: 0.3,
    upperLeg: 0.45,
    waist: 0.85,
    waistBack: 0.85,
    waistBackArc: 0.85,
    waistFront: 0.85,
    waistFrontArc: 0.85,
    waistToFloor: 0.4,
    wrist: 0.5
  };
  var measurements2 = Object.keys(base);
  var neckstimate = (neck = false, measurement = false, i = 0, noRound = false) => {
    if (typeof base[measurement] === "undefined") {
      console.log(new Error(`neckstimate() called with an invalid measurement name (${measurement})`));
      return null;
    }
    if (!measurement) {
      throw new Error(
        "new neckstimate() requires a valid measurement name as second parameter. (received " + JSON.stringify(measurement) + ")"
      );
    }
    if (measurement === "shoulderSlope") return base.shoulderSlope[i];
    if (!neck) throw new Error("neckstimate() requires a neck measurement in mm as first parameter");
    const delta = neck / base.neck[i] * base[measurement][i] - base[measurement][i];
    return noRound ? base[measurement][i] + delta * ratio[measurement] : Math.round(base[measurement][i] + delta * ratio[measurement]);
  };

  // node_modules/@freesewing/models/src/index.mjs
  var getMeasurements = (size, index) => {
    const all = {};
    for (const m of measurements2) {
      all[m] = neckstimate(size * 10, m, index);
    }
    return all;
  };
  var multiplyMeasurements = (factor, index) => {
    const all = {};
    const base2 = index === 0 ? "340" : "380";
    for (const m of measurements2) {
      if (degreeMeasurements.indexOf(m) !== -1)
        all[m] = neckstimate(base2, m, index);
      else all[m] = factor * neckstimate(base2, m, index);
    }
    return all;
  };
  var cisFemaleAdult28 = getMeasurements(28, CISFEMALE);
  var cisFemaleAdult30 = getMeasurements(30, CISFEMALE);
  var cisFemaleAdult32 = getMeasurements(32, CISFEMALE);
  var cisFemaleAdult34 = getMeasurements(34, CISFEMALE);
  var cisFemaleAdult36 = getMeasurements(36, CISFEMALE);
  var cisFemaleAdult38 = getMeasurements(38, CISFEMALE);
  var cisFemaleAdult40 = getMeasurements(40, CISFEMALE);
  var cisFemaleAdult42 = getMeasurements(42, CISFEMALE);
  var cisFemaleAdult44 = getMeasurements(44, CISFEMALE);
  var cisFemaleAdult46 = getMeasurements(46, CISFEMALE);
  var cisMaleAdult32 = getMeasurements(32, CISMALE);
  var cisMaleAdult34 = getMeasurements(34, CISMALE);
  var cisMaleAdult36 = getMeasurements(36, CISMALE);
  var cisMaleAdult38 = getMeasurements(38, CISMALE);
  var cisMaleAdult40 = getMeasurements(40, CISMALE);
  var cisMaleAdult42 = getMeasurements(42, CISMALE);
  var cisMaleAdult44 = getMeasurements(44, CISMALE);
  var cisMaleAdult46 = getMeasurements(46, CISMALE);
  var cisMaleAdult48 = getMeasurements(48, CISMALE);
  var cisMaleAdult50 = getMeasurements(50, CISMALE);
  var cisFemaleDoll10 = multiplyMeasurements(0.1, CISFEMALE);
  var cisFemaleDoll20 = multiplyMeasurements(0.2, CISFEMALE);
  var cisFemaleDoll30 = multiplyMeasurements(0.3, CISFEMALE);
  var cisFemaleDoll40 = multiplyMeasurements(0.4, CISFEMALE);
  var cisFemaleDoll50 = multiplyMeasurements(0.5, CISFEMALE);
  var cisFemaleDoll60 = multiplyMeasurements(0.6, CISFEMALE);
  var cisMaleDoll10 = multiplyMeasurements(0.1, CISMALE);
  var cisMaleDoll20 = multiplyMeasurements(0.2, CISMALE);
  var cisMaleDoll30 = multiplyMeasurements(0.3, CISMALE);
  var cisMaleDoll40 = multiplyMeasurements(0.4, CISMALE);
  var cisMaleDoll50 = multiplyMeasurements(0.5, CISMALE);
  var cisMaleDoll60 = multiplyMeasurements(0.6, CISMALE);
  var cisFemaleGiant150 = multiplyMeasurements(1.5, CISFEMALE);
  var cisFemaleGiant200 = multiplyMeasurements(2, CISFEMALE);
  var cisFemaleGiant250 = multiplyMeasurements(2.5, CISFEMALE);
  var cisFemaleGiant300 = multiplyMeasurements(3, CISFEMALE);
  var cisMaleGiant150 = multiplyMeasurements(1.5, CISMALE);
  var cisMaleGiant200 = multiplyMeasurements(2, CISMALE);
  var cisMaleGiant250 = multiplyMeasurements(2.5, CISMALE);
  var cisMaleGiant300 = multiplyMeasurements(3, CISMALE);

  // js/pattern-source.js
  var Bodice = new Design({ parts: [back, frontSideDart] });
  var version2 = 2;
  var customer = { bust: 92.5, waist: 75, hips: 101, shoulder: 41.5, backLength: 39.5, frontLength: 40, bustHeight: 27.5, bustSpan: 16, neck: 34, highBust: 86.5, underbust: 78, shoulderSlope: 13, skirtLength: 60 };
  var limits = { bust: [84, 104], waist: [66, 88], hips: [90, 116], shoulder: [37, 45], backLength: [36, 44], frontLength: [37, 46], bustHeight: [24, 31], bustSpan: [14, 21], neck: [31, 39], highBust: [78, 100], underbust: [70, 94], shoulderSlope: [8, 20], skirtLength: [45, 75] };
  var xy = (p) => ({ x: p.x, y: p.y });
  var line = (a2, b) => new Path().move(a2).line(b);
  var distance = (a2, b) => Math.hypot(a2.x - b.x, a2.y - b.y);
  function flatten(path, spacing = 3) {
    const result = [];
    let last, start;
    for (const op of path.ops) {
      if (op.type === "move") {
        last = op.to;
        start = op.to;
        result.push(xy(last));
        continue;
      }
      const end = op.type === "close" ? start : op.to;
      const len = op.type === "curve" ? distance(last, op.cp1) + distance(op.cp1, op.cp2) + distance(op.cp2, end) : distance(last, end);
      const count = Math.max(1, Math.ceil(len / spacing));
      for (let i = 1; i <= count; i++) {
        const t2 = i / count, u = 1 - t2;
        result.push(op.type === "curve" ? {
          x: u ** 3 * last.x + 3 * u * u * t2 * op.cp1.x + 3 * u * t2 * t2 * op.cp2.x + t2 ** 3 * end.x,
          y: u ** 3 * last.y + 3 * u * u * t2 * op.cp1.y + 3 * u * t2 * t2 * op.cp2.y + t2 ** 3 * end.y
        } : { x: last.x + (end.x - last.x) * t2, y: last.y + (end.y - last.y) * t2 });
      }
      last = end;
    }
    return result;
  }
  function mark(label, path, type = "seam") {
    return { label, points: flatten(path), type };
  }
  function bodicePiece(part, front) {
    const p = part.points;
    const outline = flatten(part.paths.saBase);
    const cut = flatten(part.paths.saBase.offset(15));
    const waist = front ? [line(p.cfHem, p.waistDartLeft), line(p.waistDartRight, p.sideHem)] : [line(p.waistCenter, p.dartBottomLeft), line(p.dartBottomRight, p.waistSide)];
    const neckline = front ? new Path().move(p.hps).curve(p.hpsCp2, p.cfNeckCp1, p.cfNeck) : new Path().move(p.hps)._curve(p.cbNeckCp1, p.cbNeck);
    const side = front ? [line(p.armhole, p.bustDartTop), line(p.bustDartBottom, p.sideHem)] : [new Path().move(p.waistSide).curve_(p.waistSideCp2, p.armhole)];
    const darts = front ? [
      mark("\u80F8\u7701 \xB7 \u7F1D\u5408\u4E0D\u526A\u5F00", new Path().move(p.bustDartBottom)._curve(p.bustDartCpBottom, p.bustDartTip).curve_(p.bustDartCpTop, p.bustDartTop), "dart"),
      mark("\u8170\u7701 \xB7 \u7F1D\u5408\u4E0D\u526A\u5F00", new Path().move(p.waistDartLeft).curve_(p.waistDartLeftCp, p.waistDartTip)._curve(p.waistDartRightCp, p.waistDartRight), "dart")
    ] : [mark("\u80CC\u8170\u7701 \xB7 \u7F1D\u5408\u4E0D\u526A\u5F00", new Path().move(p.dartBottomLeft).curve_(p.dartLeftCp, p.dartTip)._curve(p.dartRightCp, p.dartBottomRight), "dart")];
    return {
      outline,
      cut,
      fold: front ? [xy(p.cfHem), xy(p.cfNeck)] : null,
      waistLength: waist.reduce((sum, path) => sum + path.length(), 0),
      sideLength: side.reduce((sum, path) => sum + path.length(), 0),
      marks: [
        mark("A \xB7 \u80A9\u7F1D", line(p.shoulder, p.hps)),
        ...side.map((path) => mark("B \xB7 \u4E0A\u8EAB\u4FA7\u7F1D", path)),
        ...waist.map((path) => mark("C \xB7 \u8170\u8282\u63A5\u7F1D", path)),
        mark("\u9886\u53E3 \xB7 \u4FDD\u7559\u5F00\u53E3", neckline, "opening"),
        mark("\u8896\u7ABF \xB7 \u4FDD\u7559\u5F00\u53E3", part.paths.armhole, "opening"),
        ...darts,
        ...!front ? [mark("D \xB7 \u540E\u4E2D\u62C9\u94FE\u5F00\u53E3", new Path().move(p.cbNeck).curve_(p.cbNeckCp2, p.waistCenter), "opening")] : []
      ],
      notch: xy(p.armholePitch),
      grain: [xy(front ? p.cfBust : p.bustCenter), xy(front ? p.cfHem : p.waistCenter)]
    };
  }
  function arc(radius, from, to, originY) {
    const count = Math.max(2, Math.ceil(Math.abs(to - from) * radius / 3));
    return Array.from({ length: count + 1 }, (_, i) => {
      const angle = from + (to - from) * i / count;
      return { x: Math.sin(angle) * radius, y: Math.cos(angle) * radius + originY };
    });
  }
  function interpolate(a2, b) {
    return flatten(line(new Point(a2.x, a2.y), new Point(b.x, b.y)));
  }
  function skirtPiece(waistLength, radius, length, front) {
    const angle = waistLength / radius, rOuter = radius + length;
    const waist = arc(radius, angle, 0, -radius), hem = arc(rOuter, 0, angle, -radius);
    const outline = [...hem, ...interpolate(hem.at(-1), waist[0]), ...waist];
    const rCutHem = rOuter + 30, rCutWaist = radius - 15;
    const cutHem = arc(rCutHem, front ? 0 : -Math.asin(15 / rCutHem), angle + Math.asin(15 / rCutHem), -radius);
    const cutWaist = arc(rCutWaist, angle + Math.asin(15 / rCutWaist), front ? 0 : -Math.asin(15 / rCutWaist), -radius);
    const cut = [...cutHem, ...interpolate(cutHem.at(-1), cutWaist[0]), ...cutWaist];
    if (!front) cut.push(...interpolate(cut.at(-1), cut[0]));
    const side = [hem.at(-1), waist[0]];
    return {
      outline,
      cut,
      fold: front ? [waist.at(-1), hem[0]] : null,
      waistLength,
      sideLength: length,
      marks: [
        { label: "C \xB7 \u8170\u8282\u63A5\u7F1D", points: waist, type: "seam" },
        { label: "E \xB7 \u88D9\u4FA7\u7F1D", points: side, type: "seam" },
        { label: "F \xB7 \u4E0B\u6446\u6298\u8FB9 3 cm", points: hem, type: "hem" },
        ...!front ? [
          { label: "D \xB7 \u62C9\u94FE\u5EF6\u957F 20 cm", points: [{ x: 0, y: 0 }, { x: 0, y: 200 }], type: "opening" },
          { label: "G \xB7 \u540E\u4E2D\u7F1D", points: [{ x: 0, y: 200 }, { x: 0, y: length }], type: "seam" }
        ] : []
      ],
      notch: waist[Math.floor(waist.length / 2)],
      grain: [{ x: 20, y: 60 }, { x: 20, y: length - 60 }]
    };
  }
  function generate(input) {
    const size = {};
    for (const [key, [min2, max2]] of Object.entries(limits)) {
      const value = Number(input[key] ?? customer[key]);
      if (!Number.isFinite(value) || value < min2 || value > max2) throw new Error(`\u91CF\u4F53\u503C\u8D85\u51FA\u672C\u539F\u578B\u8303\u56F4\uFF1A${key}`);
      size[key] = value;
    }
    if (size.highBust > size.bust || size.underbust >= size.bust || size.waist >= size.bust || size.hips <= size.waist) throw new Error("\u8BF7\u68C0\u67E5\u80F8\u56F4\u3001\u4E0A\u80F8\u56F4\u3001\u4E0B\u80F8\u56F4\u3001\u8170\u56F4\u548C\u81C0\u56F4\u7684\u5173\u7CFB");
    const m = {
      ...cisFemaleAdult34,
      chest: size.bust * 10,
      waist: size.waist * 10,
      waistBack: size.waist * 10 * 380 / 750,
      shoulderToShoulder: size.shoulder * 10,
      hpsToWaistBack: size.backLength * 10,
      hpsToWaistFront: size.frontLength * 10,
      hpsToBust: size.bustHeight * 10,
      bustSpan: size.bustSpan * 10,
      neck: size.neck * 10,
      highBust: size.highBust * 10,
      underbust: size.underbust * 10,
      shoulderSlope: size.shoulderSlope
    };
    const drafted = new Bodice({ measurements: m, sa: 0, options: { chestEase: 0.08, fullChestEaseReduction: 0.03, waistEase: 0.04, bustDartCurve: 0, waistDartCurve: 0 } }).draft();
    const parts = drafted.parts[0];
    const front = bodicePiece(parts["bella.frontSideDart"], true), rear = bodicePiece(parts["bella.back"], false);
    const waistTotal = (front.waistLength + rear.waistLength) * 2;
    const totalAngle = Math.max(1, (size.hips * 10 + 60 - waistTotal) / 200);
    const radius = waistTotal / totalAngle;
    const skirtFront = skirtPiece(front.waistLength, radius, size.skirtLength * 10, true);
    const skirtBack = skirtPiece(rear.waistLength, radius, size.skirtLength * 10, false);
    const pieces = [
      { id: "front", name: "\u524D\u4E0A\u8EAB", material: "\u9762\u5E03", quantity: 1, layout: "\u5BF9\u6298\u88C1 1 \u7247", ...front },
      { id: "back", name: "\u540E\u4E0A\u8EAB", material: "\u9762\u5E03", quantity: 2, layout: "\u53CC\u5C42\u955C\u50CF\u88C1 2 \u7247", ...rear },
      { id: "skirtFront", name: "\u524D\u88D9\u7247", material: "\u9762\u5E03", quantity: 1, layout: "\u5BF9\u6298\u88C1 1 \u7247", ...skirtFront },
      { id: "skirtBack", name: "\u540E\u88D9\u7247", material: "\u9762\u5E03", quantity: 2, layout: "\u53CC\u5C42\u955C\u50CF\u88C1 2 \u7247", ...skirtBack },
      { id: "liningFront", name: "\u524D\u4E0A\u8EAB\u91CC\u5E03", material: "\u91CC\u5E03", quantity: 1, layout: "\u5BF9\u6298\u88C1 1 \u7247", ...front },
      { id: "liningBack", name: "\u540E\u4E0A\u8EAB\u91CC\u5E03", material: "\u91CC\u5E03", quantity: 2, layout: "\u53CC\u5C42\u955C\u50CF\u88C1 2 \u7247", ...rear }
    ];
    for (const p of pieces) {
      if (p.cut.some((pt) => !Number.isFinite(pt.x + pt.y))) throw new Error("\u539F\u578B\u751F\u6210\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u8865\u5145\u91CF\u4F53\u503C");
      p.bounds = { minX: Math.min(...p.cut.map((pt) => pt.x)), minY: Math.min(...p.cut.map((pt) => pt.y)), maxX: Math.max(...p.cut.map((pt) => pt.x)), maxY: Math.max(...p.cut.map((pt) => pt.y)) };
    }
    return { version: version2, signature: JSON.stringify(size), size, pieces, waistTotal, hipCircumference: totalAngle * (radius + 200), seamAllowance: 15, hemAllowance: 30 };
  }
  var operations = [
    { id: "darts", name: "\u7F1D\u80F8\u7701\u4E0E\u8170\u7701", pieces: ["front", "back", "liningFront", "liningBack"], type: "dart", hint: "\u9762\u5E03\u3001\u91CC\u5E03\u5206\u522B\u5BF9\u6298\u7701\u9053\uFF0C\u6CBF\u4E24\u6761\u7701\u7F1D\u7EBF\u8F66\u5230\u7701\u5C16\uFF1B\u7701\u9053\u5185\u7684\u5E03\u4E0D\u8981\u526A\u6389\u3002", action: "\u5BF9\u6298\u7701\u9053", duration: 220 },
    { id: "shoulders", name: "\u62FC\u5408\u80A9\u7F1D A", pieces: ["front", "back", "liningFront", "liningBack"], type: "A", hint: "\u9762\u5E03\u524D\u540E\u7247\u6B63\u9762\u76F8\u5BF9\u62FC\u80A9\u7F1D\uFF0C\u91CC\u5E03\u4E5F\u5206\u522B\u62FC\u80A9\u7F1D\u3002", action: "\u5BF9\u9F50 A \u6807\u8BB0", duration: 180 },
    { id: "neck", name: "\u9886\u53E3\u4E0E\u91CC\u5E03\u8D34\u5408", pieces: ["front", "back", "liningFront", "liningBack"], type: "\u9886\u53E3", hint: "\u9762\u5E03\u4E0E\u91CC\u5E03\u6B63\u9762\u76F8\u5BF9\uFF0C\u6CBF\u6A59\u8272\u9886\u53E3\u8FB9\u754C\u7F1D\u4E00\u5708\uFF1B\u4FEE\u526A\u7F1D\u4EFD\u3001\u526A\u7259\u53E3\u5E76\u538B\u886C\u7EBF\uFF0C\u4FDD\u6301\u9886\u53E3\u5F00\u653E\u3002", action: "\u9762\u5E03\u4E0E\u91CC\u5E03\u5BF9\u9F50", duration: 240 },
    { id: "armholes", name: "\u8896\u7ABF\u7FFB\u7F1D", pieces: ["front", "back", "liningFront", "liningBack"], type: "\u8896\u7ABF", hint: "\u7528\u5377\u5305\u6CD5\u5206\u522B\u7F1D\u4E24\u4FA7\u8896\u7ABF\uFF0C\u4FEE\u526A\u7F1D\u4EFD\u540E\u7FFB\u56DE\u6B63\u9762\uFF1B\u4E0D\u8981\u628A\u8896\u7ABF\u4E24\u8FB9\u7F1D\u6B7B\u3002", action: "\u5377\u5305\u5E76\u5BF9\u9F50\u8896\u7ABF", duration: 240 },
    { id: "sides", name: "\u62FC\u4E0A\u8EAB\u4FA7\u7F1D B", pieces: ["front", "back", "liningFront", "liningBack"], type: "B", hint: "\u5BF9\u9F50\u814B\u4E0B\u63A5\u7F1D\uFF0C\u628A\u540C\u4FA7\u9762\u5E03\u4E0E\u91CC\u5E03\u8FDE\u7EED\u7F1D\u5408\uFF1B\u53E6\u4E00\u4FA7\u540C\u6837\u5904\u7406\u3002", action: "\u5BF9\u9F50 B \u6807\u8BB0", duration: 220 },
    { id: "skirt", name: "\u62FC\u88D9\u7247 E / G", pieces: ["skirtFront", "skirtBack"], type: "E", hint: "\u524D\u88D9\u4E0E\u5DE6\u53F3\u540E\u88D9\u62FC\u4FA7\u7F1D\uFF1B\u540E\u4E2D\u53EA\u7F1D\u62C9\u94FE\u6B62\u70B9\u4EE5\u4E0B\uFF0C\u4FDD\u7559\u8170\u4E0B 20 cm \u5F00\u53E3\u3002", action: "\u5BF9\u9F50 E \u4E0E G \u6807\u8BB0", duration: 280 },
    { id: "waist", name: "\u4E0A\u8EAB\u63A5\u88D9\u7247 C", pieces: ["front", "back", "skirtFront", "skirtBack"], type: "C", hint: "\u7701\u9053\u5148\u7F1D\u5408\uFF0C\u518D\u5BF9\u9F50\u524D\u4E2D\u3001\u540E\u4E2D\u3001\u4FA7\u7F1D\u4E0E\u8170\u8282\u5BF9\u4F4D\u70B9\u3002\u53EA\u63A5\u9762\u5E03\uFF0C\u91CC\u5E03\u8170\u53E3\u6682\u7559\u3002", action: "\u5BF9\u9F50 C \u8170\u8282\u70B9", duration: 260 },
    { id: "zip", name: "\u88C5\u540E\u4E2D\u9690\u5F62\u62C9\u94FE D", pieces: ["back", "skirtBack"], type: "D", hint: "\u62C9\u94FE\u8DE8\u8FC7\u8170\u8282\uFF0C\u4E24\u8FB9\u8170\u7F1D\u5BF9\u9F50\u3002\u7F1D\u597D\u540E\uFF0C\u5C06\u91CC\u5E03\u540E\u4E2D\u4E0E\u8170\u53E3\u5305\u4F4F\u7F1D\u4EFD\u3002", action: "\u5BF9\u9F50\u62C9\u94FE\u4E0E\u8170\u8282", duration: 240 },
    { id: "hem", name: "\u4E0B\u6446\u6298\u8FB9\u4E0E\u6574\u70EB F", pieces: ["skirtFront", "skirtBack"], type: "F", hint: "\u4E0B\u6446\u9884\u7559 3 cm\uFF0C\u5148\u6298 1 cm \u518D\u6298 2 cm\uFF0C\u6CBF\u5185\u6298\u8FB9\u538B\u7EBF\uFF1B\u6574\u70EB\u540E\u68C0\u67E5\u9886\u53E3\u3001\u8896\u7ABF\u548C\u62C9\u94FE\u80FD\u6B63\u5E38\u6253\u5F00\u3002", action: "\u6298\u597D\u4E0B\u6446", duration: 280 }
  ];
  return __toCommonJS(pattern_source_exports);
})();
