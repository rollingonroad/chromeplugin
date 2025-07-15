/**
 * 翻译功能测试
 * 测试 parseGoogleResult 函数的解析逻辑
 */

// 模拟 parseGoogleResult 函数（从 content.js 中提取）
function parseGoogleResult(data) {
  let main = '', pron = '', pos = '', explains = [];
  try {
    main = data[0]?.[0]?.[0] || '';
    if (data[0]?.[0]?.[1]) pron = data[0][0][1];
    if (data[1] && Array.isArray(data[1])) {
      pos = data[1][0][0] || '';
      explains = data[1][0][2] || [];
    }
  } catch {}
  return { main, pron, pos, explains };
}

// 测试用例
const testCases = [
  {
    name: '标准翻译结果',
    input: [
      [['happy', 'ˈhæpi', null, null], ['快乐的', 'ˈhæpi', null, null]],
      [['happy', 'noun', null, ['快乐', '幸福', '愉快']]]
    ],
    expected: {
      main: 'happy',
      pron: 'ˈhæpi',
      pos: 'happy',
      explains: ['快乐', '幸福', '愉快']
    },
    description: '完整的Google翻译API响应'
  },
  {
    name: '只有主翻译',
    input: [['hello', 'həˈloʊ', null, null]],
    expected: {
      main: 'hello',
      pron: 'həˈloʊ',
      pos: '',
      explains: []
    },
    description: '只有主翻译，没有词性和释义'
  },
  {
    name: '空数据',
    input: [],
    expected: {
      main: '',
      pron: '',
      pos: '',
      explains: []
    },
    description: '空数组输入'
  },
  {
    name: 'null输入',
    input: null,
    expected: {
      main: '',
      pron: '',
      pos: '',
      explains: []
    },
    description: 'null输入'
  },
  {
    name: '异常数据',
    input: 'invalid data',
    expected: {
      main: '',
      pron: '',
      pos: '',
      explains: []
    },
    description: '非数组数据'
  }
];

function runTests() {
  console.log('🧪 开始运行翻译解析测试...\n');
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((testCase, index) => {
    const result = parseGoogleResult(testCase.input);
    const isPassed = JSON.stringify(result) === JSON.stringify(testCase.expected);
    
    console.log(`测试 ${index + 1}: ${testCase.name}`);
    console.log(`  描述: ${testCase.description}`);
    console.log(`  期望: ${JSON.stringify(testCase.expected)}`);
    console.log(`  实际: ${JSON.stringify(result)}`);
    
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
    console.log('⚠️  有测试失败，请检查解析逻辑');
  }
  
  return { passed, failed, total: testCases.length };
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseGoogleResult, runTests, testCases };
}

// 自动运行测试
if (typeof require !== 'undefined' && require.main === module) {
  runTests();
} 