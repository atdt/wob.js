Wob.js: an Experiment in Concurrency
====================================

Wob.js is a JavaScript library for transforming ordinary functions into
asyncronous functions that run in their own threads using Web Workers. It
does this by doing things that upset Douglas Crockford.

::

    var asyncSum = wob(function (a, b) {
        return a + b;
    });

    asyncSum(4, 5, function (result) {
        console.log(result);
    });



Ordinarily, Web Workers are instantiated by passing a URL to the
constructor which resolves to a JavaScript script. Because you can't relay
function objects between workers, you have to know in advance which
operations you'd like to parallelize.

We work around this requirement by decompiling functions and wrapping
them with code that handles relaying data to and from the parent. We then
create an ObjectURL reference to the generated source code and use it to
spawn a worker.

It's a crazy hack, but it's a crazy hack with a good heart -- the idea is
to lower the barrier for working with Web Workers and investigate how
browser-based JavaScript code might look like as adoption of Web Workers
(and the need for them) increases.
