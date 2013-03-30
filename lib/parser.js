var Lexer = require('./lexer');
var Token = require('./token');

var Parser = function (code) {
  this.definedLabels = [];
  this.usedLabels = [];
  this.instructions = [];
  var lexer = new Lexer(code);
};

Parser.prototype.parse = function () {
  var i = 0;
  var token = this.lexer.next();

  while (token != null) {
    switch (token.type) {
      case Token.SM:
      case Token.ARITHMETIC:
      case Token.HEAP:
      case Token.IO:
        this.instructions.push(token.instruction);
        break;
      case Token.FLOW:
        if (token.instruction.op === Token.MARK) {
          this.definedLabels.push({ line: i, label: token.instruction.label });
        }
        else {
          if (token.instruction.label) {
            this.usedLabels.push({ line: i, label: token.instruction.label });
          }
        }

        this.instructions.push(token.instruction);
        break;
      default:
        throw new Error('Unknown token ' + token);
    }

    token = lexer.next();
    i++;
  }

  this.resolveLabels();

  return this.instructions;
};

Parser.prototype.parseSM = function () {
  var sm = this.lexer.getSm();
  if (sm.op == Token.PUSH || sm.op === Token.COPY_NTH) {
    return { op: sm.op, value: this.lexer.getNumber() };
  }

  return { op: sm.op };
};

Parser.prototype.parseArithmetic = function () {
  return this.lexer.getArtihmetic();
};

Parser.prototype.parseHeap = function () {
  return this.lexer.getHeapAccess();
};

Parser.prototype.parseIo = function () {
  return this.lexer.getIo();
};

Parser.prototype.parseFlow = function () {
  var flow = this.lexer.getFlow();
  if (flow.op === Token.END_SUBROUTINE || flow.op === Token.END) {
    return flow;
  }

  return { op: flow.op, label: this.lexer.parseNumber() };
};

Parser.prototype.resolveLabels = function () {

};

module.exports = Parser;
