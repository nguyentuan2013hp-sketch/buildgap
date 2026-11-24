# BuildGap — 生产上线部署指南

1. 在 Supabase SQL Editor 执行 `docs/03-DATABASE.sql`，并在 Authentication 设置 Redirect URL `https://你的域名/auth/callback`。
2. 在 Lemon Squeezy 创建商品与 Webhook `https://你的域名/api/webhooks/lemonsqueezy`。
3. 在 Vercel 配置环境变量后部署上线。
4. 在 Google Search Console 提交 `https://你的域名/sitemap.xml`。
