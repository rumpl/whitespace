var Parser = require('./parser');
var Vm = require('./vm');
var fs = require('fs');

module.exports = {
  run: function (file) {
    var code = fs.readFileSync(file, "utf8");

    var parser = new Parser(code);
    var instructions = parser.parse();

    var vm = new Vm(instructions);

    vm.run();
  },
  debug: function (file) {
    var code = fs.readFileSync(file, "utf8");

    var parser = new Parser(code);
    var instructions = parser.parse();

    for (var i = 0; i < instructions.length; i++) {
      var str = instructions[i].op;
      if (instructions[i].value !== undefined) {
        str += " " + instructions[i].value;
      }

      if (instructions[i].label) {
        str += " \'" + instructions[i].label + "\'";
      }

      if (instructions[i].position !== undefined) {
        str += " " + instructions[i].position;
      }

      console.log(str);
    }
  }
};
