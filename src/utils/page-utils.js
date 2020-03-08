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

export const input = async (page, selector, value, retry = 0) => {
  value = value.toString();

  const inputForm = await page.$(selector);
  if (!inputForm) {
    throw new Error('form is not found:' + selector);
  }

  // clear
  await page.evaluate(e => (e.value = ''), inputForm);
  await page.waitFor(500);

  await page.type(selector, value, { delay: 100 });
  await page.waitFor(500);

  const inputed = await page.evaluate(e => e.value, inputForm);
  if (inputed !== value) {
    debug.warn('Input does not match:' + selector);
    if (retry > 10) {
      throw new Error('Retry count reached limit.');
    }

    return input(page, selector, value, retry + 1);
  }
};
