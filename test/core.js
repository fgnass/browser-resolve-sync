// test loading core modules
var assert = require('assert');
var resolve = require('../');

var shims = {
    events: 'foo'
};

test('shim found', function() {
    var path = resolve('events', { modules: shims });
    assert.equal(path, 'foo');
});

test('core shim not found', function() {
    var path = resolve('http', {});
    assert.equal(path, 'http');
});
