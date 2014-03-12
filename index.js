// builtin
var fs = require('fs');
var path = require('path');

// vendor
var resv = require('resolve');

// given a path, create an array of node_module paths for it
// borrowed from substack/resolve
function nodeModulesPaths (start, cb) {
    var splitRe = process.platform === 'win32' ? /[\/\\]/ : /\/+/;
    var parts = start.split(splitRe);

    var dirs = [];
    for (var i = parts.length - 1; i >= 0; i--) {
        if (parts[i] === 'node_modules') continue;
        var dir = path.join(
            path.join.apply(path, parts.slice(0, i + 1)),
            'node_modules'
        );
        if (!parts[0].match(/([A-Za-z]:)/)) {
            dir = '/' + dir;
        }
        dirs.push(dir);
    }
    return dirs;
}

// paths is mutated
// load shims from first package.json file found
function load_shims(paths) {
    // identify if our file should be replaced per the browser field
    // original filename|id -> replacement
    var shims = {};
    var cur_path;

    while(cur_path = paths.shift()) {

        var pkg_path = path.join(cur_path, 'package.json');
        if (!fs.existsSync(pkg_path)) continue;

        var info = require(pkg_path);

        // support legacy browserify field for easier migration from legacy
        // many packages used this field historically
        if (typeof info.browserify === 'string' && !info.browser) {
            info.browser = info.browserify;
        }

        // no replacements, skip shims
        if (!info.browser) {
            break;
        }

        // if browser field is a string
        // then it just replaces the main entry point
        if (typeof info.browser === 'string') {
            var key = path.resolve(cur_path, info.main || 'index.js');
            shims[key] = path.resolve(cur_path, info.browser);
            break;
        }

        // http://nodejs.org/api/modules.html#modules_loading_from_node_modules_folders
        Object.keys(info.browser).forEach(function(key) {
            if (info.browser[key] === false) {
                return shims[key] = __dirname + '/empty.js';
            }

            var val = info.browser[key];

            // if target is a relative path, then resolve
            // otherwise we assume target is a module
            if (val[0] === '.') {
                val = path.resolve(cur_path, val);
            }

            // if does not begin with / ../ or ./ then it is a module
            if (key[0] !== '/' && key[0] !== '.') {
                return shims[key] = val;
            }

            var key = path.resolve(cur_path, key);
            shims[key] = val;
        });
    }
    return shims;
}

function resolve(id, opts) {

    // opts.filename
    // opts.paths
    // opts.modules
    // opts.packageFilter

    opts = opts || {};

    var base = path.dirname(opts.filename);
    var paths = nodeModulesPaths(base);

    if (opts.paths) {
        paths.push.apply(paths, opts.paths);
    }

    paths = paths.map(function(p) {
        return path.dirname(p);
    });

    // we must always load shims because the browser field could shim out a module
    var shims = load_shims(paths);

    if (shims[id]) {
        // if the shim was is an absolute path, it was fully resolved
        if (shims[id][0] === '/') {
            return shims[id];
        }

        // module -> alt-module shims
        id = shims[id];
    }

    var modules = opts.modules || {};
    var shim_path = modules[id];
    if (shim_path) {
        return shim_path;
    }

    // our browser field resolver
    // if browser field is an object tho?
    var full = resv.sync(id, {
        paths: opts.paths,
        extensions: opts.extensions,
        basedir: base,
        package: opts.package,
        packageFilter: function(info, pkgdir) {
            if (opts.packageFilter) info = opts.packageFilter(info, pkgdir);

            // support legacy browserify field
            if (typeof info.browserify === 'string' && !info.browser) {
                info.browser = info.browserify;
            }

            // no browser field, keep info unchanged
            if (!info.browser) {
                return info;
            }

            // replace main
            if (typeof info.browser === 'string') {
                info.main = info.browser;
                return info;
            }

            var replace_main = info.browser[info.main || './index.js'];
            info.main = replace_main || info.main;
            return info;
        }
    });

    return (shims) ? shims[full] || full : full;
};

module.exports = resolve;
