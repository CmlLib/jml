const native = require("./jml_native");
const mdownloader = require("./mdownloader");

async function checkMods(mc, mods, exclusive, progress) {
    this.progress.step("Installing Mods");

    let modpath = native.join(mc.path, "mods");
    await native.mkdir(modpath);

    let files;
    if (exclusive && (await native.checkDirExists(modpath)))
        files = await native.readdir(modpath);
    else files = [];

    files = files.filter(value => value.indexOf(".jar") !== -1);

    for (let i = 0; i < mods.length; i++) {
        let mod = mods[i];

        let file = native.join(modpath, mod.file + ".jar");

        if (exclusive) {
            let i = files.indexOf(mod.file + ".jar");
            if (i !== -1) files.splice(i, 1);
        }

        if (progress) progress("mod", mod.file, mods.length, i + 1);

        mdownloader.checkDownload(file, mod.sha1, mod.url);
    }

    if (exclusive) {
        let task = [];
        for (let i = 0; i < files.length; i++)
            task.push(await native.rmfile(native.join(modpath, files[i])));

        await Promise.all(task);
    }
}
