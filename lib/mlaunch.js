"use strict"

const native = require("./jml_native");
const mnative = require("./mnative");
const mrule = require("./mrule");

var supportversion = "1.4";
var bracket_pre_compiled = /\$\{(.*?)}/g;

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function contain(str, cmp) {
    return str.indexOf(cmp) != -1;
}

function e(t) {
    if (contain(t, " "))
        return '"' + t + '"';
    else
        return t;
}


function ea(t) {
    if (contain(t, " ") && contain(t, "=")) {
        var s = t.split("=");
        return s[0] + '="' + s[1] + '"';
    }
    else
        return t
}


function arg_in(arg, dicts) {
    var args = [];

    for (var i = 0; i < arg.length; i++) {
        var item = arg[i];

        if (typeof (item) == "string") {
            var m = bracket_pre_compiled.exec(item); // check ${} str
            if (m) {
                var arg_key = m[1]; // get ${KEY}
                var arg_value = dicts[arg_key];  // get dicts value of ${KEY}

                if (arg_value)
                    args.push(item.replace(m[0], arg_value));  // replace ${} of whole str to dicts value
                else
                    args.push(item);  // if value of default arg has space, handle whitespace.
                // (ex) -Dos.Version=Windows 10 => -Dos.Version="Windows 10"
            }
            else
                args.push(ea(item)); // not ${} str
        }
    }

    return args;
}

class launch {
    constructor(option) {
        this.defaultJavaParameter = [
            "-XX:+UnlockExperimentalVMOptions",
            "-XX:+UseG1GC",
            "-XX:G1NewSizePercent=20",
            "-XX:G1ReservePercent=20",
            "-XX:MaxGCPauseMillis=50",
            "-XX:G1HeapRegionSize=16M"];
        if (mrule.osname == "osx")
            this.defaultJavaParameter.push("-XstartOnFirstThread");

        this.launchOption = option;
        this.checkOptionValid()
    }

    checkOptionValid() {
        var exMsg = "";
        if (!this.launchOption.xmx)
            exMsg = "xmx is too small"
        if (!this.launchOption.startProfile)
            exMsg = "startProfile was null"
        if (!this.launchOption.session)
            exMsg = "session was null"
        if (this.launcher_name && contain(this.launcher_name, " "))
            exMsg = "launcher_name cannot contain space character"

        if (exMsg)
            throw new Error(exMsg)
    }

    createArg() {
        var profile = this.launchOption.startProfile;

        var args = [];

        // common jvm args
        if (this.launchOption.jvmArg)
            args.push(...this.launchOption.jvmArg);
        else
            args.push(...this.defaultJavaParameter);

        args.push("-Xmx" + this.launchOption.xmx.toString() + "m");

        // specific jvm args
        var libArgs = new Set([]);

        for (var i = 0; i < profile.libraries.length; i++) {
            var item = profile.libraries[i];

            if (!item.isNative)
                libArgs.add(item.path);
        }

        var jar = native.join(profile.minecraft.version, profile.jar, profile.jar + ".jar");
        libArgs.add(jar);
        var libs = native.pathjoin([...libArgs]);

        var jvmdict = {
            "natives_directory": profile.minecraft.natives,
            "launcher_name": "minecraft-launcher",
            "launcher_version": "2",
            "classpath": libs
        };

        if (profile.jvm_arguments && profile.jvm_arguments.length > 0)
            args.push(...arg_in(profile.jvm_arguments, jvmdict));
        else {
            args.push("-Djava.library.path=" + profile.minecraft.natives);
            args.push("-cp");
            args.push(libs);
        }

        args.push(profile.mainclass);

        // game args
        var gamedict = {
            "auth_player_name": this.launchOption.session.username,
            "version_name": profile.id,
            "game_directory": profile.minecraft.path,
            "assets_root": profile.minecraft.assets,
            "assets_index_name": profile.assetId,
            "auth_uuid": this.launchOption.session.uuid,
            "auth_access_token": this.launchOption.session.access_token,
            "user_properties": "{}",
            "user_type": "Mojang",
            "game_assets": profile.minecraft.assetLegacy,
            "auth_session": this.launchOption.session.access_token
        };

        if (this.launchOption.launcher_name)
            gamedict["version_type"] = this.launchOption.launcher_name;
        else
            gamedict["version_type"] = profile.type;

        if (profile.game_arguments && profile.game_arguments.length > 0) // 1.3
            args.push(...arg_in(profile.game_arguments, gamedict));
        else if (profile.minecraftArguments)
            args.push(...arg_in(profile.minecraftArguments.split(' '), gamedict));

        // options
        if (this.launchOption.server_ip) {
            args.push("--server")
            args.push(this.launchOption.server_ip);
        }

        if (this.launchOption.screen_width && this.launchOption.screen_height) {
            args.push("--width")
            args.push(this.launchOption.screen_width);
            args.push("--height")
            args.push(this.launchOption.screen_height);
        }

        return args;
    }

    async createProcess() {
        await mnative.clean_natives(this.launchOption.startProfile.minecraft);
        await mnative.extract_natives(this.launchOption.startProfile);

        var arg = await this.createArg();
        return arg;
    }
}

module.exports = {
    launch: launch
}