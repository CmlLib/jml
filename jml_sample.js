const jml = require("./lib/jml.js");

async function init() {
    var p = "./game_dir"

    var launcher = new jml.jml();
    await launcher.initialize(p);

    console.log("initialized in " + launcher.getGamePath());

    launcher.downloadEventHandler = function (kind, name, max, current) {
        console.log(`${kind} - ${name} (${current} / ${max})`);
    };

    var mcversion = "1.12.2";
    var forgeversion = "14.23.5.2847";
    var versionname = launcher.getVersionName(mcversion, forgeversion);

    await launcher.updateProfiles();

    if (!launcher.profiles.some(x => x.name === versionname)) { // forge not installed
        console.log("install forge : " + versionname);

        await launcher.downloadForge(mcversion, forgeversion);
        await launcher.updateProfiles();
    }

    console.log("start " + versionname);

    var arg = await launcher.launch(versionname, {
        xmx: 4096,
        server_ip: "mc.hypixel.net",
        session: {
            username: "test123",
            access_token: "token123",
            uuid: "uuid123"
        },
        screen_width: 1600,
        screen_height: 900
    });

    console.log(arg);

    console.log("end");
}

init();