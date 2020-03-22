"use strict"

const native = require("./jml_native");

class mprofileinfo {
    constructor() {
        this.isweb = true;
        this.name = "";
        this.path = "";
    }
}

async function getProfilesFromLocal(minecraft) {
    var list = await native.readdir(minecraft.version);
    var arr = []

    if (!list)
        return arr

    for (var i = 0; i < list.length; i++) {
        var item = list[i];

        if (!native.checkDirExists(item))
            continue;

        var filepath = native.join(minecraft.version, item, item + ".json");

        if (await native.checkFileExists(filepath)) {
            var profile = new mprofileinfo();
            profile.isweb = false;
            profile.name = item;
            profile.path = filepath;
            arr.push(profile);
        }
    }

    return arr
}

async function getProfilesFromWeb() {
    var result = [];

    var url = "https://launchermeta.mojang.com/mc/game/version_manifest.json";

    var jarr = JSON.parse(await native.get(url));
    var versions = jarr["versions"];

    for (var i = 0; i < versions.length; i++) {
        var item = versions[i];

        var profile = new mprofileinfo();
        profile.isweb = true;
        profile.name = item["id"];
        profile.path = item["url"];
        result.push(profile);
    }

    return result
}

async function getProfiles(minecraft) {
    var arr = await getProfilesFromLocal(minecraft);
    var web = await getProfilesFromWeb();

    for (var i1 = 0; i1 < web.length; i1++) {
        var exist = false;
        var item1 = web[i1];

        for (var i2 = 0; i2 < arr.length; i2++) {
            var item2 = arr[i2];

            if (item1.name == item2.name) {
                exist = true;
                break;
            }
        }

        if (!exist)
            arr.push(item1)
    }
    return arr
}

module.exports = {
    mprofileinfo: mprofileinfo,
    getProfilesFromLocal: getProfilesFromLocal,
    getProfilesFromWeb: getProfilesFromWeb,
    getProfiles: getProfiles
}