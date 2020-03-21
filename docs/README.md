# bank-js API

## tl;dr

```javascript
import puppeteer from 'puppeteer';
import bankJs from '@nzws/bank-js';

(async () => {
  const browser = await puppeteer.launch({
    slowMo: 50,
    args: [
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding'
    ]
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

---

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
  - `addData` <[Object]>: 項目名から解析した追加情報 (ベータ)
    - `type`: 取引のカテゴリ (不明な場合は `unknown`)
    - カテゴリによって他のデータが入っている場合があります。

---

- ゆうちょ: 直近 10 日分を取得できます。
- 楽天: 最新 50 件を取得できます。
- ゆうちょ, 楽天: 時刻はすべて 00:00 固定です。(日付しか取得できないため)
- ゆうちょの `addData` 属性
  - 銀行 ATM からの入出金 - type: `atm`, bank <[string]>: 銀行名
  - 自動払い込み - type: `auto-payment`, to <[string]>: 振込先
  - 即時振替 - type: `immediate-transfer`, to <[string]>: 振込先
  - Pay-easy - type: `pay-easy`, to <[string]>: 振込先
- 楽天の `addData` 属性
  - Visa デビット利用 - type: `debit`, transactionNo <[string]>: 承認番号, transactionType <A|B>: 取引タイプ, usedPoint <[number]>: 使用したポイント(返金の場合はマイナス), merchant <[string]>: 加盟店名
  - ゆうちょからの入金 - type: `jp-bank`
  - ATM からの入出金 - type: `atm`, bank <[string]>: 銀行名

返ってくる値は例えば次のような配列になります：

```
[
  {
    date: 2020-03-03T15:00:00.000Z,
    name: 'VISAデビット xxxxxx',
    type: 'withdrawal',
    amount: 200,
    balance: 1000
    addData: {
      type: 'debit',
      transactionNo: '000000',
      transactionType: 'A',
      usedPoint: 0,
      merchant: '加盟店名'
    }
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
[object]: https://developer.mozilla.org/ja/docs/Web/JavaScript/Data_structures#Object
[promise]: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise
[date]: https://developer.mozilla.org/ja/docs/Web/JavaScript/Data_structures#Dates
[array]: https://developer.mozilla.org/ja/docs/Web/JavaScript/Data_structures#Indexed_collections_Arrays_and_typed_Arrays
[any]: #
