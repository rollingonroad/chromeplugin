/**
 * 测试运行器
 * 运行所有测试用例
 */

const fs = require('fs');
const path = require('path');

// 导入测试模块
const ipaTests = require('./ipa-normalizer.test.js');
const translationTests = require('./translation.test.js');

function runAllTests() {
  console.log('🚀 开始运行所有测试...\n');
  
  const results = {
    ipa: ipaTests.runTests(),
    translation: translationTests.runTests()
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 测试总结');
  console.log('='.repeat(50));
  
  const totalPassed = results.ipa.passed + results.translation.passed;
  const totalFailed = results.ipa.failed + results.translation.failed;
  const totalTests = results.ipa.total + results.translation.total;
  
  console.log(`音标标准化测试: ${results.ipa.passed}/${results.ipa.total} 通过`);
  console.log(`翻译解析测试: ${results.translation.passed}/${results.translation.total} 通过`);
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