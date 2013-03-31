var Lexer = require('./lexer');
var Token = require('./token');

var Parser = function (code) {
  this.definedLabels = [];
  this.usedLabels = [];
  this.instructions = [];
  this.lexer = new Lexer(code);
};

Parser.prototype.parse = function () {
  var i = 0;
  var token = this.lexer.imp();

  while (token != null) {
    switch (token.type) {
      case Token.SM:
        this.instructions.push(this.parseSM());
        break;
      case Token.ARITHMETIC:
        this.instructions.push(this.parseArithmetic());
        break;
      case Token.HEAP:
        this.instructions.push(this.parseHeap());
        break;
      case Token.IO:
        this.instructions.push(this.parseIo());
        break;
      case Token.FLOW:
        this.instructions.push(this.parseFlow());
        break;
      default:
        throw new Error('Unknown token ' + token);
    }

    token = this.lexer.imp();
    i++;
  }

  this.resolveLabels();

  return this.instructions;
};

Parser.prototype.parseSM = function () {
  var sm = this.lexer.stackManipulation();
  if (sm.op == Token.PUSH || sm.op === Token.COPY_NTH) {
    return { op: sm.op, value: this.lexer.parseNumber() };
  }

  return { op: sm.op };
};

Parser.prototype.parseArithmetic = function () {
  return this.lexer.arithmetic();
};

Parser.prototype.parseHeap = function () {
  return this.lexer.heapAccess();
};

Parser.prototype.parseIo = function () {
  return this.lexer.io();
};

Parser.prototype.parseFlow = function () {
  var flow = this.lexer.flowControl();
  if (flow.op === Token.END_SUBROUTINE || flow.op === Token.END) {
    return flow;
  }

  var label = this.lexer.parseNumber();
  if (flow.op === Token.MARK) {
    this.definedLabels.push(label);
  } else {
    this.usedLabels.push(label);
  }

  return { op: flow.op, label: label };
};

Parser.prototype.resolveLabels = function () {
};

module.exports = Parser;
