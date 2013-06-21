var Token = require('./token');
var fs = require('fs');

var Vm = function (ops) {
  this.stack = [];
  this.heap = [];
  this.instrPtr = 0;
  this.ops = ops;
  this.callStack = [];
};

Vm.prototype.runSync = function () {
  var instruction = this.ops[this.instrPtr];
  var value, value1, value2, address, oldInstr, response;

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
        for (var i = 0; i < instruction.value; i++) {
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
        address = this.stack.shift();
        this.heap[address] = value;
        break;
      case Token.RETRIEVE:
        address = this.stack.shift();
        this.stack.unshift(this.heap[address]);
        break;
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
        if (this.stack.shift() == 0) {
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
        address = this.stack.shift();
        response = fs.readSync(process.stdin.fd, 100, 0, "utf8");
        this.heap[address] = response[0].replace(/[\r\n]/g, '').charCodeAt(0);
        break;
      case Token.INPUT_NUMBER:
        address = this.stack.shift();
        response = fs.readSync(process.stdin.fd, 100, 0, "utf8");
        this.heap[address] = response[0].replace(/[\r\n]/g, '');
        break;
      default:
        break;
    }

    this.instrPtr++;

    instruction = this.ops[this.instrPtr];
  }
};

Vm.prototype.run = function () {
  var instruction = this.ops[this.instrPtr];

  if (instruction.op === Token.END) {
    return;
  }

  var self = this;
  var next = function () {
    setImmediate(function () {
      self.run();
    });
  };

  switch (instruction.op) {
    case Token.PUSH:
      this.push(instruction, next);
      break;
    case Token.DUP:
      this.dup(next);
      break;
    case Token.COPY_NTH:
      this.copyNth(instruction, next);
      break;
    case Token.SWAP:
      this.swap(next);
      break;
    case Token.DISCARD:
      this.discard(next);
      break;
    case Token.SLIDE:
      this.slide(instruction, next);
      break;
    case Token.ADD:
      this.add(next);
      break;
    case Token.SUB:
      this.sub(next);
      break;
    case Token.MUL:
      this.mul(next);
      break;
    case Token.DIV:
      this.div(next);
      break;
    case Token.MOD:
      this.mod(next);
      break;
    case Token.STORE:
      this.store(next);
      break;
    case Token.RETRIEVE:
      this.retrieve(next);
      break;
    case Token.MARK:
      next();
      break;
    case Token.CALL_SUBROUTINE:
      this.callSubroutine(instruction, next);
      break;
    case Token.JUMP:
      this.jump(instruction, next);
      break;
    case Token.JUMP_IF_ZERO:
      this.jumpIfZero(instruction, next);
      break;
    case Token.JUMP_IF_NEGATIVE:
      this.jumpIfNegative(instruction, next);
      break;
    case Token.END_SUBROUTINE:
      this.endSubroutine(next);
      break;
    case Token.OUTPUT_CHAR:
      this.outputChar(next);
      break;
    case Token.OUTPUT_NUMBER:
      this.outputNumber(next);
      break;
    case Token.INPUT_CHAR:
      this.inputChar(next);
      break;
    case Token.INPUT_NUMBER:
      this.inputNumber(next);
      break;
    default:
      break;
  }

  this.instrPtr++;
};

Vm.prototype.push = function (instruction, next) {
  this.stack.unshift(instruction.value);

  next();
};

Vm.prototype.dup = function (next) {
  var value = this.stack[0];
  this.stack.unshift(value);

  next();
};

Vm.prototype.copyNth = function (instruction, next) {
  this.stack.unshift(this.stack[instruction.value]);

  next();
};

Vm.prototype.swap = function (next) {
  var value1 = this.stack.shift();
  var value2 = this.stack.shift();

  this.stack.unshift(value1);
  this.stack.unshift(value2);

  next();
};

Vm.prototype.discard = function (next) {
  this.stack.shift();

  next();
};

Vm.prototype.slide = function (instruction, next) {
  var value = this.stack.shift();
  for (var i = 0; i < instruction.value; i++) {
    this.stack.shift();
  }
  this.stack.unshift(value);

  next();
};

Vm.prototype.add = function (next) {
  this.stack.unshift(parseInt(this.stack.shift()) + parseInt(this.stack.shift()));

  next();
};

Vm.prototype.sub = function (next) {
  var value1 = this.stack.shift();
  var value2 = this.stack.shift();

  this.stack.unshift(value2 - value1);

  next();
};

Vm.prototype.mul = function (next) {
  this.stack.unshift(this.stack.shift() * this.stack.shift());

  next();
};

Vm.prototype.div = function (next) {
  var value1 = this.stack.shift();
  var value2 = this.stack.shift();

  this.stack.unshift(value2 / value1);

  next();
};

Vm.prototype.mod = function (next) {
  var value1 = this.stack.shift();
  var value2 = this.stack.shift();

  this.stack.unshift(value2 % value1);

  next();
};

Vm.prototype.store = function (next) {
  var value = this.stack.shift();
  var address = this.stack.shift();

  this.heap[address] = value;

  next();
};

Vm.prototype.retrieve = function (next) {
  var address = this.stack.shift();

  this.stack.unshift(this.heap[address]);

  next();
};

Vm.prototype.callSubroutine = function (instruction, next) {
  this.callStack.unshift(this.instrPtr);
  this.instrPtr = instruction.position;

  next();
};

Vm.prototype.jump = function (instruction, next) {
  this.instrPtr = instruction.position;

  next();
};

Vm.prototype.jumpIfZero = function (instruction, next) {
  if (this.stack.shift() == 0) {
    this.instrPtr = instruction.position;
  }

  next();
};

Vm.prototype.jumpIfNegative = function (instruction, next) {
  if (this.stack.shift() <= 0) {
    this.instrPtr = instruction.position;
  }

  next();
};

Vm.prototype.endSubroutine = function (next) {
  this.instrPtr = this.callStack.shift();

  next();
};

Vm.prototype.outputChar = function (next) {
  process.stdout.write("" + String.fromCharCode(this.stack.shift()));

  next();
};

Vm.prototype.outputNumber = function (next) {
  process.stdout.write("" + this.stack.shift());
  next();
};

Vm.prototype.inputChar = function (next) {
  var address = this.stack.shift();
  var buffer = new Buffer(100);
  var self = this;

  fs.read(process.stdin.fd, buffer, 0, 100, 0, function (err, bytesRead, buff) {
    self.heap[address] = buff.toString('utf8', 0, 1).replace(/[\r\n]/g, '').charCodeAt(0);
    console.log(self.heap[address]);
    next();
  });
};

Vm.prototype.inputNumber = function (next) {
  var address = this.stack.shift();
  var buffer = new Buffer(100);
  var self = this;

  fs.read(process.stdin.fd, buffer, 0, 100, 0, function (err, bytesRead, buff) {
    self.heap[address] = parseInt(buff.toString('utf8', 0, bytesRead).replace(/[\r\n]/g, ''));

    next();
  });
};

module.exports = Vm;
