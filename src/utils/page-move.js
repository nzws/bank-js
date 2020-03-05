import { debug } from './logger';

export const clickToNav = async (page, selector) => {
  return Promise.all([
    page.click(selector),
    page.waitForNavigation({
      timeout: 15 * 1000,
      waitUntil: 'domcontentloaded'
    })
  ]).catch(e => debug.warn(e));
};

export const clickToSelector = async (page, clickSelector, checkSelector) => {
  return Promise.all([
    page.click(clickSelector),
    page.waitForSelector(checkSelector, {
      timeout: 15 * 1000
    })
  ]).catch(e => debug.warn(e));
};
