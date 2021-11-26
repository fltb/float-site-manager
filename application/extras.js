const fs = require("fs");
const path = require("path");

const extras = {

    deleteFolderOrFileRecursive: function (directoryPath) {
        const that = this;
        if (fs.existsSync(directoryPath)) {
            try{
                const stat = fs.statSync(directoryPath);
                if (stat.isFile()) {
                    fs.unlinkSync(directoryPath);
                    try {
                        // if it is empty, it will be removed
                        fs.rmdirSync(dirname);
                    }
                    catch(err){
                        ;
                    }
                } else {
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
    
                }
                console.log("Deleted " + directoryPath);
                fs.rmdirSync(directoryPath);
            } catch (err) {
                throw err;
            }
        }
    }
}

module.exports = extras;