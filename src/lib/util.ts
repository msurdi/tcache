/// <reference path="../typings/all.d.ts" />
import fs = require('fs');
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
            return fn.apply(null, Array.prototype.slice.call(arguments, 1))
        }
    });
}

export function cleanup(dir:string, removeOlder:number, cb?:Function):void {
    fs.readdir(dir, (error, files:string[]) => {
        if (error) return callback(cb, error);
        let stats:fs.Stats[] = [];
        let statCount = 0;
        for (let file of files) {
            let filePath = path.join(dir, file);
            statFile(filePath);
        }
        return callback(cb);

        function statFile(filePath:string) {
            fs.stat(filePath, (error, stat) => {
                statCount += 1;
                if (error) {
                    console.log(`Error reading ${filePath}: ${error.message}`);
                }
                stats.push(stat);
                if (statCount === files.length) {
                    return process.nextTick(()=> {
                        afterStats(stats);
                    })
                }
            });

        }

        function afterStats(stats:fs.Stats[]) {
            var now = new Date();
            let toDelete = stats.filter((stat)=> {
                return now.getTime() - stat.ctime.getTime() > removeOlder;
            });

            console.log('deleting...');

            console.log(toDelete);
        }
    });
    return callback(cb);
}

