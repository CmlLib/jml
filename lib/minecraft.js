"use native"

const native = require("./jml_native");

async function initialize(path) {
    return {
        path: await m(path),
        library: await m(path + "/libraries"),
        version: await m(path + "/versions"),
        resources: await m(path + "/resources"),
        natives: await m(path + "/natives"),
        assets: await m(path + "/assets"),
        index: await m(path + "/assets/indexes"),
        assetObject: await m(path + "/assets/objects"),
        assetLegacy: await m(path + "/assets/virtual/legacy"),
        runtime: await m(path + "/runtime")
    }
}

async function m(p) {
    p = native.normpath(p);
    await native.mkdir(p);
    return p
}

module.exports = {
    initialize: initialize
}