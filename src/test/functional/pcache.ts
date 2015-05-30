/// <reference path="../../typings/all.d.ts" />
require('source-map-support').install();

import chai = require('chai');
import spawn = require('child_process');
import tmp = require('tmp');
import path = require('path');
import ncp = require('ncp');
import fs = require('fs');

const BIN = path.join(__dirname, '../../../bin/pcache');
const assert = chai.assert;

function run(args = [], cb:Function = null) {
    var process = spawn.spawn(BIN, args);
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

describe("When command is run with --help", () => {
    it('Should print help', (done) => {
        run(['--help'], (err, code, stdout) => {
            assert.include(stdout, 'Usage:');
            assert.include(stdout, 'Options:');
            assert.include(stdout, 'Examples:');
            done();
        });
    });

});