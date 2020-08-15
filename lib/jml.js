const minecraft = require("./minecraft");
const mprofileinfo = require("./mprofileinfo");
const mprofile = require("./mprofile");
const mdownloader = require("./mdownloader");
const mlaunch = require("./mlaunch")
const forgedownloader = require("./forgedownloader");
const mods = require("./mods");
const jredownloader = require("./jredownloader");
const { spawn } = require('child_process');

class jml {
    constructor() {
        this.mc = {};
        this.profiles = [];
        this.downloadEventHandler = function () { };
    }

    getGamePath() {
        return this.mc.path;
    }

    async initialize(path) {
        this.mc = await minecraft.initialize(path);
    }

    async updateProfiles() {
        this.profiles = await mprofileinfo.getProfiles(this.mc);
        return this.profiles;
    }

    async getProfile(name) {
        if (!this.profiles || this.profiles.length == 0) {
            await this.updateProfiles();
        }

        return await mprofile.get_profile(this.mc, this.profiles, name);
    }

    async checkJre() {
        return await jredownloader.checkJre(this.mc);
    }

    async checkProfile(profile, downloadAssets = true) {
        var downloader = new mdownloader.mdownload(profile);
        downloader.downloadFileChanged = this.downloadEventHandler;
        await downloader.downloadAll(downloadAssets);
    }

    async checkForge(mcversion, forgeversion) {
        await forgedownloader.installForgeLibraries(this.mc, mcversion, forgeversion, this.downloadEventHandler);
    }

    // mod.file mod.url, mod.sha1

    getCurseForgeModByProjectId(projectid, fileid, sha1) {
        return {
            sha1: sha1,
            file: projectid,
            url: `https://minecraft.curseforge.com/projects/${projectid}/files/${fileid}/download`
        }
    }

    getCustomForgeMod(filename, url, sha1) {
        return {
            sha1: sha1,
            file: filename,
            url: url
        }
    }

    async checkMods(mod) {
        if (this.downloadEventHandler)
            this.downloadEventHandler("java", "jre", 1, 1);

        await mods.checkMods(this.mc, mod, this.downloadEventHandler);
    }

    getVersionName(mcversion, forgeversion) {
        return `${mcversion}-forge${mcversion}-${forgeversion}`;
    }

    // opt.xmx
    // opt.server_ip
    // opt.screen_width
    // opt.screen_height
    // opt.session = { username, uuid, access_token }
    async launch(name, opt) {
        var profile = await this.getProfile(name);
        await this.checkProfile(profile);

        opt.startProfile = profile;
        var launch = new mlaunch.launch(opt);
        return await launch.createProcess();
    }

    async start(name, opt) {
        let arg = await this.launch(name, opt);
        return spawn(opt.jre, arg, {
            cwd: this.getGamePath(),
            detached: true
        });
    }
}

module.exports = {
    jml: jml
}