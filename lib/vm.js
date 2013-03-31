var Token = require('./token');
var fs = require('fs');

var Vm = function (ops) {
  this.stack = [];
  this.heap = [];
  this.instrPtr = 0;
  this.ops = ops;
  this.callStack = [];
};

Vm.prototype.run = function () {
  var instruction = this.ops[this.instrPtr];
  var value, value1, value2, addr, oldInstr, response;

  while (instruction.op !== Token.END) {
    switch (instruction.op) {
      case Token.PUSH:
        this.stack.unshift(instruction.value);
        break;
      case Token.DUP:
        value = this.stack[0];
        this.stack.unshift(value);
        break;
      case Token.COPY_NTH:
        this.stack.unshift(this.stack[instruction.value]);
        break;
      case Token.SWAP:
        value1 = this.stack.shift();
        value2 = this.stack.shift();

        this.stack.unshift(value1);
        this.stack.unshift(value2);
        break;
      case Token.DISCARD:
        this.stack.shift();
        break;
      case Token.SLIDE:
        value = this.stack.shift();
        for(var i = 0; i < instruction.value; i++) {
          this.stack.shift();
        }
        this.stack.unshift(value);
        break;
      case Token.ADD:
        this.stack.unshift(parseInt(this.stack.shift()) + parseInt(this.stack.shift()));
        break;
      case Token.SUB:
        value1 = this.stack.shift();
        value2 = this.stack.shift();
        this.stack.unshift(value2 - value1);
        break;
      case Token.MUL:
        this.stack.unshift(this.stack.shift() * this.stack.shift());
        break;
      case Token.DIV:
        value1 = this.stack.shift();
        value2 = this.stack.shift();
        this.stack.unshift(value2 / value1);
        break;
      case Token.MOD:
        value1 = this.stack.shift();
        value2 = this.stack.shift();
        this.stack.unshift(value2 % value1);
        break;
      case Token.STORE:
        value = this.stack.shift();
        addr = this.stack.shift();
        this.heap[addr] = value;
        break;
      case Token.RETRIEVE:
        addr = this.stack.shift();
        this.stack.unshift(this.heap[addr]);
      case Token.MARK:
        break;
      case Token.CALL_SUBROUTINE:
        this.callStack.unshift(this.instrPtr);
        this.instrPtr = instruction.position;
        break;
      case Token.JUMP:
        this.instrPtr = instruction.position;
        break;
      case Token.JUMP_IF_ZERO:
        if (this.stack.shift() === 0) {
          this.instrPtr = instruction.position;
        }
        break;
      case Token.JUMP_IF_NEGATIVE:
        if (this.stack.shift() <= 0) {
          this.instrPtr = instruction.position;
        }
        break;
      case Token.END_SUBROUTINE:
        oldInstr = this.callStack.shift();
        this.instrPtr = oldInstr;
        break;
      case Token.OUTPUT_CHAR:
        process.stdout.write("" + String.fromCharCode(this.stack.shift()));
        break;
      case Token.OUTPUT_NUMBER:
        process.stdout.write("" + this.stack.shift());
        break;
      case Token.INPUT_CHAR:
        addr = this.stack.shift();
        response = fs.readSync(process.stdin.fd, 100, 0, "utf8");
        this.heap[addr] = response[0].replace(/[\r\n]/g, '');
        break;
      case Token.INPUT_NUMBER:
        addr = this.stack.shift();
        response = fs.readSync(process.stdin.fd, 100, 0, "utf8");
        this.heap[addr] = response[0].replace(/[\r\n]/g, '');
        break;
      default:
        break;
    }

    this.instrPtr++;

    instruction = this.ops[this.instrPtr];
  }
};

module.exports = Vm;
