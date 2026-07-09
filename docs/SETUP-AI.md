# AI publishing setup

1. Add GitHub secret: `gh secret set ANTHROPIC_API_KEY -R dunksmaster/duacrypto-news`
2. Run workflow: Actions → **AI draft post** → Run workflow
3. Review PR, set `draft: false` when ready, merge

Local test:
```bash
ANTHROPIC_API_KEY=... npm run generate:post -- "Your topic"
npm run validate:posts
```

Telegram notifications (optional):
```bash
gh secret set TELEGRAM_BOT_TOKEN -R dunksmaster/duacrypto-news
gh secret set TELEGRAM_CHAT_ID -R dunksmaster/duacrypto-news
```
