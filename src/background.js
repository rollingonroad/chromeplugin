// 翻译API代理 - 解决CORS问题

// 翻译API配置
const TRANSLATION_APIS = {
  // MyMemory翻译 (备用)
  myMemory: {
    url: (text) => `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh`,
    name: 'MyMemory翻译',
    parser: (data) => data.responseData?.translatedText || null
  },
  
  // Lingva翻译 (主要)
  lingva: {
    url: (text) => `https://lingva.ml/api/v1/en/zh/${encodeURIComponent(text)}`,
    name: 'Lingva翻译',
    parser: (data) => data.translation || null
  },
  
  // Google翻译
  google: {
    url: (text) => `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`,
    name: 'Google翻译',
    parser: (data) => data[0]?.[0]?.[0] || null
  }
};

// 通用的API请求函数
async function makeApiRequest(url, apiName, responseParser) {
  try {
    console.log(`开始${apiName}:`, url);
    const response = await fetch(url);
    const data = await response.json();
    console.log(`${apiName}响应:`, data);
    
    const result = responseParser(data);
    if (result) {
      console.log(`${apiName}结果:`, result);
      return result;
    }
  } catch (error) {
    console.log(`${apiName}失败:`, error);
  }
  return null;
}

// 翻译函数
async function translateWithApi(apiKey, text) {
  const api = TRANSLATION_APIS[apiKey];
  if (!api) {
    console.log(`未知的API: ${apiKey}`);
    return null;
  }
  
  return await makeApiRequest(api.url(text), api.name, api.parser);
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
    // 中国用户：先尝试MyMemory翻译，失败则使用Lingva
    console.log('检测到中国用户，使用MyMemory翻译');
    translationResult = await translateWithApi('myMemory', text);
    if (!translationResult) {
      console.log('MyMemory翻译失败，尝试Lingva翻译');
      translationResult = await translateWithApi('lingva', text);
    }
  } else {
    // 非中国用户：使用Google翻译
    console.log('检测到非中国用户，使用Google翻译');
    translationResult = await translateWithApi('google', text);
  }
  
  return { success: !!translationResult, result: translationResult };
} 