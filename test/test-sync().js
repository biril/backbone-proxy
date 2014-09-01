/*global Backbone, BackboneProxy, _, QUnit, test, strictEqual, ok  */
(function () {
  'use strict';

  // Tests regarding sync-related functionality, i.e. fetch()/save()/destroy()ing models
  QUnit.module('.sync-related methods', {
    setup: function () {},
  });

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
    };

  _(['proxied', 'proxy', 'proxy2', 'proxyProxy']).each(function (tM) { // target model

    _(['proxied', 'proxy', 'proxy2', 'proxyProxy']).each(function (oM) { // other model

      test(tM + '.fetch() should populate ' + oM + ' with received data', 1, s(tM, oM, function () {
        proxied.sync = function (method, model, options) { // Setting sync only effective on root-proxied
          options.success({
            name: 'Betty'
          });
        };

        targetModel.fetch({
          success: function () {
            strictEqual(otherModel.get('name'), 'Betty');
          }
        });
      }));

      test(tM + '.fetch() should trigger request/sync events on ' + oM + ', with expected context', 2, s(tM, oM, function () {
        proxied.sync = function (method, model, options) { // Setting sync only effective on root-proxied
          model.trigger('request', model, undefined, options); // The 'request' event is a concern of the sync method
          options.success(model.toJSON());
        };

        otherModel.on('request', function () {
          strictEqual(this, otherModel, 'context of request-event callback is ' + oM);
        });

        otherModel.on('sync', function () {
          strictEqual(this, otherModel, 'context of sync-event callback is ' + oM);
        });

        targetModel.fetch();
      }));

      test(tM + '.fetch() should trigger request/sync events on ' + oM + ', with expected model parameter', 2, s(tM, oM, function () {
        proxied.sync = function (method, model, options) { // Setting sync only effective on root-proxied
          model.trigger('request', model, undefined, options); // The 'request' event is a concern of the sync method
          options.success(model.toJSON());
        };

        otherModel.on('request', function (model) {
          strictEqual(model, otherModel, 'model parameter of request-event callback is ' + oM);
        });

        otherModel.on('sync', function (model) {
          strictEqual(model, otherModel, 'model parameter of sync-event callback is ' + oM);
        });

        targetModel.fetch();
      }));

    }); // Iterate: other model = proxied', 'proxy', 'proxy2', 'proxyProxy'

    test(tM + '.sync() is always invoked with root-proxied as the model', 8, s(tM, function () {
      proxied.sync = function (method, model, options) {
        ok(method === 'read', '.sync() invoked with method = read ..');
        strictEqual(model, proxied, '.. and model is root-proxied');
        options.success(model.toJSON());
      };
      targetModel.fetch();

      proxied.sync = function (method, model, options) {
        ok(method === 'create', '.sync() invoked with method = create ..');
        strictEqual(model, proxied, '.. and model is root-proxied');
        options.success(_(model.toJSON()).extend({ id: 1 }));
      };
      targetModel.save();

      proxied.sync = function (method, model, options) {
        ok(method === 'update', '.sync() invoked with method = update ..');
        strictEqual(model, proxied, '.. and model is root-proxied');
        options.success(_(model.toJSON()).extend({ name: 'Betty' }));
      };
      targetModel.save();

      proxied.sync = function (method, model, options) {
        ok(method === 'delete', '.sync() invoked with method = delete ..');
        strictEqual(model, proxied, '.. and model is root-proxied');
        options.success();
      };
      targetModel.destroy();
    }));

    test(tM + '.fetch() should invoke success function on ' + tM + ', with expected model parameter', 1, s(tM, function () {
      proxied.sync = function (method, model, options) { // Setting sync only effective on root-proxied
        options.success(model.toJSON());
      };

      targetModel.fetch({
        success: function (model) {
          strictEqual(model, targetModel);
        }
      });
    }));

    test(tM + '.fetch() should invoke error function on ' + tM + ', with expected model parameter', 1, s(tM, function () {
      proxied.sync = function (method, model, options) { // Setting sync only effective on root-proxied
        options.error();
      };

      targetModel.fetch({
        error: function (model) {
          strictEqual(model, targetModel);
        }
      });
    }));

  }); // Iterate: target model = proxied', 'proxy', 'proxy2', 'proxyProxy'

}());
