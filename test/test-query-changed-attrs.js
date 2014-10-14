/*global Backbone, BackboneProxy, _, QUnit, test, strictEqual, deepEqual  */
(function () {
  'use strict';

  QUnit.module('query changed attrs', {
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

      test(tM + '.set(name) -> ' + oM + ' should report expected changed attrs in context of change-event callback, ', 4, s(function () {
        otherModel.on('change', function () {
          strictEqual(otherModel.hasChanged('name'), true, oM + ' reports name-attr as changed');
          strictEqual(otherModel.previous('name'), 'Anna', oM + ' reports expected previous name');
          deepEqual(otherModel.changedAttributes(), { name: 'Betty' }, oM + ' reports expected changed attributes');
          deepEqual(otherModel.previousAttributes(), { name: 'Anna', age: 23 }, oM + ' reports expected previous attributes');
        });
        targetModel.set({ name: 'Betty' });
      }));

      test(tM + '.set(name, age) -> ' + oM + ' should report expected changed attrs in context of change-event callback, ', 6, s(function () {
        otherModel.on('change', function () {
          strictEqual(otherModel.hasChanged('name'), true, oM + ' reports name-attr as changed');
          strictEqual(otherModel.hasChanged('age'), true, oM + ' reports age-attr as changed');
          strictEqual(otherModel.previous('name'), 'Anna', oM + ' reports expected previous name');
          strictEqual(otherModel.previous('name'), 'Anna', oM + ' reports expected previous age');
          deepEqual(otherModel.changedAttributes(), { name: 'Betty', age: 31 }, oM + ' reports expected changed attributes');
          deepEqual(otherModel.previousAttributes(), { name: 'Anna', age: 23 }, oM + ' reports expected previous attributes');
        });
        targetModel.set({ name: 'Betty', age: 31 });
      }));

    }); // Iterate: other model = proxied', 'proxy', 'proxy2', 'proxyProxy'

  }); // Iterate: target model = proxied', 'proxy', 'proxy2', 'proxyProxy'

}());
