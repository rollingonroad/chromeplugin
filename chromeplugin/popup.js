window.onload = async () => {
  const selectedTextDiv = document.getElementById('selectedText');
  const resultDiv = document.getElementById('result');
  let text = '';
  // 读取 storage 里的选中文字
  await new Promise(resolve => {
    chrome.storage.local.get(['selectedText'], (result) => {
      text = result.selectedText || '';
      selectedTextDiv.textContent = text;
      resolve();
    });
  });
  if (!text) {
    resultDiv.textContent = '未检测到选中文字';
    return;
  }
  resultDiv.textContent = '正在翻译...';
  try {
    // Google 翻译 API（web 端接口，非官方，可能随时失效）
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    const translated = data[0]?.map(item => item[0]).join('');
    resultDiv.textContent = translated || '未获取到翻译结果';
  } catch (e) {
    resultDiv.textContent = '翻译失败';
  }
};

document.getElementById('speakBtn').addEventListener('click', () => {
  const text = document.getElementById('selectedText').textContent.trim();
  if (!text) return;
  const utter = new window.SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  utter.rate = 1;
  window.speechSynthesis.speak(utter);
}); 