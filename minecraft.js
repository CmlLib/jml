const native = require("jml_native");

var path = ""
var library = ""
var version = ""
var assets = ""
var index = ""
var assetObject = ""
var assetLegacy = ""
var resources = ""
var natives = ""

async function initialize(_path) {
    path = await m(_path)
    library = await m(path + "/libraries")
    version = await m(path + "/versions")
    resources = await m(path + "/resources")
    natives = await m(path + "/natives")
    await change_assets(path)
}

async function change_assets(p) {
    assets = await m(p + "/assets")
    index = await m(assets + "/indexes")
    assetObject = await m(assets + "/objects")
    assetLegacy = await m(assets + "/virtual/legacy")
}

async function m(p) {
    p = native.normpath(p);
    await native.mkdir(p);
    return p
}
