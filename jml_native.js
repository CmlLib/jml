// node js

// fileread(path) : str
// filewrite(path, content)
// get(url) : str
// post(url, content) : str

const fs = require("fs");
const path = require("path");
const request = require("request");

function join() {
    path.join(...arguments);
}

function normpath(p) {
    return path.normalize(p);
}

async function mkdir(p) {
    await fs.mkdir(p, { recursive: true });
}

async function checkDirExists(p) {
    try {
        return (await fs.lstat(p)).isDirectory();
    } catch (error) {
        return false;
    }
}

async function checkFileExists(p) {
    try {
        return (fs.lstat(p)).isFile();
    } catch (error) {
        return false;
    }
}

async function readdir(p) {
    return await fs.readdir(p);
}

async function fileread(path) {

}

async function filewrite(path, content) {

}

async function get(url) {
    var option = {
        uri: url
    };

    return new Promise((resolve, reject) => {
        request.get(option, function (err, response, body) {
            if (checkRes(name, response, err))
                resolve(body);
            else
                throw new Error("get request failed");
        });
    });
}

async function post(url, content) {
    var option = {
        uri: url,
        body: content
    };

    return new Promise((resolve, reject) => {
        request.post(option, function (err, response, body) {
            if (checkRes(name, response, err))
                resolve(body);
            else
                throw new Error("get request failed");
        });
    });
}

function checkRes(name, response, err) {

    if (err || !response || response.statusCode != 200) {
        console.log("ERROR : " + name);
        console.log(err);
        return false;
    }

    console.log(name + " " + response.statusCode);
    return true;
}