/// <reference path="../../typings/all.d.ts" />
require('source-map-support').install();

import chai = require('chai');
import spawn = require('child_process');
import tmp = require('tmp');
import path = require('path');
import ncp = require('ncp');
import fs = require('fs-extra');

const BIN = path.join(__dirname, '../../../bin/pcache');
const TEST_FILE = 'this/is/a/test.txt';
const CMD = `( mkdir -p this/is/a && touch ${TEST_FILE} )`;

const assert = chai.assert;

function run(args:string = "", cb?:Function) {
    var process = spawn.spawn(BIN, args.split(' '));
    var stdout = '', stderr = '';
    process.stdout.on('data', function (data) {
        stdout += data.toString();
    });
    process.stderr.on('data', function (data) {
        stderr += data.toString();
    });

    process.on('close', (code) => {
        if (typeof cb == 'function') {
            return cb(null, code, stdout, stderr);
        }
    });
}

/**
 * Creates a version of {@link run} wich will always hae some fixed parameters
 *
 * @param preArgs - The parameters that will be prefixed to every {@link run} call
 * @param cb - Callback
 * @returns {function(string[], Function=): undefined}
 */
function createRun(preArgs:string = "", cb?:Function):Function {
    return (args:string = "", cb?:Function)=> {
        run(preArgs + ' ' + args, cb);
    }
}

describe("When command is run with --help", () => {
    it('Should print help', (done) => {
        run('--help', (err, code, stdout) => {
            assert.include(stdout, 'Usage:');
            assert.include(stdout, 'Options:');
            assert.include(stdout, 'Examples:');
            done();
        });
    });
});


describe("When there are no cache entries", () => {
    var cacheDir:string;
    var filesDir:string;
    var workDir:string;
    var runOnWorkDir;

    // Create a temp work directory for the tests
    beforeEach((done) => {
        tmp.dir({unsafeCleanup: true}, (error, tmpPath) => {
            if (error) throw error;
            workDir = tmpPath;
            // create cache and an actual directory with some ata
            cacheDir = path.join(workDir, 'cache');
            filesDir = path.join(workDir, 'files');
            fs.mkdirSync(cacheDir);
            fs.mkdirSync(filesDir);
            runOnWorkDir = createRun(`-c ${cacheDir}`);

            // Make sure we're in the work directory
            process.chdir(filesDir);
            done();
        });
    });

    afterEach(()=> {
        fs.removeSync(workDir);
    });

    it('Should run the command and save the result to cache', (done) => {
        runOnWorkDir(`-p this -- ${CMD}`, (err, code, stdout) => {
            assert.equal(code, 0);
            let createdFileStat = fs.statSync(path.join(filesDir, TEST_FILE));
            assert.isTrue(createdFileStat.isFile());
            let cachedFileStat = fs.statSync(path.join(cacheDir, TEST_FILE));
            assert.isTrue(cachedFileStat.isFile());
            done();
        });
    });

});




