"use strict";

const child_process = require("child_process");
const fs = require("fs");
const extras = require("./extras");
const configGet = require("./config")


const deploygit = {
    deploy: function() {
        /*
            copy public/ to the __deploy/
            cd __deploy
            git add .
            git commit -m "Update"
            git push config.deploygit.repo congig.deploygit.branch -f
        */
        const deployDir = "__deploy";
        const config = configGet.getConfig();
        // get an empty dir __deploy/
        if (fs.existsSync(deployDir)) {
            extras.rmQuiet(deployDir);
        }
        fs.mkdirSync(deployDir);
        
        // copy
        if (fs.existsSync("public")) {
            extras.copyQuiet("public", deployDir);
        } else {
            throw new Error("public/ not exsist. Haven't generated?")
        }
        
        child_process.execSync("echo $PWD", {
            cwd: deployDir,
            stdio:[0, 1, 2]
        })

        // git's action
        child_process.execSync("git init", {
            cwd: deployDir,
            stdio:[0, 1, 2]
        });

        child_process.execSync("git add .", {
            cwd: deployDir,
            stdio:[0, 1, 2]
        });

        child_process.execSync("git commit -m Update", {
            cwd: deployDir,
            stdio:[0, 1, 2]
        });

        child_process.execSync(`git push ${config.deploygit.repo} ${config.deploygit.branch} -f`, {
            cwd: deployDir,
            stdio:[0, 1, 2]
        });
    }
};

module.exports = deploygit;
