import { access, debug } from '../utils/logger';
import amountToNumber from '../utils/amount';
import { clickToNav } from '../utils/page-move';
import { checkLocking, clearLocking } from '../utils/locker';

const checkError = async args => {
  const { getState, setState } = args;
  const { page } = getState();

  await page.waitFor(1000);
  const errorBox = await page.$('.errortxt, .txt-error').catch(e => {
    debug.warn(e);
    return null;
  });

  if (errorBox) {
    const error = await page.evaluate(el => el.innerText, errorBox);
    access.error(page.url(), error);

    if (error.indexOf('一定時間操作が行われなかった') !== -1) {
      // セッションタイムアウト
      await page.waitFor(2000);
      await login({ getState, setState });
      return 'reloaded';
    } else {
      throw new Error(error);
    }
  }
};

const login = async args => {
  const { getState, setState, values } = args;
  const { page, login } = getState();
  const {
    username,
    password,
    options: { secretQuestions }
  } = values || login;

  if (!username || !password || !secretQuestions) {
    throw new Error('The value is missing.');
  }
  if (!login && values) {
    setState('login', {
      username,
      password,
      options: { secretQuestions }
    });
  }

  await checkLocking(args);
  await page.goto(
    'https://fes.rakuten-bank.co.jp/MS/main/RbS?CurrentPageID=START&&COMMAND=LOGIN'
  );

  await page.waitFor(2000);
  await page.type('input[name="LOGIN:USER_ID"]', username);
  await page.type('input[name="LOGIN:LOGIN_PASSWORD"]', password);
  await page.waitFor(500);

  await clickToNav(page, '.btn-login01 a');

  const checkInput = async () => {
    await page.waitFor(5000);
    await checkError(args);
    const secretWordInput = await page.$(
      'input[name="INPUT_FORM:SECRET_WORD"]'
    );

    if (secretWordInput) {
      const secretQuestion = await page.evaluate(
        el => el.innerText,
        (await page.$$('.td01 .innercell'))[0]
      );
      if (!secretQuestion) {
        throw new Error('The secret question could not be found.');
      }

      const questionSet = secretQuestions.find(
        v => secretQuestion.indexOf(v[0]) !== -1
      );
      if (!questionSet) {
        throw new Error('This question does not exist.');
      }

      await page.type('input[name="INPUT_FORM:SECRET_WORD"]', questionSet[1]);
      await page.waitFor(500);

      await clickToNav(page, 'input[type="submit"]');

      return checkInput();
    } else {
      debug.info('logged in');
    }
  };

  await checkInput();
  clearLocking(args);
};

const getBalance = async (args, isRetry = false) => {
  const { page } = args.getState();

  await checkLocking(args);
  await page.goto(
    'https://fes.rakuten-bank.co.jp/MS/main/gns?COMMAND=BALANCE_INQUIRY_START&&CurrentPageID=HEADER_FOOTER_LINK'
  );

  await page.waitFor(2000);
  if ((await checkError(args)) === 'reloaded' && !isRetry) {
    return getBalance(args, true);
  }

  const balanceText = await page.evaluate(
    el => el.innerText,
    await page.$('.tbl-amount span.amount')
  );
  if (!balanceText) {
    throw new Error('There was no balance display.');
  }

  clearLocking(args);
  return amountToNumber(balanceText);
};

const getLogs = async (args, isRetry = false) => {
  const { page } = args.getState();

  await checkLocking(args);
  await page.goto(
    'https://fes.rakuten-bank.co.jp/MS/main/gns?COMMAND=CREDIT_DEBIT_INQUIRY_START&&CurrentPageID=HEADER_FOOTER_LINK'
  );
  await page.waitFor(2000);

  if ((await checkError(args)) === 'reloaded' && !isRetry) {
    return getLogs(args, true);
  }

  const table = await page.$$('.table01 tbody');
  if (!table || !table[0]) {
    throw new Error('table is not found');
  }

  const result = await page.evaluate(e => {
    const tr = Array.from(e.querySelectorAll('tr'));
    tr.shift();
    return tr.map(v => Array.from(v.children).map(v => v.innerText));
  }, table[0]);

  clearLocking(args);
  return result.map(v => {
    const [date, name, depositStr, balance] = v;
    const deposit = amountToNumber(depositStr);

    return {
      date: new Date(date),
      name: name.trim(),
      type: deposit > 0 ? 'deposit' : 'withdrawal',
      amount: Math.abs(deposit),
      balance: amountToNumber(balance)
    };
  });
};

const depositFromJpBank = async (args, isRetry = false) => {
  const {
    getState,
    values: { amount = 1000, PIN = 0 }
  } = args;
  const { page } = getState();

  if (!amount || !PIN) {
    throw new Error('amount and PIN is required in values.');
  }

  await checkLocking(args);
  await page.goto(
    'https://fes.rakuten-bank.co.jp/MS/main/gns?COMMAND=CREDIT_SERVICE_START&&CurrentPageID=HEADER_FOOTER_LINK'
  );
  await page.waitFor(2000);

  if ((await checkError(args)) === 'reloaded' && !isRetry) {
    return depositFromJpBank(args, true);
  }

  await clickToNav(
    page,
    'form#CREDIT_CARD_FORM td[align="center"] a[href="#"]'
  );

  await page.type('input[name="FORM:AMOUNT"]', amount.toString());
  await page.waitFor(500);

  await clickToNav(page, 'input[type="submit"]');
  await checkError(args);

  await page.type('input[name="SECURITY_BOARD:USER_PASSWORD"]', PIN.toString());
  await page.waitFor(500);

  await clickToNav(page, 'input[value="実 行"]');
  await checkError(args);

  const result = await page.$$('table .td01none');
  // 4: 入金金額, 5: 手数料, 6: 予定日

  const amountResult = await page.evaluate(el => el.innerText, result[4]);
  const fee = await page.evaluate(el => el.innerText, result[5]);
  const schedule = await page.evaluate(el => el.innerText, result[6]);

  clearLocking(args);
  return {
    amount: amountToNumber(amountResult),
    fee: amountToNumber(fee),
    schedule: new Date(schedule)
  };
};

export const action = args => {
  const { type } = args;

  switch (type) {
    case 'LOGIN':
      return login(args);
    case 'GET_BALANCE':
      return getBalance(args);
    case 'GET_LOGS':
      return getLogs(args);
    case 'DEPOSIT_FROM_JPBANK':
      return depositFromJpBank(args);
    default:
      throw new Error('This action does not exist.');
  }
};
