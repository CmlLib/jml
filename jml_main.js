const jml = require("jml");

async function init() {
    var profiles = await jml.getProfiles();

    for (var prop in profiles) {
        console.log(prop);
    }

    var version = "1.15.2";

    var profile = profiles[version];

    await jml.launch({
        startProfile: profile,
        xmx: 4096,
        jre: "java.exe",
        server: "mc.hypixel.net",
        session: {
            username: "test123",
            token: "token123",
            uuid: "uuid123"
        }
    }, function (log) {
        console.log(log);
    });
}

init();
