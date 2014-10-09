/*global Backbone, _, BackboneProxy, QUnit, test, strictEqual, ok */
(function () {
  'use strict';

  var
    sync = Backbone.sync,
    proxied,
    proxy;

  QUnit.module('model overridables', {
    setup: function () {
      var Proxy;
      proxied = new Backbone.Model({ name: 'Anna' });
      Proxy = BackboneProxy.extend(proxied);
      proxy = new Proxy();
      Backbone.sync = function () {
        throw 'unexpected invocation of Backbone.sync';
      };
    },
    teardown: function () {
      Backbone.sync = sync;
    }
  });

  //////// .sync() method

  test('setting a .sync() method on proxy should have no effect', 0, function () {
    proxied.sync = function () {};
    proxy.sync = function () {
      ok(false, 'the sync method should not be invoked');
    };
    proxy.fetch();
    proxy.save();
    proxy.set({ id: 1 });
    proxy.save();
    proxy.destroy();
  });

  test('a .sync() method set on proxied should be invoked when proxy is persisted', 4, function () {
    proxied.sync = function (method) {
      strictEqual(method, 'read', 'invoked for fetch');
    };
    proxy.fetch();

    proxied.sync = function (method) {
      strictEqual(method, 'create', 'invoked for save (when model.isNew())');
    };
    proxy.save();

    proxied.sync = function (method) {
      strictEqual(method, 'update', 'invoked for save (when !model.isNew())');
    };
    proxy.save({ id: 1 });

    proxied.sync = function (method) {
      strictEqual(method, 'delete', 'invoked for destroy (when !model.isNew())');
    };
    proxy.set({ id: 1 });
    proxy.destroy();
  });

  test('a .sync() method set on proxied should be invoked with proxied as the model parameter when proxy is persisted', 4, function () {
    proxied.sync = function (method, model) {
      strictEqual(model, proxied, 'ok for fetch');
    };
    proxy.fetch();

    proxied.sync = function (method, model) {
      strictEqual(model, proxied, 'ok for save (when model.isNew())');
    };
    proxy.save();

    proxied.sync = function (method, model) {
      strictEqual(model, proxied, 'ok for save (when !model.isNew())');
    };
    proxy.save({ id: 1 });

    proxied.sync = function (method, model) {
      strictEqual(model, proxied, 'ok for destroy (when !model.isNew())');
    };
    proxy.set({ id: 1 });
    proxy.destroy();
  });

  //////// .url() / .urlRoot / .urlRoot() properties & methods

  test('setting the url() method on proxy should not affect the request URL during sync', 1, function () {
    proxied.urlRoot = 'original url';
    proxied.sync = function (method, model) {
      strictEqual(_.result(model, 'url'), 'original url');
    };

    proxy.url = function () {
      return 'changed url';
    };
    proxy.fetch(); // or save/destroy
  });

  test('setting the urlRoot property on proxy should not affect the result of proxy.url()', 1, function () {
    proxied.urlRoot = 'original url';
    proxy.urlRoot = 'changed url';
    strictEqual(proxy.url(), 'original url');
  });

  test('setting the urlRoot property on proxy should not affect the request URL during sync', 1, function () {
    proxied.urlRoot = 'original url';
    proxied.sync = function (method, model) {
      strictEqual(_.result(model, 'url'), 'original url');
    };

    proxy.urlRoot = 'changed url';

    proxy.fetch(); // or save/destroy
  });

  test('setting the urlRoot() method on proxy should not affect the result of proxy.url()', 1, function () {
    proxied.urlRoot = 'original url';
    proxy.urlRoot = function () {
      return 'changed url';
    };
    strictEqual(proxy.url(), 'original url');
  });

  test('setting the urlRoot() method on proxy should not affect the request URL during sync', 1, function () {
    proxied.urlRoot = 'original url';
    proxied.sync = function (method, model) {
      strictEqual(_.result(model, 'url'), 'original url');
    };

    proxy.urlRoot = function () {
      return 'changed url';
    };
    proxy.fetch(); // or save/destroy
  });

  //////// .idAttribute property

  test('setting idAttribute on proxy should have no effect', 2, function () {
    proxy.set({ id: '01234'});
    proxy.idAttribute = '_id';

    ok(!proxied.isNew(), 'proxied is not new, although idAttribute is changed');
    ok(!proxy.isNew(), 'proxy is not new, although idAttribute is changed');
  });

  test('setting idAttribute on proxied should have the intended effect', 2, function () {
    proxy.set({ id: '01234'});
    proxied.idAttribute = '_id';

    ok(proxied.isNew(), 'proxied with changed idAttribute is new');
    ok(proxy.isNew(), 'proxy with changed idAttribute is new');
  });

  // TODO:

  //////// .toJSON() method
  //////// .validate() method
  //////// .parse() method

}());
