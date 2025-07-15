# 英汉翻译Chrome插件

一个支持音标显示和发音的英汉翻译Chrome插件。

## 功能特性

- 🎯 双击单词快速翻译
- 🔤 显示标准IPA音标
- 🔊 支持文本朗读和真人发音
- 🎨 现代化的UI设计

## 项目结构

```
manifest.json           # 插件配置文件
background.js           # 后台脚本
content.js              # 内容脚本（主要功能）
popup.html              # 弹窗界面
popup.js                # 弹窗逻辑
icon.png                # 插件图标
package.json            # 项目配置
build.js                # 构建脚本
.gitignore              # Git忽略文件
README.md               # 项目说明
release/                # 构建产物目录
release.zip             # 打包zip
node_modules/           # 依赖目录
tests/                  # 测试目录
  ├── ipa-normalizer.test.js    # 音标标准化测试
  ├── translation.test.js       # 翻译解析测试
  └── run-tests.js              # 测试运行器
```

## 开发指南

### 安装依赖

```bash
# 进入项目目录
cd chromeplugin

# 安装依赖（如果有的话）
npm install
```

### 运行测试

```bash
# 运行所有测试
npm test

# 或者直接运行
node tests/run-tests.js
```

### 构建发布

```bash
# 运行测试后构建
npm run build:test

# 仅构建（不运行测试）
npm run build

# 构建并自动打包为release.zip（推荐提交Chrome Web Store）
npm run build:zip

# 只打包release目录为release.zip（release目录已存在时）
npm run zip

# 清理发布目录
npm run clean
```

> **说明：**
> - `release/` 目录为构建产物，不会被提交到git。
> - `release.zip` 是可直接上传到 Google Chrome Web Store 的标准包。
> - 所有测试、构建、打包命令均可通过 `npm run ...` 方式一键完成。

## 测试系统

### 音标标准化测试

测试 `normalizeIPA` 函数的各种转换规则：

- 美式ɹ转英式r
- ɾ(flap t)转t
- ɝɚ转ɜː
- oʊ转əʊ
- ɡ转g
- ɔ转ɔː
- ʊr转ʊə
- ər转ə
- 多余长音符号处理
- 斜杠去除
- 空格规范化

### 翻译解析测试

测试 `parseGoogleResult` 函数的解析逻辑：

- 标准翻译结果解析
- 只有主翻译的情况
- 空数据处理
- 异常数据处理

### 运行测试

```bash
# 运行所有测试
node tests/run-tests.js

# 运行特定测试
node tests/ipa-normalizer.test.js
node tests/translation.test.js
```

## 发布流程

1. **运行测试**：确保所有功能正常
   ```bash
   npm test
   ```

2. **构建并打包发布文件**：生成干净的 `release.zip` 包
   ```bash
   npm run build:zip
   ```

3. **检查发布包**：确认 `release.zip` 内包含所需文件
   - manifest.json
   - background.js
   - content.js
   - popup.html
   - popup.js
   - icon.png

4. **上传插件**：将 `release.zip` 上传到 Chrome Web Store

## 注意事项

- 测试文件位于 `tests/` 目录，不会被包含在发布包中
- 构建脚本会自动排除测试相关文件
- 发布前请确保所有测试通过
- 音标转换规则基于中国常用的IPA标准

## 技术栈

- Chrome Extension Manifest V3
- 原生JavaScript
- Google Translate API
- Free Dictionary API
- Web Speech API

## 许可证

MIT License 