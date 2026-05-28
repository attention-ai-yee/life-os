# Life-OS 部署指南

## 问题排查

如果你看到 "This page couldn't load / A server error occurred" 错误，通常是由以下原因之一导致的：

### 1. 环境变量未正确配置

确保在部署平台（Vercel/Netlify）中设置了以下环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. 构建配置问题

项目使用 Next.js 16 + Turbopack，需要确保：

- Node.js 版本 >= 18.17.0
- 正确的构建设置

## 部署到 Vercel（推荐）

### 方法一：通过 Vercel Dashboard

1. 将代码推送到 GitHub
2. 访问 [vercel.com](https://vercel.com)
3. 点击 "Add New Project"
4. 导入你的 GitHub 仓库
5. Vercel 会自动检测 Next.js 并配置构建设置
6. 在 "Environment Variables" 中添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. 点击 "Deploy"

### 方法二：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 部署到生产环境
vercel --prod
```

## 部署到 Netlify

项目已经包含 `netlify.toml` 配置文件。

### 步骤

1. 将代码推送到 GitHub
2. 访问 [netlify.com](https://netlify.com)
3. 点击 "Add new site" > "Import an existing project"
4. 选择你的 GitHub 仓库
5. 构建配置会自动从 `netlify.toml` 读取：
   - Build command: `npx next build`
   - Publish directory: `.next`
6. 在 "Environment variables" 中添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. 点击 "Deploy site"

## 常见问题解决

### 问题：页面空白或服务器错误

**解决方案**：

1. 检查环境变量是否正确设置
2. 查看部署平台的日志：
   - Vercel: 点击项目 > Deployments > 点击部署 > 点击 "Function Logs"
   - Netlify: 点击项目 > Deploys > 点击部署 > 点击 "Deploy log"

### 问题：数据库连接失败

**解决方案**：

确保 Supabase 项目处于活跃状态：
1. 登录 [supabase.com](https://supabase.com)
2. 检查项目是否暂停（如果超过 7 天未活动，免费项目会暂停）
3. 点击 "Restore" 恢复项目

### 问题：RLS 策略导致数据无法访问

**解决方案**：

项目当前的 RLS 策略允许所有访问，应该不会有问题。如果遇到问题，可以临时禁用 RLS：

```sql
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;
ALTER TABLE habits DISABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;
ALTER TABLE goals DISABLE ROW LEVEL SECURITY;
```

## 本地测试生产构建

```bash
# 构建
npm run build

# 启动生产服务器
npm run start

# 访问 http://localhost:3000
```

## 获取帮助

如果问题仍然存在，请：
1. 检查浏览器控制台的错误信息
2. 检查部署平台的构建日志
3. 确保 Supabase 项目正常运行
