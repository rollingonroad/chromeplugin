// 中国用户检测标志
let isChineseUser = false;

// 检测用户是否在中国境内
function detectChineseUser() {
  // 检查浏览器语言
  const language = navigator.language || navigator.userLanguage;
  const isChineseLang = language.startsWith('zh');
  
  // 检查时区
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isChineseTimezone = timezone.includes('Asia/Shanghai') || 
                           timezone.includes('Asia/Urumqi') ||
                           timezone.includes('Asia/Harbin') ||
                           timezone.includes('Asia/Chongqing') ||
                           timezone.includes('Asia/Kashgar');
  
  // 检查系统区域设置
  const locale = new Intl.NumberFormat().resolvedOptions().locale;
  const isChineseLocale = locale.includes('zh-CN');
  
  // 综合判断：语言、时区、区域设置中至少有两个匹配
  const indicators = [isChineseLang, isChineseTimezone, isChineseLocale];
  const matchCount = indicators.filter(Boolean).length;
  
  return matchCount >= 2;
}

// 初始化时检测用户位置
function initializeUserLocation() {
  isChineseUser = detectChineseUser();
  
  console.log('用户位置检测结果:', isChineseUser ? '中国用户' : '非中国用户');
}

// 页面加载时执行检测
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUserLocation);
} else {
  initializeUserLocation();
}

// 监听用户选中内容
let selectedText = '';

function removeTranslatePopup() {
  const old = document.getElementById('chromeplugin-translate-popup');
  if (old) old.remove();
}

function createTranslatePopup(text, translated, x = null, y = null, autoSpeak = false) {
  removeTranslatePopup();
  const popup = document.createElement('div');
  popup.id = 'chromeplugin-translate-popup';
  popup.style.position = 'fixed';
  popup.style.zIndex = 999999;
  popup.style.borderRadius = '24px';
  popup.style.overflow = 'hidden';
  popup.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
  popup.style.background = 'transparent';
  popup.style.padding = '0';
  popup.style.minWidth = '340px';
  popup.style.maxWidth = '420px';
  popup.style.fontFamily = 'Arial, sans-serif';
  // 先设置初步位置
  if (x !== null && y !== null) {
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    popup.style.transform = 'none';
  } else {
    popup.style.top = '20%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, 0)';
  }
  // 顶部蓝色栏，增加音标类型切换按钮组
  const topBar = document.createElement('div');
  topBar.style.background = '#3578e5';
  topBar.style.height = '64px';
  topBar.style.display = 'flex';
  topBar.style.alignItems = 'center';
  topBar.style.padding = '0 24px';
  topBar.style.borderTopLeftRadius = '24px';
  topBar.style.borderTopRightRadius = '24px';
  // 音标类型下拉菜单，放在两面国旗之间
  const phoneticType = (window.localStorage.getItem('chromeplugin-phonetic-type') || 'dj');
  let phoneticTypeText = phoneticType === 'dj' ? '中国音标' : '国际音标';
  // 恢复顶部栏国旗和箭头，单词+主发音按钮+国旗+箭头+国旗
  let topBarHTML = `
    <span style="
      font-family: 'Segoe UI', 'San Francisco', 'Helvetica Neue', Arial, sans-serif;
      font-size: 28px;
      font-weight: 600;
      letter-spacing: 0.04em;
      color: #222;
      line-height: 1.2;
      -webkit-font-smoothing: antialiased;
      margin-right: 10px;">
      ${text}
    </span>
    <span id="chromeplugin-main-speak-btn" style="width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;margin-left:10px;">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M3 10v4h4l5 5V5l-5 5H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03z" fill="black"/>
        <path d="M14 3.23v2.06c3.39.49 6 3.39 6 6.71s-2.61 6.22-6 6.71v2.06c4.5-.51 8-4.31 8-8.77s-3.5-8.26-8-8.77z" fill="black"/>
      </svg>
    </span>
    <span style='flex:1;'></span>
    <span style="display:flex;align-items:center;background:#fff2;border-radius:18px;padding:4px 12px;gap:6px;">
      <span style='font-size:20px;'>🇬🇧</span>
      <span style='font-size:18px;'>→</span>
      <span style='font-size:20px;'>🇨🇳</span>
    </span>
  `;
  topBar.innerHTML = `<span style='display:flex;align-items:center;gap:0;flex:1;'>${topBarHTML}</span>`;
  // 主内容卡片
  const card = document.createElement('div');
  card.style.background = '#fff';
  card.style.padding = '20px 24px 12px 24px';
  card.style.borderBottomLeftRadius = '24px';
  card.style.borderBottomRightRadius = '24px';
  card.style.maxHeight = '340px';
  card.style.overflowY = 'auto';
  // 内容：先音标，再中文翻译
  let html = '';
  // 音标转换函数：根据 phoneticType 切换
  function normalizeIPA(ipa) {
    if (!ipa) return '';
    let s = ipa;
    if ((window.localStorage.getItem('chromeplugin-phonetic-type') || 'dj') === 'dj') {
      // DJ规则（与 tests/dj_phonetic_convert.test.js 保持一致，简化版）
      s = s.replace(/\(([^)]+)\)/g, '$1');
      s = s.replace(/l\u0329/g, 'əl');
      s = s.replace(/n\u0329/g, 'ən');
      s = s.replace(/m\u0329/g, 'əm');
      s = s.replace(/\.n\u0329/g, 'ən');
      s = s.replace(/\.l\u0329/g, 'əl');
      s = s.replace(/\.m\u0329/g, 'əm');
      s = s.replace(/n\u0329\./g, 'ən');
      s = s.replace(/l\u0329\./g, 'əl');
      s = s.replace(/m\u0329\./g, 'əm');
      s = s.replace(/\.ʃn\u0329/g, 'ʃən');
      s = s.replace(/\.tn\u0329/g, 'tən');
      s = s.replace(/\.dn\u0329/g, 'dən');
      s = s.replace(/\.sn\u0329/g, 'sən');
      s = s.replace(/\.tl\u0329/g, 'təl');
      s = s.replace(/\.dl\u0329/g, 'dəl');
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
        .replace(/ɛ/g, 'e')
        .replace(/ɫ/g, 'l');
      s = s.replace(/nɛ/g, 'ne')
        .replace(/ɡɛ/g, 'ge')
        .replace(/dɛ/g, 'de')
        .replace(/tɛ/g, 'te');
      s = s.replace(/[\.]/g, '');
      s = s.replace(/[\/\[\]]/g, '');
      s = s.replace(/\s+/g, '');
      return s.trim();
    } else {
      // 国际IPA，原样美化
      s = s.replace(/[\/\[\]]/g, '');
      s = s.replace(/\s+/g, ' ');
      return s.trim();
    }
  }
  // 下方音标后的发音按钮和音标类型选择（无音标时不显示下拉框）
  if (translated.pron && /[ˈˌɪʊʌæɔəθðʃʒŋːɑːɒɛɜːɡ]/.test(translated.pron)) {
    const normIPA = normalizeIPA(translated.pron);
    html += `<div style='color:#3578e5;font-size:22px;margin-bottom:10px;display:flex;align-items:center;'>/<span id='chromeplugin-ipa'>${normIPA}</span>/`;
    if (translated.audio) {
      html += `<button id='chromeplugin-audio-btn' style='background:none;border:none;cursor:pointer;width:20px;height:20px;margin-left:8px;display:inline-flex;align-items:center;' title='真人发音'>
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none'>
          <path d='M3 10v4h4l5 5V5l-5 5H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03z' fill='black'/>
          <path d='M14 3.23v2.06c3.39.49 6 3.39 6 6.71s-2.61 6.22-6 6.71v2.06c4.5-.51 8-4.31 8-8.77s-3.5-8.26-8-8.77z' fill='black'/>
        </svg>
      </button>`;
      // 音标类型选择：点击按钮直接切换，无需下拉弹层
      // toggle控件恢复最初蓝/灰色外框和滑块，整体缩小20%，去掉“中国音标”外部按钮框，仅保留文字和toggle
      const isDJ = phoneticType === 'dj';
      html += `
      <span style="display:flex;align-items:center;gap:8px;margin-left:8px;">
        <span style="font-family: 'Segoe UI', 'San Francisco', 'Helvetica Neue', Arial, sans-serif;font-size:13px;color:#3578e5;">中国音标</span>
        <span id='phonetic-toggle-btn' style="display:inline-block;width:25px;height:14px;position:relative;cursor:pointer;">
          <span style="position:absolute;left:0;top:0;width:100%;height:100%;border-radius:7px;background:${isDJ ? '#3578e5' : '#ccc'};transition:background 0.2s;"></span>
          <span style="position:absolute;top:1.5px;left:${isDJ ? '2px' : '11px'};width:11px;height:11px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.08);transition:left 0.2s;"></span>
        </span>
      </span>`;
    }
    html += `</div>`;
  }
  html += `<div style='font-size:28px;font-weight:bold;margin-bottom:8px;'>${translated.main || ''}</div>`;
  if (translated.explains && Array.isArray(translated.explains) && translated.explains.length > 0) {
    html += `<hr style='border:none;border-top:1px solid #eee;margin:8px 0;'>`;
    translated.explains.forEach((item, idx) => {
      html += `<div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;'>
        <div style='font-size:16px;'>${item}</div>
        <div>
          <button data-copy='${item}' style='background:none;border:none;cursor:pointer;font-size:18px;margin-right:6px;' title='复制'>📋</button>
          <button data-speak='${item}' style='background:none;border:none;cursor:pointer;font-size:18px;' title='发音'>🔊</button>
        </div>
      </div>`;
    });
  }
  card.innerHTML = html;
  // 组装
  popup.appendChild(topBar);
  popup.appendChild(card);
  document.body.appendChild(popup);
  // 复制和发音按钮事件
  card.querySelectorAll('button[data-copy]').forEach(btn => {
    btn.onclick = (e) => {
      navigator.clipboard.writeText(btn.getAttribute('data-copy'));
      btn.textContent = '✅';
      setTimeout(()=>{btn.textContent='📋';}, 1000);
      e.stopPropagation();
    };
  });
  card.querySelectorAll('button[data-speak]').forEach(btn => {
    btn.innerHTML = `<svg width='22' height='22' viewBox='0 0 24 24' fill='none'>
      <path d='M3 10v4h4l5 5V5l-5 5H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03z' fill='black'/>
      <path d='M14 3.23v2.06c3.39.49 6 3.39 6 6.71s-2.61 6.22-6 6.71v2.06c4.5-.51 8-4.31 8-8.77s-3.5-8.26-8-8.77z' fill='black'/>
    </svg>`;
    btn.onclick = (e) => {
      const utter = new window.SpeechSynthesisUtterance(btn.getAttribute('data-speak'));
      utter.lang = 'en-US';
      utter.rate = 1;
      window.speechSynthesis.speak(utter);
      e.stopPropagation();
    };
  });
  // 主发音按钮（顶部）
  topBar.querySelector('#chromeplugin-main-speak-btn').onclick = (e) => {
    e.stopPropagation();
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 1;
    window.speechSynthesis.speak(utter);
  };
  // 真人发音按钮事件
  if (translated.audio) {
    const audioBtn = card.querySelector('#chromeplugin-audio-btn');
    if (audioBtn) {
      audioBtn.onclick = (e) => {
        e.stopPropagation();
        const audio = new Audio(translated.audio);
        audio.play();
      };
    }
  }
  // 只在 autoSpeak=true 时自动发音
  if (autoSpeak) {
    setTimeout(() => {
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.rate = 1;
      window.speechSynthesis.speak(utter);
    }, 500);
  }
  // 点击悬浮窗外关闭
  setTimeout(() => {
    function outsideClickListener(e) {
      const popup = document.getElementById('chromeplugin-translate-popup');
      if (!popup) return;
      // 如果点击的是悬浮窗本身或其子元素，不关闭
      if (popup === e.target || popup.contains(e.target)) return;
      removeTranslatePopup();
      document.removeEventListener('mousedown', outsideClickListener, true);
    }
    document.addEventListener('mousedown', outsideClickListener, true);
  }, 0);
  // 自动调整悬浮窗位置，保证可见
  if (x !== null && y !== null) {
    // 需要等popup渲染后才能获取宽高
    setTimeout(() => {
      const rect = popup.getBoundingClientRect();
      let newX = x, newY = y;
      if (rect.right > window.innerWidth) {
        newX = window.innerWidth - rect.width - 10;
      }
      if (rect.left < 0) {
        newX = 10;
      }
      if (rect.bottom > window.innerHeight) {
        newY = window.innerHeight - rect.height - 10;
      }
      if (rect.top < 0) {
        newY = 10;
      }
      popup.style.left = newX + 'px';
      popup.style.top = newY + 'px';
    }, 0);
  }
  // 事件绑定：点击toggle控件切换
  setTimeout(() => {
    const toggleBtn = card.querySelector('#phonetic-toggle-btn');
    if (toggleBtn) {
      toggleBtn.onclick = (e) => {
        const newType = (window.localStorage.getItem('chromeplugin-phonetic-type') || 'dj') === 'dj' ? 'ipa' : 'dj';
        window.localStorage.setItem('chromeplugin-phonetic-type', newType);
        removeTranslatePopup();
        createTranslatePopup(text, translated, x, y, autoSpeak);
      };
    }
  }, 0);
}

// 解析 Google 翻译 API 结果，提取主翻译、音标、词性、释义
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

document.addEventListener('dblclick', async (e) => {
  const text = window.getSelection().toString().trim();
  if (!text) return;
  const x = e.clientX + 10;
  const y = e.clientY + 10;
  createTranslatePopup(text, { main: '正在翻译...' }, x, y, false);
  // 并行请求 Google 翻译和 Free Dictionary API
  let googleData = null, ipa = '', audioUrl = '';
  try {
    const [googleRes, dictRes] = await Promise.all([
      fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`),
      fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(text)}`)
    ]);
    const googleJson = await googleRes.json();
    googleData = parseGoogleResult(googleJson);
    try {
      const dictJson = await dictRes.json();
      if (Array.isArray(dictJson) && dictJson[0]?.phonetics?.length) {
        // 取第一个有 text 的音标
        const phoneticObj = dictJson[0].phonetics.find(p => p.text);
        if (phoneticObj && phoneticObj.text) {
          ipa = phoneticObj.text;
        }
        // 取第一个有 audio 的音频
        const audioObj = dictJson[0].phonetics.find(p => p.audio);
        if (audioObj && audioObj.audio) {
          audioUrl = audioObj.audio;
        }
      }
    } catch {}
  } catch {}
  removeTranslatePopup();
  createTranslatePopup(text, { ...googleData, pron: ipa, audio: audioUrl }, x, y, true);
}); 