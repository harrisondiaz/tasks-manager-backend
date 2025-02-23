const crypto = require('crypto');

const [,, inputStr, inputNum] = process.argv;

if (!inputStr || !inputNum) {
  console.error('Usage: node customHashGenerator.js <string> <number>');
  process.exit(1);
}

const reversedStr = inputStr.split('').reverse().join('');
const num = Number(inputNum);
if (isNaN(num)) {
  console.error('The second parameter must be a valid number.');
  process.exit(1);
}
const squaredNum = Math.pow(num, 2);

const finalStr = `${reversedStr}${squaredNum}`;
const hash = crypto.createHash('sha256').update(finalStr).digest('hex');

console.log('Result:', finalStr);
console.log('SHA256:', hash);
