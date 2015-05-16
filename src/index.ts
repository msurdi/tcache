/// <reference path="typings/all.d.ts" />
require('source-map-support').install();

import program = require('commander');
import fs = require('fs');
import path = require('path');
import child_process = require('child_process');

function loadMetadata():any {
    var appDir = path.dirname(require.main.filename);
    return JSON.parse(fs.readFileSync(path.join(appDir, '../package.json'), 'utf8'));
}

program
    .version(loadMetadata().version)
    .usage('[options] -- <command>')
    .option('-p --path <path>', 'Path to cache', '.')
    .option('-k --key <key>', 'Cache key. By default, the path basename is used')
    .option('-c --cache-dir <path>', 'Path to use for cache storage', '~/.pcache')
    .option('-r --remove-older <time>', 'Remove cache entries older than <time>. Set to 0 to cache forever', 0)
    .on('--help', function () {
        console.log('  Examples:');
        console.log('');
        console.log('    $ pcache -p ./node_modules -k $(md5 -q package.json) -- npm install');
        console.log('');
    });

class Cache {
    constructor(private dir:string) {

    }

    set(key:string, sourceDir:string, cb?:Function):void {
        console.log('Saving to cache');
        return callback(cb);

    }

    get(key:string, targetDir:string, cb?:Function):void {
        console.log('Loading from cache');
        return callback(cb);

    }

    del(key:string, cb?:Function):void {
        console.log('Deleting from cache');
        return callback(cb);
    }

    list(cb?:((results:string) => void)) {
        return callback(cb);

    }

    has(key:string, cb?:((exists:boolean) => void)) {
        console.log('has cache?');
        return callback(cb);
    }

}

function callback(fn:Function, ...args:any[]) {
    if (typeof fn === 'function') {
        return fn.apply(null, Array.prototype.slice.call(arguments, 1))
    }
}


function main() {
    program.parse(process.argv);
    debugger;
    let opts = program.opts();
    let cacheDir = opts['cacheDir'].toString();
    let sourcePath = opts['path'].toString();
    let key = opts['key'] ? opts['key'].toString() : path.basename(sourcePath.toString());
    let command = program.args ? program.args.join(' ') : undefined;
    let cache = new Cache(cacheDir);

    cache.has(key, (exists) => {
        if (exists) {
            cache.get(key, sourcePath, afterCacheGet);
        }
        else {
            if (command) {
                run(command, afterRun);
            }
        }
    });

    function run(command, cb?:(error:Error, stdout:Buffer, stderr:Buffer) =>void) {
        console.log('Running command');
        let options = {
            env: process.env,
            shell: process.env['SHELL'],
        };
        child_process.exec(command, options, afterRun)
    }

    function afterCacheGet() {
        console.log(`Restored ${sourcePath} from cache`);
    }

    function afterRun(error:Error, stdout:Buffer, stderr:Buffer) {
        if (error) {
            console.log(`pcache command for generating files failed with exit status: ${error['code']}`)
        }
        cache.set(key, sourcePath, afterCacheSet);
    }

    function afterCacheSet() {
        console.log(`Saved ${sourcePath} to cache`);
    }

}


main();