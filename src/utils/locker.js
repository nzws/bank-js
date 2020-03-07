import { debug } from './logger';

const sleep = (wait = 2000) =>
  new Promise(resolve => setTimeout(resolve, wait));

export const checkLocking = async (args, retry = 0) => {
  const { getState, setState } = args;
  const { isLocking } = getState();

  if (retry > 30) {
    // 大体1分（適当）
    debug.warn('locking timeout');
    setState('locking', true);
    return;
  }

  if (isLocking) {
    if (retry === 0) {
      debug.info('running the locking...');
    }
    await sleep();
    return checkLocking(args, retry + 1);
  } else {
    if (retry !== 0) {
      debug.info('released from locking!');
    }
    setState('isLocking', true);
  }
};

export const clearLocking = ({ setState }) => setState('isLocking', false);
