"use strict";

const config = require("./config");
const generator = require("./generator");
const sourseManager = require("./sourceManager");
const server = require("./server");

function main() {
    const args = process.argv.slice(2);
    switch (args[0]) {
        case "generate":
        case "g":
            generator.renderAll();
            break;
        case "server":
        case "s":
            server.start(args[1]);
            break;
        case "clean":
            sourseManager.clean();
            break;
        case "new":
            sourseManager.newer(args[1], args[2]);
            break;
    }
}

main();
