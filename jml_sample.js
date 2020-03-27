const jml = require("./lib/jml.js");
const { spawn } = require('child_process');

async function init() {
    var p = "./game_dir"

    var launcher = new jml.jml();
    await launcher.initialize(p);

    console.log("initialized in " + launcher.getGamePath());

    launcher.downloadEventHandler = function (kind, name, max, current) { // log progress
        // kind : forge, library, resource, index, minecraft, mod
        console.log(`${kind} - ${name} (${current} / ${max})`);
    };

    console.log("check jre");
    var jre = await launcher.checkJre();

    //var versionname = "1.12.2";
    var mcversion = "1.12.2";
    var forgeversion = "14.23.5.2847";
    var versionname = launcher.getVersionName(mcversion, forgeversion);

    await launcher.updateProfiles();

    if (!launcher.profiles.some(x => x.name === versionname)) { // forge not installed
        console.log("install forge : " + versionname);

        await launcher.checkForge(mcversion, forgeversion);
        await launcher.updateProfiles();
    }

    await launcher.checkMods([ // download mods
        {
            file: "test123",
            url: "https://www.naver.com",
            sha1: "sha1sha1hash"
        },
        launcher.getCustomForgeMod("testmod", "https://google.com", "SHA1_HASH")
    ]);

    console.log("start " + versionname);

    var arg = await launcher.launch(versionname, { // download client
        xmx: 4096,
        server_ip: "",
        session: {
            username: "test123",
            access_token: "token123",
            uuid: "uuid123"
        },
        screen_width: 1600,
        screen_height: 900
    });

    console.log(arg);

    const inst = spawn(jre, arg, { 
        cwd: launcher.getGamePath(),
        detached: true
    });
    inst.unref();

    inst.stdout.on('data', function (data) {
        console.log(data + "");
    });
    inst.stderr.on('data', function (data) {
        console.log(data + "");
    });

    console.log("end");
}

init();