/**
 * DJ音标转换测试脚本
 * 读取dj_phonetic_list.txt，测试ipa转DJ音标的转换函数
 */

const fs = require('fs');
const path = require('path');

// 这里写一个简单的ipa转DJ音标的转换函数（实际规则需完善）
function ipaToDJ(ipa) {
  let s = ipa;
  // 1. 先处理括号内容（如(ə)→ə，(ə)→省略）
  s = s.replace(/\(([^)]+)\)/g, '$1');

  // 2. 特殊音节符号处理 l̩ → əl、n̩ → ən、m̩ → əm
  // 注意：̩ 是 Unicode 0x0329，正则写法为 \u0329
  s = s.replace(/l\u0329/g, 'əl');
  s = s.replace(/n\u0329/g, 'ən');
  s = s.replace(/m\u0329/g, 'əm');

  // 3. 对音节分隔符.前后做特殊合并（如 t.n̩ → tən，ʃ.l̩ → ʃəl）
  // 先合并 .n̩、.l̩、.m̩
  s = s.replace(/\.n\u0329/g, 'ən');
  s = s.replace(/\.l\u0329/g, 'əl');
  s = s.replace(/\.m\u0329/g, 'əm');
  // 也处理 n̩. l̩. m̩.（极少见）
  s = s.replace(/n\u0329\./g, 'ən');
  s = s.replace(/l\u0329\./g, 'əl');
  s = s.replace(/m\u0329\./g, 'əm');

  // 4. 部分常见词的特殊音节正则替换（举例：invitation, button, little, etc.）
  // 例如 .ʃn̩ → ʃən，.tn̩ → tən，.dn̩ → dən，.sn̩ → sən
  s = s.replace(/\.ʃn\u0329/g, 'ʃən');
  s = s.replace(/\.tn\u0329/g, 'tən');
  s = s.replace(/\.dn\u0329/g, 'dən');
  s = s.replace(/\.sn\u0329/g, 'sən');
  // 例如 .tl̩ → təl，.dl̩ → dəl
  s = s.replace(/\.tl\u0329/g, 'təl');
  s = s.replace(/\.dl\u0329/g, 'dəl');

  // 5. 基本符号映射
  s = s.replace(/ɹ/g, 'r')
    .replace(/ɾ/g, 't')
    .replace(/ɘ/g, 'i')
    .replace(/ɒ/g, 'ɔ')
    .replace(/ɜː/g, 'ə:')
    .replace(/ɜ/g, 'ə')
    .replace(/ɡ/g, 'g')
    .replace(/d͡ʒ|dʒ/g, 'ʤ')
    .replace(/t͡ʃ|tʃ/g, 'ʧ')
    .replace(/ʊ/g, 'u')
    .replace(/ɪ/g, 'i')
    .replace(/ʃ/g, 'ʃ')
    .replace(/ʒ/g, 'ʒ')
    .replace(/θ/g, 'θ')
    .replace(/ð/g, 'ð')
    .replace(/ŋ/g, 'ŋ')
    .replace(/æ/g, 'æ')
    .replace(/ɑː/g, 'ɑ:')
    .replace(/ɑ/g, 'ɑ')
    .replace(/ɔː/g, 'ɔ:')
    .replace(/ɔ/g, 'ɔ')
    .replace(/uː/g, 'u:')
    .replace(/u/g, 'u')
    .replace(/iː/g, 'i:')
    .replace(/i/g, 'i')
    .replace(/eɪ/g, 'ei')
    .replace(/aɪ/g, 'ai')
    .replace(/əʊ/g, 'əu')
    .replace(/oʊ/g, 'ou')
    .replace(/aʊ/g, 'au')
    .replace(/ɔɪ/g, 'ɔi')
    .replace(/juː/g, 'ju:')
    .replace(/ju/g, 'ju')
    .replace(/eə/g, 'eə')
    .replace(/ɪə/g, 'iə')
    .replace(/ʊə/g, 'uə')
    // 新增规则：将 ɛ 替换为 e
    .replace(/ɛ/g, 'e')
    // 新增规则：将 ɫ 替换为 l
    .replace(/ɫ/g, 'l');

  // 6. 处理特殊组合
  s = s.replace(/nɛ/g, 'ne')
    .replace(/ɡɛ/g, 'ge')
    .replace(/dɛ/g, 'de')
    .replace(/tɛ/g, 'te');

  // 7. 处理音节分隔符和点号
  s = s.replace(/[\.]/g, '');

  // 8. 去除斜杠和方括号
  s = s.replace(/[\/\[\]]/g, '');

  // 9. 多余空格
  s = s.replace(/\s+/g, '');

  return s.trim();
}

function runTest() {
  const filePath = path.join(__dirname, 'dj_phonetic_list.txt');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  let total = 0, passed = 0;
  lines.forEach(line => {
    const [word, ipa, dj] = line.split(/\t|\s{2,}/);
    if (!word || !ipa || !dj) return;
    const ipaClean = ipa.replace(/[\[\]/]/g, '').replace(/^\//, '').replace(/\/$/, '').trim();
    const djResult = ipaToDJ(ipaClean);
    const djClean = dj.replace(/[\[\]/]/g, '').replace(/^\//, '').replace(/\/$/, '').trim();
    const isPass = djResult === djClean;
    total++;
    if (isPass) passed++;
    else {
      console.log(`❌ ${word}\n  IPA: ${ipa}\n  DJ应为: ${dj}\n  转换结果: ${djResult}\n`);
    }
  });
  console.log(`\n测试通过: ${passed}/${total} (${((passed/total)*100).toFixed(1)}%)`);
}

if (require.main === module) {
  runTest();
}

module.exports = { ipaToDJ, runTest }; 