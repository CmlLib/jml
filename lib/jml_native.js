// node js

// fileread(path) : str
// filewrite(path, content)
// get(url) : str
// post(url, content) : str

const fs = require("fs");
const path = require("path");
const request = require("request");
const crypto_1 = require("crypto");
const extracter = require("extract-zip");

function join(...args) {
    return path.join(...args);
}

function pathjoin(args) {
    return args.join(path.delimiter);
}

function normpath(p) {
    return path.resolve(p);
}

function parent(p) {
    return path.dirname(p);
}

async function mkdir(p) {
    await fs.promises.mkdir(p, { recursive: true });
}

async function checkDirExists(p) {
    try {
        await fs.promises.access(p);
        return (await fs.promises.lstat(p)).isDirectory();
    } catch (error) {
        return false;
    }
}

async function checkFileExists(p) {
    try {
        await fs.promises.access(p);
        return (await fs.promises.lstat(p)).isFile();
    } catch (error) {
        return false;
    }
}

async function readdir(p) {
    return await fs.promises.readdir(p);
}

async function copyfile(org, des) {
    await fs.promises.copyFile(org, des);
}

async function rmdir(p) {
    await fs.promises.rmdir(p, { recursive: true });
}

async function rmfile(p) {
    await fs.promises.unlink(p);
}

async function unzip(zip, target) {
    return new Promise((resolve, reject) => {
        extracter(zip, { dir: target }, function (err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}

async function fileread(p) {
    return await fs.promises.readFile(p, 'utf8');
}

async function filewrite(p, content) {
    await fs.promises.writeFile(p, content);
}

function getsha1(p) {
    var s = fs.createReadStream(p);
    var hash = crypto_1.createHash('sha1');
    return new Promise(function (resolve, reject) {
        s.on('data', function (_) { return hash.update(_); })
            .on('end', function () { return resolve(hash.digest('hex')); })
            .on('error', reject);
    });
}

async function get(url) {
    var option = {
        uri: url
    };

    return new Promise((resolve, reject) => {
        request.get(option, function (err, response, body) {
            if (checkRes(response, err))
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
            if (checkRes(response, err))
                resolve(body);
            else
                throw new Error("get request failed");
        });
    });
}

function checkRes(response, err) {
    if (err || !response || response.statusCode != 200) {
        console.log(err);
        return false;
    }
    return true;
}

async function download(url, path) {
    let file = fs.createWriteStream(path);

    await new Promise((resolve, reject) => {
        let stream = request({
            uri: url
        })
            .pipe(file)
            .on('finish', () => {
                resolve();
            })
            .on('error', (err) => {
                reject(err);
            });
    })
        .catch(err => {
            throw new Error(err);
        });
}

module.exports = {
    join: join,
    pathjoin: pathjoin,
    normpath: normpath,
    parent: parent,
    mkdir: mkdir,
    checkDirExists: checkDirExists,
    checkFileExists: checkFileExists,
    readdir: readdir,
    copyfile: copyfile,
    rmdir: rmdir,
    rmfile: rmfile,
    unzip: unzip,
    fileread: fileread,
    filewrite: filewrite,
    get: get,
    post: post,
    download: download,
    getsha1: getsha1
}