var Token = require('./token');

var Lexer = function (code) {
  this.code = code.replace(/[^ \t\n]+/g, '');
};

Lexer.prototype.imp = function () {
  if (this.code === '') {
    return null;
  }

  var imp = this.next(1);

  if (imp === ' ') {
    return { type: Token.SM };
  }

  if (imp === '\n') {
    return { type: Token.FLOW };
  }

  imp = imp + this.next(1);

  if (imp === '\t ') {
    return { type: Token.ARITHMETIC };
  }

  if (imp === '\t\t') {
    return { type: Token.HEAP };
  }

  if (imp === '\t\n') {
    return { type: Token.IO };
  }

  throw new Error('Reached end with imp ' + this.debug(imp));
};

Lexer.prototype.debug = function (str) {
  str = str.replace(/ /g, 'S');
  str = str.replace(/\t/g, 'T');
  str = str.replace(/\n/g, 'L');
  return str;
}

Lexer.prototype.next = function (n) {
  var ret = this.peek(n);
  this.code = this.code.substr(n);
  return ret;
};

Lexer.prototype.peek = function (n) {
  return this.code.substr(0, n);
};

Lexer.prototype.parseNumber = function () {
  var sign = this.next(1) === ' ' ? 1 : -1;
  var ret = 0;

  for (var i = 0; this.code[i] !== '\n'; i++) {
    ret = ret << 1;
    ret = ret | (this.code[i] === ' ' ? 0 : 1);
  }

  this.next(i + 1);

  return ret * sign;
};

Lexer.prototype.stackManipulation = function () {
  var op = this.next(1);
  if (op === ' ') {
    return { op: Token.PUSH };
  }

  op = op + this.next(1);

  if (op === '\n ') {
    return { op: Token.DUP };
  }

  if (op === '\t ') {
    return { op: Token.COPY_NTH };
  }

  if (op === '\n\t') {
    return { op: Token.SWAP };
  }

  if (op === '\n\n') {
    return { op: Token.DISCARD };
  }

  if (op === '\t\n') {
    return { op: Token.SLIDE };
  }

  throw new Error('Unknown stack manipulation operation ' + this.code);
};

Lexer.prototype.arithmetic = function () {
  var op = this.next(2);

  if (op === '  ') {
    return { op: Token.ADD };
  }

  if (op === ' \t') {
    return { op: Token.SUB };
  }

  if (op === ' \n') {
    return { op: Token.MUL };
  }

  if (op === '\t ') {
    return { op: Token.DIV };
  }

  if (op === '\t\t') {
    return { op: Token.MOD };
  }

  throw new Error('Unknown arithmetic operation');
};

Lexer.prototype.heapAccess = function () {
  var op = this.next(1);
  if (op === ' ') {
    return { op: Token.STORE };
  }

  if (op === '\t') {
    return { op: Token.RETRIEVE };
  }

  throw new Error('Unknown heap access operation');
};

Lexer.prototype.flowControl = function () {
  var op = this.next(2);
  if (op === '  ') {
    return { op: Token.MARK };
  }

  if (op === ' \t') {
    return { op: Token.CALL_SUBROUTINE };
  }

  if (op === ' \n') {
    return { op: Token.JUMP };
  }

  if (op === '\t ') {
    return { op: Token.JUMP_IF_ZERO };
  }

  if (op === '\t\t') {
    return { op: Token.JUMP_IF_NEGATIVE };
  }

  if (op === '\t\n') {
    return { op: Token.END_SUBROUTINE };
  }

  if (op === '\n\n') {
    return { op: Token.END };
  }

  throw new Error('Unknown flow control operation');
};

Lexer.prototype.io = function () {
  var op = this.next(2);

  if (op === '  ') {
    return { op: Token.OUTPUT_CHAR };
  }

  if (op === ' \t') {
    return { op: Token.OUTPUT_NUMBER };
  }

  if (op === '\t ') {
    return { op: Token.INPUT_CHAR };
  }

  if (op === '\t\t') {
    return { op: Token.INPUT_NUMBER };
  }

  throw new Error('Unknown io operation');
};

module.exports = Lexer;
