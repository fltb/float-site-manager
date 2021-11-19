"use scrict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

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
            const rootDirs = fs.readDirSync("./source");
            for (let i = 0; i < rootDirs.length; i++) {
                const dirName = rootDirs[i];
                const dirPath = path.join("./source", dirName);
                const stat = fs.statSync(dirPath);
                if (stat.isDirectory()) {
                    const tmp = getSingleDirectoty(dirPath);
                    allFile.append({
                        name: dirName,
                        files: tmp
                    });
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
            promise, resolve an object that included all changed or newly build page and site's object.
            resolve: object: [
                {
                    name: '',
                    files[
                        '',
                        ...
                    ]
                },
                ...
            ]

            I dont know how to describe in English
            现在我需要进行这样一个操作：
                获取所有文件的 hash 值，对于这些 hash 进行比对。最后还要等到所有 hash 算完之后返回。
        */

        return new Promise(async function(resolve, reject) {
            const allFile = this.getAllFile();
            try {
                const fileRec = JSON.parse(fs.readFileSync('../source/fileRecord.json'));
                let rts = []; // returns, words faild to me QwQ
                // pardon my for loop, I thought it is more understandable
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
                resolve(rts);
            } catch (err) {
                if(err.code === 'ENOENT' ) {
                    // fileRecord,json not exsists, should return all page or site
                    resolve(allFile);
                } else {
                    reject(err);
                }
            }
        });
    },

    recordFile: function(filePaths) {
        /*
            arg: filePaths: [string]

            get file's hash then write into fileRecord.json
        */
        return new Promise(async function(resolve, reject) {
            let rec = {};
            for (let i = 0; i < filePaths.length; i++) {
                const filePath = filePaths[i];
                const checksum = await this.getHash(filePath);
                rec[filePath] = checksum;
            }
            fs.writeFile("./source/fileRecord.json", JSON.stringify(rec) , err => {
                if (err) {
                    reject(err)
                } else {
                    resolve();
                }
            })
        })
    },

    randerPage: function(pagePath){
        /*
            use ejs to summon file
        */
    },

    randerCommonFile: function(filePath){

    },

    randerAll: function() {
        /*
            Read all changed directory in ../source,
            then rander them according to their infos.json,
            finally put them in ../public directory,
        */

        
    }
}

module.exports = generator;