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

  QUnit.module('.off()ing by context', {
    setup: function () {},
  });

  _(['proxied', 'proxy', 'proxy2', 'proxyProxy']).each(function (sk) {

    _(['proxied', 'proxy', 'proxy2', 'proxyProxy']).each(function (tk) {

      // Registering listener on some model - removing from another (different) model
      if (sk !== tk) {

        test(tk + '.off(null, null, context) should not remove change:attr-event-listener registered on ' + sk, 1, s(sk, tk, function () {
          var context = {};
          source.on('change:name', function () {
            ok(true);
          }, context);
          target.off(null, null, context);

          target.set({ name: 'Betty' }); // or source.set - makes no difference
        }));

        test(tk + '.off(null, null, context) should not remove change:attr-event-listener registered on ' + sk + ', for context = ' + sk, 1, s(sk, tk, function () {
          source.on('change:name', function () {
            ok(true);
          }, source);
          target.off(null, null, source);

          target.set({ name: 'Betty' }); // or source.set - makes no difference
        }));

        test(tk + '.off(null, null, context) should not remove change:attr-event-listener registered on ' + sk + ', for context = ' + tk, 1, s(sk, tk, function () {
          source.on('change:name', function () {
            ok(true);
          }, target);
          target.off(null, null, target);

          target.set({ name: 'Betty' }); // or source.set - makes no difference
        }));

      }

    }); // iterate over targets

    test(sk + '.off(null, null, context) should remove change:attr-event-listener registered on ' + sk, 0, s(sk, sk, function () {
      var context = {};
      source.on('change:name', function () {
        ok(false, 'change:name listener on ' + sk + ' should not be invoked');
      }, context);
      source.off(null, null, context);

      source.set({ name: 'Betty' });
    }));

  }); // iterate over sources

}());
