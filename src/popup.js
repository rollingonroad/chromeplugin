// 中国用户检测
function detectChineseUser() {
  const language = navigator.language || navigator.userLanguage;
  const isChineseLang = language.startsWith('zh');
  
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isChineseTimezone = timezone.includes('Asia/Shanghai') || 
                           timezone.includes('Asia/Urumqi') ||
                           timezone.includes('Asia/Harbin') ||
                           timezone.includes('Asia/Chongqing') ||
                           timezone.includes('Asia/Kashgar');
  
  // 严格判断：语言和时区都必须是中国的才认为是中国用户
  return isChineseLang && isChineseTimezone;
}

// 通过background script请求翻译
async function requestTranslation(text, isChineseUser) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'translate',
      text: text,
      isChineseUser: isChineseUser
    });
    return response;
  } catch (error) {
    console.log('翻译请求失败:', error);
    return { success: false, result: '翻译失败' };
  }
}

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
    const isChineseUser = detectChineseUser();
    
    // 通过background script请求翻译
    const translationResponse = await requestTranslation(text, isChineseUser);
    if (translationResponse.success) {
      resultDiv.textContent = translationResponse.result || '未获取到翻译结果';
    } else {
      resultDiv.textContent = '翻译失败';
    }
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