/*global Backbone, BackboneProxy, _, QUnit, test, ok, strictEqual  */
(function () {
  'use strict';

  QUnit.module('.on()');

  var

    proxied, proxy, proxy2, proxyProxy, models, targetModel, otherModel,

    setup = function (tM, oM) {
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

      tM && (targetModel = models[tM]);
      oM && (otherModel  = models[oM]);
    },

    s = function (tM, oM, expect) {
      if (!expect && _.isFunction(oM)) {
        expect = oM;
        oM = null;
      }
      return function () {
        setup(tM, oM);
        expect();
      };
    },

    areProxiedAndProxy = function (tM, oM) {
      return (tM === 'proxied' && oM !== 'proxied') || (tM === 'proxy' && oM === 'proxyProxy');
    };

  _(['proxied', 'proxy', 'proxy2', 'proxyProxy']).each(function (tM) { // target model

    _(['proxied', 'proxy', 'proxy2', 'proxyProxy']).each(function (oM) { // other model

      test(tM + '.set() should invoke change:attr-event listener on ' + oM, 1, s(tM, oM, function () {
        otherModel.on('change:name', function () {
          ok(true);
        });
        targetModel.set({ name: 'Betty' });
      }));

      test(tM + '.unset() should invoke change:attr-event listener on ' + oM, 1, s(tM, oM, function () {
        otherModel.on('change:name', function () {
          ok(true);
        });
        targetModel.unset('name');
      }));

      test(tM + '.clear() should invoke change:attr-event listeners on ' + oM, 2, s(tM, oM, function () {
        otherModel.on('change:name', function () {
          ok(true, 'invoked for change:name event');
        });
        otherModel.on('change:age', function () {
          ok(true, 'invoked for change:age event');
        });
        targetModel.clear();
      }));

      test(tM + '.set() should invoke change-event listener on ' + oM, 1, s(tM, oM, function () {
        otherModel.on('change', function () {
          ok(true);
        });
        targetModel.set({ name: 'Betty' });
      }));

      test(tM + '.unset() should invoke change-event listener on ' + oM, 1, s(tM, oM, function () {
        otherModel.on('change', function () {
          ok(true);
        });
        targetModel.unset('name');
      }));

      test(tM + '.clear() should invoke change-event listener on ' + oM, 1, s(tM, oM, function () {
        otherModel.on('change', function () {
          ok(true);
        });
        targetModel.clear();
      }));

      test(tM + '.set() should twice-invoke all-event listener on ' + oM, 2, s(tM, oM, function () {
        var invokedForChange, invokedForChangeAttr;

        otherModel.on('all', function (event) {
          if (event === 'change') {
            invokedForChange = true;
          }
          if (event === 'change:name') {
            invokedForChangeAttr = true;
          }
        });

        targetModel.set({ name: 'Betty' });

        ok(invokedForChange,     'invoked for change-event');
        ok(invokedForChangeAttr, 'invoked for change:attr-event');
      }));

      test(tM + '.unset() should twice-invoke all-event listener on ' + oM, 2, s(tM, oM, function () {
        var invokedForChange, invokedForChangeAttr;

        otherModel.on('all', function (event) {
          if (event === 'change') {
            invokedForChange = true;
          }
          if (event === 'change:name') {
            invokedForChangeAttr = true;
          }
        });

        targetModel.unset('name');

        ok(invokedForChange,     'invoked for change-event');
        ok(invokedForChangeAttr, 'invoked for change:attr-event');
      }));

      test(tM + '.clear() should thrice-invoke all-event listener on ' + oM, 3, s(tM, oM, function () {
        var invokedForChange, invokedForChangeNameAttr, invokedForChangeAgeAttr;

        otherModel.on('all', function (event) {
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

        targetModel.clear();

        ok(invokedForChange,         'invoked for change-event');
        ok(invokedForChangeNameAttr, 'invoked for change:name-event');
        ok(invokedForChangeAgeAttr,  'invoked for change:age-event');
      }));

      ///

      test(tM + '.set() should invoke change:attr-event listener on ' + oM + ', with context = ' + oM + ' (if no context given)', 1, s(tM, oM, function () {
        otherModel.on('change:name', function () {
          strictEqual(this, otherModel);
        });
        targetModel.set({ name: 'Betty' });
      }));

      test(tM + '.unset() should invoke change:attr-event listener on ' + oM + ', with context = ' + oM + ' (if no context given)', 1, s(tM, oM, function () {
        otherModel.on('change:name', function () {
          strictEqual(this, otherModel);
        });
        targetModel.unset('name');
      }));

      test(tM + '.clear() should invoke change:attr-event listeners on ' + oM + ', with context = ' + oM + ' (if no context given)', 2, s(tM, oM, function () {
        otherModel.on('change:name', function () {
          strictEqual(this, otherModel, 'change:name-event listener invoked with context = ' + oM);
        });
        otherModel.on('change:age', function () {
          strictEqual(this, otherModel, 'change:age-event listener invoked with context = ' + oM);
        });
        targetModel.clear();
      }));

      test(tM + '.set() should invoke change-event listener on ' + oM + ', with context = ' + oM + ' (if no context given)', 1, s(tM, oM, function () {
        otherModel.on('change', function () {
          strictEqual(this, otherModel);
        });
        targetModel.set({ name: 'Betty' });
      }));

      test(tM + '.unset() should invoke change-event listener on ' + oM + ', with context = ' + oM + ' (if no context given)', 1, s(tM, oM, function () {
        otherModel.on('change', function () {
          strictEqual(this, otherModel);
        });
        targetModel.unset('name');
      }));

      test(tM + '.clear() should invoke change-event listener on ' + oM + ', with context = ' + oM + ' (if no context given)', 1, s(tM, oM, function () {
        otherModel.on('change', function () {
          strictEqual(this, otherModel);
        });
        targetModel.clear();
      }));

      test(tM + '.set() should twice-invoke all-event listener on ' + oM + ', with context = ' + oM + ' (if no context given)', 2, s(tM, oM, function () {
        otherModel.on('all', function () {
          strictEqual(this, otherModel);
        });
        targetModel.set({ name: 'Betty' });
      }));

      test(tM + '.unset() should twice-invoke all-event listener on ' + oM + ', with context = ' + oM + ' (if no context given)', 2, s(tM, oM, function () {
        otherModel.on('all', function () {
          strictEqual(this, otherModel);
        });
        targetModel.unset('name');
      }));

      test(tM + '.clear() should thrice-invoke all-event listener on ' + oM + ', with context = ' + oM + ' (if no context given)', 3, s(tM, oM, function () {
        otherModel.on('all', function () {
          strictEqual(this, otherModel);
        });
        targetModel.clear();
      }));

      ///

      test(tM + '.set() should invoke change:attr-event listener on ' + oM + ', with given context', 1, s(tM, oM, function () {
        var context = {};
        otherModel.on('change:name', function () {
          strictEqual(this, context);
        }, context);
        targetModel.set({ name: 'Betty' });
      }));

      test(tM + '.unset() should invoke change:attr-event listener on ' + oM + ', with given context', 1, s(tM, oM, function () {
        var context = {};
        otherModel.on('change:name', function () {
          strictEqual(this, context);
        }, context);
        targetModel.unset('name');
      }));

      test(tM + '.clear() should invoke change:attr-event listeners on ' + oM + ', with given context', 2, s(tM, oM, function () {
        var context1 = {}, context2 = {};
        otherModel.on('change:name', function () {
          strictEqual(this, context1, 'change:name-event listener invoked with appropriate context');
        }, context1);
        otherModel.on('change:age', function () {
          strictEqual(this, context2, 'change:name-event listener invoked with appropriate context');
        }, context2);
        targetModel.clear();
      }));

      test(tM + '.set() should invoke change-event listener on ' + oM + ', with given context', 1, s(tM, oM, function () {
        var context = {};
        otherModel.on('change', function () {
          strictEqual(this, context);
        }, context);
        targetModel.set({ name: 'Betty' });
      }));

      test(tM + '.unset() should invoke change-event listener on ' + oM + ', with given context', 1, s(tM, oM, function () {
        var context = {};
        otherModel.on('change', function () {
          strictEqual(this, context);
        }, context);
        targetModel.unset('name');
      }));

      test(tM + '.clear() should invoke change-event listener on ' + oM + ', with given context', 2, s(tM, oM, function () {
        var context1 = {}, context2 = {};
        otherModel.on('change', function () {
          strictEqual(this, context1, 'change:name-event listener invoked with appropriate context');
        }, context1);
        otherModel.on('change', function () {
          strictEqual(this, context2, 'change:name-event listener invoked with appropriate context');
        }, context2);
        targetModel.clear();
      }));

      test(tM + '.set() should twice-invoke all-event listener on ' + oM + ', with given context', 2, s(tM, oM, function () {
        var context = {};
        otherModel.on('all', function () {
          strictEqual(this, context);
        }, context);
        targetModel.set({ name: 'Betty' });
      }));

      test(tM + '.unset() should twice-invoke all-event listener on ' + oM + ', with given context', 2, s(tM, oM, function () {
        var context = {};
        otherModel.on('all', function () {
          strictEqual(this, context);
        }, context);
        targetModel.unset('name');
      }));

      test(tM + '.clear() should thrice-invoke all-event listener on ' + oM + ', with given context', 3, s(tM, oM, function () {
        var context = {};
        otherModel.on('all', function () {
          strictEqual(this, context);
        }, context);
        targetModel.clear();
      }));

      ///

      test(tM + '.set() should invoke change:attr-event listener on ' + oM + ', with model param = ' + oM, 1, s(tM, oM, function () {
        otherModel.on('change:name', function (model) {
          strictEqual(model, otherModel);
        });
        targetModel.set({ name: 'Betty' });
      }));

      test(tM + '.unset() should invoke change:attr-event listener on ' + oM + ', with model param = ' + oM, 1, s(tM, oM, function () {
        otherModel.on('change:name', function (model) {
          strictEqual(model, otherModel);
        });
        targetModel.unset('name');
      }));

      test(tM + '.clear() should invoke change:attr-event listeners on ' + oM + ', with model param = ' + oM, 2, s(tM, oM, function () {
        otherModel.on('change:name', function (model) {
          strictEqual(model, otherModel);
        });
        otherModel.on('change:age', function (model) {
          strictEqual(model, otherModel);
        });
        targetModel.clear();
      }));

      test(tM + '.set() should invoke change-event listener on ' + oM + ', with model param = ' + oM, 1, s(tM, oM, function () {
        otherModel.on('change', function (model) {
          strictEqual(model, otherModel);
        });
        targetModel.set({ name: 'Betty' });
      }));

      test(tM + '.unset() should invoke change-event listener on ' + oM + ', with model param = ' + oM, 1, s(tM, oM, function () {
        otherModel.on('change', function (model) {
          strictEqual(model, otherModel);
        });
        targetModel.unset('name');
      }));

      test(tM + '.clear() should invoke change-event listener on ' + oM + ', with model param = ' + oM, 1, s(tM, oM, function () {
        otherModel.on('change', function (model) {
          strictEqual(model, otherModel);
        });
        targetModel.clear();
      }));

      test(tM + '.set() should twice-invoke all-event listener on ' + oM + ', with model param = ' + oM, 2, s(tM, oM, function () {
        otherModel.on('all', function (__, model) {
          strictEqual(model, otherModel);
        });
        targetModel.set({ name: 'Betty' });
      }));

      test(tM + '.unset() should twice-invoke all-event listener on ' + oM + ', with model param = ' + oM, 2, s(tM, oM, function () {
        otherModel.on('all', function (__, model) {
          strictEqual(model, otherModel);
        });
        targetModel.unset('name');
      }));

      test(tM + '.clear() should thrice-invoke all-event listener on ' + oM + ', with model param = ' + oM, 3, s(tM, oM, function () {
        otherModel.on('all', function (__, model) {
          strictEqual(model, otherModel);
        });
        targetModel.clear();
      }));

      if (tM === oM || areProxiedAndProxy(tM, oM)) {

        test(tM + '.trigger(boo) should invoke boo-listener on ' + oM, 1, s(tM, oM, function () {
          otherModel.on('boo', function (hoo) {
            strictEqual(hoo, 'hoo');
          });
          targetModel.trigger('boo', 'hoo');
        }));

        test(tM + '.trigger(boo) should invoke all-event listener on ' + oM, 2, s(tM, oM, function () {
          otherModel.on('all', function (event, hoo) {
            strictEqual(event, 'boo', 'listener invoked with boo-event');
            strictEqual(hoo, 'hoo', 'hoo argument set as expected');
          });
          targetModel.trigger('boo', 'hoo');
        }));

      } else {

        test(tM + '.trigger(boo) should not invoke boo-listener on ' + oM, 0, s(tM, oM, function () {
          otherModel.on('boo', function () {
            ok(false);
          });
          targetModel.trigger('boo', 'hoo');
        }));

      }

    }); // Iterate: other model = proxied', 'proxy', 'proxy2', 'proxyProxy'

  }); // Iterate: target model = proxied', 'proxy', 'proxy2', 'proxyProxy'

}());
