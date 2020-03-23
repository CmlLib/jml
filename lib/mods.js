const native = require("./jml_native");
const mdownloader = require("./mdownloader");

// mod.file mod.url, mod.sha1
async function checkMods(mc, mods, progress) {
    let modpath = native.join(mc.path, "mods");
    await native.mkdir(modpath);

    for (let i = 0; i < mods.length; i++) {
        let mod = mods[i];
        let file = native.join(modpath, mod.file + ".jar");

        if (progress) progress("mod", mod.file, mods.length, i + 1);

        mdownloader.checkDownload(file, mod.sha1, mod.url);
    }
}

module.exports = {
    checkMods: checkMods
}