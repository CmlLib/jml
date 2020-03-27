"use strict"

const native = require("./jml_native");
const mrule = require("./mrule");

const launchermeta = "http://launchermeta.mojang.com/mc/launcher.json";

async function checkJre(mc) {
    let jrepath;
    if (process.platform === "win32") {
        jrepath = native.join(mc.runtime, "bin", "java.exe");
    } else {
        jrepath = native.join(mc.runtime, "bin", "java");
    }
    if (! await native.checkFileExists(jrepath)){

        var metadata = JSON.parse(await native.get(launchermeta));

        var osjava = metadata[mrule.osname];
        var javainfo = {};

        if (mrule.is64bit)
            javainfo = osjava["64"];
        else
            javainfo = osjava["32"];

        if (!javainfo)
            return;

        var jreurl = javainfo["jre"]["url"];

        await native.downloadlzmazipfile(jreurl, mc.runtime);
        await native.chmod(jrepath, 0o755);
    }

    return jrepath;
}

module.exports = {
    checkJre: checkJre
}
