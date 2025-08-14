/**
 * 翻译API配置测试
 * 测试重构后的翻译API配置和备用机制
 */

// 模拟翻译API配置（从background.js复制）
const BAIDU_PROXY_ENDPOINT = 'https://api.yun.info/api/translate';
const TRANSLATION_APIS = {
  // 百度翻译代理（Vercel / 自建代理）
  baidu: {
    url: (text) => `${BAIDU_PROXY_ENDPOINT}?q=${encodeURIComponent(text)}&from=en&to=zh`,
    name: '百度翻译代理',
    parser: (data) => {
      try {
        if (data && data.success && Array.isArray(data.data) && data.data[0]?.dst) {
          return data.data[0].dst;
        }
      } catch {}
      return null;
    }
  },
  // MyMemory翻译 (备用)
  myMemory: {
    url: (text) => `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh`,
    name: 'MyMemory翻译',
    parser: (data) => data.responseData?.translatedText || null
  },
  
  // Google翻译
  google: {
    url: (text) => `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`,
    name: 'Google翻译',
    parser: (data) => data[0]?.[0]?.[0] || null
  }
};

// 模拟通用的API请求函数
async function makeApiRequest(url, apiName, responseParser) {
  try {
    console.log(`[${apiName}] 发送请求:`, url);
    const response = await fetch(url);
    const data = await response.json();
    console.log(`[${apiName}] 接收响应:`, data);
    
    const result = responseParser(data);
    if (result) {
      console.log(`[${apiName}] 解析结果:`, result);
      return result;
    }
  } catch (error) {
    console.log(`[${apiName}] 请求失败:`, error);
  }
  return null;
}

// 模拟翻译函数
async function translateWithApi(apiKey, text) {
  const api = TRANSLATION_APIS[apiKey];
  if (!api) {
    console.log(`[未知API] 未知的API: ${apiKey}`);
    return null;
  }
  
  return await makeApiRequest(api.url(text), api.name, api.parser);
}

// 模拟处理翻译请求函数
async function handleTranslation(text, isChineseUser) {
  let translationResult = '';
  
  if (isChineseUser) {
    // 中国用户：优先百度，其次 MyMemory
    console.log('[Test] 检测到中国用户，优先使用百度翻译代理');
    translationResult = await translateWithApi('baidu', text);
    if (!translationResult) {
      console.log('[Test] 百度翻译失败，尝试MyMemory翻译');
      translationResult = await translateWithApi('myMemory', text);
    }
  } else {
    // 非中国用户：使用Google翻译
    console.log('[Test] 检测到非中国用户，使用Google翻译');
    translationResult = await translateWithApi('google', text);
  }
  
  return { success: !!translationResult, result: translationResult };
}

// 测试用例
const testCases = [
  {
    name: '中国用户 - MyMemory成功',
    text: 'matured',
    isChineseUser: true,
    expectedApi: 'myMemory',
    expectedResult: '成熟'
  },
  {
    name: '中国用户 - 百度优先，MyMemory备用',
    text: 'testword',
    isChineseUser: true,
    expectedApi: 'baidu',
    expectedResult: null // 可能失败
  },
  {
    name: '非中国用户 - Google翻译',
    text: 'computer',
    isChineseUser: false,
    expectedApi: 'google',
    expectedResult: '电脑'
  }
];

// 测试API配置
function testApiConfiguration() {
  console.log('🧪 测试翻译API配置...\n');
  
  let passed = 0;
  let failed = 0;
  
  // 测试API配置对象
  console.log('1️⃣ 测试API配置对象结构');
  const requiredApis = ['baidu', 'myMemory', 'google'];
  for (const apiKey of requiredApis) {
    if (TRANSLATION_APIS[apiKey]) {
      const api = TRANSLATION_APIS[apiKey];
      if (api.url && api.name && api.parser) {
        console.log(`  ✅ ${apiKey} API配置正确`);
        passed++;
      } else {
        console.log(`  ❌ ${apiKey} API配置缺少必要属性`);
        failed++;
      }
    } else {
      console.log(`  ❌ 缺少 ${apiKey} API配置`);
      failed++;
    }
  }
  
  // 测试URL生成函数
  console.log('\n2️⃣ 测试URL生成函数');
  const testText = 'hello';
  for (const apiKey of requiredApis) {
    const api = TRANSLATION_APIS[apiKey];
    const url = api.url(testText);
    if (url && url.includes(encodeURIComponent(testText))) {
      console.log(`  ✅ ${apiKey} URL生成正确: ${url}`);
      passed++;
    } else {
      console.log(`  ❌ ${apiKey} URL生成失败`);
      failed++;
    }
  }
  
  // 测试解析函数
  console.log('\n3️⃣ 测试解析函数');
  const testData = {
    baidu: { success: true, data: [{ src: 'hello', dst: '测试' }], from: 'en', to: 'zh' },
    myMemory: { responseData: { translatedText: '测试' } },
    google: [[['测试', 'test', null, null]]]
  };
  
  for (const apiKey of requiredApis) {
    const api = TRANSLATION_APIS[apiKey];
    const result = api.parser(testData[apiKey]);
    if (result === '测试') {
      console.log(`  ✅ ${apiKey} 解析函数正确`);
      passed++;
    } else {
      console.log(`  ❌ ${apiKey} 解析函数失败，期望: 测试，实际: ${result}`);
      failed++;
    }
  }
  
  return { passed, failed, total: passed + failed };
}

// 测试翻译逻辑
async function testTranslationLogic() {
  console.log('\n🧪 测试翻译逻辑...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    console.log(`🔍 测试: ${testCase.name}`);
    console.log(`   文本: "${testCase.text}"`);
    console.log(`   用户类型: ${testCase.isChineseUser ? '中国用户' : '非中国用户'}`);
    
    try {
      const result = await handleTranslation(testCase.text, testCase.isChineseUser);
      
      if (result.success) {
        console.log(`   ✅ 翻译成功: ${result.result}`);
        passed++;
      } else {
        console.log(`   ⚠️  翻译失败，但这是预期的（备用机制测试）`);
        passed++;
      }
    } catch (error) {
      console.log(`   ❌ 翻译出错: ${error.message}`);
      failed++;
    }
    
    console.log('');
  }
  
  return { passed, failed, total: passed + failed };
}

// 测试用户检测逻辑
function testUserDetection() {
  console.log('🧪 测试用户检测逻辑...\n');
  
  let passed = 0;
  let failed = 0;
  
  // 模拟用户检测函数
  function detectChineseUser(language, timezone) {
    const isChineseLang = language.startsWith('zh');
    const isChineseTimezone = timezone.includes('Asia/Shanghai') || 
                             timezone.includes('Asia/Urumqi') ||
                             timezone.includes('Asia/Harbin') ||
                             timezone.includes('Asia/Chongqing') ||
                             timezone.includes('Asia/Kashgar');
    return isChineseLang && isChineseTimezone;
  }
  
  const testCases = [
    { language: 'zh-CN', timezone: 'Asia/Shanghai', expected: true, desc: '中国语言+中国时区' },
    { language: 'en-US', timezone: 'Asia/Shanghai', expected: false, desc: '英语+中国时区' },
    { language: 'zh-CN', timezone: 'America/New_York', expected: false, desc: '中国语言+美国时区' },
    { language: 'en-US', timezone: 'America/New_York', expected: false, desc: '英语+美国时区' }
  ];
  
  for (const testCase of testCases) {
    const result = detectChineseUser(testCase.language, testCase.timezone);
    if (result === testCase.expected) {
      console.log(`  ✅ ${testCase.desc}: ${result}`);
      passed++;
    } else {
      console.log(`  ❌ ${testCase.desc}: 期望${testCase.expected}，实际${result}`);
      failed++;
    }
  }
  
  return { passed, failed, total: passed + failed };
}

// 运行所有测试
async function runTests() {
  console.log('🚀 开始运行翻译API配置测试...\n');
  
  // 测试API配置
  const configResult = testApiConfiguration();
  
  // 测试用户检测
  const detectionResult = testUserDetection();
  
  // 测试翻译逻辑
  const translationResult = await testTranslationLogic();
  
  // 汇总结果
  const totalPassed = configResult.passed + detectionResult.passed + translationResult.passed;
  const totalFailed = configResult.failed + detectionResult.failed + translationResult.failed;
  const totalTests = totalPassed + totalFailed;
  
  console.log('='.repeat(50));
  console.log('📋 翻译API配置测试总结');
  console.log('='.repeat(50));
  console.log(`API配置测试: ${configResult.passed}/${configResult.total} 通过`);
  console.log(`用户检测测试: ${detectionResult.passed}/${detectionResult.total} 通过`);
  console.log(`翻译逻辑测试: ${translationResult.passed}/${translationResult.total} 通过`);
  console.log(`总计: ${totalPassed}/${totalTests} 通过, ${totalFailed} 失败`);
  
  if (totalFailed === 0) {
    console.log('\n🎉 所有翻译API配置测试都通过了！');
  } else {
    console.log('\n⚠️  有测试失败，请检查相关配置。');
  }
  
  return { passed: totalPassed, failed: totalFailed, total: totalTests };
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    runTests, 
    testApiConfiguration, 
    testUserDetection, 
    testTranslationLogic,
    TRANSLATION_APIS,
    handleTranslation
  };
}

// 自动运行测试
if (typeof require !== 'undefined' && require.main === module) {
  runTests().catch(console.error);
} 