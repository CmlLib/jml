
const minecraft = require("./minecraft");
const mprofileinfo = require("./mprofileinfo");
const mprofile = require("./mprofile");
const mdownloader = require("./mdownloader");
const mlaunch = require("./mlaunch")

var mc;
var profiles = [];
var downloadEventHandler = function () { };

function getGamePath() {
    return mc.path;
}

async function initialize(path) {
    mc = await minecraft.initialize(path);
}

async function updateProfiles() {
    profiles = await mprofileinfo.getProfiles(mc);
    return profiles;
}

async function getProfile(name) {
    if (!profiles || profiles.length == 0) {
        await updateProfiles();
    }

    return await mprofile.get_profile(mc, profiles, name);
}

async function downloadProfile(profile, downloadAssets = true) {
    var downloader = new mdownloader.mdownload(profile);
    downloader.downloadFileChanged = downloadEventHandler;
    await downloader.downloadAll(downloadAssets);
}

// opt.xmx
// opt.server_ip
// opt.screen_width
// opt.screen_height
// opt.session = { username, uuid, access_token }
async function launch(name, opt, logger) {
    downloadEventHandler = logger;

    var profile = await getProfile(name);
    await downloadProfile(profile);

    opt.startProfile = profile;
    var launch = new mlaunch.launch(opt);
    return await launch.createProcess();
}

exports.getGamePath = getGamePath;
exports.initialize = initialize;
exports.updateProfiles = updateProfiles;
exports.getProfile = getProfile;
exports.downloadProfile = downloadProfile;
exports.launch = launch;