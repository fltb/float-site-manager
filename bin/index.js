"use strict";

const generator = require("./generator");
const sourseManager = require("./sourceManager");
const server = require("./server");
const deploygit = require("./deploygit");

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
        case "deploy":
        case "d":
            deploygit.deploy();
            break;
        case "clean":
            sourseManager.clean();
            break;
        case "new":
            sourseManager.newer(args[1], args[2]);
            break;
        
        default:
            console.log("Unknown arguments.\nUsage: [generate] [server] [clean] [new <type> <name>]\nSee ./doc to get more infomations.");
    }
}

main();
