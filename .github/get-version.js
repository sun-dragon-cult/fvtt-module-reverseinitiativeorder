var fs = require("fs");
console.log(JSON.parse(fs.readFileSync("module/module.json", "utf8")).version);
