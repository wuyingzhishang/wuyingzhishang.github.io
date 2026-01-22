/**
 * Shadow Supreme Toolbox - Core Logic
 * Optimized for Performance and Security
 */

const CONFIG = {
    API: {
        FUEL: 'https://api.nxvav.cn/api/fuel-price/',
        QRCODE: 'http://api.lykep.com/api/qrcode',
        EXCHANGE: [
            { name: 'binance', url: 'https://api.binance.com/api/v3/ticker/price?symbol=USDTUSDT', parser: 'binance' },
            { name: 'coingecko', url: 'https://api.coingecko.com/api/v3/simple/price?ids=tether,tron&vs_currencies=usd,cny', parser: 'coingecko' },
            { name: 'frankfurter', url: 'https://api.frankfurter.app/latest?from=USD&to=CNY', parser: 'frankfurter' }
        ]
    },
    TIMEOUT: 5000,
    DEFAULTS: {
        USDT: { usd: 1.0, cny: 7.2932 },
        TRX: { usd: 0.2431, cny: 1.7725 },
        USD_CNY: 7.2932
    },
    THEME: {
        BG_GRADIENT_START: '#050510',
        BG_GRADIENT_END: '#020205',
        ACCENT_CYAN: '#00F3FF',
        ACCENT_PURPLE: '#BC13FE',
        TEXT_MAIN: '#F0F0FF',
        TEXT_SEC: '#8899AC'
    }
};

// ==================== State Management ====================
const state = {
    exchangeRates: {
        usdt: { ...CONFIG.DEFAULTS.USDT },
        trx: { ...CONFIG.DEFAULTS.TRX },
        usdToCny: CONFIG.DEFAULTS.USD_CNY,
        lastUpdate: null
    }
};

// ==================== DOM Elements ====================
const dom = {
    tabs: document.querySelectorAll('.nav-tab'),
    contents: document.querySelectorAll('.tab-content'),
    fuel: {
        input: document.getElementById('regionInput'),
        btn: document.getElementById('searchBtn'),
        quickBtns: document.querySelectorAll('.quick-btn'),
        resultSection: document.getElementById('resultSection'),
        loading: document.getElementById('loading'),
        content: document.getElementById('resultContent'),
        error: document.getElementById('errorMessage'),
        regionName: document.getElementById('regionName'),
        updateTime: document.getElementById('updateTime'),
        prices: {
            p92: document.getElementById('price92'),
            p95: document.getElementById('price95'),
            p98: document.getElementById('price98'),
            p0: document.getElementById('price0')
        }
    },
    currency: {
        usdt: document.getElementById('usdt-price'),
        trx: document.getElementById('trx-price'),
        amount: document.getElementById('amount'),
        unit: document.getElementById('unit'),
        leftResult: document.getElementById('left-result'),
        rightResult: document.getElementById('right-result')
    },
    text: {
        processBtn: document.getElementById('process-btn'),
        input: document.getElementById('input-text'),
        output: document.getElementById('output-text'),
        sourceFormat: document.getElementById('source-format'),
        targetFormat: document.getElementById('target-format'),
        suffixCheck: document.getElementById('suffix-enabled'),
        suffixNum: document.getElementById('suffix-number'),
        copyOutput: document.getElementById('copy-output-btn'),
        badge: document.getElementById('output-badge'),
        clearBtn: document.getElementById('clear-input-btn')
    },
    share: {
        btn: document.getElementById('shareSiteBtn'),
        modal: document.getElementById('shareImageModal'),
        preview: document.getElementById('shareImagePreview'),
        copyBtn: document.getElementById('copyShareImageBtn'),
        downloadBtn: document.getElementById('downloadShareImageBtn')
    }
};

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initFuel();
    initCurrency();
    initTextProcessor();
    initQrcode();
    initShare();
});

// ==================== Tab System ====================
function initTabs() {
    dom.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            // Switch Active Tab
            dom.tabs.forEach(t => t.classList.toggle('active', t === tab));

            // Switch Content
            dom.contents.forEach(c => {
                c.style.display = c.id === `${target}Tab` ? 'block' : 'none';
            });
        });
    });
}

// ==================== Fuel Module ====================
function initFuel() {
    dom.fuel.btn.addEventListener('click', handleFuelSearch);
    dom.fuel.input.addEventListener('keypress', (e) => e.key === 'Enter' && handleFuelSearch());

    dom.fuel.quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dom.fuel.input.value = btn.dataset.region;
            handleFuelSearch();
        });
    });

    dom.fuel.input.addEventListener('input', () => {
        dom.fuel.resultSection.style.display = 'none';
    });
}

async function handleFuelSearch() {
    const region = dom.fuel.input.value.trim();
    if (!region) return showToast('info', '请输入地区名称');

    toggleFuelLoading(true);

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

        const url = `${CONFIG.API.FUEL}?region=${encodeURIComponent(region)}&encoding=json`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error('网络请求失败');

        const data = await res.json();
        if (data.code === 200 && data.data) {
            renderFuelData(data.data);
        } else {
            throw new Error('未找到该地区信息');
        }
    } catch (err) {
        console.error('Fuel API Error:', err);
        showFuelError(err.name === 'AbortError' ? '请求超时，请重试' : err.message);
    }
}

function toggleFuelLoading(isLoading) {
    dom.fuel.resultSection.style.display = 'block';
    dom.fuel.loading.style.display = isLoading ? 'block' : 'none';
    dom.fuel.content.style.display = isLoading ? 'none' : 'block';
    dom.fuel.error.style.display = 'none';
}

function renderFuelData(data) {
    toggleFuelLoading(false);

    dom.fuel.regionName.textContent = data.region;
    dom.fuel.updateTime.textContent = `更新时间: ${data.updated || new Date().toLocaleDateString()}`;

    // Reset prices
    Object.values(dom.fuel.prices).forEach(el => el.textContent = '--');

    data.items.forEach(item => {
        if (item.name.includes('92')) dom.fuel.prices.p92.textContent = item.price;
        if (item.name.includes('95')) dom.fuel.prices.p95.textContent = item.price;
        if (item.name.includes('98')) dom.fuel.prices.p98.textContent = item.price;
        if (item.name.includes('0')) dom.fuel.prices.p0.textContent = item.price;
    });
}

function showFuelError(msg) {
    dom.fuel.loading.style.display = 'none';
    dom.fuel.content.style.display = 'none';
    dom.fuel.error.style.display = 'block';
    document.getElementById('errorText').textContent = msg;
}

// ==================== Currency Module ====================
function initCurrency() {
    updateExchangeRates();

    dom.currency.amount.addEventListener('input', calculateConversion);
    dom.currency.unit.addEventListener('change', calculateConversion);

    // Auto refresh every 5 minutes
    setInterval(updateExchangeRates, 300000);
}

async function updateExchangeRates() {
    const parsers = {
        binance: (d) => {
            const price = parseFloat(d.price);
            return price ? { usdt: { usd: 1, cny: price }, usdToCny: price } : null;
        },
        coingecko: (d) => {
            if (!d.tether?.usd || !d.tether?.cny) return null;
            return {
                usdt: { usd: d.tether.usd, cny: d.tether.cny },
                trx: { usd: d.tron?.usd || 0, cny: d.tron?.cny || 0 },
                usdToCny: d.tether.cny / d.tether.usd
            };
        },
        frankfurter: (d) => {
            return d.rates?.CNY ? { usdt: { usd: 1, cny: d.rates.CNY }, usdToCny: d.rates.CNY } : null;
        }
    };

    let success = false;

    // Try APIs sequentially
    for (const api of CONFIG.API.EXCHANGE) {
        try {
            const controller = new AbortController();
            setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

            const res = await fetch(api.url, { signal: controller.signal });
            if (!res.ok) continue;

            const data = await res.json();
            const result = parsers[api.parser](data);

            if (result && result.usdToCny > 0) {
                state.exchangeRates = { ...state.exchangeRates, ...result, lastUpdate: new Date() };
                success = true;
                break;
            }
        } catch (e) {
            console.warn(`API ${api.name} failed:`, e);
        }
    }

    renderExchangeRates();
    if (!success) showToast('error', '汇率更新失败，使用预估值');
}

function renderExchangeRates() {
    const { usdt, trx } = state.exchangeRates;

    const renderPrice = (usd, cny) => `
        <div class="price-row">USD: <span class="value">$${usd.toFixed(4)}</span></div>
        <div class="price-row">CNY: <span class="value">¥${cny.toFixed(4)}</span></div>
    `;

    if (dom.currency.usdt) dom.currency.usdt.innerHTML = renderPrice(usdt.usd, usdt.cny);
    if (dom.currency.trx) dom.currency.trx.innerHTML = renderPrice(trx.usd, trx.cny);

    calculateConversion();
}

function calculateConversion() {
    const amount = parseFloat(dom.currency.amount.value);
    if (isNaN(amount)) {
        dom.currency.leftResult.innerHTML = '';
        dom.currency.rightResult.innerHTML = '';
        return;
    }

    const unit = dom.currency.unit.value;
    const rate = state.exchangeRates.usdToCny;

    let multiplier = 1;
    if (unit === 'k') multiplier = 1e3;
    if (unit === 'm') multiplier = 1e6;
    if (unit === 'b') multiplier = 1e9;

    const valSm = amount;
    const valLg = amount * multiplier;

    const fmt = (n, c) => new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).format(n);

    dom.currency.leftResult.innerHTML = `
        <div>${amount} = <span class="value">${fmt(valSm, 'USD')}</span></div>
        <div>≈ <span class="value">${fmt(valSm * rate, 'CNY')}</span></div>
    `;

    dom.currency.rightResult.innerHTML = `
        <div>${amount}${unit.toUpperCase()} = <span class="value">${fmt(valLg, 'USD')}</span></div>
        <div>≈ <span class="value">${fmt(valLg * rate, 'CNY')}</span></div>
        <div class="exchange-rate">Rate: ${rate.toFixed(4)}</div>
    `;
}

// ==================== Text Processor ====================
function initTextProcessor() {
    if (!dom.text.processBtn) return;

    dom.text.processBtn.addEventListener('click', () => {
        const text = dom.text.input.value.trim();
        if (!text) return showToast('info', '请输入文本');

        const srcFmt = dom.text.sourceFormat.value;
        const tgtFmt = dom.text.targetFormat.value;
        const addSuffix = dom.text.suffixCheck.checked;
        const suffixVal = dom.text.suffixNum.value;

        const lines = text.split('\n').filter(l => l.trim());
        const results = lines.map(line => {
            const parts = line.split('----');
            let processed = tgtFmt;

            processed = processed.replace(/\{(\d+)\}/g, (match, p1) => {
                const idx = parseInt(p1) - 1;
                return parts[idx] ? parts[idx].trim() : match;
            });

            return addSuffix ? `${processed}----${suffixVal}` : processed;
        });

        dom.text.output.value = results.join('\n');
        dom.text.badge.textContent = `${results.length} 行`;
        showToast('success', `处理完成: ${results.length} 行`);
    });

    dom.text.copyOutput.addEventListener('click', () => {
        if (!dom.text.output.value) return;
        navigator.clipboard.writeText(dom.text.output.value);
        showToast('success', '已复制');
    });

    dom.text.clearBtn.addEventListener('click', () => {
        dom.text.input.value = '';
        dom.text.output.value = '';
    });

    // Auto-detect format
    dom.text.input.addEventListener('input', () => {
        const firstLine = dom.text.input.value.split('\n')[0];
        if (firstLine && firstLine.includes('----')) {
            const parts = firstLine.split('----');
            dom.text.sourceFormat.value = parts.map((_, i) => `{${i + 1}}`).join('----');
        }
    });
}

// ==================== QR Code Module ====================
function initQrcode() {
    const els = {
        input: document.getElementById('qrcodeInput'),
        btn: document.getElementById('generateQrcodeBtn'),
        sizeSelect: document.getElementById('qrcodeSizeSelect'),
        resultBox: document.getElementById('qrcodeResult'),
        image: document.getElementById('qrcodeImage'),
        downloadBtn: document.getElementById('downloadQrcodeBtn')
    };

    if (!els.input) return;

    els.btn.addEventListener('click', () => {
        const text = els.input.value.trim();

        if (!text) return showToast('info', '请输入内容');

        const size = els.sizeSelect.value;

        // Build the QR code URL
        const qrcodeUrl = `${CONFIG.API.QRCODE}?text=${encodeURIComponent(text)}&size=${size}&frame=1&e=M`;

        // Set the image source - no CORS issue since we're just displaying an image
        els.image.src = qrcodeUrl;
        els.downloadBtn.href = qrcodeUrl;

        // Show result
        els.resultBox.style.display = 'block';
        showToast('success', '二维码已生成');
    });

    // Handle enter key
    els.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') els.btn.click();
    });
}

// ==================== Share System ====================
function initShare() {
    // Copy URL
    if (dom.share.btn) {
        dom.share.btn.addEventListener('click', () => {
            navigator.clipboard.writeText(window.location.href);
            showToast('success', '链接已复制');
        });
    }

    // Canvas Generation
    document.getElementById('addToHomeBtn').addEventListener('click', openShareModal);

    document.querySelector('.close').addEventListener('click', () => {
        dom.share.modal.style.display = 'none';
    });

    dom.share.copyBtn.addEventListener('click', async () => {
        try {
            const res = await fetch(dom.share.preview.src);
            const blob = await res.blob();
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            showToast('success', '图片已复制');
        } catch (e) {
            showToast('error', '复制失败');
        }
    });

    dom.share.downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'shadow-supreme-tools.png';
        link.href = dom.share.preview.src;
        link.click();
    });
}

async function openShareModal() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 800;
    const height = 1000; // Taller for more content

    canvas.width = width;
    canvas.height = height;

    // Gradient Background (Cyberpunk)
    const grd = ctx.createLinearGradient(0, 0, 0, height);
    grd.addColorStop(0, CONFIG.THEME.BG_GRADIENT_START);
    grd.addColorStop(1, CONFIG.THEME.BG_GRADIENT_END);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);

    // Draw Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke(); }
    for (let i = 0; i < height; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke(); }

    // Title
    ctx.fillStyle = CONFIG.THEME.ACCENT_CYAN;
    ctx.font = 'bold 60px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = CONFIG.THEME.ACCENT_CYAN;
    ctx.shadowBlur = 20;
    ctx.fillText("SHADOW SUPREME", width / 2, 120);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '30px "Inter", sans-serif';
    ctx.fillText("TOOLBOX", width / 2, 170);

    // Content box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(100, 250, 600, 500);
    ctx.strokeStyle = CONFIG.THEME.ACCENT_PURPLE;
    ctx.lineWidth = 2;
    ctx.strokeRect(100, 250, 600, 500);

    // Info inside
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px "Inter", sans-serif';
    ctx.textAlign = 'left';

    const activeTab = document.querySelector('.nav-tab.active');
    const mode = activeTab ? activeTab.innerText.trim() : 'Tools';

    ctx.fillText(`MODE: ${mode}`, 140, 300);
    ctx.fillText(`DATE: ${new Date().toLocaleDateString()}`, 140, 340);

    // Get some context data
    ctx.font = '36px "Space Grotesk", sans-serif';
    ctx.fillStyle = CONFIG.THEME.ACCENT_CYAN;

    // Dynamic Content based on active tab
    if (mode.includes('油价')) {
        const region = document.getElementById('regionName').textContent;
        const p92 = document.getElementById('price92').textContent;
        ctx.fillText(`${region} 92#: ${p92}`, 140, 450);
    } else if (mode.includes('汇率')) {
        const rate = state.exchangeRates.usdToCny.toFixed(4);
        ctx.fillText(`USD/CNY: ${rate}`, 140, 450);
    } else {
        ctx.fillText("DATA PROCESSED", 140, 450);
    }

    // Footer
    ctx.textAlign = 'center';
    ctx.font = '20px "Inter", sans-serif';
    ctx.fillStyle = '#8899AC';
    ctx.fillText("wuyingzhishang.github.io", width / 2, 900);

    dom.share.preview.src = canvas.toDataURL('image/png');
    dom.share.modal.style.display = 'flex';
}

// ==================== Utilities ====================
function showToast(type, msg) {
    const toast = document.getElementById('shareToast');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastText = toast.querySelector('.toast-text');

    toast.className = `toast ${type} show`;
    toastIcon.textContent = type === 'success' ? '✓' : (type === 'error' ? '!' : 'i');
    toastText.textContent = msg;

    setTimeout(() => toast.classList.remove('show'), 3000);
}
