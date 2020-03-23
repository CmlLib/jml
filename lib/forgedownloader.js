
const unzipper = require("unzipper");
const native = require("./jml_native");
const mlibrary = require("./mlibrary");
const mdownloader = require("./mdownloader");
const fetch = require("node-fetch");

function getArtifactUrl(lib, retry) {
    return (
        (retry
            ? "http://central.maven.org/maven2/"
            : lib.url || mlibrary.defaultLibraryServer) +
        mlibrary.nameToPath(lib.name)
    );
}

let maven = "https://files.minecraftforge.net/maven/net/minecraftforge/forge/";

async function installForgeLibraries(mc, mcversion, fversion, progress) {
    let versionname = `${mcversion}-forge${mcversion}-${fversion}`;
    let manifest = native.join(
        mc.version,
        versionname,
        versionname + ".json"
    );

    let installer = `${maven}${mcversion}-${fversion}/forge-${mcversion}-${fversion}-installer.jar`;

    let libraries;
    let data;
    if (await native.checkFileExists(manifest)) {
        data = await native.fileread(manifest);
        libraries = JSON.parse(data.toString());
    }
    else {
        let res = await fetch.default(installer);
        data = await new Promise((accept, reject) => {
            res.body
                .pipe(unzipper.Parse())
                .on("entry", async function (entry) {
                    if (entry.path === "install_profile.json") {
                        let data = await new Promise(
                            resolve => {
                                let buffers = [];
                                entry.on("data", (d) =>
                                    buffers.push(d)
                                );
                                entry.on("end", () =>
                                    resolve(Buffer.concat(buffers))
                                );
                            }
                        );
                        accept(data);
                    } else {
                        // noinspection JSIgnoredPromiseFromCall
                        entry.autodrain();
                    }
                })
                .on("close", () => reject());
        });

        libraries = JSON.parse(data.toString())["versionInfo"];

        await native.mkdir(native.parent(manifest));
        await native.filewrite(manifest, JSON.stringify(libraries));
    }

    if (progress)
        progress("forge", "universal", 1, 0);

    let universalUrl = `${maven}${mcversion}-${fversion}/forge-${mcversion}-${fversion}-universal.jar`;

    let sha1url = universalUrl + ".sha1";
    let sha1 = await native.get(sha1url);

    let dest = native.join(
        mc.library,
        "net",
        "minecraftforge",
        "forge",
        `${mcversion}-${fversion}`,
        `forge-${mcversion}-${fversion}.jar`
    );

    await mdownloader.checkDownload(dest, sha1, universalUrl);

    if (progress)
        progress("forge", "universal", 1, 1);
}

module.exports = {
    installForgeLibraries: installForgeLibraries
}