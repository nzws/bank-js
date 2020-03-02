import puppeteer from 'puppeteer';
import { access, action, debug } from './utils/logger';

const banks = {
  'jp-bank': require('./banks/jp-bank'),
  rakuten: require('./banks/rakuten')
};

export default class bankJs {
  constructor(bankId) {
    if (!bankId || !banks[bankId]) {
      throw new Error('This bank ID does not exist.');
    }

    this.state = {
      bankId
    };
  }

  async init(browser) {
    if (this.state.browser) {
      throw new Error('This instance has been initialized.');
    }

    if (!browser) {
      browser = await puppeteer.launch({
        // headless: false,
        slowMo: 50
      });
    }
    browser.on('targetchanged', e => {
      access.info(this.state.bankId, e._targetInfo.url);
    });

    const page = await browser.newPage();

    this.setState('browser', browser);
    this.setState('page', page);

    debug.info(`${this.state.bankId} started`);
  }

  setState(key, value) {
    return (this.state[key] = value);
  }

  action(type = '', values = {}) {
    const { state, setState } = this;
    const { bankId, closed } = state;

    if (closed) {
      throw new Error('This session has been closed. Please create a new one.');
    }

    if (!type || !bankId) {
      throw new Error('Missing key.');
    }

    action.info(bankId, type);

    return banks[bankId]
      .action({
        state,
        setState,
        type,
        values
      })
      .catch(e => debug.error(e));
  }

  async close() {
    const { page, browser } = this.state;
    this.setState('closed', true);

    await page.goto('about:blank');
    await page.close();
    await browser.close();
  }

  login(username = '', password = '', options = {}) {
    return this.action('LOGIN', {
      username,
      password,
      options
    });
  }

  getBalance() {
    return this.action('GET_BALANCE');
  }

  getLogs() {
    return this.action('GET_LOGS');
  }
}
