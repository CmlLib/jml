"use strict"

const native = require("./jml_native");
const mrule = require("./mrule");

class mlibrary {
    constructor() {
        this.isNative = false;
        this.name = "";
        this.path = "";
        this.url = "";
        this.isRequire = true;
        this.hash = "";
    }
}

var checkOSRules = true;
var defaultLibraryServer = "https://libraries.minecraft.net/";

function replaceAll(str, searchStr, replaceStr) {
    return str.split(searchStr).join(replaceStr);
}

// net.java.dev.jna:jna:4.4.0
// net\java\dev\jna\jna\4.4.0\jna-4.0.0.jar
function nameToPath(name, native) {  // library name to relative path
    try {
        var tmp = name.split(':');
        var front = replaceAll(tmp[0], '.', '/');
        var back = name.substring(name.indexOf(':') + 1);

        var libpath = front + "/" + replaceAll(back, ':', '/') + "/" + replaceAll(back, ':', '-');

        if (native)
            libpath += "-" + native + ".jar"
        else
            libpath += ".jar"

        return libpath
    }
    catch (e) {
        return ""
    }
}

function createLibrary(minecraft, name, nativeId, job) {
    var path = job["path"];
    if (!path)
        path = nameToPath(name, nativeId);

    var url = job["url"];

    if (!url)
        url = defaultLibraryServer + path
    else {
        var urlSplit = url.split('/');
        if (!urlSplit[urlSplit.length - 1])
            url += path
    }

    var library = new mlibrary();
    library.hash = job["sha1"];
    library.name = name;
    library.path = native.join(minecraft.library, path);
    library.url = url;

    if (nativeId)
        library.isNative = true;
    else
        library.isNative = false;

    return library
}

function parselist(minecraft, json) {
    var list = [];

    for (var i = 0; i < json.length; i++) {
        var item = json[i];
        var name = item["name"];
        if (!name)
            continue

        // check rules
        var rules = item["rules"];
        if (checkOSRules && rules) {
            var isRequire = mrule.checkAllowOS(rules);

            if (!isRequire)
                continue
        }

        // forge library
        var downloads = item["downloads"]
        if (!downloads) { // downloads == null
            var natives = item["natives"]

            var nativeId = null;
            if (natives) // natives != null
                nativeId = natives[mrule.osname]

            list.push(createLibrary(minecraft, name, nativeId, item));
            continue;
        }

        // native library
        var classif = downloads["classifiers"]
        if (classif) {
            var native_id = null;
            var native_obj = item["natives"];
            if (native_obj)
                native_id = native_obj[mrule.osname]

            if (native_id && classif[native_id]) {
                native_id = native_id.replace("${arch}", mrule.arch)
                var job = classif[native_id];
                list.push(createLibrary(minecraft, name, native_id, job));
            }
        }

        // common library
        var arti = downloads["artifact"];
        if (arti)
            list.push(createLibrary(minecraft, name, "", arti));
    }

    return list
}

module.exports = {
    mlibrary: mlibrary,
    checkOSRules: checkOSRules,
    parselist: parselist
}