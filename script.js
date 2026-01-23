/**
 * Shadow Supreme Toolbox - Core Logic
 * Optimized for Performance and Security
 */

const CONFIG = {
    API: {
        FUEL: 'https://api.nxvav.cn/api/fuel-price/',
        QRCODE: 'http://api.lykep.com/api/qrcode',
        PROXY: 'https://proxy.scdn.io/api/get_proxy.php',
        IP_INFO: 'https://my.ippure.com/v1/info',
        EXCHANGE: [
            { name: 'binance', url: 'https://api.binance.com/api/v3/ticker/price?symbol=USDTUSDT', parser: 'binance' },
            { name: 'coingecko', url: 'https://api.coingecko.com/api/v3/simple/price?ids=tether,tron&vs_currencies=usd,cny', parser: 'coingecko' },
            { name: 'frankfurter', url: 'https://api.frankfurter.app/latest?from=USD&to=CNY', parser: 'frankfurter' }
        ]
    },
    TIMEOUT: 15000,
    PROXY_TIMEOUT: 30000,
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
    },
    QUALITY_LEVELS: [
        { max: 10, label: '优秀', color: '#00FF9D', icon: '🌟' },
        { max: 30, label: '良好', color: '#2D5BFF', icon: '🟢' },
        { max: 50, label: '中等', color: '#FFD700', icon: '🟡' },
        { max: 70, label: '较差', color: '#FF9F43', icon: '🟠' },
        { max: 90, label: '差劲', color: '#FF6B6B', icon: '🔴' },
        { max: 101, label: '极差', color: '#545454', icon: '⚫' }
    ]
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
    ipInfo: {
        btn: document.getElementById('checkIpBtn'),
        loading: document.getElementById('ipInfoLoading'),
        result: document.getElementById('ipInfoResult'),
        display: document.getElementById('ipDisplay'),
        location: document.getElementById('ipLocation'),
        location: document.getElementById('ipLocation'),
        detailsGrid: document.querySelector('.ip-details-grid'),
        json: document.getElementById('ipRawJson'),
        error: document.getElementById('ipInfoError'),
        errorText: document.getElementById('ipInfoErrorText'),
        reportBtn: null // Will be created dynamically
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
    initTranslate();
    initProxy();
    initIpInfo();
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

// ==================== Translate Module ====================
function initTranslate() {
    const els = {
        input: document.getElementById('translateInput'),
        btn: document.getElementById('translateBtn'),
        swapBtn: document.getElementById('swapLangBtn'),
        sourceLang: document.getElementById('sourceLang'),
        targetLang: document.getElementById('targetLang'),
        result: document.getElementById('translateResult'),
        loading: document.getElementById('translateLoading'),
        copyBtn: document.getElementById('copyTranslateBtn'),
        error: document.getElementById('translateError'),
        errorText: document.getElementById('translateErrorText'),
        quickBtns: document.querySelectorAll('[data-text]')
    };

    if (!els.input) return;

    // Translate button click
    els.btn.addEventListener('click', () => handleTranslate(els));

    // Enter key (Ctrl+Enter for multi-line)
    els.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) handleTranslate(els);
    });

    // Swap languages
    els.swapBtn.addEventListener('click', () => {
        const temp = els.sourceLang.value;
        els.sourceLang.value = els.targetLang.value;
        els.targetLang.value = temp;
        showToast('info', '已交换语言');
    });

    // Copy result
    els.copyBtn.addEventListener('click', () => {
        const resultText = els.result.querySelector('.translate-text')?.textContent;
        if (resultText) {
            navigator.clipboard.writeText(resultText);
            showToast('success', '已复制翻译结果');
        }
    });

    // Quick translate buttons
    els.quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            els.input.value = btn.dataset.text;
            handleTranslate(els);
        });
    });
}

async function handleTranslate(els) {
    const text = els.input.value.trim();
    if (!text) return showToast('info', '请输入要翻译的文本');

    const sourceLang = els.sourceLang.value;
    const targetLang = els.targetLang.value;

    if (sourceLang === targetLang) {
        return showToast('info', '源语言和目标语言不能相同');
    }

    toggleTranslateLoading(els, true);

    const baseUrl = `${CONFIG.API.TRANSLATE}?text=${encodeURIComponent(text)}&source=${sourceLang}&target=${targetLang}`;

    // Try direct fetch first, then CORS proxies as fallback
    const fetchStrategies = [
        { url: baseUrl, name: 'direct' },
        { url: `https://corsproxy.io/?${encodeURIComponent(baseUrl)}`, name: 'corsproxy.io' }
    ];

    let lastError = null;

    for (const strategy of fetchStrategies) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

            const res = await fetch(strategy.url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!res.ok) throw new Error('网络请求失败');

            const data = await res.json();

            if (data.code === 200 && data.data) {
                renderTranslateResult(els, data.data);
                return; // Success, exit function
            } else {
                throw new Error(data.message || '翻译失败');
            }
        } catch (err) {
            console.warn(`Translate API ${strategy.name} failed:`, err);
            lastError = err;
            // Continue to next strategy
        }
    }

    // All strategies failed
    console.error('Translate API Error:', lastError);
    showTranslateError(els, lastError?.name === 'AbortError' ? '请求超时，请重试' : (lastError?.message || '翻译失败，请稍后重试'));
}

function toggleTranslateLoading(els, isLoading) {
    els.loading.style.display = isLoading ? 'flex' : 'none';
    els.result.style.display = isLoading ? 'none' : 'block';
    els.error.style.display = 'none';
    els.copyBtn.style.display = 'none';
}

function renderTranslateResult(els, data) {
    toggleTranslateLoading(els, false);

    const targetText = data.targetText || data.result || data.translation || '';

    els.result.innerHTML = `
        <div class="translate-result-content">
            <p class="translate-text">${escapeHtml(targetText)}</p>
            <span class="translate-powered">由简心翻译提供</span>
        </div>
    `;

    els.copyBtn.style.display = 'flex';
    showToast('success', '翻译完成');
}

function showTranslateError(els, msg) {
    els.loading.style.display = 'none';
    els.result.style.display = 'none';
    els.error.style.display = 'block';
    els.errorText.textContent = msg;
    els.copyBtn.style.display = 'none';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

// ==================== Proxy IP Module ====================
function initProxy() {
    const els = {
        getBtn: document.getElementById('getProxyBtn'),
        protocol: document.getElementById('proxyProtocol'),
        country: document.getElementById('proxyCountry'),
        count: document.getElementById('proxyCount'),
        resultsContainer: document.getElementById('proxyResultsContainer'),
        loading: document.getElementById('proxyLoading'),
        list: document.getElementById('proxyList'),
        error: document.getElementById('proxyError'),
        errorText: document.getElementById('proxyErrorText'),
        resultCount: document.getElementById('proxyResultCount'),
        copyAllBtn: document.getElementById('copyAllProxyBtn')
    };

    if (!els.getBtn) return;

    // Store current proxies for copy all
    let currentProxies = [];

    els.getBtn.addEventListener('click', async () => {
        const protocol = els.protocol.value;
        const country = els.country.value;
        const count = Math.min(Math.max(parseInt(els.count.value) || 10, 1), 50);

        // Build API URL
        let url = `${CONFIG.API.PROXY}?protocol=${protocol}&count=${count}`;
        if (country !== 'all') {
            url += `&country_code=${country}`;
        }

        toggleProxyLoading(els, true);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.PROXY_TIMEOUT);

            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!res.ok) throw new Error('网络请求失败');

            const data = await res.json();

            if (data.code === 200 && data.data && data.data.proxies) {
                currentProxies = data.data.proxies;
                renderProxyResults(els, data.data.proxies);
            } else {
                throw new Error(data.message || '获取代理失败');
            }
        } catch (err) {
            console.error('Proxy API Error:', err);
            showProxyError(els, err.name === 'AbortError' ? '请求超时，请重试' : err.message);
        }
    });

    // Copy all proxies
    els.copyAllBtn.addEventListener('click', () => {
        if (currentProxies.length === 0) return;
        navigator.clipboard.writeText(currentProxies.join('\n'));
        showToast('success', `已复制 ${currentProxies.length} 个代理地址`);
    });
}

function toggleProxyLoading(els, isLoading) {
    els.resultsContainer.style.display = 'block';
    els.loading.style.display = isLoading ? 'flex' : 'none';
    els.list.style.display = isLoading ? 'none' : 'block';
    els.error.style.display = 'none';
}

function renderProxyResults(els, proxies) {
    toggleProxyLoading(els, false);
    els.resultCount.textContent = proxies.length;

    els.list.innerHTML = proxies.map((proxy, index) => `
        <div class="proxy-item glass-card">
            <div class="proxy-info">
                <span class="proxy-index">#${index + 1}</span>
                <code class="proxy-address">${escapeHtml(proxy)}</code>
            </div>
            <button class="copy-proxy-btn btn btn-sm btn-secondary" data-proxy="${escapeHtml(proxy)}" title="复制">
                <span class="btn-icon">📋</span>
            </button>
        </div>
    `).join('');

    // Add click handlers for individual copy buttons
    els.list.querySelectorAll('.copy-proxy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            navigator.clipboard.writeText(btn.dataset.proxy);
            showToast('success', '已复制');
        });
    });
}

function showProxyError(els, msg) {
    els.loading.style.display = 'none';
    els.list.style.display = 'none';
    els.error.style.display = 'block';
    els.errorText.textContent = msg;
}

// ==================== IP Info Module ====================
function initIpInfo() {
    if (!dom.ipInfo.btn) return;

    dom.ipInfo.btn.addEventListener('click', checkIp);
}

async function checkIp() {
    toggleIpLoading(true);

    const strategies = [
        { url: CONFIG.API.IP_INFO, name: 'direct' },
        { url: `https://corsproxy.io/?${encodeURIComponent(CONFIG.API.IP_INFO)}`, name: 'corsproxy' }
    ];

    let lastError = null;

    for (const strategy of strategies) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

            const startTime = performance.now();
            const res = await fetch(strategy.url, { signal: controller.signal });
            const endTime = performance.now();
            clearTimeout(timeoutId);

            if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

            const data = await res.json();
            data._latency = Math.round(endTime - startTime); // Inject latency

            renderIpInfo(data);
            return;
        } catch (err) {
            console.warn(`IP Check strategy ${strategy.name} failed:`, err);
            lastError = err;
        }
    }

    console.error('All IP check strategies failed');
    showIpError(lastError?.name === 'AbortError' ? '请求超时，请重试' : '检测失败 (可能是跨域限制)');
}

function toggleIpLoading(isLoading) {
    dom.ipInfo.loading.style.display = isLoading ? 'block' : 'none';
    dom.ipInfo.result.style.display = isLoading ? 'none' : 'block';
    dom.ipInfo.error.style.display = 'none';
    if (isLoading) {
        dom.ipInfo.result.style.display = 'none';
    }
}

function getQualityInfo(score) {
    if (score === undefined || score === null) return { label: '未知', color: '#888', icon: '❓' };
    return CONFIG.QUALITY_LEVELS.find(l => score < l.max) || CONFIG.QUALITY_LEVELS[CONFIG.QUALITY_LEVELS.length - 1];
}

function renderIpInfo(data) {
    toggleIpLoading(false);
    dom.ipInfo.result.style.display = 'block';

    const quality = getQualityInfo(data.fraudScore);
    const ipType = data.isResidential ? '住宅 IP' : (data.isBroadcast ? '广播 IP' : '机房 IP');
    const ipTypeIcon = data.isResidential ? '🏠' : (data.isBroadcast ? '📡' : '🏢');

    // Main Display with Quality Color
    dom.ipInfo.display.textContent = data.ip || 'Unknown';
    dom.ipInfo.display.style.color = quality.color;
    dom.ipInfo.display.style.textShadow = `0 0 20px ${quality.color}40`;

    dom.ipInfo.location.textContent = [data.country, data.region, data.city].filter(Boolean).join(' · ') || '位置未知';

    // Details Grid
    const details = [
        { label: '质量评分', value: `<span style="color:${quality.color}; font-weight:bold">${quality.icon} ${quality.label} (风险: ${data.fraudScore}%)</span>` },
        { label: 'IP 类型', value: `${ipTypeIcon} ${ipType}` },
        { label: 'ASN', value: `${data.asn || '-'} ${data.asOrganization || ''}` },
        { label: '延迟', value: `<span style="color:var(--neon-cyan)">⚡ ${data._latency}ms</span>` },
        { label: '国家/地区', value: `${data.country || '-'} (${data.countryCode || '-'})` },
        { label: '城市', value: data.city || '-' },
        { label: '时区', value: data.timezone || '-' },
        { label: '经纬度', value: `${data.latitude || '-'}, ${data.longitude || '-'}` },
        { label: '邮编', value: data.postalCode || '-' },
    ];

    dom.ipInfo.detailsGrid.innerHTML = details.map(item => `
        <div class="glass-card detail-card" style="padding: 1rem;">
            <div class="detail-label" style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">${item.label}</div>
            <div class="detail-value" style="color: #fff; font-weight: 500;">${item.value}</div>
        </div>
    `).join('');

    // Add Report Button if not exists
    if (!document.getElementById('copyIpReportBtn')) {
        const btnContainer = document.createElement('div');
        btnContainer.style.textAlign = 'center';
        btnContainer.style.marginTop = '1rem';
        btnContainer.innerHTML = `
            <button id="copyIpReportBtn" class="btn btn-secondary btn-large" style="width:100%">
                <span class="btn-icon">📋</span> 复制检测报告
            </button>
        `;
        // Insert before JSON details
        const jsonContainer = document.querySelector('.raw-json-container');
        jsonContainer.parentNode.insertBefore(btnContainer, jsonContainer);

        document.getElementById('copyIpReportBtn').addEventListener('click', () => copyIpReport(data, quality, ipType));
    } else {
        // Update event listener (simplification: re-cloning to remove old listeners usually better, but here we assume single flow)
        const oldBtn = document.getElementById('copyIpReportBtn');
        const newBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(newBtn, oldBtn);
        newBtn.addEventListener('click', () => copyIpReport(data, quality, ipType));
    }

    // Raw JSON
    dom.ipInfo.json.textContent = JSON.stringify(data, null, 2);
}

function copyIpReport(data, quality, ipType) {
    const report = [
        `# 🕵️ IP 质量检测报告`,
        `# 检测时间: ${new Date().toLocaleString()}`,
        ``,
        `IP地址: ${data.ip}`,
        `位置: ${[data.country, data.region, data.city].filter(Boolean).join(' - ')}`,
        `质量: ${quality.icon} ${quality.label} (风险值: ${data.fraudScore}%)`,
        `类型: ${ipType}`,
        `ASN: ${data.asn} ${data.asOrganization}`,
        `延迟: ${data._latency}ms`,
        ``,
        `--------------------------------`,
        `Generated by Shadow Supreme Toolbox`
    ].join('\n');

    navigator.clipboard.writeText(report);
    showToast('success', '报告已复制');
}

function showIpError(msg) {
    dom.ipInfo.loading.style.display = 'none';
    dom.ipInfo.result.style.display = 'none';
    dom.ipInfo.error.style.display = 'block';
    dom.ipInfo.errorText.textContent = msg;
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
    } else if (mode.includes('IP')) {
        const ip = document.getElementById('ipDisplay').textContent;
        ctx.fillText(`IP: ${ip}`, 140, 450);
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
