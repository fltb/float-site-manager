"use strict";

const express = require("express");

const app = express();

app.use(express.static("public"));

const server = {
    start: function(port) {
        if (port === undefined || !Number.isInteger(port)) {
            port = 4000;
        }
        console.log("Server started at http://localhost:" + port);
        console.log("Use Ctrl+C to stop");
        app.listen(port);
    }
}

module.exports = server;