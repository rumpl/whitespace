var Token = require('./token');

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str) {
    return this.indexOf(str) === 0;
  };
}

var Lexer = function (code) {
  this.code = code;
  this.position = 0;
  this.line = 0;
  this.lines = this.code.match(/[^\r]+/g);
};

Lexer.prototype.next = function () {
  if (this.line === this.lines.length) {
    return { type: Token.END };
  }

  var currentLine = this.lines[this.line]; // You don't say...
  this.line++;

  if (currentLine.startsWith(' ')) {
    return { type: Token.SM, instruction: this.stackManipulation(currentLine.substr(1)) };
  }

  if (currentLine.sartsWith('\t ')) {
    return { type: Token.ARITHMETIC, instruction: this.arithmetic(currentLine) };
  }

  if (currentLine.startsWith('\t\t')) {
    return { type: Token.HEAP_ACCES, instruction: this.heapAccess(currentLine) };
  }

  if (currentLine.startsWith('\t\n')) {
    return { type: Token.IO, instruction: this.io(currentLine) };
  }

  if (currentLine.startsWith('\n')) {
    return { type: Token.FLOW_CONTROL, instruction: this.flowControl(currentLine) };
  }

  // TODO : Everything that is not whitespace should be ignored
  throw new Error('Reached end.');
};

Lexer.prototype.debug = function (line) {
  line = line.replace(' ', 'S');
  line = line.replace('\t', 'T');
  line = line.replace('\n', 'L');
  console.log(line);
};

Lexer.prototype.parseNumber = function (line) {
  var sign = line[0] === ' ' ? 1 : -1;
  var ret = 0;

  line = line.substr(1);

  for (var i = 0; i < line.length && line[i] !== '\n'; i++) {
    ret = ret << 1;
    ret = ret | (line[i] === ' ' ? 0 : 1);
  }

  return ret * sign;
};

Lexer.prototype.stackManipulation = function (line) {
  if (line.startsWith(' ')) {
    return { op: Token.PUSH, value: this.parseNumber(line.substr(1)) };
  }

  if (line.startsWith('\n ')) {
    return { op: Token.DUP };
  }

  if (line.startsWith('\t ')) {
    return { op: Token.COPY_NTH, value: this.parseNumber(line.substr(2)) };
  }

  if (line.startsWith('\n\t')) {
    return { op: Token.SWAP };
  }

  if (line.startsWith('\n\n')) {
    return { op: Token.DISCARD };
  }

  if (line.startsWith('\t\n')) {
    return { op: Token.SLIDE };
  }

  throw new Error('Unknown stack manipulation operation ' + line);
};

Lexer.prototype.arithmetic = function (line) {
  if (line.startsWith('  ')) {
    return { op: Token.ADD };
  }

  if (line.startsWith(' \t')) {
    return { op: Token.SUB };
  }

  if (line.startsWith(' \n')) {
    return { op: Token.MUL };
  }

  if (line.startsWith('\t ')) {
    return { op: Token.DIV };
  }

  if (line.startsWith('\t\t')) {
    return { op: Token.MOD };
  }

  throw new Error('Unknown arithmetic operation ' + line);
};

Lexer.prototype.heapAccess = function (line) {
  if (line.startsWith(' ')) {
    return { op: Token.STORE };
  }

  if (line.startsWith('\t')) {
    return { op: Token.RETRIEVE };
  }

  throw new Error('Unknown heap access operation ' + line);
};

Lexer.prototype.flowControl = function (line) {
  if (line.startsWith('  ')) {
    return { op: Token.MARK, label: this.parseLabel(line.substr(2)) };
  }

  if (line.startsWith(' \t')) {
    return { op: Token.CALL_SUBROUTINE, label: this.parseLabel(line.substr(2)) };
  }

  if (line.startsWith(' \n')) {
    return { op: Token.JUMP, label: this.parseLabel(line.substr(2)) };
  }

  if (line.startsWith('\t ')) {
    return { op: Token.JUMP_IF_ZERO, label: this.parseLabel(line.substr(2)) };
  }

  if (line.startsWith('\t\t')) {
    return { op: Token.JUMP_IF_NEGATIVE, label: this.parseLabel(line.substr(2)) };
  }

  if (line.startsWith('\t\n')) {
    return { op: Token.END_SUBROUTINE };
  }

  if (line.startsWith('\n\n')) {
    return { op: Token.END };
  }

  throw new Error('Unknown flow control operation ' + line);
};

Lexer.prototype.io = function (line) {
  if (line.startsWith('  ')) {
    return { op: Token.OUTPUT_CHAR };
  }

  if (line.startsWith(' \t')) {
    return { op: Token.OUTPUT_NUMBER };
  }

  if (line.startsWith('\t ')) {
    return { op: Token.INPUT_CHAR };
  }

  if (line.startsWith('\t\t')) {
    return { op: Token.INPUT_NUMBER };
  }

  throw new Error('Unknown io operation ' + line);
};

module.exports = Lexer;
