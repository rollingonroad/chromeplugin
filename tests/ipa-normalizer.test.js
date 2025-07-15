/**
 * 音标标准化功能测试
 * 测试 normalizeIPA 函数的各种转换规则
 */

// 模拟 normalizeIPA 函数（从 content.js 中提取）
function normalizeIPA(ipa) {
  if (!ipa) return '';
  let s = ipa;
  // 常见美式/变体转英式IPA
  s = s.replace(/ɹ/g, 'r'); // ɹ(turned r) -> r
  s = s.replace(/ɾ/g, 't'); // ɾ(flap t) -> t
  s = s.replace(/ɝ|ɚ/g, 'ɜː');
  s = s.replace(/oʊ/g, 'əʊ');
  s = s.replace(/ɡ/g, 'g');
  s = s.replace(/ɔ(?!ː)/g, 'ɔː');
  s = s.replace(/ʊr/g, 'ʊə');
  s = s.replace(/ər/g, 'ə');
  s = s.replace(/ːː+/g, 'ː'); // 多余长音
  s = s.replace(/[\/]/g, ''); // 去除斜杠
  s = s.replace(/\s+/g, ' '); // 多余空格
  return s.trim();
}

// 测试用例
const testCases = [
  {
    name: '美式ɹ转英式r',
    input: 'hɹæp',
    expected: 'hræp',
    description: '美式发音中的ɹ应该转换为英式r'
  },
  {
    name: 'ɾ(flap t)转t',
    input: 'bɛɾɹ',
    expected: 'bɛtr',
    description: '美式flap t应该转换为普通t'
  },
  {
    name: 'ɝɚ转ɜː',
    input: 'hɝ hɚ',
    expected: 'hɜː hɜː',
    description: '美式ɝ和ɚ都应该转换为ɜː'
  },
  {
    name: 'oʊ转əʊ',
    input: 'goʊ',
    expected: 'gəʊ',
    description: '美式oʊ应该转换为英式əʊ'
  },
  {
    name: 'ɡ转g',
    input: 'ɡʊd',
    expected: 'gʊd',
    description: '特殊g字符应该转换为普通g'
  },
  {
    name: 'ɔ转ɔː',
    input: 'kɔt',
    expected: 'kɔːt',
    description: '短ɔ应该转换为长ɔː'
  },
  {
    name: 'ʊr转ʊə',
    input: 'pʊr',
    expected: 'pʊə',
    description: 'ʊr组合应该转换为ʊə'
  },
  {
    name: 'ər转ə',
    input: 'bətər',
    expected: 'bətə',
    description: 'ər组合应该转换为ə'
  },
  {
    name: '多余长音符号',
    input: 'siːːː',
    expected: 'siː',
    description: '多个ː应该合并为一个'
  },
  {
    name: '去除斜杠',
    input: '/hæp/',
    expected: 'hæp',
    description: '音标中的斜杠应该被去除'
  },
  {
    name: '多余空格',
    input: 'hæp  piː',
    expected: 'hæp piː',
    description: '多个空格应该合并为单个空格'
  },
  {
    name: '空字符串',
    input: '',
    expected: '',
    description: '空字符串应该返回空字符串'
  },
  {
    name: 'null输入',
    input: null,
    expected: '',
    description: 'null输入应该返回空字符串'
  },
  {
    name: '复杂组合',
    input: '/hɹæp ɡoʊ ɝːː/',
    expected: 'hræp gəʊ ɜː',
    description: '多个转换规则组合使用'
  }
];

// 测试运行器
function runTests() {
  console.log('🧪 开始运行音标标准化测试...\n');
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((testCase, index) => {
    const result = normalizeIPA(testCase.input);
    const isPassed = result === testCase.expected;
    
    console.log(`测试 ${index + 1}: ${testCase.name}`);
    console.log(`  描述: ${testCase.description}`);
    console.log(`  输入: "${testCase.input}"`);
    console.log(`  期望: "${testCase.expected}"`);
    console.log(`  实际: "${result}"`);
    
    if (isPassed) {
      console.log(`  ✅ 通过\n`);
      passed++;
    } else {
      console.log(`  ❌ 失败\n`);
      failed++;
    }
  });
  
  console.log(`📊 测试结果: ${passed} 通过, ${failed} 失败, 总计 ${testCases.length} 个测试`);
  
  if (failed === 0) {
    console.log('🎉 所有测试都通过了！');
  } else {
    console.log('⚠️  有测试失败，请检查音标转换逻辑');
  }
  
  return { passed, failed, total: testCases.length };
}

// 如果在浏览器环境中运行
if (typeof window !== 'undefined') {
  window.runIPATests = runTests;
}

// 如果在Node.js环境中运行
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { normalizeIPA, runTests, testCases };
}

// 自动运行测试（如果直接执行此文件）
if (typeof require !== 'undefined' && require.main === module) {
  runTests();
} 