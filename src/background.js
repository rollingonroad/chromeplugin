// 翻译API代理 - 解决CORS问题

// 翻译API配置
const BAIDU_PROXY_ENDPOINT = 'https://api.yun.info/api/translate';
const TRANSLATION_APIS = {
  // 百度翻译代理（优先给中国用户）
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

// 标签页级别的百度代理状态
const tabBaiduDisabled = new Set();

// 获取标签页ID
function getTabId(sender) {
  return sender.tab ? sender.tab.id : null;
}

// 检查标签页是否已禁用百度代理
function isTabBaiduDisabled(tabId) {
  return tabId && tabBaiduDisabled.has(tabId);
}

// 设置标签页百度代理禁用状态
function setTabBaiduDisabled(tabId) {
  if (tabId) {
    tabBaiduDisabled.add(tabId);
  }
}

// 清理标签页状态
function cleanupTabState(tabId) {
  if (tabId) {
    tabBaiduDisabled.delete(tabId);
    console.log(`[Background] 清理标签页 ${tabId} 的状态`);
  }
}

// 监听标签页关闭事件，清理相关状态
chrome.tabs.onRemoved.addListener((tabId) => {
  cleanupTabState(tabId);
});

// 通用的API请求函数
async function makeApiRequest(url, apiName, responseParser, tabId = null) {
  try {
    console.log(`[${apiName}] 发送请求:`, url);
    const response = await fetch(url);
    const data = await response.json();
    console.log(`[${apiName}] 接收响应:`, data);
    
    // 检查百度代理的特定错误
    if (apiName === '百度翻译代理' && response.status === 500 && data && data.errorCode === 'BAIDU_PROVIDER_DISABLED') {
      console.log(`[${apiName}] 检测到百度代理禁用错误，标签页 ${tabId} 后续将直接使用MyMemory`);
      setTabBaiduDisabled(tabId);
      return null;
    }
    
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

// 翻译函数
async function translateWithApi(apiKey, text, tabId = null) {
  const api = TRANSLATION_APIS[apiKey];
  if (!api) {
    console.log(`[未知API] 未知的API: ${apiKey}`);
    return null;
  }
  
  return await makeApiRequest(api.url(text), api.name, api.parser, tabId);
}

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Background] 收到消息:', request);
  
  if (request.action === 'translate') {
    const tabId = getTabId(sender);
    console.log('[Background] 开始处理翻译请求:', request.text, 'isChineseUser:', request.isChineseUser, 'tabId:', tabId);
    handleTranslation(request.text, request.isChineseUser, tabId).then(result => {
      console.log('[Background] 翻译结果:', result);
      sendResponse(result);
    });
    return true; // 异步响应
  }
});

// 处理翻译请求
async function handleTranslation(text, isChineseUser, tabId) {
  let translationResult = '';
  
  if (isChineseUser) {
    // 检查当前标签页是否已禁用百度代理
    if (isTabBaiduDisabled(tabId)) {
      console.log(`[Background] 标签页 ${tabId} 已禁用百度代理，直接使用MyMemory翻译`);
      translationResult = await translateWithApi('myMemory', text, tabId);
    } else {
      // 中国用户：优先百度，其次 MyMemory
      console.log('[Background] 检测到中国用户，优先使用百度翻译代理');
      translationResult = await translateWithApi('baidu', text, tabId);
      if (!translationResult) {
        console.log('[Background] 百度翻译失败，尝试MyMemory翻译');
        translationResult = await translateWithApi('myMemory', text, tabId);
      }
    }
  } else {
    // 非中国用户：使用Google翻译
    console.log('[Background] 检测到非中国用户，使用Google翻译');
    translationResult = await translateWithApi('google', text, tabId);
  }
  
  return { success: !!translationResult, result: translationResult };
} 