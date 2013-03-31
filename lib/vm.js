var Token = require('./token');

var Vm = function (ops) {
  this.stack = [];
  this.heap = [];
  this.instrPtr = 0;
  this.ops = ops;
};

Vm.prototype.run = function () {
  var instruction = this.ops[this.instrPtr];

  while (instruction.op !== Token.END) {
    switch (instruction.op) {
      case Token.PUSH:
        this.stack.push(instruction.value);
        break;
      case Token.STORE:
        var value = this.stack.pop();
        var addr = this.stack.pop();
        this.heap[addr] = value;
        break;
      default :
        break;
    }

    this.instrPtr++;

    instruction = this.ops[this.instrPtr];
  }

  for(var i = 0; i < this.heap.length; i++) {
    process.stdout.write(String.fromCharCode(this.heap[i]));
  }

};

module.exports = Vm;
