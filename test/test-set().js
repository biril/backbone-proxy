/*global Backbone, BackboneProxy, _, QUnit, test, strictEqual  */
(function () {
  'use strict';

  QUnit.module('.set()', {
    setup: function () {},
  });

  _(['proxied', 'proxy', 'proxy2', 'proxyProxy']).each(function (tM) { // target model

    _(['proxied', 'proxy', 'proxy2', 'proxyProxy']).each(function (oM) { // other model

      var

        proxied, proxy, proxy2, proxyProxy, models, targetModel, otherModel,

        setup = function () {
          var Proxy, ProxyProxy;

          proxied    = new Backbone.Model({ name: 'Anna', age: 23 });
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

          targetModel = models[tM];
          otherModel  = models[oM];
        },

        s = function (expect) {
          return function () {
            setup();
            expect();
          };
        };

      test(tM + '.set() should set attribute\'s value on ' + oM, 1, s(function () {
        targetModel.set({ name: 'Betty' });
        strictEqual(otherModel.get('name'), 'Betty');
      }));

      test(tM + '.unset() should unset attribute\'s value on ' + oM, 1, s(function () {
        targetModel.unset('name');
        strictEqual(otherModel.get('name'), undefined);
      }));

      test(tM + '.clear() should unset all attributes on ' + oM, 2, s(function () {
        targetModel.clear();
        strictEqual(otherModel.get('name'), undefined);
        strictEqual(otherModel.get('age'), undefined);
      }));

    }); // Iterate: other model = proxied', 'proxy', 'proxy2', 'proxyProxy'

  }); // Iterate: target model = proxied', 'proxy', 'proxy2', 'proxyProxy'

}());
