/// <reference path="../typings/all.d.ts" />
import fs = require('fs-extra');
import path = require('path');
import _ = require('underscore');

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

interface StatResult {
    path:string;
    stat:fs.Stats;
}

/**
 * Recursively removes any directory or file older than a given time
 *
 * @param dir - Root directory to look for directories or files to remove
 * @param removeOlder - Any file/directory older than this number of milliseconds will be removed
 * @param cb - Callback
 */
export function cleanup(dir:string, removeOlder:number, cb?:Function):void {
    fs.readdir(dir, (error, files:string[]) => {
        if (error) return callback(cb, error);
        let stats:StatResult[] = [];
        let statCount = 0;
        for (let file of files) {
            let filePath = path.join(dir, file);
            statFile(filePath);
        }

        function statFile(filePath:string) {
            let afterNStats = _.after(files.length, afterStats);
            fs.stat(filePath, (error, stat) => {
                statCount += 1;
                if (error) {
                    console.log(`Error reading ${filePath}: ${error.message}`);
                }
                stats.push({path: filePath, stat: stat});
                afterNStats(stats);
            });
        }

        function afterStats(stats:StatResult[]) {
            var now = new Date();
            let toRemove = stats.filter((stat)=> {
                return now.getTime() - stat.stat.ctime.getTime() > removeOlder;
            });
            toRemove.forEach((f) => {
                let afterNRemove = _.after(toRemove.length, afterRemove);
                fs.remove(f.path, (error) => {
                    if (error) return afterRemove(error);
                    console.log(`Removed ${f.path} from cache`);
                    afterNRemove(null);
                })
            })
        }

        function afterRemove(err) {
            return callback(cb);
        }
    });
}

