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

// 新增：模拟 Free Dictionary API 响应解析
function parseFreeDictResult(data) {
  let main = '', pron = '', audio = '', explains = [];
  try {
    if (Array.isArray(data) && data[0]) {
      main = data[0].word || '';
      // 取第一个有 text 的音标
      if (data[0].phonetics && data[0].phonetics.length) {
        const phoneticObj = data[0].phonetics.find(p => p.text);
        if (phoneticObj && phoneticObj.text) pron = phoneticObj.text;
        const audioObj = data[0].phonetics.find(p => p.audio);
        if (audioObj && audioObj.audio) audio = audioObj.audio;
      }
      // 取第一个释义
      if (data[0].meanings && data[0].meanings.length) {
        explains = (data[0].meanings[0].definitions || []).map(d => d.definition);
      }
    }
  } catch {}
  return { main, pron, audio, explains };
}

// 单词测试用例（只测单词，分别模拟Google和Free Dictionary API返回）
const testWords = [
  {
    word: 'happy',
    google: [
      [['happy', 'ˈhæpi', null, null], ['快乐的', 'ˈhæpi', null, null]],
      [['happy', 'noun', null, ['快乐', '幸福', '愉快']]]
    ],
    googleExpected: {
      main: 'happy',
      pron: 'ˈhæpi',
      pos: 'happy'
    },
    freedict: [
      {
        word: 'happy',
        phonetics: [
          { text: '/ˈhæpi/', audio: 'https://audio.url/happy.mp3' }
        ],
        meanings: [
          { partOfSpeech: 'adjective', definitions: [ { definition: 'feeling or showing pleasure or contentment' } ] }
        ]
      }
    ],
    freedictExpected: {
      main: 'happy',
      pron: '/ˈhæpi/',
      audio: 'https://audio.url/happy.mp3'
    }
  },
  {
    word: 'cat',
    google: [
      [['cat', 'kæt', null, null], ['猫', 'kæt', null, null]],
      [['cat', 'noun', null, ['猫', '猫科动物']]]
    ],
    googleExpected: {
      main: 'cat',
      pron: 'kæt',
      pos: 'cat'
    },
    freedict: [
      {
        word: 'cat',
        phonetics: [
          { text: '/kæt/', audio: 'https://audio.url/cat.mp3' }
        ],
        meanings: [
          { partOfSpeech: 'noun', definitions: [ { definition: 'a small domesticated carnivorous mammal' } ] }
        ]
      }
    ],
    freedictExpected: {
      main: 'cat',
      pron: '/kæt/',
      audio: 'https://audio.url/cat.mp3'
    }
  }
];

function pickFields(obj, keys) {
  const out = {};
  keys.forEach(k => { if (obj && obj[k] !== undefined) out[k] = obj[k]; });
  return out;
}

function runTests() {
  console.log('🧪 开始运行翻译解析测试...\n');
  let passed = 0;
  let failed = 0;
  testWords.forEach((item, idx) => {
    // Google API 解析
    const googleResult = pickFields(parseGoogleResult(item.google), Object.keys(item.googleExpected));
    const googlePass = JSON.stringify(googleResult) === JSON.stringify(item.googleExpected);
    console.log(`Google测试 ${idx + 1}: ${item.word}`);
    if (googlePass) {
      console.log('  ✅ 通过');
      passed++;
    } else {
      console.log('  ❌ 失败');
      console.log('  期望:', item.googleExpected);
      console.log('  实际:', googleResult);
      failed++;
    }
    // Free Dictionary API 解析
    const freeResult = pickFields(parseFreeDictResult(item.freedict), Object.keys(item.freedictExpected));
    const freePass = JSON.stringify(freeResult) === JSON.stringify(item.freedictExpected);
    console.log(`FreeDict测试 ${idx + 1}: ${item.word}`);
    if (freePass) {
      console.log('  ✅ 通过');
      passed++;
    } else {
      console.log('  ❌ 失败');
      console.log('  期望:', item.freedictExpected);
      console.log('  实际:', freeResult);
      failed++;
    }
  });
  console.log(`\n📊 测试结果: ${passed} 通过, ${failed} 失败, 总计 ${testWords.length * 2} 个测试`);
  if (failed === 0) {
    console.log('🎉 所有测试都通过了！');
  } else {
    console.log('⚠️  有测试失败，请检查解析逻辑');
  }
  return { passed, failed, total: testWords.length * 2 };
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseGoogleResult, parseFreeDictResult, runTests, testWords };
}

// 自动运行测试
if (typeof require !== 'undefined' && require.main === module) {
  runTests();
} 