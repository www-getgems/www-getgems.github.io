async function loadNFT() {
    const params = new URLSearchParams(window.location.search);
    const giftUrl = params.get('gift');

    if (!giftUrl) {
        window.location.href = 'https://getgems.io/';
        return;
    }

    if (!giftUrl.startsWith('https://t.me/')) {
        document.getElementById('preview').innerHTML = '<p>Некорректная ссылка.</p>';
        document.getElementById('result').innerHTML = '';
        return;
    }

    const proxy = 'https://api.allorigins.win/raw?url=';

    try {
        const res = await fetch(proxy + giftUrl);
        if (!res.ok) throw new Error();

        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        const previewEl = document.getElementById('preview');
        previewEl.innerHTML = '';

        const gift = doc.querySelector('.tgme_gift_preview');
        const svg = gift?.querySelector('svg');
        if (svg) {
            const bgDiv = document.createElement('div');
            bgDiv.className = 'nft_background';
            bgDiv.innerHTML = svg.outerHTML;
            previewEl.appendChild(bgDiv);
        }

        const source = doc.querySelector('source[type="application/x-tgsticker"]');
        const tgsUrl = source?.srcset?.split(',')[0]?.trim();
        if (tgsUrl) {
            const stickerDiv = document.createElement('div');
            stickerDiv.className = 'nft_sticker';
            stickerDiv.innerHTML = `<tgs-player src="${tgsUrl}" autoplay loop style="width:200px; height:200px;"></tgs-player>`;
            previewEl.appendChild(stickerDiv);
        }

        document.getElementById('telegram-btn').href = giftUrl;

        // Без encodeURIComponent
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

    } catch {
        document.getElementById('preview').innerHTML = '<p>Ошибка загрузки NFT.</p>';
        document.getElementById('result').innerHTML = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const giftBtn = document.querySelector('.btn.green');
    const modal = document.getElementById('gift-modal');
    const closeBtn = document.getElementById('modal-close');

    const slides = modal.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    let currentIndex = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }

    giftBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        currentIndex = 0;
        showSlide(currentIndex);
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(currentIndex);
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
    });

    // Закрытие по клику вне окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
});




loadNFT();
