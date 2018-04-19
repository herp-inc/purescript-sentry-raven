"use strict";

var Raven = require('raven');


exports.withRavenImpl = function(dsn, ctx, act) {
    var raven = new Raven.Client(dsn);
    raven.setContext(ctx);
    return raven.context(ctx, function(){
        return act(raven)();
    });
};

exports.withNewCtxImpl = function(raven, ctx, act) {
    raven.setContext(ctx);
    return raven.context(ctx, function(){
        return act(raven)();
    });
};

exports.captureMessageImpl = function(raven, msg) {
    raven.captureMessage(msg);
};

exports.captureExceptionImpl = function(raven, err) {
    raven.captureException(err);
};

exports.getContextImpl = function(raven) {
  return raven.getContext();
};

exports.setContextImpl = function(raven, ctx) {
  raven.setContext(ctx);
};

exports.extend =
    Object.assign ||
    function(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };

exports.recordBreadcrumbImpl = function(raven, breadcrumb) {
    breadcrumb = exports.extend(
        {
            timestamp: +new Date() / 1000
        },
        breadcrumb
    );
    var currCtx = raven.getContext();
    if (!currCtx.breadcrumbs) currCtx.breadcrumbs = [];
    currCtx.breadcrumbs.push(breadcrumb);
    if (currCtx.breadcrumbs.length > raven.maxBreadcrumbs) {
        currCtx.breadcrumbs.shift();
    }
    raven.setContext(currCtx);
};

exports.throw = function() {
    throw new Error("test error");
    return 8;
};
