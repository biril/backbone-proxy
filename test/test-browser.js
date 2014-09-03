/*global BackboneProxy, _, window, QUnit, test, ok */
(function () {
  'use strict';

  QUnit.module('browser');

  test('backboneProxy should be available in global scope', 2, function () {
    ok(_.isObject(window.BackboneProxy), 'window.backboneProxy is an object');
    ok(_.isFunction(BackboneProxy.extend), 'backboneProxy.extend is a function');
  });

  test('backboneProxy should have a .noConflict() method', 1, function () {
    ok(_.isFunction(BackboneProxy.noConflict));
  });

}());