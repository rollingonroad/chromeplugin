/**
 * 测试运行器
 * 运行所有测试用例
 */

const fs = require('fs');
const path = require('path');

// 导入测试模块
const djPhonetic = require('./dj_phonetic_convert.test.js');
const translationTests = require('./translation.test.js');

function runAllTests() {
  console.log('🚀 开始运行所有测试...\n');

  // 运行 DJ 音标转换测试
  let djResult = { passed: 0, failed: 0, total: 0 };
  if (typeof djPhonetic.runTest === 'function') {
    // 捕获 runTest 的输出统计
    let passed = 0, total = 0;
    const origLog = console.log;
    console.log = function(msg) {
      const m = msg.match(/测试通过: (\d+)\/(\d+)/);
      if (m) {
        passed = parseInt(m[1], 10);
        total = parseInt(m[2], 10);
      }
      origLog.apply(console, arguments);
    };
    djPhonetic.runTest();
    console.log = origLog;
    djResult = { passed, failed: total - passed, total };
  }

  // 运行翻译解析测试
  const result = translationTests.runTests();

  console.log('\n' + '='.repeat(50));
  console.log('📋 测试总结');
  console.log('='.repeat(50));
  if (djResult.total > 0) {
    console.log(`DJ音标转换测试: ${djResult.passed}/${djResult.total} 通过`);
  }
  console.log(`翻译解析测试: ${result.passed}/${result.total} 通过`);
  const totalPassed = djResult.passed + result.passed;
  const totalTests = djResult.total + result.total;
  const totalFailed = djResult.failed + result.failed;
  console.log(`总计: ${totalPassed}/${totalTests} 通过, ${totalFailed} 失败`);
  if (totalFailed === 0) {
    console.log('\n🎉 所有测试都通过了！插件功能正常。');
    process.exit(0);
  } else {
    console.log('\n⚠️  有测试失败，请检查相关功能。');
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests }; 