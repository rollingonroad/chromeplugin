// 翻译API代理 - 解决CORS问题

// MyMemory翻译 (备用)
async function translateWithMyMemory(text) {
  try {
    console.log('开始MyMemory翻译:', text);
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh`);
    const data = await response.json();
    console.log('MyMemory翻译响应:', data);
    
    if (data.responseData && data.responseData.translatedText) {
      const result = data.responseData.translatedText;
      console.log('MyMemory翻译结果:', result);
      return result;
    }
  } catch (error) {
    console.log('MyMemory翻译失败:', error);
  }
  return null;
}

// Lingva翻译 (主要)
async function translateWithLingva(text) {
  try {
    console.log('开始Lingva翻译:', text);
    const response = await fetch(`https://lingva.ml/api/v1/en/zh/${encodeURIComponent(text)}`);
    const data = await response.json();
    console.log('Lingva翻译响应:', data);
    
    if (data.translation) {
      const result = data.translation;
      console.log('Lingva翻译结果:', result);
      return result;
    }
  } catch (error) {
    console.log('Lingva翻译失败:', error);
  }
  return null;
}

// Google翻译
async function translateWithGoogle(text) {
  try {
    console.log('开始Google翻译:', text);
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`);
    const data = await response.json();
    console.log('Google翻译响应:', data);
    const result = data[0]?.[0]?.[0] || '';
    console.log('Google翻译结果:', result);
    return result;
  } catch (error) {
    console.log('Google翻译失败:', error);
  }
  return null;
}

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background script收到消息:', request);
  
  if (request.action === 'translate') {
    console.log('开始处理翻译请求:', request.text, 'isChineseUser:', request.isChineseUser);
    handleTranslation(request.text, request.isChineseUser).then(result => {
      console.log('翻译结果:', result);
      sendResponse(result);
    });
    return true; // 异步响应
  }
});

// 处理翻译请求
async function handleTranslation(text, isChineseUser) {
  let translationResult = '';
  
  if (isChineseUser) {
    // 中国用户：先尝试Lingva翻译，失败则使用MyMemory
    console.log('检测到中国用户，使用Lingva翻译');
    translationResult = await translateWithLingva(text);
    if (!translationResult) {
      console.log('Lingva翻译失败，尝试MyMemory翻译');
      translationResult = await translateWithMyMemory(text);
    }
  } else {
    // 非中国用户：使用Google翻译
    console.log('检测到非中国用户，使用Google翻译');
    translationResult = await translateWithGoogle(text);
  }
  
  return { success: !!translationResult, result: translationResult };
} 