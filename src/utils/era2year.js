// Era -> Year / 和暦 -> 西暦
// ('ω'✌ )三✌('ω')✌三( ✌'ω')✌

// note: これ以上改元するな2020

export const e2y = (num = 0, era = 'reiwa') => {
  switch (era) {
    case 'reiwa':
      return num + 2018;
    case 'heisei':
      return num + 1988;
    case 'showa':
      return num + 1925;
    default:
      throw new Error('Unknown era name.');
  }
};
