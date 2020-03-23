"use strict"

const native = require("./jml_native");

async function extract_natives(profile) {
    for (var i = 0; i < profile.libraries.length; i++) {
        var item = profile.libraries[i];
        if (item.isNative) {
            try {
                await native.unzip(item.path, profile.minecraft.natives);
            }
            catch (e) {
                console.log(e);
            }
        }
    }
}


async function clean_natives(minecraft) {
    for (var prop in native.readdir(minecraft.natives)) {
        if (native.checkDirExists(prop))
            await native.rmdir(prop);
        else
            await native.rmfile(prop);
    }
}

module.exports = {
    extract_natives: extract_natives,
    clean_natives: clean_natives
}