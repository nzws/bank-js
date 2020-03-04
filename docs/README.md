# bank-js API [WIP]

## tl;dr

```javascript
import puppeteer from 'puppeteer';
import bankJs from '@nzws/bank-js';

(async () => {
  const browser = await puppeteer.launch({
    slowMo: 50
  });

  const bank = new bankJs('jp-bank');
  await bank.init(browser);

  await bank.login('0000-0000-00000', 'password', {
    secretQuestions: [
      ['秘密の質問1', '答え1'],
      ['質問2', '答え2'],
      ['質問3', '答え3']
    ]
  });

  const balance = await bank.getBalance();
  console.log(balance);
})();
```

## new bankJs(bankId)

インスタンスを生成します。合わせて後述の `bank.init` が必要です。

- `bankId` <[string]>: 銀行 ID
  - ゆうちょ: `jp-bank`
  - 楽天: `rakuten`

## bank.init([browser])

- `browser` <[Object]>: puppeteer の Browser
- returns: <[Promise]>

## bank.login(username, password[, options])

ログインします。  
他の関数の実行時にセッションタイムアウトだった場合、bank-js は自動的に `bank.login` を実行して更新します。

- `username` <[string]>: ログイン時に必要なユーザー ID,番号等
- `password` <[string]>: ログイン時に必要なパスワード
- `options` <[Object]>
  - `secretQuestions` <[Array]> 秘密の質問
- returns: <[Promise]>

- ゆうちょ: `username` は「お客さま番号」で `0000-0000-00000` の形式である必要があります。
- ゆうちょ, 楽天: `options` に `secretQuestions` として秘密の質問を記入する必要があります。

```javascript
await bank.login('username', 'password', {
  secretQuestions: [
    ['秘密の質問1', '答え1'],
    ['質問2', '答え2'],
    ['質問3', '答え3']
  ]
});
```

## bank.getBalance()

残高を取得します。

- returns: <[Promise]<[number]>>

## bank.getLogs()

履歴を取得します。

- returns: <[Promise]<[Array]>> リストを新しい順の配列で返します。

  - `date` <[Date]>: 実行された日時
  - `name` <[string]>: 項目名
  - `type` <withdrawal|deposit>: deposit: 入金, withdrawal: 引出
  - `amount` <[number]>: 金額
  - `balance` <[number]>: その時点での残高

- ゆうちょ: 直近 10 日分を取得できます。
- 楽天: 最新 50 件を取得できます。
- ゆうちょ, 楽天: 時刻はすべて 00:00 固定です。(日付しか取得できないため)

返ってくる値は次のような配列になります：

```
[
  {
    date: 2020-03-03T15:00:00.000Z,
    name: 'VISAデビット xxxxxx',
    type: 'withdrawal',
    amount: 200,
    balance: 1000
  },
  ...
]
```

## bank.action(type[, values])

コマンドを実行します。銀行固有の機能はここから実行できます。

- `type` <[string]>: コマンド
- `values` <[any]>: データ
- returns: <[Promise]<[any]>>

## 楽天

### action: DEPOSIT_FROM_JPBANK

ゆうちょ → 楽天の自動払込をします。  
なお、ゆうちょ側の残高が不足している場合でもエラーは発生せず、入金は行われません。

```javascript
await bank.action('DEPOSIT_FROM_JPBANK', {
  amount: 1000,
  PIN: 1234
});
```

- `amount` <[number]>: 入金額
- `PIN` <[number]>: 暗証番号
- returns: <[Promise]<[Object]>>
  - `amount` <[number]>: 入力された入金額
  - `fee` <[number]>: 手数料(恐らく変更がない限り 0 円固定)
  - `schedule` <[Date]>: 入金予定日


[number]: https://developer.mozilla.org/ja/docs/Web/JavaScript/Data_structures#Numbers
[string]: https://developer.mozilla.org/ja/docs/Web/JavaScript/Data_structures#String
[Object]: https://developer.mozilla.org/ja/docs/Web/JavaScript/Data_structures#Object
[Promise]: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise
[Date]: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date
[any]: #
