/// <reference path="typings/all.d.ts" />
require('source-map-support').install();

import program = require('commander');
import fs = require('fs');
import path = require('path');

function loadMetadata():any {
    var appDir = path.dirname(require.main.filename);
    return JSON.parse(fs.readFileSync(path.join(appDir, '../package.json'), 'utf8'));
}

program
    .version(loadMetadata().version)
    .usage('[options] -- <command>')
    .option('-p --path <path>', 'Path to cache', '.')
    .option('-k --key <key>', 'Cache key')
    .option('-c --cache-dir <path>', 'Path to use for cache storage', '~/.pcache')
    .option('-r --remove-older <time>', 'Remove cache entries older than <time>. Set to 0 to cache forever', 0)
    .on('--help', function () {
        console.log('  Examples:');
        console.log('');
        console.log('    $ pcache -p ./node_modules -k $(md5 -q package.json) -- npm install');
        console.log('');
    });

class Cache {
    constructor(private dir:Path);

    set(key:string, sourceDir:Path):void {

    }

    get(key:string, targetDir:Path):Path {

    }

    del(key:string):void {

    }

    list():Path[] {

    }

    has(key:string):boolean {

    }

}

interface Path extends path.ParsedPath {
}

function main() {
    let key:string = program.optionFor('key').toString();
    let cacheDir:Path = path.parse(program.optionFor('cache-dir').toString());
    let sourcePath:Path = path.parse(program.optionFor('path').toString());
    let command:string = program.args.join(' ');

    program.parse(process.argv);
    console.log(program.args);
    if (!key) {
        process.exit(1);
    }

    let cache = new Cache(cacheDir);

    if (cache.has(key)) {
        cache.get(key, sourcePath)
    } else {
        run(command);
        cache.set(key, sourcePath);
    }

}


main();