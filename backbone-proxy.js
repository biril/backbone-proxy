//     Backbone Proxy v0.1.0
//
//     https://github.com/biril/backbone-proxy
//     Licensed and freely distributed under the MIT License
//     Copyright (c) 2014 Alex Lambiris

/*globals exports, define, require, _, Backbone */

// Detect env & export module
// --------------------------

(function (root, createModule) {
  'use strict';

  // A global `define` method with an `amd` property signifies the presence of an AMD loader
  //  (require.js, curl.js)
  if (typeof define === 'function' && define.amd) {
    return define(['underscore', 'backbone', 'exports'], function (_, Backbone, exports) {
      return createModule(exports, _, Backbone);
    });
  }

  // A global `exports` object signifies CommonJS-like enviroments that support `module.exports`,
  //  e.g. Node
  if (typeof exports === 'object') {
    return createModule(exports, require('underscore'), require('backbone'));
  }

  // Otherwise we assume running in a browser - no AMD loader:

  // Save a reference to previous value of `BackboneProxy` before (potentially) overwriting it -
  //  so that it can be restored on `noConflict`
  var previousBackboneProxy = root.BackboneProxy;

  createModule(root.BackboneProxy = {}, _, Backbone);

  // The `noConflict` method sets the `BackboneProxy` _global_ to to its previous value (_once_),
  //  returning a reference to `BackboneProxy` (_always_)
  root.BackboneProxy.noConflict = function () {
    var BackboneProxy = root.BackboneProxy;
    root.BackboneProxy = previousBackboneProxy;
    return (BackboneProxy.noConflict = function () { return BackboneProxy; }).call();
  };

// Create module
// -------------

}(this, function (BackboneProxy, _, Backbone) {
  'use strict';

  var

    builtInEventNames = [
      'add', 'remove', 'reset', 'change', 'destroy', 'request', 'sync', 'error', 'invalid'
    ],

    eventApiMethodNames = [
      'on', 'off', 'trigger', 'once', 'listenTo', 'stopListening', 'listenToOnce'
    ],


    // ### SubscriptionCollection
    // A collection of subscriptions, where each subscription is a
    //  `<event, callback, context, proxyCallback>` 4-tuple. Every `EventEngine` instance maintains
    //  a `SubscriptionCollection` instance to keep track of registered callbacks and the mapping
    //  of each of those to a _proxy_-callback

    //
    SubscriptionCollection = (function () {

      var SubscriptionCollection = function SubscriptionCollection () {
          this._items = [];
        };

      SubscriptionCollection.prototype = {
        _markToKeep: function (propName, propValue) {
          if (!propValue) { return; }
          for (var i = this._items.length - 1; i >= 0; --i) {
            this._items[i].keep = this._items[i][propName] !== propValue;
          }
        },
        store: function (event, callback, context, proxyCallback) {
          this._items.push({
            event: event,
            callback: callback,
            context: context,
            proxyCallback: proxyCallback
          });
        },
        unstore: function (event, callback, context) {
          var itemsUnstored = [], itemsKept = [];

          _(this._items).each(function (item) { item.keep = false; });

          this._markToKeep('event', event);
          this._markToKeep('callback', callback);
          this._markToKeep('context', context);

          for (var i = this._items.length - 1; i >= 0; --i) {
            (this._items[i].keep ? itemsKept : itemsUnstored).push(this._items[i]);
          }

          this._items = itemsKept;

          return itemsUnstored;
        }
      };

      return SubscriptionCollection;
    }()),


    // ### Event Engine
    // A module that builds on top of `Backbone.Events` to support invoking registered callbacks in
    //  response to events triggered on a given `proxied` model. Every `ModelProxyProto` instance,
    //  i.e. every prototype of a created Proxy contains an event engine to facilitate forwarding
    //  of events from proxied to proxy

    //
    EventEngine = (function () {

      var createProxyCallback, EventEngine;

      // For given subscription (that is defined by specified event-name, callback and context),
      //  create a proxy-callback - a callback to pass into Backbone's Event module in place of the
      //  callback provided by the caller. The proxy-callback will take care of appropriately
      //  setting `model` arguments that may be present (in the case of model built-in events) as
      //  well as the context, if it's not explicitly set
      createProxyCallback = function (proxy, event, callback, context) {

        // The context is the one that's already provided or forced to the proxy
        context || (context = proxy);

        // If the subscription is for a model built-in event, the proxy-callback will have to
        //  replace the model argument with the proxy (as Backbone's Event module will set it to
        //  the proxied when invoking the callback). Same goes for the context in the case that it
        //  wasn't explicitly set by the caller
        if (_(builtInEventNames).contains(event) || !event.indexOf('change:')) {
          return function () {
            arguments[0] = proxy;
            callback.apply(context, arguments);
          };
        }

        // The subscription doesn't concern a built-in event. If additionally it's not for the
        //  'all' event, then we're dealing with a user-defined event. In this case we'll only have
        //  to make sure that the callback is invoked with proxy as the context
        if (event !== 'all') {
          return function () {
            callback.apply(context, arguments);
          };
        }

        // The subscription is for the 'all' event. The callback will run for built-in events as
        //  well as arbitrary user defined events. We'll have to check the type of the event at
        //  callback-invocation-time and treat it as one of the two preceding cases. (And yes, if
        //  client-code decides to trigger() an event which is named like a built-in but doesn't
        //  carry the expected parameters, things will go sideways)
        return function (event) {
          if (_(builtInEventNames).contains(event) || !event.indexOf('change:')) {
            arguments[1] = proxy;
          }
          callback.apply(context, arguments);
        };
      },

      //
      EventEngine = function EventEngine(proxy, proxied) {
        this._proxy = proxy;
        this._proxied = proxied;
        this._subscriptions = new SubscriptionCollection();
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
          this._subscriptions.store(event, callback, context, proxyCallback);
          Backbone.Events.on.call(this, event, proxyCallback, context);
          this.manageSubscriptionToProxied();
        },

        off: function (event, callback, context) {
          var matchingSubscriptions = this._subscriptions.unstore(event, callback, context);
          _(matchingSubscriptions).each(function (subscription) {
            Backbone.Events.off.call(this, subscription.event, subscription.proxyCallback, subscription.context);
          }, this);
          this.manageSubscriptionToProxied();
        }
      });

      return EventEngine;
    }()),


    // ### Model Proxy Prototype
    // The prototype of Proxy, per given `proxied` model. Exposes a number of 'tweaked'
    //  `Backbone.Model` methods which ultimately delegate to `proxied`

    // Create a prototype for Proxy of given `proxied` model
    createModelProxyProtoForProxied = function (proxied) {

      var ModelProxyProto;

      ModelProxyProto = function ModelProxyProto() {
        var createPersistenceMethod;

        //
        _(eventApiMethodNames).each(function (methodName) {
          this[methodName] = function () {
            this._eventEngine[methodName].apply(this._eventEngine, arguments);
            return this;
          };
        }, this);


        // #### Methods that should always be invoked with `this` set to `proxied`
        // e.g `set`

        // This ensures that
        //
        //  * all other model methods in the call-graph of the invoked method (e.g. `proxied.set`)
        //     are also invoked with `this` set to `proxied`.
        //  * all properties which may be set on the model as part of the invoked method's code
        //     path are set on `proxied`
        //
        // For example, this ensures that the `model` parameter made available to event listeners
        //  attached to `proxied` will be `proxied` - not `proxy` (which would otherwise be the
        //  case). In terms of set properties, consider `validationError` which also needs to be
        //  set on `proxied` - not `proxy`.

        // Generally, we just need to forward to `proxied`
        _(['isNew', 'url']).each(function (methodName) {
          this[methodName] = function () {
            return proxied[methodName]();
          };
        }, this);

        // Specifically, for the case of `set`, we need to replace the returned reference with
        //  `this`. To get proper chaining
        this.set = function () {
          return proxied.set.apply(proxied, arguments) ? this : false;
        };


        // #### Persistence methods
        // i.e. `fetch`, `save` & `destroy`

        // Create persistence method of `methodName`, where `isWithAttributes` indicates whether
        //  the method excepts attributes (`save`) or just options (`fetch`, `destroy`)
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


  // ### BackboneProxy

  // Features a single `extend` method
  return _(BackboneProxy).extend({

    // Get a Proxy 'class' for given `proxied` model
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
