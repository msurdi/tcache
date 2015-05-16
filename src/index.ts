/// <reference path="typings/all.d.ts" />
require('source-map-support').install();

import program = require('commander');
import fs = require('fs');
import path = require('path');
import child_process = require('child_process');
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
    .option('-r --remove-older <time>', 'Remove cache entries older than <time>. Set to 0 to cache forever', 0)
    .on('--help', function () {
        console.log('  Examples:');
        console.log('');
        console.log('    $ pcache -p ./node_modules -k $(md5 -q package.json) -- npm install');
        console.log('');
    });


function main() {
    program.parse(process.argv);
    let opts = program.opts();
    let cacheDir = opts['cacheDir'].toString();
    let sourcePath = opts['path'].toString();
    let force:boolean = opts['force'];
    let key = opts['key'] ? opts['key'].toString() : path.basename(sourcePath.toString());
    let command = program.args ? program.args.join(' ') : undefined;
    let cache = new cachelib.Cache(cacheDir);

    // Check if the path already exists
    fs.open(sourcePath, 'r', undefined, (error, fd) => {
        if (!error) fs.close(fd);
        if ((error && error['code'] === 'ENOENT') || force) {
            // restore from cache if it is already there
            cache.has(key, (exists) => {
                if (exists) {
                    cache.get(key, sourcePath, afterCacheGet);
                }
                // Else run the command that is supposed to generate it
                else if (command) {
                    run(command, afterRun);
                }
            });
        } else {
            console.log("Nothing to do");
        }
    });

    function run(command, cb?:(code:number) =>void) {
        console.log('Running command');
        let options = {
            env: process.env,
            shell: process.env['SHELL'],
        };
        let p = child_process.spawn(process.env['SHELL'], ['-c', command], options);
        p.stdout.pipe(process.stdout);
        p.stderr.pipe(process.stderr);
        p.on('exit', cb);
        // Wait forever for child process
        setInterval(()=> {
            // Maybe implement a timeout feature and kill the subprocess?
        }, 1000);

    }

    function afterCacheGet() {
        console.log(`Restored ${sourcePath} from cache`);
    }

    function afterRun(code:number) {
        if (code) {
            console.log(`pcache command for generating files failed with exit status: ${code}`)
        }
        cache.set(key, sourcePath, afterCacheSet);

        function afterCacheSet() {
            console.log(`Saved ${sourcePath} to cache`);
            process.exit(code);
        }
    }

}

main();