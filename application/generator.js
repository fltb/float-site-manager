"use strict";

const fs = require("fs");
const ejs = require("ejs");
const path = require("path");
const crypto = require("crypto");
const config = require("./config");
const extras = require("./extras");

const getConfig = function () {
    return config.getConfig();
}

const generator = {

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

    getSingleDirectoty: function (fileRootPath) {
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
                        const tmp = this.getSingleDirectoty(dirPath);
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
                        name: dir.name,
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

    recordFileandClean: function (changedFilePaths) {
        /*
            arg: filePaths: [string]

            get file's hash then write into fileRecord.json
        */
        const that = this;
        return new Promise(async function (resolve, reject) {
            let fileRec;
            try {
                fileRec = JSON.parse(fs.readFileSync('source/fileRecord.json', "utf-8"));
            } catch (err) {
                if (err.code === 'ENOENT' || err.code === "ENOTDIR") {
                    fileRec = {};
                } else {
                    reject(err);
                }
            }

            // find all deleted file then clean them
            let infoChanged = false;
            const keys = Object.getOwnPropertyNames(fileRec);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (!fs.existsSync(key)) {
                    delete fileRec[key];
                    infoChanged = true;
                    extras.deleteFolderOrFileRecursive(path.join("public", path.relative("source", key)));
                }
            }

            for (let i = 0; i < changedFilePaths.length; i++) {
                const filePath = changedFilePaths[i];
                const checksum = await that.getHash(filePath);
                fileRec[filePath] = checksum;
            }

            fs.writeFile("source/fileRecord.json", JSON.stringify(fileRec, null, "\t"), err => {
                if (err) {
                    reject(err);
                } else {
                    if (infoChanged) {
                        resolve("changed");
                    } else {
                        resolve();
                    }
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
        console.log("Writen " + pathPublic);
        fs.copyFileSync(filePath, pathPublic);
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
        function compare(Item1, Item2) {
            // reverse
            const date1 = new Date(Item1.date);
            const date2 = new Date(Item2.date);
            if (date1 < date2) {
                return 1;
            } else if (date1 > date2) {
                return -1;
            } else {
                return 0;
            }
        }

        let categories = {
            All: []
        };

        extras.deleteFolderOrFileRecursive("public/categories");

        for (let i = 0; i < allItems.length; i++) {
            const item = allItems[i];
            if (item.category) {
                if (categories[item.category] === undefined) {
                    categories[item.category] = [];
                }
                categories[item.category].push(item);
                categories.All.push(item);

            }
        }

        const categoriesKeys = Object.getOwnPropertyNames(categories);
        const ejsTemptele = fs.readFileSync("layout/ejs/categories/categories.ejs", "utf-8");
        // render every single category, including all
        for (let i = 0; i < categoriesKeys.length; i++) {
            const key = categoriesKeys[i];
            let items = categories[key];
            items.sort(compare);
            const html = ejs.render(ejsTemptele, {
                config: getConfig(),
                page: {
                    title: "Categories " + key
                },
                category: {
                    categories: categoriesKeys,
                    active: key,
                    items: items
                }
            }, {
                filename: "layout/ejs/categories/categories.ejs"
            });
            if (!fs.existsSync(path.join("public/categories", key))) {
                fs.mkdirSync(path.join("public/categories", key), { recursive: true });
            }
            console.log("Writen " + path.join("public/categories", key, "index.html"));
            fs.writeFileSync(path.join("public/categories", key, "index.html"), html);
        }
        console.log("Writen public/categories/index.html");
        fs.copyFileSync("public/categories/All/index.html", "public/categories/index.html")
    },

    renderTagPage: function (tagName, items) {
        /*
            arg: tagname: <string>
                 items: <as same as in renderCategories()>
        */
        function compare(Item1, Item2) {
            // reverse
            const date1 = new Date(Item1.date);
            const date2 = new Date(Item2.date);
            if (date1 < date2) {
                return 1;
            } else if (date1 > date2) {
                return -1;
            } else {
                return 0;
            }
        }
        items.sort(compare);
        const ejsTemptele = fs.readFileSync("layout/ejs/tags/tags.ejs", "utf-8");
        const html = ejs.render(ejsTemptele, {
            config: getConfig(),
            page: {
                title: 'Tag' + tagName
            },
            tag: {
                name: tagName,
                items: items
            }
        }, {
            filename: "layout/ejs/tags/tags.ejs"
        });
        if (!fs.existsSync(path.join("public/tags", tagName))) {
            fs.mkdirSync(path.join("public/tags", tagName), { recursive: true });
        }
        console.log("Writen " + path.join("public/tags", tagName, "index.html"));
        fs.writeFileSync(path.join("public/tags", tagName, "index.html"), html);
    },

    renderTagGuiding: function (allInfos) {
        /*
            arg: <as same as in renderCategories()>
        */
        let allTags = [];
        let recTags = {};
        for (let i = 0; i < allInfos.length; i++) {
            const info = allInfos[i];
            for (let j = 0; j < info.tags.length; j++) {
                const tag = info.tags[j];
                if (tag && recTags[tag] === undefined) {
                    allTags.push(tag);
                    recTags[tag] = 1;
                }
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
        console.log("Writen " +"public/tags/index.html");
        fs.writeFileSync("public/tags/index.html", html);
    },

    renderAllTagPage: function (allInfos) {
        let infosGuideByTag = {};
        for (let i = 0; i < allInfos.length; i++) {
            const info = allInfos[i];
            for (let j = 0; j < info.tags.length; j++) {
                const tag = info.tags[j];
                if (tag) {
                    if (infosGuideByTag[tag] === undefined) {
                        infosGuideByTag[tag] = [];
                    }
                    infosGuideByTag[tag].push(info);    
                }
            }
        }
        extras.deleteFolderOrFileRecursive("public/tags");
        const keys = Object.getOwnPropertyNames(infosGuideByTag);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            this.renderTagPage(key, infosGuideByTag[key]);
        }
        this.renderTagGuiding(allInfos);
    },

    renderIndex: function() {
        const ejsTemptele = fs.readFileSync("layout/ejs/index/index.ejs", "utf-8");
        const content = fs.readFileSync("layout/src/index.html", "utf-8");
        const html = ejs.render(ejsTemptele, {
            config: getConfig(),
            page: {
                title: config.getConfig()["siteName"]
            },
            index: {
                content: content
            }
        }, {
            filename: "layout/ejs/index/index.ejs"
        });

        const pathPublic = "public/index.html";
        if (!fs.existsSync("public")) {
            fs.mkdirSync("public", {recursive: true});
        }
        console.log("Writen " + pathPublic);
        fs.writeFileSync(pathPublic, html);
    },

    renderSrc: function() {
        let allFile = this.getSingleDirectoty("layout/src");
        
        for (let i = 0; i < allFile.length; i++) {
            const file = allFile[i];
            if (file !== "layout/src/index.html") {
                fs.mkdirSync(path.join("public", path.relative("layout", path.dirname(file))), { recursive: true });
                console.log("Writen " + path.join("public", path.relative("layout", file)));
                fs.copyFileSync(file, path.join("public", path.relative("layout", file)));
            }
        }
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

            // copy static files if not exsist
            if (!fs.existsSync("public/src")) {
                that.renderSrc();
            }

            if (!fs.existsSync("public/index.html")) {
                that.renderIndex();
            }

            let infoChanged = false;

            // record all files
            let allChangedList = [];
            for (let i = 0; i < allChangedFileList.length; i++) {
                const changed = allChangedFileList[i];
                for (let j = 0; j < changed.files.length; j++) {
                    const filePath = changed.files[j];
                    allChangedList.push(filePath);
                }
            }
            if("changed" === await that.recordFileandClean(allChangedList)) {
                infoChanged = true;
            }
            
            // if a page or site's info have been changed, we need to update categroies and tags
            for (let i = 0; i < allChangedFileList.length; i++) {
                const changed = allChangedFileList[i];
                const infos = JSON.parse(fs.readFileSync(path.join("source", changed.name, "infos.json"), "utf-8"));

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
                that.renderAllTagPage(allInfos);
            }

            resolve();
        });
    }
}

module.exports = generator;