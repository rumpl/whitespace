var Token = require('./token');
var fs = require('fs');

var Vm = function (program) {
  this.programs = [program];
};

Vm.prototype.run = function () {
  var self = this;
  var toDelete = [];
  for(var i in this.programs) {
    var program = this.programs[i];

    if (program.state == 1) {
      toDelete.push(i);
    } else {
      _run(program);
    }
  }

  for(i in toDelete) {
    var idx = toDelete[i];
    this.programs.slice(idx);
  }

  function _run(program) {
    var instruction = program.instructions[program.instrPtr];

    var next = function () {
      setImmediate(function () {
        program.instrPtr++;
        self.run();
      });
    };

    switch (instruction.op) {
      case Token.PUSH:
        self.push(program, instruction, next);
        break;
      case Token.DUP:
        self.dup(program, next);
        break;
      case Token.COPY_NTH:
        self.copyNth(program, instruction, next);
        break;
      case Token.SWAP:
        self.swap(program, next);
        break;
      case Token.DISCARD:
        self.discard(program, next);
        break;
      case Token.SLIDE:
        self.slide(program, instruction, next);
        break;
      case Token.ADD:
        self.add(program, next);
        break;
      case Token.SUB:
        self.sub(program, next);
        break;
      case Token.MUL:
        self.mul(program, next);
        break;
      case Token.DIV:
        self.div(program, next);
        break;
      case Token.MOD:
        self.mod(program, next);
        break;
      case Token.STORE:
        self.store(program, next);
        break;
      case Token.RETRIEVE:
        self.retrieve(program, next);
        break;
      case Token.MARK:
        next();
        break;
      case Token.CALL_SUBROUTINE:
        self.callSubroutine(program, instruction, next);
        break;
      case Token.JUMP:
        self.jump(program, instruction, next);
        break;
      case Token.JUMP_IF_ZERO:
        self.jumpIfZero(program, instruction, next);
        break;
      case Token.JUMP_IF_NEGATIVE:
        self.jumpIfNegative(program, instruction, next);
        break;
      case Token.END_SUBROUTINE:
        self.endSubroutine(program, next);
        break;
      case Token.OUTPUT_CHAR:
        self.outputChar(program, next);
        break;
      case Token.OUTPUT_NUMBER:
        self.outputNumber(program, next);
        break;
      case Token.INPUT_CHAR:
        self.inputChar(program, next);
        break;
      case Token.INPUT_NUMBER:
        self.inputNumber(program, next);
        break;
      case Token.END:
        program.state = 1;
        break;
      default:
        break;
    }

  }
};

Vm.prototype.push = function (program, instruction, next) {
  program.stack.unshift(instruction.value);

  next();
};

Vm.prototype.dup = function (program, next) {
  var value = program.stack[0];
  program.stack.unshift(value);

  next();
};

Vm.prototype.copyNth = function (program, instruction, next) {
  program.stack.unshift(program.stack[instruction.value]);

  next();
};

Vm.prototype.swap = function (program, next) {
  var value1 = program.stack.shift();
  var value2 = program.stack.shift();

  program.stack.unshift(value1);
  program.stack.unshift(value2);

  next();
};

Vm.prototype.discard = function (program, next) {
  program.stack.shift();

  next();
};

Vm.prototype.slide = function (program, instruction, next) {
  var value = program.stack.shift();
  for (var i = 0; i < instruction.value; i++) {
    program.stack.shift();
  }
  program.stack.unshift(value);

  next();
};

Vm.prototype.add = function (program, next) {
  program.stack.unshift(parseInt(program.stack.shift()) + parseInt(program.stack.shift()));

  next();
};

Vm.prototype.sub = function (program, next) {
  var value1 = program.stack.shift();
  var value2 = program.stack.shift();

  program.stack.unshift(value2 - value1);

  next();
};

Vm.prototype.mul = function (program, next) {
  program.stack.unshift(program.stack.shift() * program.stack.shift());

  next();
};

Vm.prototype.div = function (program, next) {
  var value1 = program.stack.shift();
  var value2 = program.stack.shift();

  program.stack.unshift(value2 / value1);

  next();
};

Vm.prototype.mod = function (program, next) {
  var value1 = program.stack.shift();
  var value2 = program.stack.shift();

  program.stack.unshift(value2 % value1);

  next();
};

Vm.prototype.store = function (program, next) {
  var value = program.stack.shift();
  var address = program.stack.shift();

  program.heap[address] = value;

  next();
};

Vm.prototype.retrieve = function (program, next) {
  var address = program.stack.shift();

  program.stack.unshift(program.heap[address]);

  next();
};

Vm.prototype.callSubroutine = function (program, instruction, next) {
  program.callStack.unshift(program.instrPtr);
  program.instrPtr = instruction.position;

  next();
};

Vm.prototype.jump = function (program, instruction, next) {
  program.instrPtr = instruction.position;

  next();
};

Vm.prototype.jumpIfZero = function (program, instruction, next) {
  if (program.stack.shift() == 0) {
    program.instrPtr = instruction.position;
  }

  next();
};

Vm.prototype.jumpIfNegative = function (program, instruction, next) {
  if (program.stack.shift() <= 0) {
    program.instrPtr = instruction.position;
  }

  next();
};

Vm.prototype.endSubroutine = function (program, next) {
  program.instrPtr = program.callStack.shift();

  next();
};

Vm.prototype.outputChar = function (program, next) {
  process.stdout.write("" + String.fromCharCode(program.stack.shift()));

  next();
};

Vm.prototype.outputNumber = function (program, next) {
  process.stdout.write("" + program.stack.shift());
  next();
};

Vm.prototype.inputChar = function (program, next) {
  var address = program.stack.shift();
  var buffer = new Buffer(100);

  fs.read(process.stdin.fd, buffer, 0, 100, 0, function (err, bytesRead, buff) {
    program.heap[address] = buff.toString('utf8', 0, 1).replace(/[\r\n]/g, '').charCodeAt(0);

    next();
  });
};

Vm.prototype.inputNumber = function (program, next) {
  var address = program.stack.shift();
  var buffer = new Buffer(100);
  fs.read(process.stdin.fd, buffer, 0, 100, 0, function (err, bytesRead, buff) {
    program.heap[address] = parseInt(buff.toString('utf8', 0, bytesRead).replace(/[\r\n]/g, ''));

    next();
  });
};

module.exports = Vm;
