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

      test(sourceKey + '.clear() should unset all attributes on ' + targetKey, 2, s(function () {
        source.clear();
        strictEqual(target.get('name'), undefined);
        strictEqual(target.get('age'), undefined);
      }));

      ///

      test(sourceKey + '.set() should invoke change:attr-event listener on ' + targetKey, 1, s(function () {
        target.on('change:name', function () {
          ok(true);
        });
        source.set({ name: 'Betty' });
      }));

      test(sourceKey + '.unset() should invoke change:attr-event listener on ' + targetKey, 1, s(function () {
        target.on('change:name', function () {
          ok(true);
        });
        source.unset('name');
      }));

      test(sourceKey + '.clear() should invoke change:attr-event listeners on ' + targetKey, 2, s(function () {
        target.on('change:name', function () {
          ok(true, 'invoked for change:name event');
        });
        target.on('change:age', function () {
          ok(true, 'invoked for change:age event');
        });
        source.clear();
      }));

      test(sourceKey + '.set() should invoke change-event listener on ' + targetKey, 1, s(function () {
        target.on('change', function () {
          ok(true);
        });
        source.set({ name: 'Betty' });
      }));

      test(sourceKey + '.unset() should invoke change-event listener on ' + targetKey, 1, s(function () {
        target.on('change', function () {
          ok(true);
        });
        source.unset('name');
      }));

      test(sourceKey + '.clear() should invoke change-event listener on ' + targetKey, 1, s(function () {
        target.on('change', function () {
          ok(true);
        });
        source.clear();
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

      test(sourceKey + '.unset() should twice-invoke all-event listener on ' + targetKey, 2, s(function () {
        var invokedForChange, invokedForChangeAttr;

        target.on('all', function (event) {
          if (event === 'change') {
            invokedForChange = true;
          }
          if (event === 'change:name') {
            invokedForChangeAttr = true;
          }
        });

        source.unset('name');

        ok(invokedForChange,     'invoked for change-event');
        ok(invokedForChangeAttr, 'invoked for change:attr-event');
      }));

      test(sourceKey + '.clear() should thrice-invoke all-event listener on ' + targetKey, 3, s(function () {
        var invokedForChange, invokedForChangeNameAttr, invokedForChangeAgeAttr;

        target.on('all', function (event) {
          if (event === 'change') {
            invokedForChange = true;
          }
          if (event === 'change:name') {
            invokedForChangeNameAttr = true;
          }
          if (event === 'change:age') {
            invokedForChangeAgeAttr = true;
          }
        });

        source.clear();

        ok(invokedForChange,         'invoked for change-event');
        ok(invokedForChangeNameAttr, 'invoked for change:name-event');
        ok(invokedForChangeAgeAttr,  'invoked for change:age-event');
      }));

      ///

      test(sourceKey + '.set() should invoke change:attr-event listener on ' + targetKey + ', with context = ' + targetKey + ' (if no context given)', 1, s(function () {
        target.on('change:name', function () {
          strictEqual(this, target);
        });
        source.set({ name: 'Betty' });
      }));

      test(sourceKey + '.unset() should invoke change:attr-event listener on ' + targetKey + ', with context = ' + targetKey + ' (if no context given)', 1, s(function () {
        target.on('change:name', function () {
          strictEqual(this, target);
        });
        source.unset('name');
      }));

      test(sourceKey + '.clear() should invoke change:attr-event listeners on ' + targetKey + ', with context = ' + targetKey + ' (if no context given)', 2, s(function () {
        target.on('change:name', function () {
          strictEqual(this, target, 'change:name-event listener invoked with context = ' + targetKey);
        });
        target.on('change:age', function () {
          strictEqual(this, target, 'change:age-event listener invoked with context = ' + targetKey);
        });
        source.clear();
      }));

      test(sourceKey + '.set() should invoke change-event listener on ' + targetKey + ', with context = ' + targetKey + ' (if no context given)', 1, s(function () {
        target.on('change', function () {
          strictEqual(this, target);
        });
        source.set({ name: 'Betty' });
      }));

      test(sourceKey + '.unset() should invoke change-event listener on ' + targetKey + ', with context = ' + targetKey + ' (if no context given)', 1, s(function () {
        target.on('change', function () {
          strictEqual(this, target);
        });
        source.unset('name');
      }));

      test(sourceKey + '.clear() should invoke change-event listener on ' + targetKey + ', with context = ' + targetKey + ' (if no context given)', 1, s(function () {
        target.on('change', function () {
          strictEqual(this, target);
        });
        source.clear();
      }));

      test(sourceKey + '.set() should twice-invoke all-event listener on ' + targetKey + ', with context = ' + targetKey + ' (if no context given)', 2, s(function () {
        target.on('all', function () {
          strictEqual(this, target);
        });
        source.set({ name: 'Betty' });
      }));

      test(sourceKey + '.unset() should twice-invoke all-event listener on ' + targetKey + ', with context = ' + targetKey + ' (if no context given)', 2, s(function () {
        target.on('all', function () {
          strictEqual(this, target);
        });
        source.unset('name');
      }));

      test(sourceKey + '.clear() should thrice-invoke all-event listener on ' + targetKey + ', with context = ' + targetKey + ' (if no context given)', 3, s(function () {
        target.on('all', function () {
          strictEqual(this, target);
        });
        source.clear();
      }));

      ///

      test(sourceKey + '.set() should invoke change:attr-event listener on ' + targetKey + ', with given context', 1, s(function () {
        var context = {};
        target.on('change:name', function () {
          strictEqual(this, context);
        }, context);
        source.set({ name: 'Betty' });
      }));

      test(sourceKey + '.unset() should invoke change:attr-event listener on ' + targetKey + ', with given context', 1, s(function () {
        var context = {};
        target.on('change:name', function () {
          strictEqual(this, context);
        }, context);
        source.unset('name');
      }));

      test(sourceKey + '.clear() should invoke change:attr-event listeners on ' + targetKey + ', with given context', 2, s(function () {
        var context1 = {}, context2 = {};
        target.on('change:name', function () {
          strictEqual(this, context1, 'change:name-event listener invoked with appropriate context');
        }, context1);
        target.on('change:age', function () {
          strictEqual(this, context2, 'change:name-event listener invoked with appropriate context');
        }, context2);
        source.clear();
      }));

      test(sourceKey + '.set() should invoke change-event listener on ' + targetKey + ', with given context', 1, s(function () {
        var context = {};
        target.on('change', function () {
          strictEqual(this, context);
        }, context);
        source.set({ name: 'Betty' });
      }));

      test(sourceKey + '.unset() should invoke change-event listener on ' + targetKey + ', with given context', 1, s(function () {
        var context = {};
        target.on('change', function () {
          strictEqual(this, context);
        }, context);
        source.unset('name');
      }));

      test(sourceKey + '.clear() should invoke change-event listener on ' + targetKey + ', with given context', 2, s(function () {
        var context1 = {}, context2 = {};
        target.on('change', function () {
          strictEqual(this, context1, 'change:name-event listener invoked with appropriate context');
        }, context1);
        target.on('change', function () {
          strictEqual(this, context2, 'change:name-event listener invoked with appropriate context');
        }, context2);
        source.clear();
      }));

      test(sourceKey + '.set() should twice-invoke all-event listener on ' + targetKey + ', with given context', 2, s(function () {
        var context = {};
        target.on('all', function () {
          strictEqual(this, context);
        }, context);
        source.set({ name: 'Betty' });
      }));

      test(sourceKey + '.unset() should twice-invoke all-event listener on ' + targetKey + ', with given context', 2, s(function () {
        var context = {};
        target.on('all', function () {
          strictEqual(this, context);
        }, context);
        source.unset('name');
      }));

      test(sourceKey + '.clear() should thrice-invoke all-event listener on ' + targetKey + ', with given context', 3, s(function () {
        var context = {};
        target.on('all', function () {
          strictEqual(this, context);
        }, context);
        source.clear();
      }));

      ///

      test(sourceKey + '.set() should invoke change:attr-event listener on ' + targetKey + ', with model param = ' + targetKey, 1, s(function () {
        target.on('change:name', function (model) {
          strictEqual(model, target);
        });
        source.set({ name: 'Betty' });
      }));

      test(sourceKey + '.unset() should invoke change:attr-event listener on ' + targetKey + ', with model param = ' + targetKey, 1, s(function () {
        target.on('change:name', function (model) {
          strictEqual(model, target);
        });
        source.unset('name');
      }));

      test(sourceKey + '.clear() should invoke change:attr-event listeners on ' + targetKey + ', with model param = ' + targetKey, 2, s(function () {
        target.on('change:name', function (model) {
          strictEqual(model, target);
        });
        target.on('change:age', function (model) {
          strictEqual(model, target);
        });
        source.clear();
      }));

      test(sourceKey + '.set() should invoke change-event listener on ' + targetKey + ', with model param = ' + targetKey, 1, s(function () {
        target.on('change', function (model) {
          strictEqual(model, target);
        });
        source.set({ name: 'Betty' });
      }));

      test(sourceKey + '.unset() should invoke change-event listener on ' + targetKey + ', with model param = ' + targetKey, 1, s(function () {
        target.on('change', function (model) {
          strictEqual(model, target);
        });
        source.unset('name');
      }));

      test(sourceKey + '.clear() should invoke change-event listener on ' + targetKey + ', with model param = ' + targetKey, 1, s(function () {
        target.on('change', function (model) {
          strictEqual(model, target);
        });
        source.clear();
      }));

      test(sourceKey + '.set() should twice-invoke all-event listener on ' + targetKey + ', with model param = ' + targetKey, 2, s(function () {
        target.on('all', function (__, model) {
          strictEqual(model, target);
        });
        source.set({ name: 'Betty' });
      }));

      test(sourceKey + '.unset() should twice-invoke all-event listener on ' + targetKey + ', with model param = ' + targetKey, 2, s(function () {
        target.on('all', function (__, model) {
          strictEqual(model, target);
        });
        source.unset('name');
      }));

      test(sourceKey + '.clear() should thrice-invoke all-event listener on ' + targetKey + ', with model param = ' + targetKey, 3, s(function () {
        target.on('all', function (__, model) {
          strictEqual(model, target);
        });
        source.clear();
      }));

    });

  });

}());
