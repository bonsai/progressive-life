# RECAP – progressive‑life (v2)

## 目的
- **音声だけで半生記・遺言状参考資料を作成**し、**個人情報はサーバに残さない**（すべてブラウザ内で処理）
- **PWA SPA** としてオフラインでも利用可能
- **Cloudflare Workers** をプロキシにして **Sakura AI Engine** と **メール送信**（Resend/SendGrid）を実行し、キーは **Worker 環境変数** のみで保持

## 主な実装

### 1. Workers (src/index.js)
- `POST /api/proxy/stt` → 受信した音声を **Sakura Whisper** に転送し、結果をそのまま返す
- `POST /api/proxy/embed` → 受信したテキストを **Sakura Embedding** に転送し、ベクトルを返す
- `POST /api/proxy/mail` → Base64 PDF とメール情報を **Resend**（または **SendGrid**）へ転送し、メール送信
- それ以外は **ASSETS** バインディングで静的ファイル（HTML, CSS, Manifest）を配信
- **CORS** 対応、ヘルスチェック `/api/health`

### 2. 環境変数（Cloudflare Workers Secrets）
```
SAKURA_API_KEY      ← Sakura の Bearer トークン（フル文字列）
RESEND_API_KEY      ← Resend の API キー（または SENDGRID_API_KEY）
FROM_EMAIL          ← 送信元メールアドレス（任意）
```
`wrangler secret put <NAME>` で登録し、フロントからは決して見えない。

### 3. フロントエンド（public/app.html）
- **録音**: MediaRecorder → IndexedDB に `base64` で保存
- **STT**: `/api/proxy/stt` を呼び出し、取得テキストをローカルで **エピソード分割**
- **Embedding**: `/api/proxy/embed` でベクトル取得（必要なら）
- **PDF生成**: `jsPDF` (CDN) で **半生記 + 遺言状参考資料** を作成（法的免責文言付き）
- **メール送信**: PDF を Base64 に変換し `/api/proxy/mail` へ送信
- **UI**: 大きめフォント・高コントラスト、タブ切替、プライバシーバッジ

### 4. PWA 設定
- `public/manifest.json`（名前、アイコン、standalone 表示）
- `public/service-worker.js`：シェルキャッシュ（HTML、jsPDF CDN）＋ API リクエストはネットワーク直送
- `beforeinstallprompt` 捕捉 → カスタムインストールプロンプト UI 追加
- **スタンドアロン検知** → safe‑area 用 CSS 調整

### 5. データ永続化（完全ローカル）
- `IndexedDB` (`voices`, `episodes`, `relations`) に全データ保存
- エクスポート/インポート機能（JSON）でバックアップ可能
- `clearAll()` でローカルデータを全削除

## デプロイ手順
```bash
# 1. 必要なシークレットを設定
wrangler secret put SAKURA_API_KEY
wrangler secret put RESEND_API_KEY   # (または SENDGRID_API_KEY)
wrangler secret put FROM_EMAIL        # 任意

# 2. デプロイ（assets と Worker が一緒にアップロード）
wrangler deploy
```
デプロイ完了後は
```
https://progressive-life.vonsai-apps.workers.dev/lp.html
https://progressive-life.vonsai-apps.workers.dev/app.html
```
にアクセスすれば、404 が出ずに PWA が表示されます。

## トラブルシューティング
- **404** → `wrangler deploy` のログで `🧱 Publishing assets` が出ているか確認。`public/` に `app.html`/`lp.html` があるか。
- **キー漏洩** → フロント側のコードに `SAKURA_API_KEY` などが無いことを必ず確認。全て Worker が環境変数で保持。
- **メール送信失敗** → Worker の `RESEND_API_KEY`（または `SENDGRID_API_KEY`）と `FROM_EMAIL` が正しいか。
- **オフラインで動かない** → Service Worker が正しく登録されているか（DevTools → Application → Service Workers）

## 今後の拡張候補
- Nightly バッチ（GitHub Actions）から Workers の STT/Embedding API を呼び出して自動処理
- Cloudflare Access / Turnstile で簡易認証を追加し、デバイス間でデータ共有を安全に実装
- KV バックアップでデバイス変更時に自動復元

---
**この RECAP は `v2` ブランチにコミット済みです。**

*作成者：ChatGPT (OpenAI) – 実装サポート*