/// <reference path="../typings/all.d.ts" />
import fs = require('fs-extra');
import path = require('path');
import util = require('./util');

const callback = util.callback;

export class Cache {
    constructor(private dir:string) {
    }

    set(key:string, sourceDir:string, cb?:Function):void {
        let targetDir = path.join(this.dir, key);
        fs.copy(sourceDir, targetDir, (error) => {
            return callback(cb, error);
        });


    }

    get(key:string, targetDir:string, cb?:Function):void {
        let sourceDir = path.join(this.dir, key);
        fs.copy(sourceDir, targetDir, (error) => {
            if (error && error['code'] == 'ENOENT') {
                return callback(cb, null, false);
            } else if (error) {
                return callback(cb, error);
            } else {
                return callback(cb, error, true);
            }
        });

    }

    del(key:string, cb?:Function):void {
        let dir = path.join(this.dir, key);
        fs.rmdir(dir, (error) => {
            return callback(cb, error);
        });
    }


    has(key:string, cb?:((exists:boolean) => void)) {
        let dir = path.join(this.dir, key);
        fs.open(dir, 'r', undefined, (error, fd) => {
            if (!error) fs.close(fd);
            let exists = true;
            if (error && error['code'] === 'ENOENT') {
                exists = false;
            }
            return callback(cb, exists);
        });
    }

}

