/*global Backbone, _, BackboneProxy, QUnit, test, strictEqual, deepEqual, ok, throws */
(function () {
  'use strict';

  var proxied, proxy;

  QUnit.module('model overridables', {
    setup: function () {
      var Proxy;
      proxied = new Backbone.Model({ name: 'Anna' });
      Proxy = BackboneProxy.extend(proxied);
      proxy = new Proxy();
      Backbone.ajax = function () {
        throw 'unexpected invocation of Backbone.ajax';
      };
    }
  });

  //////// .sync() method

  test('setting a sync() method on proxy should have no effect', 0, function () {
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

  test('a sync() method set on proxied should be invoked when proxy is persisted', 4, function () {
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

  //////// .collection property

  test('setting the collection property on proxy should have no effect on model URL', 1, function () {
    var collection = new Backbone.Collection();
    collection.url = 'some/stuff';

    proxy.set({ id: 'yolo' });
    proxy.collection = collection;

    throws(function () {
      proxy.url();
    });
  });

  test('setting the collection property on proxied should determine the model URL', 1, function () {
    var collection = new Backbone.Collection();
    collection.url = 'some/stuff';

    proxy.set({ id: 'yolo' });
    proxied.collection = collection;

    strictEqual(proxy.url(), 'some/stuff/yolo');
  });

  //////// .parse() method

  test('setting the parse() method on proxy should not parse response', function () {
    proxied.sync = function (method, model, opts) {
      opts.success(_.clone(model.attributes));
    };
    proxy.parse = function (response) {
      return _(response).extend({ isParsed: true });
    };
    proxy.fetch();

    ok(!proxy.get('isParsed'));
  });

  test('setting the parse() method on proxied should parse response', function () {
    proxied.sync = function (method, model, opts) {
      opts.success(_.clone(model.attributes));
    };
    proxied.parse = function (response) {
      return _(response).extend({ isParsed: true });
    };
    proxy.fetch();

    ok(proxy.get('isParsed'));
  });

  //////// .validate() method

  test('setting the validate() method on proxy should not introduce validation', 1, function () {
    proxy.validate = function () {
      return 'invalid';
    };

    proxy.set({ name: 'Betty' }, { validate: true });

    ok(!proxy.validationError);
  });

  test('setting the validate() method on proxied should introduce validation', 1, function () {
    proxied.validate = function () {
      return 'invalid';
    };

    proxy.set({ name: 'Betty' }, { validate: true });

    strictEqual(proxy.validationError, 'invalid');
  });


  //////// .toJSON() method

  test('setting the toJSON() method on proxy should not affect serialized data for sync', 1, function () {
    Backbone.ajax = function (settings) {
      deepEqual(JSON.parse(settings.data), { name: 'Anna' });
    };
    proxy.toJSON = function () {
      return 'isSetByToJSON';
    };
    proxied.urlRoot = 'some/stuff';
    proxy.save();
  });

  test('setting the toJSON() method on proxied should determine serialized data for sync', 1, function () {
    Backbone.ajax = function (settings) {
      strictEqual(JSON.parse(settings.data), 'isSetByToJSON');
    };
    proxied.toJSON = function () {
      return 'isSetByToJSON';
    };
    proxied.urlRoot = 'some/stuff';
    proxy.save();
  });

  test('setting the toJSON() method on proxied should determine JSON representation of proxy', 1, function () {
    proxied.toJSON = function () {
      return 'isSetByToJSON';
    };
    strictEqual(JSON.stringify(proxy), '"isSetByToJSON"');
  });

}());
