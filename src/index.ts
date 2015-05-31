/// <reference path="typings/all.d.ts" />
require('source-map-support').install();

import program = require('commander');
import fs = require('fs');
import path = require('path');
import child_process = require('child_process');
import parseDuration = require('parse-duration');
import cachelib = require('./lib/cache');
import util = require('./lib/util');

program
    .version(util.loadMetadata().version)
    .usage('[options] -- <command>')
    .option('-p --path <path>', 'Path to cache', '.')
    .option('-f --force', 'Force restore from cache overwritting any existing files in path')
    .option('-k --key <key>', 'Cache key. By default, the path basename is used')
    .option('-c --cache-dir <path>', 'Path to use for cache storage. Defaults to ~/.pcache',
    path.join(util.getUserHome(), '.pcache'))
    .option('-r --remove-older <time>', 'Remove cache entries older than <time>. Set to 0 to cache forever', parseDuration)
    .on('--help', function () {
        console.log('  Examples:');
        console.log('');
        console.log('    $ pcache -p ./node_modules -k $(md5 -q package.json) -- npm install');
        console.log('');
    });

export function main() {
    program.parse(process.argv);

    let opts = program.opts();
    let cacheDir = opts['cacheDir'].toString();
    let sourcePath = opts['path'].toString();
    let force:boolean = opts['force'];
    let key = opts['key'] ? opts['key'].toString() : path.basename(sourcePath.toString());
    let command = program.args ? program.args.join(' ') : undefined;
    let cache = new cachelib.Cache(cacheDir);
    let removeOlder = opts['removeOlder'];

    if (removeOlder) {
        util.cleanup(cacheDir, removeOlder, afterCleanup);
    } else {
        afterCleanup(null, []);
    }

    function afterCleanup(error:Error, cleaned:string[]) {
        if (error) return terminate(error);
        checkSource(sourcePath, afterCheckSource);
    }

    function afterCheckSource(error:Error, exists:boolean) {
        if (error) return terminate(error);
        if (force) {
            run(command, afterRun);
        } else if (!exists) {
            cache.get(key, sourcePath, afterCacheGet);
        } else {
            console.log('Nothing to do');
        }
    }

    function afterCacheGet(error:Error, restored:boolean) {
        if (error) return terminate(error);
        if (!restored) {
            run(command, afterRun);
        }
    }

    function afterRun(error:Error, code:number) {
        console.log(`exit code: ${code}`);
        if (error) return terminate(error);
        cache.set(key, sourcePath, afterCacheSet);
    }

    function afterCacheSet(error:Error) {
        if (error) return terminate(error);
        console.log('Cache updated');
    }

}

function terminate(error:Error) {
    console.log(error.message);
}


function checkSource(path:string, cb?:Function) {
    fs.open(path, 'r', undefined, (error, fd) => {
        if (!error) fs.close(fd);
        if ((error && error['code'] === 'ENOENT')) {
            return util.callback(cb, null, false);
        } else if (error) {
            return util.callback(cb, error);
        } else {
            return util.callback(cb, error, true);
        }
    });
}


function run(command, cb?:Function) {
    console.log('Running command');
    let options = {
        env: process.env,
    };
    let p = child_process.spawn(process.env['SHELL'], ['-c', command], options);
    p.stdout.pipe(process.stdout);
    p.stderr.pipe(process.stderr);
    p.on('exit', (code) => {
        util.callback(cb, null, code);
    });
}
