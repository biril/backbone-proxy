/*global BackboneProxy, _, QUnit, test, ok, strictEqual, deepEqual, expect, Backbone */
(function () {
  'use strict';

  var

    proxied, proxy, proxy2, proxyProxy, models, source, target,

    setup = function (sourceKey, targetKey) {
      var Proxy, ProxyProxy;

      proxied    = new Backbone.Model({ name: 'Anna' });
      Proxy      = BackboneProxy.extend(proxied);

      proxy      = new Proxy();
      proxy2     = new Proxy();
      ProxyProxy = BackboneProxy.extend(proxy);

      proxyProxy = new ProxyProxy();

      models = {
        proxied: proxied,
        proxy: proxy,
        proxy2: proxy2,
        proxyProxy: proxyProxy
      };

      source = models[sourceKey];
      target = models[targetKey];
    },

    s = function (sourceKey, targetKey, expect) {
      return function () {
        setup(sourceKey, targetKey);
        expect();
      };
    };

  QUnit.module('.off()ing by callback', {
    setup: function () {},
  });

  _(['proxied', 'proxy', 'proxy2', 'proxyProxy']).each(function (sk) {

    _(['proxied', 'proxy', 'proxy2', 'proxyProxy']).each(function (tk) {

      // Registering listener on some model - removing from another (different) model
      if (sk !== tk) {

        test(tk + '.off(null, callback) should not remove change:attr-event-listener registered on ' + sk, 1, s(sk, tk, function () {
          var callback = function () {
              ok(true);
            };
          source.on('change:name', callback);
          target.off(null, callback);

          target.set({ name: 'Betty' }); // or source.set - makes no difference
        }));

      }

    }); // iterate over targets

    test(sk + '.off(null, callback) should remove change:attr-event-listener registered on ' + sk, 0, s(sk, sk, function () {
      var callback = function () {
          ok(false, 'change:name listener on ' + sk + ' should not be invoked');
        };
      source.on('change:name', callback);
      source.off(null, callback);

      source.set({ name: 'Betty' });
    }));

  }); // iterate over sources

}());
