"use strict";

const fs = require("fs");

const config = {
    getConfig: function() {
        if (!this.inited) {
            this.inited = true;
            this.conf = JSON.parse(fs.readFileSync("config.json"));
        } 
        return this.conf;
    }
}

module.exports = config;