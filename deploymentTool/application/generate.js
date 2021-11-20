"use scrict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const getConfig = function() {
    return {
        "siteName": "YJZX",
        "siteURL": "https://example.com",
        "year": 2021,
        "owner": "Float",
        "licenseLink": "https://creativecommons.org/licenses/by-sa/4.0/",
        "lisenseName": "CC-BY-SA 4.0",
        "navs": [ {
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

    getHash: function(filePath) {
        return new Promise(function(resolve, reject) {
            try {
                const stream = fs.createReadStream(filePath);
                const sha256sum = crypto.createHash('sha256');
                stream.on('data', function(data) {
                    sha256sum.update(data);
                });
                stream.on('end', function() {
                    resolve(sha256sum.digest('hex'));
                });    
            } catch (err) {
                reject(err);
            }
        });
    },

    getAllFile: function() {
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
        function getSingleDirectoty(fileRootPath){
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
                    if (err.code === 'ENOENT') {
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
            const rootDirs = fs.readDirSync("source");
            for (let i = 0; i < rootDirs.length; i++) {
                const dirName = rootDirs[i];
                const dirPath = path.join("source", dirName);
                try {
                    fs.accessSync(path.join(dirPath, "infos.json"));
                    const stat = fs.statSync(dirPath);
                    if (stat.isDirectory()) {
                        const tmp = getSingleDirectoty(dirPath);
                        allFile.append({
                            name: dirName,
                            files: tmp
                        });
                    } 
                } catch (err) {
                    if (err.code === 'ENOENT') {
                        ;
                    } else {
                        throw err;
                    }
                }
            }
        } catch (err) {
            if (err.code === 'ENOENT') {
                ;
            } else {
                throw err;
            }
        }
        return allFile;
    },

    getChanged: function() {
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

        return async function() {
            const allFile = this.getAllFile();
            try {
                const fileRec = JSON.parse(fs.readFileSync('source/fileRecord.json'));
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
                            const checksum = await this.getHash(file);
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
                return rts;
            } catch (err) {
                if(err.code === 'ENOENT' ) {
                    // fileRecord,json not exsists, should return all page or site
                    return allFile;
                } else {
                    throw err;
                }
            }
        }
    },

    getAllInfos: function() {
        let allInfos = [];
        try {
            const rootDirs = fs.readDirSync("source");
            for (let i = 0; i < rootDirs.length; i++) {
                const dirName = rootDirs[i];
                const dirPath = path.join("source", dirName);
                try {
                    let data = JSON.parse(fs.readFileSync(path.join(dirPath, "infos.json")));
                    data.link = "/" + dirName;
                    allInfos.append(data);
                } catch (err) {
                    if(err.code === 'ENOENT' ) {
                        // fileRecord,json not exsists
                        ;
                    } else {
                        throw err;
                    }
                }
            }
            return allInfos;
        } catch (err) {
            if(err.code === 'ENOENT' ) {
                // fileRecord,json not exsists
                return allInfos;
            } else {
                throw err;
            }
        }
    },

    recordFile: function(filePaths) {
        /*
            arg: filePaths: [string]

            get file's hash then write into fileRecord.json
        */
        return async function() {
            let rec = {};
            for (let i = 0; i < filePaths.length; i++) {
                const filePath = filePaths[i];
                const checksum = await this.getHash(filePath);
                rec[filePath] = checksum;
            }
            fs.writeFile("source/fileRecord.json", JSON.stringify(rec) , err => {
                if (err) {
                    throw err;
                } else {
                    return;
                }
            })
        }
    },

    renderPage: function(pagePath, pageTitle){
        /*
            use ejs to summon file, then copy
        */
        const data = fs.readFileSync(pagePath);
        const ejsTemptele = fs.readFileSync("layout/ejs/page/page.ejs");

        const config = getConfig();

        const html = ejs.render(ejsTemptele, {
            page: {
                content: data,
                title: pageTitle
            },
            config: config
        });

        const pathPublic = path.join('public', path.relative('source', pagePath));
        fs.writeFileSync(pathPublic, html);
        console.log("Writen " + pathPublic);
    },

    renderCommonFile: function(filePath){
        /*
            Just copy them into ./public
        */
        
        const pathPublic = path.join('public', path.relative('source', filePath));
        fs.copyFileSync(filePath, pathPublic);
        console.log("Writen " + pathPublic);
    },

    renderCategories: function(allItems) {
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
            ALL_ITEMS: []
        };

        for (let i = 0; i < allItems.length; i++) {
            const item = allItems[i];
            if (categories[item.category] === undefined) {
                categories[item.category] = [];
            }
            categories[item.category].append(item);
            categories.ALL_ITEMS.append(item);
        }
        
        // render all category
        const ejsTemptele = fs.readFileSync("layout/ejs/categories/categories.ejs");
        const htmlOfAll = ejs.render(ejsTemptele, {
            config: getConfig(),
            page: {
                title: "Categories"
            },
            category: {
                categories: ["All"].concat(categoriesKeys),
                active: "All",
                items: categories.ALL_ITEMS
            }
        });
        fs.writeFileSync("public/categories/index.html", htmlOfAll);

        // render every single category
        const categoriesKeys = Object.getOwnPropertyNames(categories);
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
            });
            fs.writeFileSync(path.join("public/categories", key, "index.html"), html);
        }
    },

    renderTagPage: function(tagName, items) {
        /*
            arg: tagname: <string>
                 items: <as same as in renderCategories()>
        */
        const ejsTemptele = fs.readFileSync("layout/ejs/tags/tags.ejs");
        const html = ejs.render(ejsTemptele, {
            config: getConfig(),
            page: {
                title: 'Tag' + tagName
            },
            items: items
        });
        fs.writeFileSync(path.join("public/tags", tagName, "index.html"), html);
    },

    renderAllTagPage: function(allInfos) {
        let infosGuideByTag = {};
        for (let i = 0; i < allInfos.length; i++) {
            const info = allInfos[i];
            for (let j = 0; j < info.tags.length; j++) {
                const tag = info.tags[j];
                if (infosGuideByTag[tag] === undefined) {
                    infosGuideByTag[tag] = [];
                }
                infosGuideByTag[tag].append(info);
            }
        }
        const keys = Object.getOwnPropertyNames(infosGuideByTag);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            for (let j = 0; i < infosGuideByTag[key].length; j++) {
                const info = infosGuideByTag[key][j];
                this.renderTagPage(key, info);
            }
        }
    },

    renderTagGuiding: function(allInfos) {
        /*
            arg: <as same as in renderCategories()>
        */
        let allTags = [];
        for (let i = 0; i < allInfos.length; i++) {
            const info = allInfos[i];
            for (let j = 0; j < info.tags.length; j++) {
                const tag = info.tags[j];
                allTags.append(tag);
            }
        }
        const ejsTemptele = fs.readFileSync("layout/ejs/tags/tagGuiding.ejs");
        const html = ejs.render(ejsTemptele, {
            config: getConfig(),
            page: {
                title: "Tags"
            },
            tagGuiding: {
                items: allTags
            }
        });
        fs.writeFileSync("public/tags/index.html", html);
    },

    renderAll: function() {
        /*
            Read all changed directory in ../source,
            then render them according to their infos.json,
            finally put them in ../public directory,
        */
        
        // read all file
        return async function() {
            const allChangedFileList = await this.getChanged();
            // if a page or site's info have been changed, we need to update categroies and tags
            let infoChanged = false;
            for (let i = 0; i < allChangedFileList.length; i++) {
                const changed = allChangedFileList[i];
                const infos = JSON.parse(fs.readFileSync(path.join("source", changed.name)));

                for (let j = 0; j < changed.files.length; j++) {
                    const filePath = changed.files[j];
                    if ("infos.json" === path.relative(path.join("source", changed.name), filePath)) {
                        // is infos
                        infoChanged = true;
                    } else if ( infos.type === "page"  &&
                                "index.html" === path.relative(path.join("source", changed.name), filePath)) {
                        // is page's index.html
                        this.renderPage(filePath, infos.title);
                    } else {
                        this.renderCommonFile(filePath);
                    }
                }
            }

            // if infos have been changed, all categroies and tags should be updated
            if (infoChanged) {
                const allInfos = this.getAllInfos();
                this.renderCategories(allInfos);
                this.renderTagGuiding(allInfos);
                this.renderAllTagPage(allInfos);
            }
        }
    }
}

module.exports = generator;