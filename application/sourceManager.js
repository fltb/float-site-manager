"use strict";

const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const config = require("./config");

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

    getInfosTemplete: function(type, name) {
        // Waiting
        return `{
    "type": "${type}",
    "title": "${name}",
    "auther": "",
    "category": "",
    "tags": [""],
    "description": "",
    "date": "${new Date().toISOString().split("T")[0]}"
}`;
    },

    clean: function() {
        // just delete rendered files
        this.deleteFolderOrFileRecursive("public");
        this.deleteFolderOrFileRecursive("source/fileRecord.json");
    },

    newer: function(type, name) {
        /*
            type: "page" || "site", name: ""
        */
        if (type === undefined) {
            throw new Error("Type not given.");
        }
        if (name === undefined) {
            throw new Error("Name not given");
        }
        const infos = this.getInfosTemplete(type, name);
        let index = "";
        if (type === "site") {
            const ejsTemptele = fs.readFileSync("layout/ejs/page/page.ejs", "utf-8");
            index = ejs.render(ejsTemptele, {
                page: {
                    title: name,
                    content: `
    <!-- Here Are Contents -->
    <h1>${name}</h1>
                    `
                },
                config: config.getConfig(), 
            }, {
                filename: "layout/ejs/page/page.ejs"
            });
        } else if (type === "page") {
            index = "<!-- A sigle page -->";
        }

        if (!fs.existsSync(path.join("source", name))) {
            fs.mkdirSync(path.join("source", name), { recursive: true });
            fs.writeFileSync(path.join("source", name, "index.html"), index);
            fs.writeFileSync(path.join("source", name, "infos.json"), infos);
        } else {
            throw new Error("Failed: " + path.join("source", name) + " Already exsist");
        }
    }
};

module.exports = sourceManager;
