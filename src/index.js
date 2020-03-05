import puppeteer from 'puppeteer';
import { access, action, debug } from './utils/logger';

const state = {};
const banks = {
  'jp-bank': require('./banks/jp-bank'),
  rakuten: require('./banks/rakuten')
};

export default class bankJs {
  constructor(bankId) {
    if (!bankId || !banks[bankId]) {
      throw new Error('This bank ID does not exist.');
    }

    const random = Math.random()
      .toString(36)
      .slice(-8);
    this.id = random;
    this.setState('bankId', bankId, random);
  }

  setState(key, value, id = this.id) {
    if (!state[id]) {
      state[id] = {};
    }
    state[id][key] = value;
  }

  getState(id = this.id) {
    return state[id];
  }

  async init(browser) {
    const state = this.getState();
    if (state.browser) {
      throw new Error('This instance has been initialized.');
    }

    if (!browser) {
      browser = await puppeteer.launch({
        // headless: false,
        slowMo: 50
      });
    }

    const page = await browser.newPage();
    page.on('load', () => {
      access.info(page.url());
    });

    this.setState('browser', browser);
    this.setState('page', page);

    debug.info(`${state.bankId} started`);
  }

  action(type = '', values = {}) {
    const { getState, setState, id } = this;
    const { bankId, closed } = getState(id);

    if (closed) {
      throw new Error('This session has been closed. Please create a new one.');
    }

    if (!type || !bankId) {
      throw new Error('Missing key.');
    }

    action.info(bankId, type);

    return banks[bankId]
      .action({
        getState: () => getState(id),
        setState: (key, value) => setState(key, value, id),
        type,
        values
      })
      .catch(e => {
        debug.error(e);
        throw new Error(e);
      });
  }

  async close() {
    const { page } = this.getState();
    this.setState('closed', true);

    await page.goto('about:blank');
    await page.close();
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
