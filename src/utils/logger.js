import log4js from 'log4js';

log4js.configure({
  appenders: {
    console: { type: 'console' },
    debug: {
      type: 'file',
      filename: 'debug.log'
    },
    access: {
      type: 'file',
      filename: 'access.log'
    },
    action: {
      type: 'file',
      filename: 'action.log'
    }
  },
  categories: {
    default: { appenders: ['console', 'debug'], level: 'debug' },
    debug: { appenders: ['console', 'debug'], level: 'debug' },
    access: { appenders: ['console', 'access'], level: 'debug' },
    action: { appenders: ['console', 'action'], level: 'debug' }
  }
});

export const debug = log4js.getLogger('debug');
export const access = log4js.getLogger('access');
export const action = log4js.getLogger('action');
