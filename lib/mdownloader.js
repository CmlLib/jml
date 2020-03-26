"use strict"

const native = require("./jml_native");

let checkHash = true;

async function download(url, path) {
    var parent = native.parent(path);
    if (!(await native.checkDirExists(parent)))
        await native.mkdir(parent);

    await native.download(url, path);
}

async function checkFileSHA1(path, fhash) {
    if (!checkHash)
        return true;
    if (!fhash)
        return true;

    var sha1 = await native.getsha1(path);
    if (Array.isArray(fhash))
        return fhash.includes(sha1);
    else
        return fhash == sha1;
}

async function checkFileValidation(path, fhash) {
    return await native.checkFileExists(path) && await checkFileSHA1(path, fhash);
}

async function checkDownload(path, hash, url) {
    if (path && url && !await checkFileValidation(path, hash))
        await download(url, path);
}

class mdownload {
    constructor(_profile) {
        this.profile = _profile;
        this.doFireEvents = true;
        this.downloadFileChanged = function () { };
    }

    fireEvent(kind, name, max, current) {
        if (!this.doFireEvents || !this.downloadFileChanged)
            return;

        this.downloadFileChanged(kind, name, max, current);
    }

    async downloadAll(downloadAssets) {
        await this.downloadLibraries();
        await this.downloadMinecraft();

        if (downloadAssets)
            await this.downloadIndex();
        await this.downloadResources();
    }

    async downloadLibraries() {
        var count = this.profile.libraries.length;
        for (var i = 0; i < count; i++) {
            var lib = this.profile.libraries[i];

            this.fireEvent("library", lib.name, count, i + 1);

            if (lib.isRequire)
                await checkDownload(lib.path, lib.hash, lib.url);
        }
    }

    async downloadIndex() {
        this.fireEvent("index", this.profile.assetId, 1, 0);

        var path = native.join(this.profile.minecraft.index, this.profile.assetId + ".json");
        await checkDownload(path, this.profile.assetHash, this.profile.assetUrl);

        this.fireEvent("index", this.profile.assetId, 1, 1);
    }

    async downloadResources() {
        var indexPath = native.join(this.profile.minecraft.index, this.profile.assetId + ".json");
        if (!(await native.checkFileExists(indexPath)))
            return;

        var index = JSON.parse(await native.fileread(indexPath));

        var isVirtual = false;
        var v = index["virtual"];
        if (v)
            isVirtual = true;

        var isMapResource = false;
        var m = index["map_to_resources"];
        if (m)
            isMapResource = true;

        var objects = index["objects"];
        var keys = Object.keys(objects);
        var count = keys.length;
        for (var i = 0; i < count; i++) {
            this.fireEvent("resource", "", count, i + 1);

            var key = keys[i];
            var value = objects[key];

            var hash = value["hash"];
            var hashName = hash.substring(0, 2) + "/" + hash;
            var hashPath = native.join(this.profile.minecraft.assetObject, hashName);
            var hashUrl = "http://resources.download.minecraft.net/" + hashName;

            await checkDownload(hashPath, hash, hashUrl);

            if (isVirtual) {
                var resPath = native.join(this.profile.minecraft.assetLegacy, key);

                if (!await native.checkFileExists(resPath)) {
                    await native.mkdir(native.parent(resPath));
                    await copyfile(hashPath, resPath);
                }
            }

            if (isMapResource) {
                var resPath = native.join(this.profile.minecraft.resources, key);

                if (!await native.checkFileExists(resPath)) {
                    await native.mkdir(native.parent(resPath));
                    await native.copyfile(hashPath, resPath);
                }
            }
        }
    }

    async downloadMinecraft() {
        var id = this.profile.jar;
        this.fireEvent("minecraft", id, 1, 0);

        var path = native.join(this.profile.minecraft.version, id, id + ".jar");
        await checkDownload(path, this.profile.clientHash, this.profile.clientDownloadUrl);

        this.fireEvent("minecraft", id, 1, 1);
    }
}

module.exports = {
    mdownload: mdownload,
    checkDownload, checkDownload
}