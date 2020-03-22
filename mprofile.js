"use native"

const native = require("./jml_native");
const mlibrary = require("./mlibrary");
const mrule = require("./mrule");

function n(t) {
    if (!t)
        return ""
    else
        return t
}

function arg_parse(arr) {
    strlist = [];
    for (prop in arr) {
        var item = arr[prop];

        if (typeof (item) != "string") {
            var allow = true;

            var rule = item["rules"];
            if (rule)
                allow = mrule.checkAllowOS(rule);

            value = item["value"];

            if (allow && value) {
                if (Array.isArray(value))
                    strlist.push(...value)
                else
                    strlist.push(value)
            }
        }
        else
            strlist.push(item);
    }

    return strlist
}

class profile {
    constructor(minecraft, info) {
        this.minecraft = minecraft;
        this.id = ""
        this.assetId = ""
        this.assetUrl = ""
        this.assetHash = ""
        this.jvm_arguments = []
        this.game_arguments = []
        this.libraries = []
        this.clientDownloadUrl = ""
        this.clientHash = ""
        this.parent_profile_id = ""
        this.is_inherited = false;
        this.jar = ""
        this.mainclass = ""
        this.minecraftArguments = ""
        this.releaseTime = ""
        this.type = ""
    }

    async parse(info) {
        var json = "";

        if (info.isweb)
            json = await native.get(info.path)
        else
            json = await native.fileread(info.path);

        return await this.parseFromJson(json);
    }

    async parseFromJson(content) {
        var d = JSON.parse(content)

        this.id = d["id"]

        var assetIndex = d["assetIndex"]
        if (assetIndex) {
            this.assetId = n(assetIndex["id"])
            this.assetUrl = n(assetIndex["url"])
            this.assetHash = n(assetIndex["sha1"])
        }

        var downloads = d["downloads"]
        if (downloads) {
            var client = downloads["client"]
            if (client) {
                this.clientDownloadUrl = client["url"]
                this.clientHash = client["sha1"]
            }
        }

        this.libraries = mlibrary.parselist(this.minecraft, d["libraries"]);
        this.mainclass = n(d["mainClass"]);

        this.minecraftArguments = d["minecraftArguments"];
        var arg = d["arguments"];
        if (arg) {
            if (arg["game"])
                this.game_arguments = arg_parse(arg["game"])
            if (arg["jvm"])
                this.jvm_arguments = arg_parse(arg["jvm"])
        }

        this.releaseTime = n(d["releaseTime"])
        this.type = n(d["type"])

        var inherits = d["inheritsFrom"]
        if (inherits) {
            this.is_inherited = true;
            this.parent_profile_id = inherits;
        }
        else
            this.jar = this.id

        var profilePath = native.join(this.minecraft.version, this.id)

        if (!await native.checkDirExists(profilePath)) {
            await native.mkdir(profilePath);

            var p = native.join(profilePath, this.id + ".json");
            native.filewrite(p, content);
        }
    }
}

function inhert(parent, child) {
    // Overload : assetId, assetUrl, assetHash, clientDownloadUrl, clientHash, mainClass, minecraftArguments
    // Combine : libraries, game_arguments, jvm_arguments

    if (!child.assetId)
        child.assetId = parent.assetId

    if (!child.assetUrl)
        child.assetUrl = parent.assetUrl

    if (!child.assetHash)
        child.assetHash = parent.assetHash

    if (!child.clientDownloadUrl)
        child.clientDownloadUrl = parent.clientDownloadUrl

    if (!child.clientHash)
        child.clientHash = parent.clientHash

    if (!child.mainclass)
        child.mainclass = parent.mainclass

    if (!child.minecraftArguments)
        child.minecraftArguments = parent.minecraftArguments

    child.jar = parent.jar;

    if (parent.libraries)
        if (child.libraries)
            child.libraries.push(...parent.libraries)
        else
            child.libraries = parent.libraries

    if (parent.game_arguments)
        if (child.game_arguments)
            child.game_arguments.push(...parent.game_arguments)
        else
            child.game_arguments = parent.game_arguments

    if (parent.jvm_arguments)
        if (child.jvm_arguments)
            child.jvm_arguments.push(...parent.jvm_arguments)
        else
            child.jvm_arguments = parent.jvm_arguments
}

async function get_profile(minecraft, infos, version) {
    var start_profile = null;

    for (prop in infos) {
        var item = infos[prop];

        if (item.name == version) {
            start_profile = new profile(minecraft);
            await start_profile.parse(item);
            break;
        }
    }

    if (!start_profile)
        throw new Error("cannot find profile named " + version)

    if (start_profile.is_inherited) {
        parent_profile = await get_profile(minecraft, infos, start_profile.parent_profile_id)
        inhert(parent_profile, start_profile)
    }

    return start_profile
}

module.exports = {
    get_profile: get_profile,
    profile: profile
}