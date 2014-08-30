/*jshint node:true */
'use strict';
var qunit = require('qunit'),
absPath = (function () {
  var joinPaths = require('path').join;
  return function (relPath) {
    return joinPaths(__dirname, relPath);
  };
}());

qunit.options.deps = [{
  path: absPath('../node_modules/underscore/underscore.js'),
  namespace: '_'
}, {
  path: absPath('../node_modules/backbone/backbone.js'),
  namespace: 'Backbone'
}];

qunit.run({
  code: {
    path: absPath('../backbone-proxy.js'),
    namespace: 'BackboneProxy'
  },
  tests: [
    absPath('test-model-api.js'),
    absPath('test-model-overridables.js'),
    absPath('test-use-case.js'),
    absPath('test-set().js'),
    absPath('test-off()-by-event.js'),
    absPath('test-off()-by-callback.js'),
    absPath('test-off()-by-context.js'),
    absPath('test-query-changed-attrs.js')
  ]
}, function (error, stats) {
  if (error) {
    console.error(new Error(error));
    return process.exit(1);
  }
  process.exit(stats.failed > 0 ? 1 : 0);
});