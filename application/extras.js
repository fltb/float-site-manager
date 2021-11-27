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
    }
}

module.exports = extras;