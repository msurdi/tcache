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
    .option('-p --path <path>', 'Path to cache')
    .option('-k --key <key>', 'Cache key')
    .option('-c --cache-path <path>', 'Path to use for cache storage')
    .option('-r --remove-older <time>', 'Remove cache entries older than <time>')
    .on('--help', function () {
        console.log('  Examples:');
        console.log('');
        console.log('    $ pcache -p ./node_modules -k $(md5 -q package.json) -- npm install');
        console.log('');
    });

program.parse(process.argv);
