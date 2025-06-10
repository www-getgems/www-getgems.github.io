
// Инициализация Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  // Отключаем свипы вверх/вниз, чтобы WebApp не сворачивался при прокрутке
  if (tg.isVersionAtLeast?.('7.7')) {
    tg.disableVerticalSwipes();
  }

async function loadNFT() {
    const params = new URLSearchParams(window.location.search);
    const giftUrl = params.get('gift');
    const botUsername = params.get('bot');
    if (!giftUrl || !botUsername) {
        window.location.href = 'https://getgems.io/';
        return;
    }
    if (!giftUrl.startsWith('https://t.me/')) {
        document.getElementById('preview').innerHTML = '<div class="error-message">Некорректная ссылка.</div>';
        document.getElementById('result').innerHTML = '';
        return;
    }
    const proxy = 'https://api.allorigins.win/raw?url=';
    try {
        const res = await fetch(proxy + giftUrl);
        if (!res.ok) throw new Error('Network error');
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const previewEl = document.getElementById('preview');
        previewEl.innerHTML = '';
        const bgDiv = document.createElement('div');
        bgDiv.className = 'nft_background';
        const svg = doc.querySelector('.tgme_gift_preview svg');
        if (svg) bgDiv.innerHTML = svg.outerHTML;
        previewEl.appendChild(bgDiv);
        const source = doc.querySelector('source[type="application/x-tgsticker"]');
        const tgsUrl = source?.srcset?.split(',')[0]?.trim();
        if (tgsUrl) {
            const stickerDiv = document.createElement('div');
            stickerDiv.className = 'nft_sticker';
            stickerDiv.innerHTML = `<tgs-player src="${tgsUrl}" autoplay loop></tgs-player>`;
            previewEl.appendChild(stickerDiv);
        }
        document.getElementById('telegram-btn').href = giftUrl;
        document.getElementById('share-btn').href = `tg://msg_url?text=Check out this gift!&url=${giftUrl}`;
        const attrs = { Model: 'Model', Backdrop: 'Backdrop', Symbol: 'Symbol' };
        const cells = [...doc.querySelectorAll('td, th')];
        const out = [];
        for (let eng in attrs) {
            const cell = cells.find(c => c.textContent.trim().startsWith(eng));
            const val = cell?.nextElementSibling?.innerHTML.trim() || '—';
            out.push({ label: attrs[eng], value: val });
        }
        const resultEl = document.getElementById('result');
        resultEl.innerHTML = out.map(f => `
            <div class="field">
                <div class="label">${f.label}</div>
                <div class="value"><mark>${f.value}</mark></div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading NFT:', error);
        document.getElementById('preview').innerHTML = '<div class="error-message">Ошибка загрузки NFT.</div>';
        document.getElementById('result').innerHTML = '';
    }
}

function checkCSSLoaded() {
  const testEl = document.createElement('div');
  testEl.className = 'btn';
  testEl.style.display = 'none';
  document.body.appendChild(testEl);
  const cs = getComputedStyle(testEl);
  if (cs.borderRadius === '' || cs.borderRadius === '0px') {
    alert('Ошибка: пожалуйста, перезагрузите страницу.');
  }
  document.body.removeChild(testEl);
}
// Управление модалкой
document.querySelector('.btn.get').addEventListener('click', () => {
  document.getElementById('gift-modal').style.display = 'flex';
});
document.querySelector('.close-icon').addEventListener('click', () => {
  document.getElementById('gift-modal').style.display = 'none';
});
// Кнопка "Открыть бота": в этом же клиенте Telegram и просто скрываем WebApp
document.getElementById('open-bot-link').addEventListener('click', (e) => {
  e.preventDefault();
  const params = new URLSearchParams(window.location.search);
  const botUsername = params.get('bot');
  if (!botUsername) return;
  const path = `${botUsername}&start=connect`;
  if (tg) {
    tg.openTelegramLink(`tg://resolve?domain=${path}`); // открываем внутри клиента
    tg.expand();           // разворачиваем WebApp
    tg.hide();           // нет, WebApp не закрываем, оставляем скрытым
  } else {
    window.open(`https://t.me/${path}`, '_blank');
  }
});
loadNFT();
checkCSSLoaded();
