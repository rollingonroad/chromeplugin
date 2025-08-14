# 英汉翻译Chrome插件

一个支持音标显示和发音的英汉翻译Chrome插件。

## 功能特性

- 🎯 双击单词快速翻译
- 🔤 **支持中国人熟悉的中国音标（K12标准），也可一键切换回国际音标**
- 🔊 支持文本朗读和真人发音（带易懂图标）
- 🎨 现代化UI设计，交互直观优雅
- 🌍 **智能用户检测**：自动识别中国用户，提供优化的翻译服务
- 🔄 **多API备用机制**：确保翻译服务的稳定性和准确性
- ⚡ **智能API选择**：根据用户地理位置自动选择最优翻译API
- 🛡️ **HTTPS安全连接**：所有API调用均使用HTTPS协议
- 🏷️ **标签页级别错误管理**：每个新标签页独立管理翻译API状态

## 主要界面与交互

- **主弹窗顶部**：显示选中单词（大号字体）、主发音按钮、国旗与箭头，整体美观。
- **音标行**：展示音标，后跟"真人发音"按钮（扬声器图标），按钮更易理解。
- **音标类型切换**：
  - 默认显示中国音标（K12标准），中国用户最熟悉，学习无障碍。
  - 右侧有iOS风格toggle控件，点击即可在"中国音标/国际音标"间切换，满足不同学习/考试需求。
  - toggle控件小巧，状态一目了然，无需下拉菜单，交互极简。
- **所有按钮均有hover/点击反馈，操作流畅。**

## 项目结构

```
src/
  ├── manifest.json           # 插件配置文件
  ├── background.js           # 后台脚本（翻译API代理）
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
  ├── benchmark_cn_providers.js # 中国用户翻译提供方基准测试
  ├── translation_api_config.test.js # 翻译API配置测试
  ├── refactoring.test.js     # 代码重构测试
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

### 翻译API配置

插件支持多种翻译API，根据用户地理位置智能选择：

- **中国用户**：优先使用百度翻译代理，备用 MyMemory API
- **非中国用户**：使用 Google Translate API
- **音标和发音**：统一使用 Free Dictionary API

> **配置说明**：中国用户优先使用百度翻译代理（平均396ms），备用MyMemory API（平均502ms）；非中国用户使用Google翻译API（平均90ms）。所有API都保持100%成功率，确保翻译服务的稳定性。

### 智能错误处理机制

- **标签页级别状态管理**：每个标签页独立管理翻译API状态
- **百度代理错误检测**：当百度代理返回500错误且errorCode为`BAIDU_PROVIDER_DISABLED`时，该标签页后续请求直接使用MyMemory
- **新标签页重置**：用户打开新标签页时，重新尝试百度代理，确保最佳体验
- **HTTPS安全连接**：所有API调用均使用HTTPS协议，提供更好的安全性和兼容性

### 代码重构亮点

- **配置化API管理**：使用 `TRANSLATION_APIS` 配置对象统一管理所有翻译API
- **通用请求函数**：通过 `makeApiRequest` 函数统一处理API请求和错误
- **智能用户检测**：基于语言和时区自动识别中国用户
- **多级备用机制**：确保翻译服务的稳定性和准确性
- **详细调试信息**：每个API调用都有清晰的接口标识，便于调试

### 构建发布

```bash
npm run build:test   # 运行测试后构建
npm run build        # 仅构建
npm run build:zip    # 构建并打包为release.zip
npm run zip          # 只打包release目录为zip
npm run clean        # 清理发布目录
npm run bench:cn     # 运行中国用户翻译提供方基准测试
```

> **说明：**
> - 所有源码和资源文件都在 `src/` 目录下，图标在 `src/icons/`。
> - 构建和打包命令会自动从 `src/` 复制所需文件到 `release/`。
> - manifest.json 及相关路径均为相对 `src/` 目录。
> - `npm run gen:html` 可将 `README.md` 和 `PRIVACY_POLICY.md` 转换为 html。

## 测试系统

- **DJ音标自动转换测试**：批量验证IPA到中国K12标准DJ音标的自动转换准确率。
- **翻译解析测试**：验证Google翻译和Free Dictionary API的解析逻辑，确保主字段（单词、音标、发音链接）提取准确。
- **翻译API配置测试**：验证多API配置和备用机制的可靠性。
- **中国用户翻译提供方基准测试**：评估百度代理和MyMemory的成功率与响应时间。
- **代码重构测试**：验证代码质量和结构完整性。
- **性能测试**：定期测试各翻译API的响应速度和稳定性，确保最佳用户体验。

### 运行测试

```bash
npm test
# 或单独运行
node tests/dj_phonetic_convert.test.js
node tests/translation.test.js
node tests/benchmark_cn_providers.js
node tests/translation_api_config.test.js
node tests/refactoring.test.js
```

### 性能测试结果

基于实际测试的API性能对比（5个单词，每个运行4次）：

| API | 平均响应时间 | 成功率 | 性能评级 |
|-----|-------------|--------|----------|
| **百度翻译代理** | 396ms | 100% | 🟢 优秀 |
| **MyMemory API** | 502ms | 100% | 🟡 良好 |
| **Google翻译API** | 90ms | 100% | 🟢 优秀 |

**性能特点**：
- 百度翻译代理响应最快（396ms），适合中国用户主要使用
- MyMemory API响应较快（502ms），作为中国用户备用
- Google翻译API响应最快（90ms），适合非中国用户
- 所有API都保持100%成功率，稳定性优秀

## 调试指南

### 查看调试信息

- **content.js 调试信息**：在网页的开发者工具控制台中查看
- **background.js 调试信息**：在扩展管理页面点击"Service Worker"查看

### 调试信息格式

所有调试信息都包含接口标识，便于追踪：

```
[百度翻译代理] 发送请求: https://api.yun.info/api/translate?q=hello&from=en&to=zh
[百度翻译代理] 接收响应: {...}
[百度翻译代理] 解析结果: 你好
[Background] 检测到中国用户，优先使用百度翻译代理
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
- 所有API调用均使用HTTPS协议
- 每个标签页独立管理翻译API状态

## 技术栈

- Chrome Extension Manifest V3
- 原生JavaScript
- **多翻译API集成**：
  - 百度翻译代理（中国用户主要，平均396ms响应时间）
  - MyMemory API（中国用户备用，平均502ms响应时间）
  - Google Translate API（非中国用户，平均90ms响应时间）
  - Free Dictionary API（音标和发音）
- Web Speech API（浏览器内置语音合成）
- **智能用户检测**：基于语言和时区的地理位置识别
- **标签页级别状态管理**：独立管理每个标签页的翻译API状态

## 许可证

MIT License 