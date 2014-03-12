var assert = require('assert');
var resolve = require('../');

var fixtures_dir = __dirname + '/fixtures-coffee/node_modules';

// no package.json, load index.js
test('index.js of module dir', function() {
    var parent = {
        paths: [ fixtures_dir ],
        extensions: ['.js', '.coffee']
    };
    var path = resolve('module-a', parent);
    assert.equal(path, require.resolve('./fixtures-coffee/node_modules/module-a/index.coffee'));
});

// package.json main field specifies other location
test('alternate main', function() {
    var parent = {
        paths: [ fixtures_dir ],
        extensions: ['.js', '.coffee']
    };
    var path = resolve('module-b', parent);
    assert.equal(path, require.resolve('./fixtures-coffee/node_modules/module-b/main.coffee'));
});

// package.json has 'browser' field which is a string
test('string browser field as main', function() {
    var parent = {
        paths: [ fixtures_dir ],
        extensions: ['.js', '.coffee']
    };
    var path = resolve('module-c', parent);
    assert.equal(path, require.resolve('./fixtures-coffee/node_modules/module-c/browser.coffee'));
});

// package.json has 'browser' field which is a string
test('string browser field as main - require subfile', function() {
    var parent = {
        filename: fixtures_dir + '/module-c/browser.js',
        paths: [ fixtures_dir + '/module-c/node_modules' ],
        extensions: ['.js', '.coffee']
    };

    var path = resolve('./bar', parent);
    assert.equal(path, require.resolve('./fixtures-coffee/node_modules/module-c/bar.coffee'));
});

// package.json has browser field as object
// one of the keys replaces the main file
// this would be done if the user needed to replace main and some other module
test('object browser field as main', function() {
    var parent = {
        paths: [ fixtures_dir ],
        extensions: ['.js', '.coffee']
    };
    var path = resolve('module-d', parent);
    assert.equal(path, require.resolve('./fixtures-coffee/node_modules/module-d/browser.coffee'));
});

// browser field in package.json maps ./foo.js -> ./browser.js
// when we resolve ./foo while in module-e, this mapping should take effect
// the result is that ./foo resolves to ./browser
test('object browser field replace file', function() {
    var parent = {
        filename: fixtures_dir + '/module-e/main.coffee',
        extensions: ['.js', '.coffee']
    };

    var path = resolve('./foo', parent);
    assert.equal(path, require.resolve('./fixtures-coffee/node_modules/module-e/browser.coffee'));
});

// same as above, but without a paths field in parent
// should still checks paths on the filename of parent
test('object browser field replace file - no paths', function() {
    var parent = {
        filename: fixtures_dir + '/module-f/lib/main.coffee',
        extensions: ['.js', '.coffee']
    };

    var path = resolve('./foo', parent);
    assert.equal(path, require.resolve('./fixtures-coffee/node_modules/module-f/lib/browser.coffee'));
});

test('replace module in browser field object', function() {
    var parent = {
        filename: fixtures_dir + '/module-g/index.js',
        extensions: ['.js', '.coffee']
    };

    var path = resolve('foobar', parent);
    assert.equal(path, require.resolve('./fixtures-coffee/node_modules/module-g/foobar-browser.coffee'));
});
