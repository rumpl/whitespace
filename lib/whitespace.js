var Parser = require('./parser');
var Program = require('./program');
var Vm = require('./vm');
var fs = require('fs');

module.exports = {
  run: function (file) {
    var code = fs.readFileSync(file, "utf8");

    var parser = new Parser(code);
    var instructions = parser.parse();

    var program = new Program(instructions);
    var vm = new Vm(program);

    vm.run();
  },
  debug: function (file) {
    var code = fs.readFileSync(file, "utf8");

    var parser = new Parser(code);
    var instructions = parser.parse();

    for (var i = 0; i < instructions.length; i++) {
      var str = i + " " + instructions[i].op;
      if (instructions[i].value !== undefined) {
        str += " " + instructions[i].value;
      }

      if (instructions[i].position !== undefined) {
        str += " " + instructions[i].position;
      }

      console.log(str);
    }
  }
};
