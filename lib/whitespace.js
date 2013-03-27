var Lexer = require('./lexer');
var Token = require('./token');

var lexer = new Lexer('   \t\n\r \n \r   \t \t\t\n');
var line = lexer.next();

while(line.type != Token.END) {
  console.log(line);
  line = lexer.next();
}
