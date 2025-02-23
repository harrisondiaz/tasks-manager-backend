const crypto = require('crypto');

const generateCustomHash = (inputStr, inputNum) => {
  
  const reversedStr = inputStr.split('').reverse().join('');

  const squaredDigits = String(inputNum)
    .split('')
    .map(digit => String(Math.pow(Number(digit), 2)))
    .join('');
  
  
  const combinedValue = reversedStr + squaredDigits;
  
  
  const hash = crypto.createHash('sha256').update(combinedValue).digest('hex');

  return { finalStr: combinedValue, hash };
};

module.exports = generateCustomHash;
