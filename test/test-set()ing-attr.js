/*global Backbone, BackboneProxy, _, QUnit, test, ok, strictEqual  */
(function () {
  'use strict';

  QUnit.module('.set()ing attr', {
    setup: function () {},
  });

  _(['proxied', 'proxy', 'proxy2', 'proxyProxy']).each(function (sourceKey) {

    _(['proxied', 'proxy', 'proxy2', 'proxyProxy']).each(function (targetKey) {

      var

        proxied, proxy, proxy2, proxyProxy, models, source, target,

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

          source = models[sourceKey];
          target = models[targetKey];
        },

        s = function (expect) {
          return function () {
            setup();
            expect();
          };
        };

      test(sourceKey + '.set() should set attribute\'s value on ' + targetKey, 1, s(function () {
        source.set({ name: 'Betty' });
        strictEqual(target.get('name'), 'Betty');
      }));

      test(sourceKey + '.unset() should unset attribute\'s value on ' + targetKey, 1, s(function () {
        source.unset('name');
        strictEqual(target.get('name'), undefined);
      }));

      test(sourceKey + '.set() should invoke change:attr-event listener on ' + targetKey, 1, s(function () {
        target.on('change:name', function () {
          ok(true);
        });
        source.set({ name: 'Betty' });
      }));

      test(sourceKey + '.set() should invoke change-event listener on ' + targetKey, 1, s(function () {
        target.on('change', function () {
          ok(true);
        });
        source.set({ name: 'Betty' });
      }));

      test(sourceKey + '.set() should twice-invoke all-event listener on ' + targetKey, 2, s(function () {
        var invokedForChange, invokedForChangeAttr;

        target.on('all', function (event) {
          if (event === 'change') {
            invokedForChange = true;
          }
          if (event === 'change:name') {
            invokedForChangeAttr = true;
          }
        });

        source.set({ name: 'Betty' });

        ok(invokedForChange,     'invoked for change-event');
        ok(invokedForChangeAttr, 'invoked for change:attr-event');
      }));

      ///

      test(sourceKey + '.set() should invoke change:attr-event listener on ' + targetKey + ', with context = ' + targetKey + ' (if no context given)', 1, s(function () {
        target.on('change:name', function () {
          strictEqual(this, target);
        });
        source.set({ name: 'Betty' });
      }));

      test(sourceKey + '.set() should invoke change-event listener on ' + targetKey + ', with context = ' + targetKey + ' (if no context given)', 1, s(function () {
        target.on('change', function () {
          strictEqual(this, target);
        });
        source.set({ name: 'Betty' });
      }));

      test(sourceKey + '.set() should twice-invoke all-event listener on ' + targetKey + ', with context = ' + targetKey + ' (if no context given)', 2, s(function () {
        target.on('all', function () {
          strictEqual(this, target);
        });
        source.set({ name: 'Betty' });
      }));

      ///

      test(sourceKey + '.set() should invoke change:attr-event listener on ' + targetKey + ', with given context', 1, s(function () {
        var context = {};
        target.on('change:name', function () {
          strictEqual(this, context);
        }, context);
        source.set({ name: 'Betty' });
      }));

      test(sourceKey + '.set() should invoke change-event listener on ' + targetKey + ', with given context', 1, s(function () {
        var context = {};
        target.on('change', function () {
          strictEqual(this, context);
        }, context);
        source.set({ name: 'Betty' });
      }));

      test(sourceKey + '.set() should twice-invoke all-event listener on ' + targetKey + ', with given context', 2, s(function () {
        var context = {};
        target.on('all', function () {
          strictEqual(this, context);
        }, context);
        source.set({ name: 'Betty' });
      }));

      ///

      test(sourceKey + '.set() should invoke change:attr-event listener on ' + targetKey + ', with model param = ' + targetKey, 1, s(function () {
        target.on('change:name', function (model) {
          strictEqual(model, target);
        });
        source.set({ name: 'Betty' });
      }));

      test(sourceKey + '.set() should invoke change-event listener on ' + targetKey + ', with model param = ' + targetKey, 1, s(function () {
        target.on('change', function (model) {
          strictEqual(model, target);
        });
        source.set({ name: 'Betty' });
      }));

      test(sourceKey + '.set() should twice-invoke all-event listener on ' + targetKey + ', with model param = ' + targetKey, 2, s(function () {
        target.on('all', function (__, model) {
          strictEqual(model, target);
        });
        source.set({ name: 'Betty' });
      }));

    });

  });

}());
