# browser-resolve-sync [![Build Status](https://travis-ci.org/fgnass/browser-resolve-sync.png?branch=master)](https://travis-ci.org/fgnass/browser-resolve-sync)

Node.js resolve algorithm with [browser](https://gist.github.com/defunctzombie/4339901) field support.

This is 1:1 port of [Roman Shtylman's](https://github.com/defunctzombie) asynchronous [browser-resolve](https://github.com/defunctzombie/node-browser-resolve) module.

## API

### resolve(pkg, opts={})

Resolve a module and return the full path.

Options:

* filename - the calling filename where the require call originated (in the source)
* paths - require.paths array to use if nothing is found on the normal node_modules recursive walk
* packageFilter - transform the parsed package.json contents before looking at the "main" field
* modules - object with module id/name -> path mappings to consult before doing manual resolution (use to provide core modules)
* extensions - array of file extensions to search in order

# License

MIT
