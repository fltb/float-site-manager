"use scrict";

const fs = require("fs");
const ejs = require("ejs");
const path = require("path");
const crypto = require("crypto");

const getConfig = function () {
    return {
        "siteName": "YJZX",
        "siteURL": "https://example.com",
        "year": 2021,
        "owner": "Float",
        "licenseLink": "https://creativecommons.org/licenses/by-sa/4.0/",
        "lisenseName": "CC-BY-SA 4.0",
        "navs": [{
            "name": "HOME",
            "link": "/"
        }, {
            "name": "WORK",
            "link": "/work"
        }, {
            "name": "BLOG",
            "link": "https://yjzxlclub.github.io/"
        }, {
            "name": "ABOUT",
            "link": "/about"
        }
        ]
    };
}

const generator = {

    deleteFolderRecursive: function (directoryPath) {
        const that = this;
        if (fs.existsSync(directoryPath)) {
            fs.readdirSync(directoryPath).forEach((file, index) => {
                const curPath = path.join(directoryPath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    // recurse
                    that.deleteFolderRecursive(curPath);
                } else {
                    // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(directoryPath);
        }
    },

    getHash: function (filePath) {
        return new Promise(function (resolve, reject) {
            try {
                const stream = fs.createReadStream(filePath);
                const sha256sum = crypto.createHash('sha256');
                stream.on('data', function (data) {
                    sha256sum.update(data);
                });
                stream.on('end', function () {
                    resolve(sha256sum.digest('hex'));
                });
            } catch (err) {
                reject(err);
            }
        });
    },

    getAllFile: function () {
        /*
            sync, returns an object included all file's name
            return object: [
                {
                    name: '',
                    files[
                        '',
                        ...
                    ]
                },
                ...
            ]
        */
        function getSingleDirectoty(fileRootPath) {
            let allFile = [];
            function readDirSync(filePath) {
                try {
                    const dirs = fs.readdirSync(filePath);
                    for (let i = 0; i < dirs.length; i++) {
                        const fileName = dirs[i];
                        const filePathChild = path.join(filePath, fileName);
                        try {
                            const stat = fs.statSync(filePathChild);
                            if (stat.isDirectory()) {
                                readDirSync(filePathChild);
                            } else if (stat.isFile()) {
                                allFile.push(filePathChild);
                            }
                        } catch (err) {
                            throw err;
                        }
                    }
                } catch (err) {
                    if (err.code === 'ENOENT' || err.code === "ENOTDIR") {
                        return;
                    } else {
                        throw err;
                    }
                }
            }
            readDirSync(fileRootPath);
            return allFile;
        }

        let allFile = [];
        try {
            const rootDirs = fs.readdirSync("source");
            for (let i = 0; i < rootDirs.length; i++) {
                const dirName = rootDirs[i];
                const dirPath = path.join("source", dirName);
                try {
                    fs.accessSync(path.join(dirPath, "infos.json"));
                    const stat = fs.statSync(dirPath);
                    if (stat.isDirectory()) {
                        const tmp = getSingleDirectoty(dirPath);
                        allFile.push({
                            name: dirName,
                            files: tmp
                        });
                    }
                } catch (err) {
                    if (err.code === "ENOENT" || err.code == "ENOTDIR") {
                        ;
                    } else {
                        throw err;
                    }
                }
            }
        } catch (err) {
            if (err.code === 'ENOENT' || err.code === "ENOTDIR") {
                ;
            } else {
                throw err;
            }
        }
        return allFile;
    },

    getChanged: function () {
        /*
            promise (async), resolve an object that included all changed or newly build page and site's object.
            resolve (return): object: [
                {
                    name: '', // directory's name
                    files[
                        '', // path relative to porject root directory
                        ...
                    ]
                },
                ...
            ]
        */
        const that = this;
        return new Promise(async function (resolve, reject) {
            const allFile = that.getAllFile();
            try {
                const fileRec = JSON.parse(fs.readFileSync('source/fileRecord.json', "utf-8"));
                let rts = []; // returns, words faild to me QwQ
                // pardon my for loop, I thought they are more understandable to me than callbacks
                for (let i = 0; i < allFile.length; i++) {
                    const dir = allFile[i];
                    let chandedFile = {
                        name: dir,
                        files: []
                    };
                    for (let j = 0; j < dir.files.length; j++) {
                        const file = dir.files[j];
                        if (fileRec[file]) {
                            const checksum = await that.getHash(file);
                            if (checksum != fileRec[file]) {
                                chandedFile.files.push(file);
                            }
                        } else {
                            // newly build
                            chandedFile.files.push(file);
                        }
                    }
                    if (chandedFile.files.length > 0) { // not empty
                        rts.push(chandedFile);
                    }
                }
                resolve(rts);
            } catch (err) {
                if (err.code === 'ENOENT' || err.code === "ENOTDIR") {
                    // fileRecord,json not exsists, should return all page or site
                    resolve(allFile);
                } else {
                    reject(err);
                }
            }
        });
    },

    getAllInfos: function () {
        let allInfos = [];
        try {
            const rootDirs = fs.readdirSync("source");
            for (let i = 0; i < rootDirs.length; i++) {
                const dirName = rootDirs[i];
                const dirPath = path.join("source", dirName);
                try {
                    let data = JSON.parse(fs.readFileSync(path.join(dirPath, "infos.json"), "utf-8"));
                    data.link = "/" + dirName;
                    allInfos.push(data);
                } catch (err) {
                    if (err.code === 'ENOENT' || err.code === "ENOTDIR") {
                        // fileRecord,json not exsists
                        ;
                    } else {
                        throw err;
                    }
                }
            }
            return allInfos;
        } catch (err) {
            if (err.code === 'ENOENT' || err.code === "ENOTDIR") {
                // fileRecord,json not exsists
                return allInfos;
            } else {
                throw err;
            }
        }
    },

    recordFile: function (changedFilePaths) {
        /*
            arg: filePaths: [string]

            get file's hash then write into fileRecord.json
        */
        const that = this;
        return new Promise(async function (resolve, reject) {
            let fileRec;
            try {
                fileRec = JSON.parse(fs.readFileSync('source/fileRecord.json', "utf-8"));
            } catch {
                if (err.code === 'ENOENT' || err.code === "ENOTDIR") {
                    fileRec = {};
                } else {
                    reject(err);
                }
            }
            for (let i = 0; i < changedFilePaths.length; i++) {
                const filePath = changedFilePaths[i];
                const checksum = await that.getHash(filePath);
                fileRec[filePath] = checksum;
            }
            fs.writeFile("source/fileRecord.json", JSON.stringify(rec), err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    },

    renderPage: function (pagePath, pageTitle) {
        /*
            use ejs to summon file, then copy
        */
        const data = fs.readFileSync(pagePath, "utf-8");
        const ejsTemptele = fs.readFileSync("layout/ejs/page/page.ejs", "utf-8");

        const config = getConfig();
        console.log(ejsTemptele);
        const html = ejs.render(ejsTemptele, {
            page: {
                content: data,
                title: pageTitle
            },
            config: config
        }, {
            filename: "layout/ejs/page/page.ejs"
        });

        const pathPublic = path.join('public', path.relative('source', pagePath));
        if (!fs.existsSync(path.dirname(pathPublic))) {
            fs.mkdirSync(path.dirname(pathPublic), { recursive: true });
        }
        fs.writeFileSync(pathPublic, html);
        console.log("Writen " + pathPublic);
    },

    renderCommonFile: function (filePath) {
        /*
            Just copy them into ./public
        */

        const pathPublic = path.join('public', path.relative('source', filePath));
        if (!fs.existsSync(path.dirname(pathPublic))) {
            fs.mkdirSync(path.dirname(pathPublic), { recursive: true });
        }
        fs.copyFileSync(filePath, pathPublic);
        console.log("Writen " + pathPublic);
    },

    renderCategories: function (allItems) {
        /*
            arg: [{
                    link: '/',
                    title: '',
                    description: '',
                    category: '',
                    auther: '',
                    date: ''
                },
                ...
            ],
        */

        let categories = {
            All: []
        };

        this.deleteFolderRecursive("public/categories");

        for (let i = 0; i < allItems.length; i++) {
            const item = allItems[i];
            if (categories[item.category] === undefined) {
                categories[item.category] = [];
            }
            if (item.category !== undefined) {
                categories[item.category].push(item);
            }
            categories.All.push(item);
        }

        const categoriesKeys = Object.getOwnPropertyNames(categories);
        const ejsTemptele = fs.readFileSync("layout/ejs/categories/categories.ejs", "utf-8");
        // render every single category, including all
        for (let i = 0; i < categoriesKeys.length; i++) {
            const key = categoriesKeys[i];
            const items = categories[key];
            const html = ejs.render(ejsTemptele, {
                config: getConfig(),
                page: {
                    title: "Categories " + key
                },
                category: {
                    categories: ["All"].concat(categoriesKeys),
                    active: key,
                    items: items
                }
            }, {
                filename: "layout/ejs/categories/categories.ejs"
            });
            if (!fs.existsSync(path.join("public/categories", key))) {
                fs.mkdirSync(path.join("public/categories", key), { recursive: true });
            }
            fs.writeFileSync(path.join("public/categories", key, "index.html"), html);
        }
    },

    renderTagPage: function (tagName, items) {
        /*
            arg: tagname: <string>
                 items: <as same as in renderCategories()>
        */
        const ejsTemptele = fs.readFileSync("layout/ejs/tags/tags.ejs", "utf-8");
        const html = ejs.render(ejsTemptele, {
            config: getConfig(),
            page: {
                title: 'Tag' + tagName
            },
            items: items
        }, {
            filename: "layout/ejs/tags/tags.ejs"
        });
        if (!fs.existsSync(path.join("public/tags", tagName))) {
            fs.mkdirSync(path.join("public/tags", tagName), { recursive: true });
        }
        fs.writeFileSync(path.join("public/tags", tagName, "index.html"), html);
    },

    renderAllTagPage: function (allInfos) {
        let infosGuideByTag = {};
        for (let i = 0; i < allInfos.length; i++) {
            const info = allInfos[i];
            for (let j = 0; j < info.tags.length; j++) {
                const tag = info.tags[j];
                if (infosGuideByTag[tag] === undefined) {
                    infosGuideByTag[tag] = [];
                }
                infosGuideByTag[tag].push(info);
            }
        }
        this.deleteFolderRecursive("public/tags");
        const keys = Object.getOwnPropertyNames(infosGuideByTag);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            for (let j = 0; i < infosGuideByTag[key].length; j++) {
                const info = infosGuideByTag[key][j];
                this.renderTagPage(key, info);
            }
        }
    },

    renderTagGuiding: function (allInfos) {
        /*
            arg: <as same as in renderCategories()>
        */
        this.deleteFolderRecursive("public/tags");
        let allTags = [];
        for (let i = 0; i < allInfos.length; i++) {
            const info = allInfos[i];
            for (let j = 0; j < info.tags.length; j++) {
                const tag = info.tags[j];
                allTags.push(tag);
            }
        }
        const ejsTemptele = fs.readFileSync("layout/ejs/tags/tagGuiding.ejs", "utf-8");
        const html = ejs.render(ejsTemptele, {
            config: getConfig(),
            page: {
                title: "Tags"
            },
            tagGuiding: {
                items: allTags
            }
        }, {
            filename: "layout/ejs/tags/tagGuiding.ejs"
        });
        if (!fs.existsSync("public/tags")) {
            fs.mkdirSync("public/tags", { recursive: true });
        }
        fs.writeFileSync("public/tags/index.html", html);
    },

    renderAll: function () {
        /*
            Read all changed directory in ../source,
            then render them according to their infos.json,
            finally put them in ../public directory,
        */

        // read all file
        const that = this;
        return new Promise(async function (resolve) {
            const allChangedFileList = await that.getChanged();
            // if a page or site's info have been changed, we need to update categroies and tags
            let infoChanged = false;
            for (let i = 0; i < allChangedFileList.length; i++) {
                const changed = allChangedFileList[i];
                const infos = JSON.parse(fs.readFileSync(path.join("source", changed.name), "utf-8"));

                for (let j = 0; j < changed.files.length; j++) {
                    const filePath = changed.files[j];
                    if ("infos.json" === path.relative(path.join("source", changed.name), filePath)) {
                        // is infos
                        infoChanged = true;
                    } else if (infos.type === "page" &&
                        "index.html" === path.relative(path.join("source", changed.name), filePath)) {
                        // is page's index.html
                        that.renderPage(filePath, infos.title);
                    } else {
                        that.renderCommonFile(filePath);
                    }
                }
            }

            // if infos have been changed, all categroies and tags should be updated
            if (infoChanged) {
                const allInfos = that.getAllInfos();
                that.renderCategories(allInfos);
                that.renderTagGuiding(allInfos);
                that.renderAllTagPage(allInfos);
            }

            // record all files
            let allChangedList = [];
            for (let i = 0; i < allChangedFileList.length; i++) {
                const changed = allChangedFileList[i];
                for (let j = 0; j < changed.files.length; j++) {
                    const filePath = changed.files[j];
                    allChangedList.push(filePath);
                }
            }
            that.recordFile(allChangedList);

            resolve();
        });
    }
}

const newLocal = async function () {
    const gg = Object.create(generator);
    console.log(gg.renderCategories(gg.getAllInfos()));
};
newLocal();

module.exports = generator;