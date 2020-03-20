// eslint-disable-next-line no-irregular-whitespace
const regex = /( |　| )/g;

export const splitName = name => name.split(regex).filter(v => v.trim());
