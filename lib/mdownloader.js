"use strict"

const native = require("./jml_native");

async function download(url, path) {
    var parent = native.parent(path);
    if (!(await native.checkDirExists(parent)))
        await native.mkdir(parent);

    await native.download(url, path);
}

class mdownload {
    constructor(_profile) {
        this.checkHash = true;
        this.profile = _profile;
        this.doFireEvents = true;
        this.downloadFileChanged = function () { };
    }

    fireEvent(kind, name, max, current) {
        if (!this.doFireEvents || !this.downloadFileChanged)
            return;

        this.downloadFileChanged(kind, name, max, current);
    }

    async checkFileSHA1(path, fhash) {
        if (!this.checkHash)
            return true;
        if (!fhash)
            return true;

        var sha1 = await native.getsha1(path);
        return fhash == sha1;
    }

    async checkFileValidation(path, fhash) {
        return await native.checkFileExists(path) && await this.checkFileSHA1(path, fhash);
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

            this.fireEvent("library", lib.name, count, i);

            if (lib.isRequire && lib.path !== "" && lib.url !== "" && !await this.checkFileValidation(lib.path, lib.hash))
                await download(lib.url, lib.path);
        }
    }

    async downloadIndex() {
        this.fireEvent("index", this.profile.assetId, 1, 0);

        var path = native.join(this.profile.minecraft.index, this.profile.assetId + ".json");
        if (this.profile.assetUrl && !await this.checkFileValidation(path, this.profile.assetHash))
            await download(this.profile.assetUrl, path);

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
            this.fireEvent("resource", "", count, i);

            var key = keys[i];
            var value = objects[key];

            var hash = value["hash"];
            var hashName = hash.substring(0, 2) + "/" + hash;
            var hashPath = native.join(this.profile.minecraft.assetObject, hashName);
            var hashUrl = "http://resources.download.minecraft.net/" + hashName;

            if (!await native.checkFileExists(hashPath))
                await download(hashUrl, hashPath);

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
        if (!this.profile.clientDownloadUrl)
            return;

        this.fireEvent("minecraft", id, 1, 0);

        var id = this.profile.jar;
        var path = native.join(this.profile.minecraft.version, id, id + ".jar");
        if (!await this.checkFileValidation(path, this.profile.clientHash))
            await download(this.profile.clientDownloadUrl, path);

        this.fireEvent("minecraft", id, 1, 1);
    }
}

module.exports = {
    mdownload: mdownload
}