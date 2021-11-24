"use strict";

const express = require("express");

const app = express();

app.use(express.static("public"));

const server = {
    start: function(port) {
        if (port === undefined || !Number.isInteger(port)) {
            port = 4000;
        }
        app.listen(port);
    }
}

module.exports = server;