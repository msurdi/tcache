"use strict";
var fs = require('fs-extra');
var path = require('path');
var util = require('./util');
var _ = require('underscore');
var callback = util.callback;
var Cache = (function () {
    function Cache(dir) {
        this.dir = dir;
    }
    Cache.prototype.set = function (key, sourceDir, cb) {
        var targetDir = path.join(this.dir, key);
        fs.copy(sourceDir, targetDir, function (error) {
            return callback(cb, error);
        });
    };
    Cache.prototype.get = function (key, targetDir, cb) {
        var sourceDir = path.join(this.dir, key);
        fs.copy(sourceDir, targetDir, function (error) {
            if (error && error['code'] == 'ENOENT') {
                return callback(cb, null, false);
            }
            else if (error) {
                return callback(cb, error);
            }
            else {
                return callback(cb, error, true);
            }
        });
    };
    Cache.prototype.del = function (key, cb) {
        var dir = path.join(this.dir, key);
        fs.remove(dir, function (error) {
            return callback(cb, error);
        });
    };
    Cache.prototype.purge = function (timeout, cb) {
        var _this = this;
        var self = this;
        fs.readdir(this.dir, function (error, files) {
            if (error) {
                if (error['code'] == 'ENOENT') {
                    return callback(cb, null, []);
                }
                return callback(cb, error);
            }
            var stats = [];
            if (files.length == 0) {
                return callback(cb, null, []);
            }
            for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                var file = files_1[_i];
                var filePath = path.join(_this.dir, file);
                statFile(filePath);
            }
            function statFile(filePath) {
                var afterNStats = _.after(files.length, afterStats);
                fs.stat(filePath, function (error, stat) {
                    if (error) {
                        console.warn("Error reading " + filePath + ": " + error.message);
                    }
                    stats.push({ path: filePath, stat: stat });
                    afterNStats(stats);
                });
            }
            function afterStats(stats) {
                var now = new Date();
                var toRemove = stats.filter(function (stat) {
                    return now.getTime() - stat.stat.ctime.getTime() > timeout;
                });
                if (toRemove.length === 0) {
                    return callback(cb, null, []);
                }
                var afterNRemove = _.after(toRemove.length, afterRemove);
                toRemove.forEach(function (f) {
                    var removed = [];
                    var key = path.basename(f.path);
                    self.del(key, function (error) {
                        if (error)
                            return afterRemove(error, []);
                        removed.push(key);
                        afterNRemove(null, removed);
                    });
                });
            }
            function afterRemove(error, removed) {
                return callback(cb, error, removed);
            }
        });
    };
    Cache.prototype.has = function (key, cb) {
        var dir = path.join(this.dir, key);
        fs.open(dir, 'r', undefined, function (error, fd) {
            if (!error)
                fs.close(fd);
            var exists = true;
            if (error && error['code'] === 'ENOENT') {
                exists = false;
            }
            return callback(cb, exists);
        });
    };
    return Cache;
}());
exports.Cache = Cache;
//# sourceMappingURL=cache.js.map