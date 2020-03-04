# bank-js

[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/nzws/bank-js/Node%20CI?style=for-the-badge)](https://github.com/nzws/bank-js/actions)
[![GitHub](https://img.shields.io/github/license/nzws/bank-js?style=for-the-badge)](#license)
[![code style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=for-the-badge&logo=prettier)](https://prettier.io/)
[![dependabot enabled](https://img.shields.io/badge/dependabot-enabled-0366D6.svg?style=for-the-badge&logo=dependabot)](https://github.com/nzws/bank-js/pulls?utf8=%E2%9C%93&q=is%3Apr+label%3Adependencies+)

> Node.js向けオンラインバンキングのスクレイピングモジュール

## 対応状況

| 銀行     | 残高 | 履歴 | 詳細な履歴 | 振込 | 参考                                          |
| -------- | :--: | :--: | :--------: | :--: | --------------------------------------------- |
| ゆうちょ |  ✔   |  ✔   |     ⏳     |  ❌  | 履歴: 直近 10 日分                            |
| 楽天     |  ✔   |  ✔   |     ⏳     |  ❌  | 履歴: 最新 50 件, ゆうちょ → 楽天の自動払込可 |

- このモジュールでは振込の実装をする予定はありません（怖いので）
- 履歴参照は最近のデータのみ対応

## 使用方法

See the example (wip)

## 免責事項

- Puppeteer(ヘッドレス Chrome)を使用するためインストール量が大きいです (~170MB Mac, ~282MB Linux, ~280MB Win)
- 続けてリクエストする際は間隔を空け、エラーが発生した場合はそれ以上試行させないようにする設計にしてください
- 自己責任でご利用ください

## License

- code: MIT
