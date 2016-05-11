"use strict";
require('source-map-support').install();
var program = require('commander');
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var parseDuration = require('parse-duration');
var cachelib = require('./lib/cache');
var util = require('./lib/util');
program
    .version(util.loadMetadata().version)
    .usage('[options] -- <command>')
    .option('-p --path <path>', 'Path to cache', '.')
    .option('-f --force', 'Force execution of command and cache update')
    .option('-k --key <key>', 'Cache key. By default, the path basename is used')
    .option('-c --cache-dir <path>', 'Path to use for cache storage. Defaults to ~/.tcache', path.join(util.getUserHome(), '.tcache'))
    .option('-r --remove-older <time>', 'Remove cache entries older than <time>. Set to 0 to cache forever', parseDuration)
    .on('--help', function () {
    console.log('  Examples:');
    console.log('');
    console.log('    $ tcache -p ./node_modules -k $(md5 -q package.json) -- npm install');
    console.log('');
    console.log('    $ tcache -p env -k $(md5 -q requirements.txt) -r 1d -- pip install -r requirements.txt --root=env');
    console.log('');
});
function main() {
    program.parse(process.argv);
    var opts = program.opts();
    var cacheDir = opts['cacheDir'].toString();
    var sourcePath = opts['path'].toString();
    var force = opts['force'];
    var key = opts['key'] ? opts['key'].toString() : path.basename(sourcePath.toString());
    var command = program.args ? program.args.join(' ') : undefined;
    var cache = new cachelib.Cache(cacheDir);
    var removeOlder = opts['removeOlder'];
    if (removeOlder) {
        cache.purge(removeOlder, afterCleanup);
    }
    else {
        afterCleanup(null, []);
    }
    function afterCleanup(error, cleaned) {
        if (error)
            return terminate(error);
        cleaned.forEach(function (f) {
            console.log("Removed " + f + " from cache");
        });
        checkSource(sourcePath, afterCheckSource);
    }
    function afterCheckSource(error, exists) {
        if (error)
            return terminate(error);
        if (force) {
            run(command, afterRun);
        }
        else if (!exists) {
            cache.get(key, sourcePath, afterCacheGet);
        }
        else {
            console.log('Nothing to do');
        }
    }
    function afterCacheGet(error, restored) {
        if (error)
            return terminate(error);
        if (!restored) {
            run(command, afterRun);
        }
        else {
            console.log('Restored from cache');
        }
    }
    function afterRun(error, code) {
        if (code)
            return terminate({ name: 'RunCommandError', message: "There was an error running the command. Exit code: " + code });
        if (error)
            return terminate(error);
        cache.set(key, sourcePath, afterCacheSet);
    }
    function afterCacheSet(error) {
        if (error)
            return terminate(error);
        console.log('Cache updated');
    }
}
exports.main = main;
function terminate(error) {
    console.log(error.message);
    process.exit(1);
}
function checkSource(path, cb) {
    fs.open(path, 'r', undefined, function (error, fd) {
        if (!error)
            fs.close(fd);
        if ((error && error['code'] === 'ENOENT')) {
            return util.callback(cb, null, false);
        }
        else if (error) {
            return util.callback(cb, error);
        }
        else {
            return util.callback(cb, error, true);
        }
    });
}
function run(command, cb) {
    console.log('Running command');
    var options = {
        env: process.env,
    };
    var p = child_process.spawn(process.env['SHELL'] || 'sh', ['-c', command], options);
    p.stdout.pipe(process.stdout);
    p.stderr.pipe(process.stderr);
    p.on('exit', function (code) {
        util.callback(cb, null, code);
    });
}
//# sourceMappingURL=index.js.map