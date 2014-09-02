//     Backbone Proxy v0.0.1

//     https://github.com/biril/backbone-proxy
//     Licensed and freely distributed under the MIT License
//     Copyright (c) 2014 Alex Lambiris

/*globals exports, define, require, _, Backbone */
(function (root, createModule) {
  'use strict';

  // A global `define` method with an `amd` property signifies the presence of an AMD
  //  loader (require.js, curl.js)
  if (typeof define === 'function' && define.amd) {
    return define(['underscore', 'backbone', 'exports'], function (_, Backbone, exports) {
        return createModule(exports, _, Backbone);
    });
  }

  // A global `exports` object signifies CommonJS-like enviroments that support
  //  `module.exports`, e.g. Node
  if (typeof exports === 'object') {
    return createModule(exports, require('underscore'), require('backbone'));
  }

  // Otherwise we assume running in a browser - no AMD loader
  var BackboneProxy = createModule({}, _, Backbone);

  // When running in a browser, the additional `noConflict` method is attached to `BackboneProxy`.
  // This is only meaningful in this specific case where `BackboneProxy` is globally exposed
  BackboneProxy.noConflict = (function() {

    // Save a reference to the previous value of 'BackboneProxy', so that it can be restored
    //  later on, if 'noConflict' is used
    var previousBackboneProxy = root.BackboneProxy;

    // The `noConflict` method: Sets the _global_ `BackboneProxy` variable to to its previous
    //  value returning a reference to `BackboneProxy`
    return function () {
      BackboneProxy.noConflict = function () {
        return BackboneProxy;
      };
      root.BackboneProxy = previousBackboneProxy;
      return BackboneProxy;
    };
  }());

  root.BackboneProxy = BackboneProxy;

}(this, function (BackboneProxy, _, Backbone) {
  'use strict';

  var

    builtInEventNames = [
      'add',
      'remove',
      'reset',
      'change',
      'destroy',
      'request',
      'sync',
      'error',
      'invalid'
    ],

    eventApiMethodNames = [
      'on',
      'off',
      'trigger',
      'once',
      'listenTo',
      'stopListening',
      'listenToOnce'
    ],


    //
    //   SubscriptionMap
    // ===================
    //

    SubscriptionMap = (function () {

      var SubscriptionMap = function SubscriptionMap () {
          this._map = [];
        };

      SubscriptionMap.prototype = {
        _markForUnstore: function (propName, propValue, toUnstore) {
          if (!propValue) {
            return toUnstore;
          }
          for (var i = toUnstore.length - 1; i >= 0; --i) {
            if (this._map[i][propName] !== propValue) {
              toUnstore[i] = false;
            }
          }
          return toUnstore;
        },
        store: function (event, callback, context, proxyCallback) {
          this._map.push({
            event: event,
            callback: callback,
            proxyCallback: proxyCallback,
            context: context
          });
        },
        unstore: function (event, callback, context) {
          var
            toUnstore = _.range(this._map.length).map(function () { return true; }),
            unstored = [], mapWithoutUnstored = [];

          this._markForUnstore('event', event, toUnstore);
          this._markForUnstore('callback', callback, toUnstore);
          this._markForUnstore('context', context, toUnstore);

          _(this._map).each(function (mappedEvent, i) {
            (toUnstore[i] ? unstored : mapWithoutUnstored).push(mappedEvent);
          });

          this._map = mapWithoutUnstored;

          return unstored;
        }
      };

      return SubscriptionMap;
    }()),


    //
    //   Event Engine
    // ================
    //

    EventEngine = (function () {

      var createProxyCallback, EventEngine;

      // For given subscription, create a proxy-callback - a callback to pass into the
      //  event-engine in place of the original callback
      createProxyCallback = function (proxy, event, callback, context) {
        context || (context = proxy);

        if (event === 'all') {
          return function () {
            arguments[1] = proxy;
            callback.apply(context, arguments);
          };
        }

        if (_(builtInEventNames).contains(event) || !event.indexOf('change:')) {
          return function () {
            arguments[0] = proxy;
            callback.apply(context, arguments);
          };
        }

        return function () {
          callback.apply(context, arguments);
        };
      },

      //
      EventEngine = function EventEngine(proxy, proxied) {
        this._proxy = proxy;
        this._proxied = proxied;
        this._subscriptionMap = new SubscriptionMap();
        this._isListeningToProxied = false;
        this._markerContext = {};
      };

      EventEngine.prototype = _({}).extend(Backbone.Events, {

        _hasEvents: function () {
          for (var key in this._events) {
            if (this._events.hasOwnProperty(key)) {
              return true;
            }
          }
          return false;
        },

        manageSubscriptionToProxied: function () {
          var hasEvents = this._hasEvents();
          if (this._isListeningToProxied !== hasEvents) {
            if (hasEvents) {
              this._proxied.on('all', _.bind(function () {
                Backbone.Events.trigger.apply(this, arguments);
              }, this), this._markerContext);
            } else {
              this._proxied.off(null, null, this._markerContext);
            }
            this._isListeningToProxied = hasEvents;
          }
        },

        on: function (event, callback, context) {
          var proxyCallback = createProxyCallback(this._proxy, event, callback, context);
          this._subscriptionMap.store(event, callback, context, proxyCallback);
          Backbone.Events.on.call(this, event, proxyCallback, context);
          this.manageSubscriptionToProxied();
        },

        off: function (event, callback, context) {
          var matchingSubscriptions = this._subscriptionMap.unstore(event, callback, context);
          _(matchingSubscriptions).each(function (subscription) {
            Backbone.Events.off.call(this, subscription.event, subscription.proxyCallback, subscription.context);
          }, this);
          this.manageSubscriptionToProxied();
        }
      });

      return EventEngine;
    }()),


    //
    //   Model Proxy Proto
    // =====================
    //

    createModelProxyProtoForProxied = function (proxied) {

      var ModelProxyProto;

      ModelProxyProto = function ModelProxyProto() {
        var createPersistenceMethod;

        _(eventApiMethodNames).each(function (methodName) {
          this[methodName] = function () {
            this._eventEngine[methodName].apply(this._eventEngine, arguments);
            return this;
          };
        }, this);

        // Attribute-write methods
        //
        // should always be invoked with `this` set to `proxied`. This will ensure that
        //  * all other model methods in the call-graph of `proxied.set` are also invoked with
        //     `this` set to `proxied`.
        //  * all properties which may be set on the model as part of `proxied.set`'s code path
        //     are set on `proxied`
        //  Which is important. For example, it will ensure that the `model` parameter made
        //  available to event listeners attached to `proxied` will be `proxied` - not `proxy`
        //  (which would otherwise be the case). In terms of set properties, consider
        //  `validationError` which also needs to be set on `proxied` - not `proxy`.
        //
        // Note however that the model which is returned (in case of success) is always the proxy
        _(['set']).each(function (methodName) {
          this[methodName] = function () {
            return proxied[methodName].apply(proxied, arguments) ? this : false;
          };
        }, this);

        // Persistence methods
        //
        createPersistenceMethod = function (methodName, isWithAttributes) {
          return function () {
            var opts, success, error, args;
            opts = arguments[isWithAttributes ? 1 : 0];
            opts = opts ? _.clone(opts) : {};
            success = opts.success;
            error = opts.error;

            success && (opts.success = _.bind(function (model, response, opts) {
              success(this, response, opts);
            }, this));
            error && (opts.error = _.bind(function (model, response, opts) {
              error(this, response, opts);
            }, this));

            args = isWithAttributes ? [arguments[0], opts] : [opts];
            return proxied[methodName].apply(proxied, args);
          };
        };

        this.fetch   = createPersistenceMethod('fetch',   false);
        this.destroy = createPersistenceMethod('destroy', false);
        this.save    = createPersistenceMethod('save',    true);

        this._proxied = proxied;
      };

      ModelProxyProto.prototype = proxied;
      return ModelProxyProto;
    };

  return _(BackboneProxy).extend({
    extend: function (proxied) {
      var ctor, ModelProxyProto;

      ctor = function ModelProxy() {
        this._eventEngine = new EventEngine(this, proxied);
      };
      ModelProxyProto = createModelProxyProtoForProxied(proxied);
      ctor.prototype = new ModelProxyProto();
      return ctor;
    }
  });
}));
