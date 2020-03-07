import puppeteer from 'puppeteer';

const bankJs = require('../build');

(async () => {
  const browser = await puppeteer.launch({
    // headless: false, // GUI上で確認する場合コメントアウトを外す: 複数タブでの bank-js 同時使用がバグりやすくなります
    slowMo: 50,
    args: [
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding'
    ]
  });

  const jpBank = new bankJs('jp-bank');
  await jpBank.init(browser);

  // ログイン
  await jpBank.login('0000-0000-00001', 'password', {
    secretQuestions: [
      ['秘密の質問1', '答え1'],
      ['質問2', '答え2'],
      ['質問3', '答え3']
    ]
  });

  // 残高取得
  const balance = await jpBank.getBalance();
  console.log(balance);

  // 履歴
  const logs = await jpBank.getLogs();
  console.log(logs);

  // 閉じる
  await jpBank.close();
})();
