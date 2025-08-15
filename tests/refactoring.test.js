/**
 * 代码重构测试
 * 验证重构后的代码质量和功能完整性
 */

const fs = require('fs');
const path = require('path');

// 测试文件路径
const SRC_DIR = path.join(__dirname, '../src');
const TEST_DIR = __dirname;

// 测试重构后的代码质量
function testCodeQuality() {
  console.log('🧪 测试代码质量...\n');
  
  let passed = 0;
  let failed = 0;
  
  // 检查必要的文件是否存在
  console.log('1️⃣ 检查文件完整性');
  const requiredFiles = [
    'manifest.json',
    'background.js',
    'content.js',
    'popup.html',
    'popup.js'
  ];
  
  for (const file of requiredFiles) {
    const filePath = path.join(SRC_DIR, file);
    if (fs.existsSync(filePath)) {
      console.log(`  ✅ ${file} 存在`);
      passed++;
    } else {
      console.log(`  ❌ ${file} 缺失`);
      failed++;
    }
  }
  
  // 检查图标文件
  const iconDir = path.join(SRC_DIR, 'icons');
  if (fs.existsSync(iconDir)) {
    const icons = ['icon-16.png', 'icon-48.png', 'icon-128.png'];
    for (const icon of icons) {
      const iconPath = path.join(iconDir, icon);
      if (fs.existsSync(iconPath)) {
        console.log(`  ✅ ${icon} 存在`);
        passed++;
      } else {
        console.log(`  ❌ ${icon} 缺失`);
        failed++;
      }
    }
  } else {
    console.log(`  ❌ icons目录缺失`);
    failed++;
  }
  
  return { passed, failed, total: passed + failed };
}

// 测试代码结构
function testCodeStructure() {
  console.log('\n2️⃣ 检查代码结构...\n');
  
  let passed = 0;
  let failed = 0;
  
  // 检查background.js中的重构内容
  const backgroundPath = path.join(SRC_DIR, 'background.js');
  if (fs.existsSync(backgroundPath)) {
    const backgroundContent = fs.readFileSync(backgroundPath, 'utf8');
    
    // 检查是否包含TRANSLATION_APIS配置
    if (backgroundContent.includes('TRANSLATION_APIS')) {
      console.log('  ✅ background.js 包含 TRANSLATION_APIS 配置');
      passed++;
    } else {
      console.log('  ❌ background.js 缺少 TRANSLATION_APIS 配置');
      failed++;
    }
    
    // 检查是否包含makeApiRequest函数
    if (backgroundContent.includes('makeApiRequest')) {
      console.log('  ✅ background.js 包含 makeApiRequest 函数');
      passed++;
    } else {
      console.log('  ❌ background.js 缺少 makeApiRequest 函数');
      failed++;
    }
    
    // 检查是否包含translateWithApi函数
    if (backgroundContent.includes('translateWithApi')) {
      console.log('  ✅ background.js 包含 translateWithApi 函数');
      passed++;
    } else {
      console.log('  ❌ background.js 缺少 translateWithApi 函数');
      failed++;
    }
    
    // 检查中国用户翻译逻辑
    if (backgroundContent.includes('myMemory') && backgroundContent.includes('baidu') && backgroundContent.includes('BAIDU_DISABLED_TIMEOUT')) {
      console.log('  ✅ background.js 包含中国用户翻译逻辑（Baidu + MyMemory + 3小时时间清理机制）');
      passed++;
    } else {
      console.log('  ❌ background.js 缺少中国用户翻译逻辑或时间清理机制');
      failed++;
    }
  }
  
  // 检查content.js中的用户检测逻辑
  const contentPath = path.join(SRC_DIR, 'content.js');
  if (fs.existsSync(contentPath)) {
    const contentContent = fs.readFileSync(contentPath, 'utf8');
    
    // 检查是否包含用户检测逻辑
    if (contentContent.includes('detectChineseUser')) {
      console.log('  ✅ content.js 包含用户检测逻辑');
      passed++;
    } else {
      console.log('  ❌ content.js 缺少用户检测逻辑');
      failed++;
    }
    
    // 检查是否包含Free Dictionary API调用
    if (contentContent.includes('api.dictionaryapi.dev')) {
      console.log('  ✅ content.js 包含 Free Dictionary API 调用');
      passed++;
    } else {
      console.log('  ❌ content.js 缺少 Free Dictionary API 调用');
      failed++;
    }
  }
  
  // 检查popup.js中的用户检测逻辑
  const popupPath = path.join(SRC_DIR, 'popup.js');
  if (fs.existsSync(popupPath)) {
    const popupContent = fs.readFileSync(popupPath, 'utf8');
    
    if (popupContent.includes('detectChineseUser')) {
      console.log('  ✅ popup.js 包含用户检测逻辑');
      passed++;
    } else {
      console.log('  ❌ popup.js 缺少用户检测逻辑');
      failed++;
    }
  }
  
  return { passed, failed, total: passed + failed };
}

// 测试manifest.json配置
function testManifestConfiguration() {
  console.log('\n3️⃣ 检查manifest.json配置...\n');
  
  let passed = 0;
  let failed = 0;
  
  const manifestPath = path.join(SRC_DIR, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);
      
      // 检查manifest版本
      if (manifest.manifest_version === 3) {
        console.log('  ✅ manifest_version 为 3');
        passed++;
      } else {
        console.log('  ❌ manifest_version 不是 3');
        failed++;
      }
      
      // 检查必要的权限
      const requiredPermissions = ['storage'];
      for (const permission of requiredPermissions) {
        if (manifest.permissions && manifest.permissions.includes(permission)) {
          console.log(`  ✅ 包含权限: ${permission}`);
          passed++;
        } else {
          console.log(`  ❌ 缺少权限: ${permission}`);
          failed++;
        }
      }
      
      // 检查host权限
      const requiredHosts = [
        'https://translate.googleapis.com/*',
        'https://api.mymemory.translated.net/*',
        'https://api.dictionaryapi.dev/*'
      ];
      
      for (const host of requiredHosts) {
        if (manifest.host_permissions && manifest.host_permissions.includes(host)) {
          console.log(`  ✅ 包含host权限: ${host}`);
          passed++;
        } else {
          console.log(`  ❌ 缺少host权限: ${host}`);
          failed++;
        }
      }
      
      // 检查background script
      if (manifest.background && manifest.background.service_worker === 'background.js') {
        console.log('  ✅ background script 配置正确');
        passed++;
      } else {
        console.log('  ❌ background script 配置错误');
        failed++;
      }
      
      // 检查content scripts
      if (manifest.content_scripts && manifest.content_scripts.length > 0) {
        console.log('  ✅ content scripts 配置存在');
        passed++;
      } else {
        console.log('  ❌ content scripts 配置缺失');
        failed++;
      }
      
    } catch (error) {
      console.log(`  ❌ manifest.json 解析失败: ${error.message}`);
      failed++;
    }
  } else {
    console.log('  ❌ manifest.json 文件不存在');
    failed++;
  }
  
  return { passed, failed, total: passed + failed };
}

// 测试代码重复消除
function testCodeDuplicationElimination() {
  console.log('\n4️⃣ 检查代码重复消除...\n');
  
  let passed = 0;
  let failed = 0;
  
  // 检查background.js中是否消除了重复的翻译函数
  const backgroundPath = path.join(SRC_DIR, 'background.js');
  if (fs.existsSync(backgroundPath)) {
    const backgroundContent = fs.readFileSync(backgroundPath, 'utf8');
    
    // 检查是否只有一个通用的翻译函数
    const translateFunctionMatches = backgroundContent.match(/async function translateWith/g);
    if (translateFunctionMatches && translateFunctionMatches.length === 1) {
      console.log('  ✅ 只有一个通用翻译函数，消除了重复');
      passed++;
    } else {
      console.log('  ❌ 仍存在多个翻译函数，重复未消除');
      failed++;
    }
    
    // 检查是否使用了配置化的API管理
    if (backgroundContent.includes('TRANSLATION_APIS') && backgroundContent.includes('apiKey')) {
      console.log('  ✅ 使用了配置化的API管理');
      passed++;
    } else {
      console.log('  ❌ 未使用配置化的API管理');
      failed++;
    }
  }
  
  // 检查用户检测逻辑是否在多个文件中重复
  const contentPath = path.join(SRC_DIR, 'content.js');
  const popupPath = path.join(SRC_DIR, 'popup.js');
  
  if (fs.existsSync(contentPath) && fs.existsSync(popupPath)) {
    const contentContent = fs.readFileSync(contentPath, 'utf8');
    const popupContent = fs.readFileSync(popupPath, 'utf8');
    
    // 检查两个文件都包含用户检测逻辑（这是合理的，因为它们是独立的脚本）
    if (contentContent.includes('detectChineseUser') && popupContent.includes('detectChineseUser')) {
      console.log('  ✅ content.js 和 popup.js 都包含用户检测逻辑（合理的设计）');
      passed++;
    } else {
      console.log('  ❌ 用户检测逻辑不完整');
      failed++;
    }
  }
  
  return { passed, failed, total: passed + failed };
}

// 运行所有重构测试
function runRefactoringTests() {
  console.log('🚀 开始运行代码重构测试...\n');
  
  // 测试代码质量
  const qualityResult = testCodeQuality();
  
  // 测试代码结构
  const structureResult = testCodeStructure();
  
  // 测试manifest配置
  const manifestResult = testManifestConfiguration();
  
  // 测试代码重复消除
  const duplicationResult = testCodeDuplicationElimination();
  
  // 汇总结果
  const totalPassed = qualityResult.passed + structureResult.passed + manifestResult.passed + duplicationResult.passed;
  const totalFailed = qualityResult.failed + structureResult.failed + manifestResult.failed + duplicationResult.failed;
  const totalTests = totalPassed + totalFailed;
  
  console.log('='.repeat(50));
  console.log('📋 代码重构测试总结');
  console.log('='.repeat(50));
  console.log(`代码质量测试: ${qualityResult.passed}/${qualityResult.total} 通过`);
  console.log(`代码结构测试: ${structureResult.passed}/${structureResult.total} 通过`);
  console.log(`Manifest配置测试: ${manifestResult.passed}/${manifestResult.total} 通过`);
  console.log(`代码重复消除测试: ${duplicationResult.passed}/${duplicationResult.total} 通过`);
  console.log(`总计: ${totalPassed}/${totalTests} 通过, ${totalFailed} 失败`);
  
  if (totalFailed === 0) {
    console.log('\n🎉 所有代码重构测试都通过了！重构质量优秀。');
  } else {
    console.log('\n⚠️  有测试失败，请检查重构质量。');
  }
  
  return { passed: totalPassed, failed: totalFailed, total: totalTests };
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    runRefactoringTests,
    testCodeQuality,
    testCodeStructure,
    testManifestConfiguration,
    testCodeDuplicationElimination
  };
}

// 自动运行测试
if (typeof require !== 'undefined' && require.main === module) {
  runRefactoringTests();
} 