const FUEL_API_URL = 'https://api.nxvav.cn/api/fuel-price/';
const IP_API_URL = 'https://api.nxvav.cn/api/ip/';

const regionInput = document.getElementById('regionInput');
const searchBtn = document.getElementById('searchBtn');
const quickBtns = document.querySelectorAll('.quick-btn[data-region]');
const resultSection = document.getElementById('resultSection');
const loading = document.getElementById('loading');
const resultContent = document.getElementById('resultContent');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

const ipInput = document.getElementById('ipInput');
const ipSearchBtn = document.getElementById('ipSearchBtn');
const getMyIpBtn = document.getElementById('getMyIp');
const ipResultSection = document.getElementById('ipResultSection');
const ipLoading = document.getElementById('ipLoading');
const ipResultContent = document.getElementById('ipResultContent');
const ipErrorMessage = document.getElementById('ipErrorMessage');
const ipErrorText = document.getElementById('ipErrorText');

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

async function fetchIpInfo(ip = '') {
    showIpLoading();

    try {
        const url = ip ? `${IP_API_URL}?ip=${encodeURIComponent(ip)}&format=json` : `${IP_API_URL}?format=json`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('网络请求失败');
        }

        const data = await response.json();
        
        if (data && data.code === 200) {
            displayIpResult(data);
        } else {
            showIpError('查询失败，请检查IP地址是否正确');
        }
    } catch (error) {
        console.error('API请求错误:', error);
        showIpError('查询失败，请稍后重试');
    }
}

function showIpLoading() {
    ipResultSection.style.display = 'block';
    ipLoading.style.display = 'block';
    ipResultContent.style.display = 'none';
    ipErrorMessage.style.display = 'none';
}

function displayIpResult(data) {
    ipLoading.style.display = 'none';
    ipResultContent.style.display = 'block';
    ipErrorMessage.style.display = 'none';

    const ipAddress = document.getElementById('ipAddress');
    const ipVersion = document.getElementById('ipVersion');
    const countryName = document.getElementById('countryName');
    const regionName = document.getElementById('regionName');
    const cityName = document.getElementById('cityName');
    const isp = document.getElementById('isp');

    if (data.data) {
        ipAddress.textContent = data.data.ip || '--';
        ipVersion.textContent = data.data.ipVersion || '--';
        countryName.textContent = data.data.countryName || '--';
        regionName.textContent = data.data.regionName || '--';
        cityName.textContent = data.data.cityName || '--';
        isp.textContent = data.data.internetServiceProvider || '--';
    } else {
        showIpError('数据格式错误');
    }
}

function showIpError(message) {
    ipLoading.style.display = 'none';
    ipResultContent.style.display = 'none';
    ipErrorMessage.style.display = 'block';
    ipErrorText.textContent = message;
}

ipSearchBtn.addEventListener('click', () => {
    const ip = ipInput.value.trim();
    fetchIpInfo(ip);
});

ipInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const ip = ipInput.value.trim();
        fetchIpInfo(ip);
    }
});

getMyIpBtn.addEventListener('click', () => {
    ipInput.value = '';
    fetchIpInfo();
});

ipInput.addEventListener('input', () => {
    if (ipResultSection.style.display === 'block') {
        ipResultSection.style.display = 'none';
    }
});

let exchangeRateData = {
    usdt: { usd: 1.0, cny: 7.2932 },
    trx: { usd: 0.0, cny: 0.0 },
    usdToCny: 7.2932
};

async function getLatestExchangeRate() {
    try {
        showLoadingSpinner('usdt-price');
        showLoadingSpinner('trx-price');
        hideError('price-error');
        
        const apiUrl = `http://api.xinyew.cn/api/huilv`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 200 && data.data) {
            if (data.data.USDT) {
                exchangeRateData.usdt.usd = data.data.USDT.USD;
                exchangeRateData.usdt.cny = data.data.USDT.CNY;
                exchangeRateData.usdToCny = data.data.USDT.CNY / data.data.USDT.USD;
            }
            
            if (data.data.TRX) {
                exchangeRateData.trx.usd = data.data.TRX.USD;
                exchangeRateData.trx.cny = data.data.TRX.CNY;
            }
            
            updatePriceDisplay();
            return true;
        }
        throw new Error('无法获取汇率数据');
    } catch (error) {
        console.error('获取汇率失败:', error);
        showErrorById('price-error', `获取汇率失败: ${error.message}`);
        hideLoadingSpinner('usdt-price');
        hideLoadingSpinner('trx-price');
        return false;
    }
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
    initTimezoneConverter();
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

function initTimezoneConverter() {
    const currentTimeBtn = document.getElementById('currentTimeBtn');
    const sourceTimeInput = document.getElementById('sourceTime');
    
    if (currentTimeBtn) {
        currentTimeBtn.addEventListener('click', setCurrentTime);
    }
    
    if (sourceTimeInput) {
        sourceTimeInput.addEventListener('change', convertTime);
    }
    
    updateLiveTimes();
    setInterval(updateLiveTimes, 1000);
}

function setCurrentTime() {
    const now = new Date();
    const sourceTimeInput = document.getElementById('sourceTime');
    
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    
    sourceTimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    convertTime();
}

function convertTime() {
    const sourceTimeInput = document.getElementById('sourceTime');
    const beijingOutput = document.getElementById('beijingOutput');
    
    if (!sourceTimeInput.value) {
        beijingOutput.textContent = '--';
        return;
    }
    
    const utcTime = new Date(sourceTimeInput.value + 'Z');
    
    if (isNaN(utcTime.getTime())) {
        beijingOutput.textContent = '无效的时间格式';
        return;
    }
    
    const beijingTime = new Date(utcTime.getTime() + 8 * 60 * 60 * 1000);
    
    const year = beijingTime.getUTCFullYear();
    const month = String(beijingTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(beijingTime.getUTCDate()).padStart(2, '0');
    const hours = String(beijingTime.getUTCHours()).padStart(2, '0');
    const minutes = String(beijingTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(beijingTime.getUTCSeconds()).padStart(2, '0');
    
    beijingOutput.textContent = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function updateLiveTimes() {
    const now = new Date();
    
    const currentUTC = document.getElementById('currentUTC');
    if (currentUTC) {
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const day = String(now.getUTCDate()).padStart(2, '0');
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        const seconds = String(now.getUTCSeconds()).padStart(2, '0');
        currentUTC.textContent = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    
    const result = document.getElementById('result');
    if (result) {
        const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
        const year = beijingTime.getUTCFullYear();
        const month = String(beijingTime.getUTCMonth() + 1).padStart(2, '0');
        const day = String(beijingTime.getUTCDate()).padStart(2, '0');
        const hours = String(beijingTime.getUTCHours()).padStart(2, '0');
        const minutes = String(beijingTime.getUTCMinutes()).padStart(2, '0');
        const seconds = String(beijingTime.getUTCSeconds()).padStart(2, '0');
        result.textContent = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
}