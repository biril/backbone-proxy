//     Backbone Proxy v0.1.1
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
  //  (e.g. require.js, curl.js)
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

  // Save a reference to previous value of `BackboneProxy` before overwriting it - so that it can
  //  be restored on `noConflict`
  var previousBackboneProxy = root.BackboneProxy;

  // Create the BackboneProxy module, attaching `BackboneProxy` to global scope
  createModule(root.BackboneProxy = {}, _, Backbone);

  // And add the `noConflict` method. This sets the `BackboneProxy` _global_ to to its previous
  //  value (_once_), returning a reference to `BackboneProxy` (_always_)
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

    // Model built-in events. Note that 'all' is not considered to be one of them
    builtInEventNames = [
      'add', 'remove', 'reset', 'change', 'destroy', 'request', 'sync', 'error', 'invalid'
    ],

    // Names of 'event API' (`Backbone.Event`) methods
    eventApiMethodNames = [
      'on', 'off', 'trigger', 'once', 'listenTo', 'stopListening', 'listenToOnce'
    ],

    // ### SubscriptionCollection
    // A collection of subscriptions, where each is a `<event, callback, context, proxyCallback>`
    //  4-tuple. Every `EventEngine` instance maintains a `SubscriptionCollection` instance to
    //  keep track of registered callbacks and their mapping to _proxy_-callbacks

    //
    SubscriptionCollection = (function () {

      function SubscriptionCollection () {
        this._items = [];
      }

      SubscriptionCollection.prototype = {
        _markToKeep: function (propName, propValue) {
          if (!propValue) { return; }
          for (var i = this._items.length - 1; i >= 0; --i) {
            this._items[i].keep = this._items[i][propName] !== propValue;
          }
        },
        // Store subscription of given attributes
        store: function (event, callback, context, proxyCallback) {
          this._items.push({
            event: event,
            callback: callback,
            context: context,
            proxyCallback: proxyCallback
          });
        },
        // Unstore subscriptions that match given `event` / `callback` / `context`. None of the
        //  params denote mandatory arguments and those given will be used to _filter_ the
        //  subscriptions to be removed. Invoking the method without any arguments will remove
        //  _all_ subscriptions. This behaviour is in line with that of `Backbone.Model#off`
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
    //  response to events triggered on a given `proxied`, on behalf of a given `proxy`. Every
    //  `ModelProxyProto` instance (i.e. every `Proxy.prototype`) contains an Event Engine to
    //  facilitate forwarding events from proxied to proxy

    //
    EventEngine = (function () {

      function EventEngine(proxy, proxied) {
        this._proxy = proxy;
        this._proxied = proxied;
        this._subscriptions = new SubscriptionCollection();
        this._isListeningToProxied = false;
        this._markerContext = {};
      }

      EventEngine.prototype = _({}).extend(Backbone.Events, {

        // Get a value indicating whether there's currently _any_ listeners registered on the engine
        _hasEvents: function () {
          for (var key in this._events) {
            if (this._events.hasOwnProperty(key)) {
              return true;
            }
          }
          return false;
        },

        // Listen or stop listening for the 'all' event on `proxied` depending on whether there's
        //  currently _any_ listeners registered on the event engine (equivalently, on the proxy)
        _manageSubscriptionToProxied: function () {
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

        // For any given subscription (defined by `event` / `callback` / `context`), create a
        //  _proxy-callback_ - a callback that will be invoked by by Backbone's Event module in
        //  place of the original caller-provided callback. Depending on the type of the event the
        //  given subscription refers to, the proxy-callback will take care of appropriately
        //  setting `model` arguments that may be present (when dealing with model built-in events)
        //  as well as the context (if it's not explicitly set by the caller)
        _createProxyCallback: function (event, callback, context) {

          // The context is the one that's already specified _or_ set to the proxy
          context || (context = this._proxy);

          // If the subscription is for a model built-in event, the proxy-callback will have to
          //  replace the model argument with the proxy (as Backbone's Event module will set it to
          //  the proxied when invoking the callback). Same goes for the context
          if (_(builtInEventNames).contains(event) || !event.indexOf('change:')) {
            return function () {
              arguments[0] = this._proxy;
              callback.apply(context, arguments);
            };
          }

          // So the subscription doesn't concern a built-in event. If additionally it's not for the
          //  'all' event, then we're dealing with a user-defined event. In this case we only have
          //  to make sure that the callback is invoked the appropriate context
          if (event !== 'all') {
            return function () {
              callback.apply(context, arguments);
            };
          }

          // So The subscription is for the 'all' event: The given callback will run for built-in
          //  events as well as arbitrary, user-defined events. We'll have to check the type of the
          //  event at callback-invocation-time and treat it as one of the two cases. (And yes, if
          //  client-code decides to `trigger()` an event which is named like a built-in but
          //  doesn't carry the expected parameters, things will go sideways)
          return function (event) {
            if (_(builtInEventNames).contains(event) || !event.indexOf('change:')) {
              arguments[1] = this._proxy;
            }
            callback.apply(context, arguments);
          };
        },

        on: function (event, callback, context) {
          var proxyCallback = this._createProxyCallback(event, callback, context);
          this._subscriptions.store(event, callback, context, proxyCallback);
          Backbone.Events.on.call(this, event, proxyCallback, context);
          this._manageSubscriptionToProxied();
        },

        off: function (event, callback, context) {
          var matchingSubscriptions = this._subscriptions.unstore(event, callback, context);
          _(matchingSubscriptions).each(function (subscription) {
            Backbone.Events.off.call(this, subscription.event, subscription.proxyCallback, subscription.context);
          }, this);
          this._manageSubscriptionToProxied();
        }
      });

      return EventEngine;
    }()),


    // ### Model Proxy Prototype
    // The prototype of Proxy, _per given `proxied` model_. Overrides certain `Backbone.Model`
    //  methods ultimately delegating to the implementations of the given `proxied`

    // Create a prototype for Proxy, given a `proxied` model
    createModelProxyProtoForProxied = function (proxied) {

      function ModelProxyProto() {
        var createPersistenceMethod;

        // #### Prototype's event API methods - they all delegate to the internal Event Engine
        // e.g. `on`, `off`

        //
        _(eventApiMethodNames).each(function (methodName) {
          this[methodName] = function () {
            this._eventEngine[methodName].apply(this._eventEngine, arguments);
            return this;
          };
        }, this);


        // #### Prototype's methods that should always be invoked with `this` set to `proxied`
        // e.g. `set`

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


        // #### Prototype's persistence methods
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
      }

      ModelProxyProto.prototype = proxied;
      return ModelProxyProto;
    };


  // ### BackboneProxy
  // The BackboneProxy module. Features a single `extend` method by means of which a proxy 'class'
  //  `Proxy` may be created. E.g `UserProxy = BackboneProxy.extend(user)`. Proxy classes may be
  //  instantiated into proxies, e.g. `user = new UserProxy()`

  // Return the BackboneProxy module
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
