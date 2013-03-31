var Parser = require('./parser');
var Vm = require('./vm');

var fs = require('fs');

var code = fs.readFileSync("../ws/hworld.ws", "utf8");
var parser = new Parser(code);

var dd = parser.parse();
var vm = new Vm(dd);
vm.run();
console.log(dd);
