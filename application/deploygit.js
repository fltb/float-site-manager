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
        const deployDir = deployDir;
        const config = configGet.getConfig();
        // get an empty dir __deploy/
        if (fs.existsSync(deployDir)) {
            extras.rm(deployDir);
        }
        fs.mkdirSync(deployDir);
        
        // copy
        if (fs.existsSync("public")) {
            fs.copyFileSync("public")
        } else {
            throw new Error("public/ not exsist. Haven't generated?")
        }
        
        // git's action
        child_process.execSync("git add .", {
            cwd: deployDir
        });

        child_process.execSync("git commit -m Update", {
            cwd: deployDir
        });

        child_process.execSync(`git push ${config.deploygit.repo} ${congig.deploygit.branch} -f`, {
            cwd: deployDir
        });
    }
};

module.exports = deploygit;
