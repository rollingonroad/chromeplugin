# 英汉翻译Chrome插件

一个支持音标显示和发音的英汉翻译Chrome插件。

## 功能特性

- 🎯 双击单词快速翻译
- 🔤 **支持中国人熟悉的中国音标（K12标准），也可一键切换回国际音标**
- 🔊 支持文本朗读和真人发音（带易懂图标）
- 🎨 现代化UI设计，交互直观优雅

## 主要界面与交互

- **主弹窗顶部**：显示选中单词（大号字体）、主发音按钮、国旗与箭头，整体美观。
- **音标行**：展示音标，后跟“真人发音”按钮（扬声器图标），按钮更易理解。
- **音标类型切换**：
  - 默认显示中国音标（K12标准），中国用户最熟悉，学习无障碍。
  - 右侧有iOS风格toggle控件，点击即可在“中国音标/国际音标”间切换，满足不同学习/考试需求。
  - toggle控件小巧，状态一目了然，无需下拉菜单，交互极简。
- **所有按钮均有hover/点击反馈，操作流畅。**

## 项目结构

```
src/
  ├── manifest.json           # 插件配置文件
  ├── background.js           # 后台脚本
  ├── content.js              # 内容脚本（主要功能）
  ├── popup.html              # 弹窗界面
  ├── popup.js                # 弹窗逻辑
  └── icons/
      ├── icon-16.png
      ├── icon-48.png
      └── icon-128.png
release/                      # 构建产物目录
release.zip                   # 打包zip
node_modules/                 # 依赖目录
tests/                        # 测试目录
  ├── dj_phonetic_convert.test.js # DJ音标自动转换测试
  ├── translation.test.js     # 翻译解析测试
  └── run-tests.js            # 测试运行器
build.js                      # 构建脚本
package.json                  # 项目配置
README.md                     # 项目说明
PRIVACY_POLICY.md             # 隐私政策
.gitignore                    # Git忽略文件
```

## 开发指南

### 安装依赖

```bash
cd chromeplugin
npm install
```

### 运行测试

```bash
npm test
# 或直接运行
node tests/run-tests.js
```

### 构建发布

```bash
npm run build:test   # 运行测试后构建
npm run build        # 仅构建
npm run build:zip    # 构建并打包为release.zip
npm run zip          # 只打包release目录为zip
npm run clean        # 清理发布目录
```

> **说明：**
> - 所有源码和资源文件都在 `src/` 目录下，图标在 `src/icons/`。
> - 构建和打包命令会自动从 `src/` 复制所需文件到 `release/`。
> - manifest.json 及相关路径均为相对 `src/` 目录。
> - `npm run gen:html` 可将 `README.md` 和 `PRIVACY_POLICY.md` 转换为 html。

## 测试系统

- **DJ音标自动转换测试**：批量验证IPA到中国K12标准DJ音标的自动转换准确率。
- **翻译解析测试**：验证Google翻译和Free Dictionary API的解析逻辑，确保主字段（单词、音标、发音链接）提取准确。

### 运行测试

```bash
npm test
# 或单独运行
node tests/dj_phonetic_convert.test.js
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
   - icons/
4. **上传插件**：将 `release.zip` 上传到 Chrome Web Store

## 注意事项

- 测试文件位于 `tests/` 目录，不会被包含在发布包中
- 构建脚本会自动排除测试相关文件
- 发布前请确保所有测试通过
- 音标转换规则基于中国K12标准和国际IPA标准

## 技术栈

- Chrome Extension Manifest V3
- 原生JavaScript
- Google Translate API
- Free Dictionary API
- Web Speech API

## 许可证

MIT License 