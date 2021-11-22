"use strict";

const fs = require("fs");

const sourceManager = {
    deleteFolderOrFileRecursive: function (directoryPath) {
        const that = this;
        if (fs.existsSync(directoryPath)) {
            try{
                fs.readdirSync(directoryPath).forEach((file, index) => {
                    const curPath = path.join(directoryPath, file);
                    if (fs.lstatSync(curPath).isDirectory()) {
                        // recurse
                        that.deleteFolderOrFileRecursive(curPath);
                    } else {
                        // delete file
                        console.log("Deleted " + curPath);
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(directoryPath);
            } catch (err) {
                if (err.code === "ENOTDIR") {
                    fs.unlinkSync(directoryPath);
                } else {
                    throw err;
                }
            }
        }
    },

    clean: function() {
        // just delete rendered files
        this.deleteFolderOrFileRecursive("public");
        this.deleteFolderOrFileRecursive("source/fileRecord.json");
    },

    newer: function(args) {
        /*
            args: {
                type: "page" || "site",
                name: ""
            } 
        */
        
    }
};
