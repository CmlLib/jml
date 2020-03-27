"use strict"

const os = require("os");

var checkOSRules = true;
var arch;
var osversion;
var osname;

var is64bit = process.arch === 'x64' || process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
if (is64bit)
    arch = "64";
else
    arch = "32";

osversion = os.release();

var sysname = os.platform();
if (sysname == "linux")
    osname = "linux";
else if (sysname == "darwin")
    osname = "osx";
else if (sysname == "win32")
    osname = "windows";
else
    osname = "";

//osname = "osx" // fake os to debug


function checkAllowOS(arr) {
    var require = true;

    for (var prop in arr)
        var job = arr[prop];

    var action = true; // allow / disallow
    var containCurrentOS = true;

    var keys = Object.keys(job);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = job[key];

        if (key == "action") {
            if (value == "allow")
                action = true;
            else
                action = false;
        }

        else if (key == "os")
            containCurrentOS = check_os_contains(value);

        else if (key == "features")
            return false;
    }

    if (!action && containCurrentOS) // disallow os
        require = false;
    else if (action && containCurrentOS) // allow os
        require = true;
    else if (action && !containCurrentOS)
        require = false;

    return require;
}

function check_os_contains(arr) {

    var keys = Object.keys(arr);
    for (var i = 0; i < keys.length; i++) {
        var osKey = keys[i];
        var osValue = arr[osKey];

        if (osKey == "name" && osValue == osname)
            return true;
    }

    return false;
}

module.exports = {
    checkOSRules: checkOSRules,
    arch: arch,
    osversion: osversion,
    osname: osname,
    is64bit: is64bit,
    checkAllowOS: checkAllowOS
}