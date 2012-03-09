//  wob.js: Experiments with Web Workers
//  http://github.com/atdt/escapes.js
//  Copyright (C) 2012 Ori Livneh
//
//  This program is free software; you can redistribute it and/or
//  modify it under the terms of the GNU General Public License
//  as published by the Free Software Foundation; either version 2
//  of the License, or (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.

(function (w) {
    "use strict";

    function format(str) {
        var args = Array.prototype.slice.call(arguments, 1);
        return str.replace(/%s/g, function () {
            return args.shift().toString() || '%s';
        });
    }

    function wrap(f) {
        function wrapper(f) {
            self.onmessage = function (e) {
                self.postMessage({
                    control  : e.data.control,
                    resp     : f.apply(f, e.data.args)
                });
            };
        }
        return format('(%s)(%s)', wrapper, f);
    }

    var BlobBuilder = (w.BlobBuilder ||
                       w.WebKitBlobBuilder ||
                       w.MozBlobBuilder),

        URL = (w.URL ||
               w.webkitURL),

        urlref = {
            assign: function (o) {
                var builder, blob;

                builder = new BlobBuilder();
                builder.append(o);
                blob = builder.getBlob();
                return URL.createObjectURL(blob);
            },
            revoke: URL.revokeObjectURL
        },

        wob = function (f) {
            var worker = wob.Worker(f),
                callbacks = {},
                control = 0;

            return function () {
                var args = Array.prototype.slice.call(arguments, 0);

                callbacks[control] = args.pop();

                worker.onmessage = function(e) {
                    callbacks[e.data.control](e.data.resp);
                };

                worker.postMessage({
                    control : control,
                    args    : args
                });

                control++;
            };
        };

        wob.Worker = function (o) {
            var src = typeof o === 'function' ? wrap(o) : o.toString(),
                ref = urlref.assign(src),
                worker = new w.Worker(ref);
            urlref.revoke(ref);
            worker.on = worker.addEventListener;
            return worker;
        };

    w.wob = wob;


    if (w.wobtest) {
        // export helpers to global scope when testing
        w.urlref = urlref;
        w.format = format;
        w.wrap = wrap;
    }

}(this));
