const jml = require("./lib/jml");
//const jml = require("minecraft-jml");

async function init() {
    var p = "./game_dir"
    await jml.initialize(p);

    var profiles = await jml.updateProfiles();
    console.log("profiles : ");
    for (var i = 0; i < profiles.length; i++) {
        console.log(profiles[i].name);
    }

    var version = "1.5.2";
    //var version = "1.12.2";

    var arg = await jml.launch(version, {
        xmx: 4096,
        server_ip: "mc.hypixel.net",
        session: {
            username: "test123",
            access_token: "token123",
            uuid: "uuid123"
        },
        screen_width: 1600,
        screen_height: 900
    }, function (kind, name, max, current) {
        console.log(`${kind} - ${name} (${current} / ${max})`);
    });

    console.log(arg);

    console.log("end");
}

init();