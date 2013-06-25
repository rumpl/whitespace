var Program = function (instructions) {
  this.stack = [];
  this.heap = [];
  this.instrPtr = 0;
  this.callStack = [];
  this.instructions = instructions;
  this.state = 0;
};

module.exports = Program;
