/*global Backbone, BackboneProxy, _, QUnit, test, ok, strictEqual, deepEqual  */
(function () {
  'use strict';

  QUnit.module('housekeeping', {
    setup: function () {},
  });

  var

    subscriptions = function (proxy) { return proxy._eventEngine._subscriptions._items; },
    isListeningToProxied = function (proxy) { return proxy._eventEngine._isListeningToProxied; },
    hasSubscriptions = function (proxy) { return !!subscriptions(proxy).length; },

    //

    subscriptionsForCallback = function (callback, proxy) {
      return _(subscriptions(proxy)).filter(function (subscription) {
        return subscription.callback === callback;
      });
    },
    hasSubscriptionForCallback = function (callback, proxy) {
      return !!subscriptionsForCallback(callback, proxy).length;
    },

    subscriptionsForContext = function (context, proxy) {
      return _(subscriptions(proxy)).filter(function (subscription) {
        return subscription.context === context;
      });
    },
    hasSubscriptionForContext = function (context, proxy) {
      return !!subscriptionsForContext(context, proxy).length;
    },

    subscriptionsForEvent = function (event, proxy) {
      return _(subscriptions(proxy)).filter(function (subscription) {
        return subscription.event === event;
      });
    },
    hasSubscriptionForEvent = function (event, proxy) {
      return !!subscriptionsForEvent(event, proxy).length;
    };



  _([['proxied', 'proxy'], ['proxy', 'proxyProxy']]).each(function (modelNames) {

    var

      proxiedName = modelNames[0],
      proxyName   = modelNames[1],

      proxied, proxy,

      setup = function () {
        var Proxy, ProxyProxy, theProxied, theProxy, theProxyProxy, models;

        theProxied    = new Backbone.Model({ name: 'Anna', age: 23 });
        Proxy         = BackboneProxy.extend(theProxied);
        theProxy      = new Proxy();
        ProxyProxy    = BackboneProxy.extend(theProxy);
        theProxyProxy = new ProxyProxy();

        models = { proxied: theProxied, proxy: theProxy, proxyProxy: theProxyProxy };

        proxied = models[proxiedName];
        proxy   = models[proxyName];
      },

      s = function (expect) {
        return function () {
          setup();
          expect();
        };
      };

    test(proxyName + '.off() by callback should eliminate references to ' + proxiedName, 5 , s(function () {
      var
        callback1 = function () {},
        callback2 = function () {};

      proxy.on('change',      callback1);
      proxy.on('change',      callback1, {});
      proxy.on('change:name', callback1);
      proxy.on('change',      callback2);

      proxy.off(null, callback1);

      ok(!hasSubscriptionForCallback(callback1, proxy), proxyName + ' has no subscription for off()ed callback1');
      strictEqual(subscriptionsForCallback(callback2, proxy).length, 1, proxyName + ' has expected subscriptions for callback2');
      ok(isListeningToProxied(proxy), proxyName + ' is listening to ' + proxiedName);

      proxy.off(null, callback2);

      ok(!hasSubscriptionForCallback(callback1, proxy), proxyName + ' has no subscription for off()ed callback2');
      ok(!isListeningToProxied(proxy), proxyName + ' is not listening to ' + proxiedName);

    }));

    test(proxyName + '.off() by context should eliminate references to ' + proxiedName, 5, s(function () {
      var
        context1 = {},
        context2 = {};

      proxy.on('change',      function () {}, context1);
      proxy.on('change:name', function () {}, context1);
      proxy.on('change',      function () {}, context2);

      proxy.off(null, null, context1);

      ok(!hasSubscriptionForContext(context1, proxy), 'proxy has no subscription for off()ed context1');
      strictEqual(subscriptionsForContext(context2, proxy).length, 1, 'proxy has expected subscriptions for context2');
      ok(isListeningToProxied(proxy), proxyName + ' is listening to ' + proxiedName);

      proxy.off(null, null, context2);

      ok(!hasSubscriptionForContext(context2, proxy), 'proxy has no subscription for off()ed context2');
      ok(!isListeningToProxied(proxy), proxyName + ' is not listening to ' + proxiedName);
    }));

    test(proxyName + '.off() by event should eliminate references to ' + proxiedName, 5 , s(function () {

      proxy.on('change', function () {});
      proxy.on('change', function () {}, {});
      proxy.on('change:name', function () {});
      proxy.on('change:name', function () {}, {});

      proxy.off('change');

      ok(!hasSubscriptionForEvent('change', proxy), 'proxy has no subscription for off()ed change-event');
      strictEqual(subscriptionsForEvent('change:name', proxy).length, 2, 'proxy has expected subscriptions for change:name-event');
      ok(isListeningToProxied(proxy), proxyName + ' is listening to ' + proxiedName);

      proxy.off('change:name');

      ok(!hasSubscriptionForEvent('change:name', proxy), 'proxy has no subscription for off()ed change:name-event');
      ok(!isListeningToProxied(proxy), proxyName + ' is not listening to ' + proxiedName);
    }));

    test('triggering a once-callback on ' + proxyName + ' should eliminate references to ' + proxiedName, 2, s(function () {
      proxy.once('change', function () {});
      proxy.set({ name: 'Betty' });
      ok(!hasSubscriptions(proxy), proxyName + ' contains no subscriptions');
      ok(!isListeningToProxied(proxy), proxyName + ' is not listening to ' + proxiedName);
    }));

  }); // Iterate: proxied vs proxy or proxy vs proxyProxy

}());
