"use strict";
var fs = require('fs-extra');
var path = require('path');
function getUserHome() {
    return process.env['HOME'] || process.env['USERPROFILE'];
}
exports.getUserHome = getUserHome;
function loadMetadata() {
    var appDir = path.dirname(require.main.filename);
    return JSON.parse(fs.readFileSync(path.join(appDir, '../package.json'), 'utf8'));
}
exports.loadMetadata = loadMetadata;
function callback(fn) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    process.nextTick(function () {
        if (typeof fn === 'function') {
            return fn.apply(null, args);
        }
    });
}
exports.callback = callback;
//# sourceMappingURL=util.js.map