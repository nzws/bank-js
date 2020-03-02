const symbols = /(,|円|¥|￥)/g;
const amountToNumber = str => parseInt(str.replace(symbols, ''));

export default amountToNumber;
