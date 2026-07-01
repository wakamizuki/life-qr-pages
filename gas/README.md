# Google Apps Script setup

このフォルダの `Code.gs` を Google Apps Script に貼り付けると、次のスプレッドシートに会話ログを書き込めます。

- Spreadsheet ID: `1uFreLM8GeVXAmGet1klmTQdQ7x5soNp8Md6CBIwGbT4`
- Sheet name: `conversation_logs`

## 手順

1. [Google Apps Script](https://script.google.com/) で新しいプロジェクトを作る
2. `Code.gs` の中身を貼る
3. 必要なら `SHARED_TOKEN` に任意の文字列を入れる
4. 右上の `デプロイ` → `新しいデプロイ`
5. 種類は `ウェブアプリ`
6. `次のユーザーとして実行`: 自分
7. `アクセスできるユーザー`: 全員
8. 発行された Web アプリ URL をコピーする
9. `/Users/wakabayashimizuki/Documents/Codex/2026-07-01/url/config.js` に次を入れる

```js
window.APP_CONFIG = {
  passcode: "自分用のパスコード",
  webhookUrl: "GASのWebアプリURL",
  webhookToken: "SHARED_TOKENに入れた値",
};
```

## 補足

- GitHub Pages から直接送るため、フロント側の送信は `no-cors` です。
- そのためブラウザでは厳密な成功判定はできず、まずローカル保存しつつ GAS にも送る形です。
- `SHARED_TOKEN` は最低限の足切りです。`config.js` も公開物に含まれるので、本格的な秘密にはなりません。
