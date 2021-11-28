"use strict";

const fs = require("fs");
const path = require("path");

const extras = {

    rm: function (Path) {
        function deleteFolderOrFileRecursive(directoryPath) {
            if (fs.existsSync(directoryPath)) {
                try {
                    const stat = fs.statSync(directoryPath);
                    if (stat.isFile()) {
                        fs.unlinkSync(directoryPath);
                    } else {
                        fs.readdirSync(directoryPath).forEach((file, index) => {
                            const curPath = path.join(directoryPath, file);
                            if (fs.lstatSync(curPath).isDirectory()) {
                                // recurse
                                deleteFolderOrFileRecursive(curPath);
                            } else {
                                // delete file
                                console.log("Deleted " + curPath);
                                fs.unlinkSync(curPath);
                            }
                        });
                        console.log("Deleted " + directoryPath);
                        fs.rmdirSync(directoryPath);
                    }
                } catch (err) {
                    throw err;
                }
            }
        }
        function deleteEmpty(dirPath) {
            try {
                fs.rmdirSync(dirPath);
            } catch (err) {
                return;
            }
            // delete success, dir is empty
            deleteEmpty(path.dirname(dirPath));
        }
        deleteFolderOrFileRecursive(Path);
        deleteEmpty(path.dirname(Path));
    },

    rmQuiet: function (Path) {
        function deleteFolderOrFileRecursive(directoryPath) {
            if (fs.existsSync(directoryPath)) {
                try {
                    const stat = fs.statSync(directoryPath);
                    if (stat.isFile()) {
                        fs.unlinkSync(directoryPath);
                    } else {
                        fs.readdirSync(directoryPath).forEach((file, index) => {
                            const curPath = path.join(directoryPath, file);
                            if (fs.lstatSync(curPath).isDirectory()) {
                                // recurse
                                deleteFolderOrFileRecursive(curPath);
                            } else {
                                // delete file
                                fs.unlinkSync(curPath);
                            }
                        });
                        fs.rmdirSync(directoryPath);
                    }
                } catch (err) {
                    throw err;
                }
            }
        }
        function deleteEmpty(dirPath) {
            try {
                fs.rmdirSync(dirPath);
            } catch (err) {
                return;
            }
            // delete success, dir is empty
            deleteEmpty(path.dirname(dirPath));
        }
        deleteFolderOrFileRecursive(Path);
        deleteEmpty(path.dirname(Path));
    },


    copy: function(source_, target_) {
        function copyFolderRecursiveSync(source, target) {

            if (!fs.existsSync(target)) {
                fs.mkdirSync(target);
            }
            if (fs.lstatSync(source).isDirectory()) {
                const files = fs.readdirSync(source);
                files.forEach(function (file) {
                    const curSource = path.join(source, file);
                    const targetNext = path.join(target, file);
                    if (fs.lstatSync(curSource).isDirectory()) {
                        copyFolderRecursiveSync(curSource, targetNext);
                    } else {
                        fs.copyFileSync(curSource, targetNext);
                    }
                });
            }
        }
        if (fs.lstatSync(source_).isFile()) {
            fs.copyFileSync(source_, target_);
        } else {
            copyFolderRecursiveSync(source_, target_);
        }
        console.log("Copyed " + source_ + " to " + target_ );
    },

    copyQuiet: function(source_, target_) {
        function copyFolderRecursiveSync(source, target) {

            if (!fs.existsSync(target)) {
                fs.mkdirSync(target);
            }
            if (fs.lstatSync(source).isDirectory()) {
                const files = fs.readdirSync(source);
                files.forEach(function (file) {
                    const curSource = path.join(source, file);
                    const targetNext = path.join(target, file);
                    if (fs.lstatSync(curSource).isDirectory()) {
                        copyFolderRecursiveSync(curSource, targetNext);
                    } else {
                        fs.copyFileSync(curSource, targetNext);
                    }
                });
            }
        }
        if (fs.lstatSync(source_).isFile()) {
            fs.copyFileSync(source_, target_);
        } else {
            copyFolderRecursiveSync(source_, target_);
        }
    }

};

module.exports = extras;