const child_process = require("child_process");


const deploygit = {
    git: function(args) {
        return new Promise(function(resolve, reject) {
            child_process.exec("git " + args, function(err, stdout, stderr) {
                if (err) {
                    reject(err);
                } else if (stdout) {
                    resolve(stdout);
                } else if (stderr) {
                    reject(stderr);
                }
            })
        })
    },

    init: function() {

    }
}
