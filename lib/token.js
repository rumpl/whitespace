var Token = {};

Token.END = "END";
Token.SM = "SM";
Token.ARITHMETIC = "ARITHMETIC";
Token.HEAP = "HEAP";
Token.IO = "IO";
Token.FLOW = "FLOW";

Token.PUSH = "PUSH";
Token.DUP = "DUP";
Token.COPY_NTH = "COPY_NTH";
Token.SWAP = "SWAP";
Token.DISCARD = "DISCARD";
Token.SLIDE = "SLIDE";

Token.ADD = "ADD";
Token.SUB = "SUB";
Token.MUL = "MUL";
Token.DIV = "DIV";
Token.MOD = "MOD";

Token.STORE = "STORE";
Token.RETRIEVE = "RETRIEVE";

Token.MARK = "MARK";
Token.CALL_SUBROUTINE = "CALL_SUBROUTINE";
Token.JUMP = "JUMP";
Token.JUMP_IF_ZERO = "JUMP_IF_ZERO";
Token.JUMP_IF_NEGATIVE = "JUMP_IF_NEGATIVE";
Token.END_SUBROUTINE = "END_SUBROUTINE";

Token.OUTPUT_CHAR = "OUTPUT_CHAR";
Token.OUTPUT_NUMBER = "OUTPUT_NUMBER";
Token.INPUT_CHAR = "INPUT_CHAR";
Token.INPUT_NUMBER = "INPUT_NUMBER";

module.exports = Token;
