/// <reference path="../typings/all.d.ts" />
import fs = require('fs-extra');
import path = require('path');

export function getUserHome():string {
    return process.env['HOME'] || process.env['USERPROFILE'];
}

export function loadMetadata():any {
    var appDir = path.dirname(require.main.filename);
    return JSON.parse(fs.readFileSync(path.join(appDir, '../package.json'), 'utf8'));
}

export function callback(fn:Function, ...args:any[]) {
    process.nextTick(function () {
        if (typeof fn === 'function') {
            return fn.apply(null, args)
        }
    });
}
