# Conversation Reset Page

GitHub Pages でそのまま公開できる、個人用の会話チェックページです。

## 使い方

1. `config.js` の `passcode` を自分用の文字列に変える
2. このフォルダを GitHub リポジトリに置く
3. GitHub Pages を有効化する
4. 公開 URL を QR コード化して使う

## 別ページを増やす

- `/how-to-wash.html`
  お風呂掃除の頻度とポイントをまとめたページです。
- GitHub Pages の URL が `https://<user>.github.io/<repo>/how-to-wash.html` なら、その URL をそのまま QR コード化できます。

## 今できること

- 簡易パスコード入力
- 入室前のチェックリスト
- 仮説ベースの確認メモ
- 会話後の振り返り保存
- ログの CSV 書き出し
- Webhook 経由のスプレッドシート連携の差し込み口

## 注意

このパスコード保護はフロントエンドだけの簡易版です。GitHub Pages 上では本格的な秘密保持にはなりません。強い秘匿性が必要なら、Cloudflare Access、Basic 認証付きの別ホスティング、あるいは小さなバックエンドを使う構成にした方が安全です。

## スプレッドシート連携の次の一歩

今はブラウザの `localStorage` に保存しています。`config.js` の `webhookUrl` に Google Apps Script の Web アプリ URL を入れると、保存時にそのまま送れます。

このリポジトリには、そのまま使える Apps Script のひな形も入れてあります。

- [gas/Code.gs](/Users/wakabayashimizuki/Documents/Codex/2026-07-01/url/gas/Code.gs)
- [gas/README.md](/Users/wakabayashimizuki/Documents/Codex/2026-07-01/url/gas/README.md)
