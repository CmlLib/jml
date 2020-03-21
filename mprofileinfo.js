const native = require("native");
const minecraft = require("minecraft");

class mprofileinfo {
    constructor() {
        this.isweb = True
        this.name = ""
        this.path = ""
    }
}

async function getProfilesFromLocal() {
    var list = await native.readdir(minecraft.version)
    var arr = []

    if (!list)
        return arr

    for (var i = 0; i < files.length; i++) {
        var item = files[i];

        if (!native.checkDirExists(item))
            continue;

        var filepath = native.join(minecraft.version, item, item + ".json");

        if (native.checkFileExists(filepath)) {
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

    for (var prop in jarr["versions"]) {
        var item = jarr["versions"][prop];

        var profile = new mprofileinfo()
        profile.isweb = true;
        profile.name = item["id"]
        profile.path = item["url"]
        result.push(profile)
    }

    return result
}

async function getProfiles() {
    var arr = await getProfilesFromLocal();
    var web = await getProfilesFromWeb();

    for (var prop1 in web) {
        var exist = false;
        var item1 = web[prop1];

        for (var prop2 in arr) {
            var item2 = arr[prop2];

            if (item1.name == item2.name) {
                exist = true;
                break;
            }

            if (!exist)
                arr.push(item1)
        }
    }
    return arr
}