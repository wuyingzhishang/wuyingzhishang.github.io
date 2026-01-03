const FUEL_API_URL = 'https://api.nxvav.cn/api/fuel-price/';
const DOUYIN_API_URL = 'https://api.aa1.cn/api/douyin-hot/';

const regionInput = document.getElementById('regionInput');
const searchBtn = document.getElementById('searchBtn');
const quickBtns = document.querySelectorAll('.quick-btn[data-region]');
const resultSection = document.getElementById('resultSection');
const loading = document.getElementById('loading');
const resultContent = document.getElementById('resultContent');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

const navTabs = document.querySelectorAll('.nav-tab');
const tabContents = document.querySelectorAll('.tab-content');

navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        
        navTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        tabContents.forEach(content => {
            content.style.display = 'none';
        });
        
        document.getElementById(`${targetTab}Tab`).style.display = 'block';
    });
});

async function fetchFuelPrice(region) {
    if (!region || region.trim() === '') {
        showError('请输入地区名称');
        return;
    }

    showLoading();

    try {
        const encodedRegion = encodeURIComponent(region.trim());
        const response = await fetch(`${FUEL_API_URL}?region=${encodedRegion}&encoding=json`);
        
        if (!response.ok) {
            throw new Error('网络请求失败');
        }

        const data = await response.json();
        
        if (data && data.code === 200) {
            displayResult(data);
        } else {
            showError('未找到该地区的油价信息，请检查地区名称是否正确');
        }
    } catch (error) {
        console.error('API请求错误:', error);
        showError('查询失败，请稍后重试');
    }
}

function showLoading() {
    resultSection.style.display = 'block';
    loading.style.display = 'block';
    resultContent.style.display = 'none';
    errorMessage.style.display = 'none';
}

function displayResult(data) {
    loading.style.display = 'none';
    resultContent.style.display = 'block';
    errorMessage.style.display = 'none';

    const regionName = document.getElementById('regionName');
    const updateTime = document.getElementById('updateTime');
    const price92 = document.getElementById('price92');
    const price95 = document.getElementById('price95');
    const price98 = document.getElementById('price98');
    const price0 = document.getElementById('price0');

    if (data.data && data.data.items) {
        regionName.textContent = data.data.region || regionInput.value;
        
        const date = data.data.updated || new Date().toLocaleDateString('zh-CN');
        updateTime.textContent = `更新时间：${date}`;

        const items = data.data.items;
        items.forEach(item => {
            if (item.name.includes('92#汽油')) {
                price92.textContent = item.price;
            } else if (item.name.includes('95#汽油')) {
                price95.textContent = item.price;
            } else if (item.name.includes('98#汽油')) {
                price98.textContent = item.price;
            } else if (item.name.includes('0#柴油')) {
                price0.textContent = item.price;
            }
        });
    } else {
        showError('数据格式错误');
    }
}

function showError(message) {
    loading.style.display = 'none';
    resultContent.style.display = 'none';
    errorMessage.style.display = 'block';
    errorText.textContent = message;
}

function showErrorById(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'block';
        element.textContent = message;
    }
}

searchBtn.addEventListener('click', () => {
    fetchFuelPrice(regionInput.value);
});

regionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchFuelPrice(regionInput.value);
    }
});

quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const region = btn.getAttribute('data-region');
        regionInput.value = region;
        fetchFuelPrice(region);
    });
});

regionInput.addEventListener('input', () => {
    if (resultSection.style.display === 'block') {
        resultSection.style.display = 'none';
    }
});


let exchangeRateData = {
    usdt: { usd: 1.0, cny: 7.2932 },
    trx: { usd: 0.0, cny: 0.0 },
    usdToCny: 7.2932,
    lastUpdate: null
};

const EXCHANGE_APIS = [
    { name: 'exmo', url: 'https://api.exmo.com/v1/ticker', parser: parseExmoData },
    { name: 'binance', url: 'https://api.binance.com/api/v3/ticker/price?symbol=USDTUSDT', parser: parseBinanceUSDT },
    { name: 'coingecko', url: 'https://api.coingecko.com/api/v3/simple/price?ids=tether,tron&vs_currencies=usd,cny', parser: parseCoinGeckoData },
    { name: 'frankfurter', url: 'https://api.frankfurter.app/latest?from=USD&to=CNY', parser: parseFrankfurterData }
];

function parseExmoData(data) {
    try {
        if (data.USDT_USD && data.USDT_CNY) {
            return {
                usdt: { usd: 1 / parseFloat(data.USDT_USD), cny: parseFloat(data.USDT_CNY) },
                trx: { usd: parseFloat(data.TRX_USD) || 0, cny: parseFloat(data.TRX_CNY) || 0 },
                usdToCny: parseFloat(data.USDT_CNY)
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}

function parseBinanceUSDT(data) {
    try {
        const usdtPrice = parseFloat(data.price);
        if (usdtPrice && usdtPrice > 0) {
            return {
                usdt: { usd: 1.0, cny: usdtPrice },
                trx: { usd: 0, cny: 0 },
                usdToCny: usdtPrice
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}

function parseCoinGeckoData(data) {
    try {
        const usdt = data.tether || {};
        const trx = data.tron || {};
        if (usdt.usd && usdt.cny) {
            return {
                usdt: { usd: usdt.usd, cny: usdt.cny },
                trx: { usd: trx.usd || 0, cny: trx.cny || 0 },
                usdToCny: usdt.cny / usdt.usd
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}

function parseFrankfurterData(data) {
    try {
        if (data.rates && data.rates.CNY) {
            return {
                usdt: { usd: 1.0, cny: data.rates.CNY },
                trx: { usd: 0, cny: 0 },
                usdToCny: data.rates.CNY
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}

async function getLatestExchangeRate() {
    try {
        showLoadingSpinner('usdt-price');
        showLoadingSpinner('trx-price');
        hideError('price-error');
        
        let lastError = null;
        
        for (const api of EXCHANGE_APIS) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const response = await fetch(api.url, {
                    signal: controller.signal,
                    headers: { 'Accept': 'application/json' }
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) continue;
                
                const data = await response.json();
                const result = api.parser(data);
                
                if (result && result.usdToCny > 0 && result.usdToCny < 100) {
                    exchangeRateData = { ...exchangeRateData, ...result, lastUpdate: new Date() };
                    updatePriceDisplay();
                    console.log(`汇率获取成功 (${api.name})`);
                    return true;
                }
            } catch (error) {
                lastError = error;
                console.warn(`API ${api.name} 请求失败:`, error.message);
                continue;
            }
        }
        
        throw lastError || new Error('所有API均不可用');
    } catch (error) {
        console.error('获取汇率失败:', error);
        showFallbackRates();
        return false;
    }
}

function showFallbackRates() {
    const usdtPriceElement = document.getElementById('usdt-price');
    const trxPriceElement = document.getElementById('trx-price');
    
    if (usdtPriceElement) {
        usdtPriceElement.innerHTML = `
            USD: <span class="value">$1.0000</span><br>
            CNY: <span class="value">¥7.2932</span><br>
            <span class="fallback-note">使用预估汇率</span>
        `;
    }
    
    if (trxPriceElement) {
        trxPriceElement.innerHTML = `
            USD: <span class="value">$0.2431</span><br>
            CNY: <span class="value">¥1.7725</span><br>
            <span class="fallback-note">使用预估汇率</span>
        `;
    }
    
    showErrorById('price-error', '实时汇率获取中，请稍后重试...');
    setTimeout(() => {
        getLatestExchangeRate();
    }, 30000);
}

function hideError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

function showLoadingSpinner(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading-spinner"></div>';
    }
}

function hideLoadingSpinner(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '';
    }
}

function updatePriceDisplay() {
    const usdtPriceElement = document.getElementById('usdt-price');
    if (usdtPriceElement) {
        usdtPriceElement.innerHTML = `
            USD: <span class="value">$${exchangeRateData.usdt.usd.toFixed(6)}</span><br>
            CNY: <span class="value">¥${exchangeRateData.usdt.cny.toFixed(6)}</span>
        `;
    }
    
    const trxPriceElement = document.getElementById('trx-price');
    if (trxPriceElement) {
        trxPriceElement.innerHTML = `
            USD: <span class="value">$${exchangeRateData.trx.usd.toFixed(6)}</span><br>
            CNY: <span class="value">¥${exchangeRateData.trx.cny.toFixed(6)}</span>
        `;
    }
}

function formatLargeNumber(number) {
    if (number >= 100000000) {
        return (number / 100000000).toFixed(4) + '亿';
    } else if (number >= 10000) {
        return (number / 10000).toFixed(0) + 'w';
    }
    return number.toString();
}

async function updateCurrencyResults() {
    const amountInput = document.getElementById('amount').value;
    const unit = document.getElementById('unit').value.toUpperCase();
    const leftResult = document.getElementById('left-result');
    const rightResult = document.getElementById('right-result');
    
    if (!amountInput) {
        leftResult.innerHTML = '';
        rightResult.innerHTML = '';
        hideError('international-error');
        return;
    }

    const amount = parseFloat(amountInput);
    
    leftResult.innerHTML = '<div class="loading-spinner" style="margin: 10px auto;"></div>';
    rightResult.innerHTML = '<div class="loading-spinner" style="margin: 10px auto;"></div>';
    hideError('international-error');
    
    try {
        const success = await getLatestExchangeRate();
        
        if (!success) {
            throw new Error('获取汇率失败');
        }

    let leftUsdAmount = amount;
    let rightUsdAmount = amount;
    switch(unit) {
        case 'K': rightUsdAmount *= 1000; break;
        case 'M': rightUsdAmount *= 1000000; break;
        case 'B': rightUsdAmount *= 1000000000; break;
    }

    const leftCnyAmount = leftUsdAmount * exchangeRateData.usdToCny;
    const rightCnyAmount = rightUsdAmount * exchangeRateData.usdToCny;

    const leftUsdFormatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(leftUsdAmount);

    const leftCnyFormatted = new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY',
        minimumFractionDigits: 2
    }).format(leftCnyAmount);

    const rightUsdFormatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(rightUsdAmount);

    const rightCnyFormatted = new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY',
        minimumFractionDigits: 2
    }).format(rightCnyAmount);

    leftResult.innerHTML = `
        <div>${amount} = <span class="value">${leftUsdFormatted}</span></div>
        <div>${leftUsdFormatted} = <span class="value">${leftCnyFormatted}</span></div>
        <div>USD: <span class="value">${leftUsdAmount.toFixed(2)}</span></div>
        <div>CNY: <span class="value">${leftCnyAmount.toFixed(4)}</span></div>
        <div class="exchange-rate">当前汇率: 1 USD = ${exchangeRateData.usdToCny.toFixed(6)} CNY</div>
    `;

    rightResult.innerHTML = `
        <div>${amount}${unit} = <span class="value">${rightUsdFormatted}</span></div>
        <div>${rightUsdFormatted} = <span class="value">${rightCnyFormatted}</span></div>
        <div>USD: <span class="value">${formatLargeNumber(rightUsdAmount)}</span></div>
        <div>CNY: <span class="value">${formatLargeNumber(rightCnyAmount)}</span></div>
        <div class="exchange-rate">当前汇率: 1 USD = ${exchangeRateData.usdToCny.toFixed(6)} CNY</div>
    `;
    } catch (error) {
        console.error('国际金额转换失败:', error);
        showErrorById('international-error', `国际金额转换失败: ${error.message}`);
        leftResult.innerHTML = '';
        rightResult.innerHTML = '';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    getLatestExchangeRate();
    
    document.getElementById('amount').addEventListener('input', async () => {
        await updateCurrencyResults();
    });
    document.getElementById('unit').addEventListener('change', async () => {
        await updateCurrencyResults();
    });
    
    initTextProcessor();
});

function initTextProcessor() {
    const processBtn = document.getElementById('process-btn');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');
    const suffixCheckbox = document.getElementById('suffix-enabled');
    const suffixInputGroup = document.getElementById('suffix-input-group');
    
    if (processBtn) {
        processBtn.addEventListener('click', processText);
    }
    
    if (copyBtn) {
        copyBtn.addEventListener('click', copyResult);
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAll);
    }
    
    if (suffixCheckbox && suffixInputGroup) {
        suffixCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                suffixInputGroup.style.opacity = '1';
                suffixInputGroup.style.pointerEvents = 'auto';
            } else {
                suffixInputGroup.style.opacity = '0.5';
                suffixInputGroup.style.pointerEvents = 'none';
            }
        });
    }
}

function processText() {
    const sourceFormat = document.getElementById('source-format').value;
    const targetFormat = document.getElementById('target-format').value;
    const inputText = document.getElementById('input-text').value;
    const suffixEnabled = document.getElementById('suffix-enabled').checked;
    const suffixNumber = parseInt(document.getElementById('suffix-number').value) || 20;
    const outputText = document.getElementById('output-text');
    const outputStats = document.getElementById('output-stats');
    
    if (!inputText.trim()) {
        alert('请输入要处理的文本');
        return;
    }
    
    const lines = inputText.split('\n').filter(line => line.trim());
    const results = [];
    
    lines.forEach(line => {
        const processed = transformLine(line, sourceFormat, targetFormat);
        if (processed) {
            if (suffixEnabled) {
                results.push(`${processed}----${suffixNumber}`);
            } else {
                results.push(processed);
            }
        }
    });
    
    outputText.value = results.join('\n');
    outputStats.innerHTML = `<span>${results.length} 行</span>`;
}

function transformLine(line, sourceFormat, targetFormat) {
    const sourceParts = extractParts(line, sourceFormat);
    if (!sourceParts) return null;
    
    return replacePlaceholders(targetFormat, sourceParts);
}

function extractParts(line, format) {
    const parts = {};
    let currentIndex = 0;
    let placeholderIndex = 0;
    
    const regex = /\{(\d+)\}/g;
    let match;
    let lastIndex = 0;
    const extractedParts = [];
    
    while ((match = regex.exec(format)) !== null) {
        const placeholderNumber = parseInt(match[1]);
        const separator = format.substring(lastIndex, match.index);
        
        if (separator && currentIndex < line.length) {
            const separatorIndex = line.indexOf(separator, currentIndex);
            if (separatorIndex === -1) {
                return null;
            }
            currentIndex = separatorIndex + separator.length;
        }
        
        if (placeholderIndex < extractedParts.length) {
            parts[placeholderNumber] = extractedParts[placeholderIndex];
        }
        
        lastIndex = regex.lastIndex;
        placeholderIndex++;
    }
    
    if (placeholderIndex === 0) {
        return null;
    }
    
    const remainingFormat = format.substring(lastIndex);
    if (remainingFormat && currentIndex < line.length) {
        const remainingIndex = line.indexOf(remainingFormat, currentIndex);
        if (remainingIndex === -1) {
            return null;
        }
        currentIndex = remainingIndex + remainingFormat.length;
    }
    
    let tempIndex = 0;
    let tempPlaceholderIndex = 0;
    regex.lastIndex = 0;
    
    while ((match = regex.exec(format)) !== null) {
        const separator = format.substring(tempIndex, match.index);
        
        if (separator) {
            const separatorIndex = line.indexOf(separator, tempIndex);
            if (separatorIndex === -1) {
                return null;
            }
            extractedParts[tempPlaceholderIndex] = line.substring(tempIndex, separatorIndex);
            tempIndex = separatorIndex + separator.length;
        }
        
        tempIndex = match.index + match[0].length;
        tempPlaceholderIndex++;
    }
    
    if (tempIndex < line.length) {
        extractedParts[tempPlaceholderIndex] = line.substring(tempIndex);
    }
    
    for (let i = 0; i < extractedParts.length; i++) {
        parts[i + 1] = extractedParts[i];
    }
    
    return parts;
}

function replacePlaceholders(format, parts) {
    return format.replace(/\{(\d+)\}/g, (match, number) => {
        return parts[number] || '';
    });
}

function copyResult() {
    const outputText = document.getElementById('output-text');
    if (!outputText.value.trim()) {
        alert('没有可复制的内容');
        return;
    }
    
    outputText.select();
    document.execCommand('copy');
    
    const copyBtn = document.getElementById('copy-btn');
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<span class="btn-icon">✓</span> 已复制';
    setTimeout(() => {
        copyBtn.innerHTML = originalText;
    }, 2000);
}

function clearAll() {
    document.getElementById('input-text').value = '';
    document.getElementById('output-text').value = '';
    document.getElementById('output-stats').innerHTML = '<span>0 行</span>';
}

const ShareUtils = {
    siteUrl: window.location.href,
    siteTitle: '聚合工具箱 - 实用工具集合，一站式查询服务',
    siteDescription: '包含油价查询、汇率转换、文本处理等实用工具',

    showToast(icon, message, duration = 2000) {
        const toast = document.getElementById('shareToast');
        const toastIcon = toast.querySelector('.toast-icon');
        const toastText = toast.querySelector('.toast-text');

        toastIcon.textContent = icon;
        toastText.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    },

    async copyShareUrl() {
        const shareText = `🔗 ${this.siteTitle}\n${this.siteDescription}\n\n${this.siteUrl}`;

        try {
            await navigator.clipboard.writeText(this.siteUrl);
            this.showToast('✅', '网址已复制到剪贴板');
        } catch (err) {
            try {
                const textarea = document.createElement('textarea');
                textarea.value = this.siteUrl;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                this.showToast('✅', '网址已复制到剪贴板');
            } catch (e) {
                this.showToast('❌', '复制失败，请手动复制');
            }
        }
    },

    async generateShareImage() {
        const activeTab = document.querySelector('.nav-tab.active').getAttribute('data-tab');
        let title = '聚合工具箱';
        let content = [];

        switch (activeTab) {
            case 'fuel':
                const regionName = document.getElementById('regionName');
                if (regionName && document.getElementById('resultContent').style.display !== 'none') {
                    title = `${regionName.textContent} 油价查询结果`;
                    const prices = [
                        { label: '92号汽油', value: document.getElementById('price92').textContent },
                        { label: '95号汽油', value: document.getElementById('price95').textContent },
                        { label: '98号汽油', value: document.getElementById('price98').textContent },
                        { label: '0号柴油', value: document.getElementById('price0').textContent }
                    ];
                    content = prices.filter(p => p.value !== '--');
                } else {
                    content = [{ label: '状态', value: '点击查询获取最新油价' }];
                }
                break;
            case 'currency':
                const usdtPrice = document.getElementById('usdt-price');
                const trxPrice = document.getElementById('trx-price');
                if (usdtPrice) {
                    const usdtText = usdtPrice.textContent.replace(/\s+/g, ' ').trim();
                    const trxText = trxPrice ? trxPrice.textContent.replace(/\s+/g, ' ').trim() : '';
                    content.push({ label: 'USDT', value: usdtText });
                    content.push({ label: 'TRX', value: trxText });
                }
                break;
            case 'text':
                const outputText = document.getElementById('output-text');
                if (outputText && outputText.value.trim()) {
                    const lines = outputText.value.split('\n').filter(l => l.trim());
                    content = lines.slice(0, 5).map((line, i) => ({
                        label: `结果 ${i + 1}`,
                        value: line.length > 30 ? line.substring(0, 30) + '...' : line
                    }));
                    if (lines.length > 5) {
                        content.push({ label: '...', value: `还有 ${lines.length - 5} 条结果` });
                    }
                } else {
                    content = [{ label: '状态', value: '处理文本后生成分享' }];
                }
                break;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const width = 600;
        const padding = 40;
        const lineHeight = 50;
        const titleHeight = 80;
        const footerHeight = 60;

        const contentHeight = content.length * lineHeight + 20;
        canvas.height = titleHeight + contentHeight + footerHeight + padding * 2;

        const gradient = ctx.createLinearGradient(0, 0, width, canvas.height);
        gradient.addColorStop(0, '#1a1a3e');
        gradient.addColorStop(1, '#0d0d2b');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, canvas.height);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(title, width / 2, padding + 40);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px "Microsoft YaHei", sans-serif';
        ctx.fillText(`聚合工具箱 | ${new Date().toLocaleDateString('zh-CN')}`, width / 2, padding + 65);

        ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)';
        ctx.beginPath();
        ctx.moveTo(padding, padding + 85);
        ctx.lineTo(width - padding, padding + 85);
        ctx.stroke();

        ctx.textAlign = 'left';
        content.forEach((item, index) => {
            const y = padding + titleHeight + 25 + index * lineHeight;

            ctx.fillStyle = 'rgba(96, 165, 250, 0.15)';
            ctx.fillRect(padding, y - 25, width - padding * 2, lineHeight - 5);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px "Microsoft YaHei", sans-serif';
            ctx.fillText(item.label, padding + 15, y);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px "Microsoft YaHei", sans-serif';
            ctx.fillText(item.value, padding + 100, y);
        });

        ctx.fillStyle = '#64748b';
        ctx.font = '12px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔗 wuyingzhishang.github.io', width / 2, canvas.height - 20);

        return canvas.toDataURL('image/png');
    },

    async openShareImageModal() {
        try {
            const imageData = await this.generateShareImage();
            const preview = document.getElementById('shareImagePreview');
            preview.src = imageData;

            const modal = document.getElementById('shareImageModal');
            modal.style.display = 'flex';
        } catch (error) {
            console.error('生成分享图失败:', error);
            this.showToast('❌', '生成分享图失败');
        }
    },

    async copyShareImage() {
        const preview = document.getElementById('shareImagePreview');
        try {
            const response = await fetch(preview.src);
            const blob = await response.blob();
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            this.showToast('✅', '图片已复制到剪贴板');
        } catch (error) {
            this.showToast('❌', '复制图片失败，请尝试下载');
        }
    },

    downloadShareImage() {
        const preview = document.getElementById('shareImagePreview');
        const link = document.createElement('a');
        link.download = `分享图-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = preview.src;
        link.click();
        this.showToast('✅', '图片已开始下载');
    }
};

function closeShareImageModal() {
    const modal = document.getElementById('shareImageModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const shareSiteBtn = document.getElementById('shareSiteBtn');
    const shareBtn = document.getElementById('shareBtn');
    const copyShareImageBtn = document.getElementById('copyShareImageBtn');
    const downloadShareImageBtn = document.getElementById('downloadShareImageBtn');
    const addToHomeBtn = document.getElementById('addToHomeBtn');

    if (shareSiteBtn) {
        shareSiteBtn.addEventListener('click', () => ShareUtils.copyShareUrl());
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', () => ShareUtils.openShareImageModal());
    }

    if (copyShareImageBtn) {
        copyShareImageBtn.addEventListener('click', () => ShareUtils.copyShareImage());
    }

    if (downloadShareImageBtn) {
        downloadShareImageBtn.addEventListener('click', () => ShareUtils.downloadShareImage());
    }

    if (addToHomeBtn) {
        addToHomeBtn.addEventListener('click', async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: ShareUtils.siteTitle,
                        text: ShareUtils.siteDescription,
                        url: ShareUtils.siteUrl
                    });
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        ShareUtils.showToast('💡', '请使用浏览器分享功能');
                    }
                }
            } else {
                ShareUtils.showToast('💡', '浏览器不支持分享 API');
            }
        });
    }

    const modal = document.getElementById('shareImageModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeShareImageModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeShareImageModal();
        }
    });
});

// 抖音热点功能
async function fetchDouyinHot() {
    const douyinLoading = document.getElementById('douyinLoading');
    const douyinContent = document.getElementById('douyinContent');
    const douyinError = document.getElementById('douyinError');
    const douyinErrorText = document.getElementById('douyinErrorText');
    const douyinList = document.getElementById('douyinList');

    douyinLoading.style.display = 'block';
    douyinContent.style.display = 'none';
    douyinError.style.display = 'none';

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(DOUYIN_API_URL, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error('网络请求失败');
        }

        const data = await response.json();

        if (data && data.data && Array.isArray(data.data)) {
            displayDouyinHot(data.data);
        } else {
            throw new Error('数据格式错误');
        }
    } catch (error) {
        console.error('获取抖音热点失败:', error);
        douyinLoading.style.display = 'none';
        douyinError.style.display = 'block';
        douyinErrorText.textContent = error.message === '数据格式错误' ? '数据格式错误，请稍后重试' : '加载失败，请稍后重试';
    }
}

function displayDouyinHot(hotList) {
    const douyinLoading = document.getElementById('douyinLoading');
    const douyinContent = document.getElementById('douyinContent');
    const douyinList = document.getElementById('douyinList');

    douyinLoading.style.display = 'none';
    douyinContent.style.display = 'block';

    douyinList.innerHTML = hotList.map((item, index) => {
        const rank = index + 1;
        const isTop3 = rank <= 3;
        const hotValue = item.hot || item.hot_value || item.heat || '热度未知';
        const title = item.title || item.word || item.name || '未知标题';

        return `
            <div class="douyin-item ${isTop3 ? 'douyin-item-top3' : ''}" data-index="${rank}">
                <div class="douyin-content-main">
                    <div class="douyin-title-text">${title}</div>
                    <div class="douyin-hot">
                        <span class="douyin-hot-icon">🔥</span>
                        <span>热度: ${hotValue}</span>
                    </div>
                </div>
                <div class="douyin-rank ${rank === 1 ? 'douyin-rank-1' : ''}">${rank}</div>
            </div>
        `;
    }).join('');
}

// 初始化抖音热点
document.addEventListener('DOMContentLoaded', function() {
    fetchDouyinHot();

    const refreshDouyinBtn = document.getElementById('refreshDouyinBtn');
    if (refreshDouyinBtn) {
        refreshDouyinBtn.addEventListener('click', () => {
            fetchDouyinHot();
        });
    }
});