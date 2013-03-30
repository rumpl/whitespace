var Parser = require('./parser');
var fs = require('fs');

var parser = new Parser;
//console.log(fs.realpathSync("./ws/calc.ws"));
console.log(parser.parse(fs.readFileSync("../ws/hworld.ws", "utf8")));

//console.log(parser.parse('   \t\n\r \n \r   \t \t\t\n'));
