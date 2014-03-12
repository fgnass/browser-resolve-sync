var assert = require('assert');
var resolve = require('../');

var fixtures_dir = __dirname + '/fixtures-coffee';

test('local', function() {
    // resolve needs a parent filename or paths to be able to lookup files
    // we provide a phony parent file
    var parent = {
      filename: fixtures_dir + '/phony.js',
      extensions: ['.js', '.coffee']
    };
    var path = resolve('./foo', parent);
    assert.equal(path, require.resolve('./fixtures-coffee/foo.coffee'));
});
