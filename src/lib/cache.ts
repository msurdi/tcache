/// <reference path="../typings/all.d.ts" />
import fs = require('fs-extra');
import path = require('path');
import expandHomeDir = require('expand-home-dir');

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
            return callback(cb, error);
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
            let exists = true;
            if (error && error['code'] === 'ENOENT') {
                exists = false;
            }
            if (!error) fs.close(fd);
            return callback(cb, exists);
        });
    }

}

function callback(fn:Function, ...args:any[]) {
    if (typeof fn === 'function') {
        return fn.apply(null, Array.prototype.slice.call(arguments, 1))
    }
}
