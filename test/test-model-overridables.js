/*global Backbone, BackboneProxy, QUnit, test, strictEqual, ok */
(function () {
  'use strict';

  var proxied, proxy;

  QUnit.module('model overridables', {
    setup: function () {
      var Proxy;
      proxied = new Backbone.Model({ name: 'Anna' });
      Proxy = BackboneProxy.extend(proxied);
      proxy = new Proxy();
    }
  });

  //////// .sync() method

  test('setting a .sync() method on proxy should have no effect', 0, function () {
    proxy.sync = function () {
      ok(false, 'the sync method should not be invoked');
    };
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
  //////// .url() method
  //////// .urlRoot() method
  //////// .parse() method

}());
