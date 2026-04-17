// Auto-detect API base: use same origin in production, localhost in development
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8001/api'
    : `${window.location.origin}/api`;

const selectors = {
    company: document.getElementById('company-select'),
    period: document.getElementById('period-select'),
    compare: document.getElementById('compare-select'),
    refresh: document.getElementById('refresh-button'),
    showPrice: document.getElementById('show-price'),
    showCandle: document.getElementById('show-candle'),
    showVolume: document.getElementById('show-volume'),
    showBollinger: document.getElementById('show-bollinger'),
    showReturns: document.getElementById('show-returns'),
    showRsi: document.getElementById('show-rsi'),
};

const containers = {
    status: document.getElementById('status-message'),
    updated: document.getElementById('last-updated'),
    cleaningGrid: document.getElementById('cleaning-summary-grid'),
    cleaningDetails: document.getElementById('cleaning-details'),
    metricsRow1: document.getElementById('metrics-row-1'),
    metricsRow2: document.getElementById('metrics-row-2'),
    insightLeft: document.getElementById('insight-left'),
    insightRight: document.getElementById('insight-right'),
    prediction: document.getElementById('prediction-box'),
    price: document.getElementById('price-trend'),
    candlestick: document.getElementById('candlestick'),
    volume: document.getElementById('volume-chart'),
    bollinger: document.getElementById('bollinger-chart'),
    returns: document.getElementById('returns-chart'),
    rsi: document.getElementById('rsi-chart'),
    comparison: document.getElementById('comparison-chart'),
    comparisonVolume: document.getElementById('comparison-volume-chart'),
    comparisonTable: document.getElementById('comparison-table'),
    summaryTable: document.getElementById('summary-table'),
    rawDataTable: document.getElementById('raw-data-table'),
};

async function fetchCompanies() {
    const response = await fetch(`${API_BASE}/companies`);
    const data = await response.json();
    const companies = data.companies.sort((a, b) => a.name.localeCompare(b.name));
    selectors.company.innerHTML = companies
        .map(item => `<option value="${item.ticker}">${item.name}</option>`)
        .join('');
    selectors.compare.innerHTML = companies
        .map(item => `<option value="${item.ticker}">${item.name}</option>`)
        .join('');
}

function getSelectedCompareTickers() {
    const selected = Array.from(selectors.compare.selectedOptions)
        .slice(0, 5)
        .map(option => option.value);
    console.log('[DEBUG] Selected tickers:', selected);
    return selected;
}

function getCurrentSettings() {
    return {
        ticker: selectors.company.value,
        period: selectors.period.value,
        showPrice: selectors.showPrice.checked,
        showCandle: selectors.showCandle.checked,
        showVolume: selectors.showVolume.checked,
        showBollinger: selectors.showBollinger.checked,
        showReturns: selectors.showReturns.checked,
        showRsi: selectors.showRsi.checked,
        compareTickers: getSelectedCompareTickers(),
    };
}

function buildMetricCard(title, value, highlightClass = '') {
    return `
        <div class="metric-card">
            <h3>${title}</h3>
            <h2 class="${highlightClass}">${value}</h2>
        </div>
    `;
}

function buildKeyValueBox(title, lines) {
    return `
        <div>
            <strong>${title}</strong><br><br>
            ${lines.map(line => `• ${line}<br>`).join('')}
        </div>
    `;
}

function renderTable(container, headers, rows) {
    if (!rows.length) {
        container.innerHTML = '<p style="color:#8d98b8;">No data available.</p>';
        return;
    }

    const heading = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
    const body = rows.map(row => `
        <tr>${headers.map(column => `<td>${row[column] != null ? row[column] : 'N/A'}</td>`).join('')}</tr>
    `).join('');

    container.innerHTML = `<table><thead>${heading}</thead><tbody>${body}</tbody></table>`;
}

function renderSummaryStats(stats) {
    const rows = Object.entries(stats).map(([key, value]) => ({
        Metric: key,
        ...value,
    }));
    if (!rows.length) {
        containers.summaryTable.innerHTML = '<p style="color:#8d98b8;">No summary statistics available.</p>';
        return;
    }

    const headers = ['Metric', ...Object.keys(rows[0]).filter(key => key !== 'Metric')];
    renderTable(containers.summaryTable, headers, rows);
}

function renderRawData(rows) {
    if (!rows.length) {
        containers.rawDataTable.innerHTML = '<p style="color:#8d98b8;">No raw data available.</p>';
        return;
    }

    const headers = Object.keys(rows[0]);
    renderTable(containers.rawDataTable, headers, rows);
}

function renderComparisonSummary(rows) {
    if (!rows.length) {
        containers.comparisonTable.innerHTML = '<p style="color:#8d98b8;">Select 2 or more companies to compare.</p>';
        return;
    }

    const formattedRows = rows.map(row => ({
        Company: row.company,
        'Current Price (₹)': row.current_price,
        'Highest (₹)': row.highest,
        'Lowest (₹)': row.lowest,
        'Return (%)': row.return,
        'Avg Volume': row.avg_volume,
        'Volatility (%)': row.volatility,
    }));
    const headers = Object.keys(formattedRows[0]);
    renderTable(containers.comparisonTable, headers, formattedRows);
}

function updateCleaningReport(summary) {
    containers.cleaningGrid.innerHTML = `
        ${buildMetricCard('Original Rows', summary.original_rows)}
        ${buildMetricCard('After Cleaning', summary.cleaned_rows)}
        ${buildMetricCard('Missing Values Found', summary.missing_values)}
        ${buildMetricCard('Outliers Capped', summary.outliers_capped)}
    `;
    containers.cleaningDetails.innerHTML = `
        <p>Cleaning Steps Applied:</p>
        <ul>
            <li>✅ Removed duplicate records</li>
            <li>✅ Handled missing values (forward-fill + backward-fill)</li>
            <li>✅ Detected outliers using IQR method (3× IQR threshold)</li>
            <li>✅ Capped extreme values to boundary limits</li>
            <li>✅ Ensured correct numeric data types</li>
        </ul>
    `;
}

function updateMetrics(insights) {
    containers.metricsRow1.innerHTML = `
        ${buildMetricCard('Current Price', `₹${insights.current_price}`)}
        ${buildMetricCard('Total Return', `${insights.total_return > 0 ? '+' : ''}${insights.total_return}%`, insights.total_return > 0 ? 'positive' : 'negative')}
        ${buildMetricCard('Highest Price', `₹${insights.highest_price}`, 'positive')}
        ${buildMetricCard('Lowest Price', `₹${insights.lowest_price}`, 'negative')}
        ${buildMetricCard('Average Price', `₹${insights.average_price}`)}
    `;

    containers.metricsRow2.innerHTML = `
        ${buildMetricCard('Overall Trend', insights.overall_trend)}
        ${buildMetricCard('Volatility', insights.volatility_level)}
        ${buildMetricCard('RSI', insights.rsi)}
        ${buildMetricCard('Avg Volume', insights.avg_volume >= 1e6 ? `${(insights.avg_volume / 1e6).toFixed(1)}M` : `${(insights.avg_volume / 1e3).toFixed(1)}K`)}
    `;
}

function updateInsights(insights) {
    containers.insightLeft.innerHTML = buildKeyValueBox('📈 Descriptive Analytics — What Happened?', [
        `Highest price: ₹${insights.highest_price} on ${insights.highest_date}`,
        `Lowest price: ₹${insights.lowest_price} on ${insights.lowest_date}`,
        `Price range: ₹${insights.price_range}`,
        `Bullish days: ${insights.bullish_days} | Bearish days: ${insights.bearish_days} | Neutral: ${insights.neutral_days}`,
    ]);

    containers.insightRight.innerHTML = buildKeyValueBox('🔍 Diagnostic Analytics — Why Did It Happen?', [
        `RSI Signal: ${insights.rsi_signal}`,
        `Volatility: ${insights.volatility}% daily std dev`,
        `Max volume: ${insights.max_volume.toLocaleString()} on ${insights.max_volume_date}`,
        `High volume days often indicate institutional activity or major news events`,
    ]);

    const color = insights.total_return >= 0 ? '#00e676' : '#ff5252';
    containers.prediction.innerHTML = `
        <div style="border-left-color: ${color};">
            <strong>🔮 Predictive Insight (Moving Average Crossover)</strong><br><br>
            ${insights.prediction_text}
        </div>
    `;
}

function showOrHideChart(cardId, visible) {
    const card = document.getElementById(cardId);
    if (card) {
        card.style.display = visible ? 'block' : 'none';
    }
}

async function fetchStockApi() {
    const settings = getCurrentSettings();
    const params = new URLSearchParams({ ticker: settings.ticker, period: settings.period });
    const response = await fetch(`${API_BASE}/stock?${params.toString()}`);
    if (!response.ok) {
        throw new Error((await response.json()).detail || 'Unable to fetch stock data.');
    }
    return response.json();
}

async function fetchComparisonApi(tickers) {
    if (!tickers.length) {
        throw new Error('No tickers selected for comparison.');
    }
    const params = new URLSearchParams();
    tickers.forEach(ticker => params.append('tickers', ticker));
    params.append('period', selectors.period.value);
    const url = `${API_BASE}/compare?${params.toString()}`;
    console.log('[DEBUG] Fetching comparison data:', url);
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `API error: ${response.status}`);
    }
    const data = await response.json();
    console.log('[DEBUG] Comparison data received:', data);
    return data;
}

async function fetchAndRender() {
    showLoading(true);
    containers.status.textContent = 'Fetching data...';

    try {
        const stockData = await fetchStockApi();
        const settings = getCurrentSettings();

        updateCleaningReport(stockData.cleaning_summary);
        updateMetrics(stockData.insights);
        updateInsights({
            ...stockData.insights,
            prediction_text: stockData.prediction,
        });
        renderSummaryStats(stockData.summary_statistics);
        renderRawData(stockData.raw_preview);

        showOrHideChart('price-card', settings.showPrice);
        showOrHideChart('candlestick-card', settings.showCandle);
        showOrHideChart('volume-card', settings.showVolume);
        showOrHideChart('bollinger-card', settings.showBollinger);
        showOrHideChart('returns-card', settings.showReturns);
        showOrHideChart('rsi-card', settings.showRsi);

        if (settings.showPrice) {
            renderPriceTrendChart(containers.price, stockData.chart_data, stockData.company_name);
        }
        if (settings.showCandle) {
            renderCandlestickChart(containers.candlestick, stockData.chart_data, stockData.company_name);
        }
        if (settings.showVolume) {
            renderVolumeChart(containers.volume, stockData.chart_data, stockData.company_name);
        }
        if (settings.showBollinger) {
            renderBollingerChart(containers.bollinger, stockData.chart_data, stockData.company_name);
        }
        if (settings.showReturns) {
            renderReturnsChart(containers.returns, stockData.chart_data, stockData.company_name);
        }
        if (settings.showRsi) {
            renderRsiChart(containers.rsi, stockData.chart_data, stockData.company_name);
        }

        console.log('[DEBUG] Comparison tickers count:', settings.compareTickers.length);
        if (settings.compareTickers.length >= 2) {
            try {
                const compareData = await fetchComparisonApi(settings.compareTickers);
                if (compareData.comparison_series && compareData.comparison_series.length > 0) {
                    console.log('[DEBUG] Rendering comparison chart with', compareData.comparison_series.length, 'series');
                    renderComparisonChart(containers.comparison, compareData.comparison_series);
                    renderComparisonSummary(compareData.comparison_summary);
                    // Render volume comparison chart
                    if (compareData.comparison_volume && compareData.comparison_volume.length > 0) {
                        console.log('[DEBUG] Rendering volume comparison with', compareData.comparison_volume.length, 'series');
                        renderComparisonVolumeChart(containers.comparisonVolume, compareData.comparison_volume);
                    } else {
                        containers.comparisonVolume.innerHTML = '';
                    }
                } else {
                    containers.comparison.innerHTML = '<p style="color:#ff6b6b;">No valid comparison data returned from server.</p>';
                    containers.comparisonTable.innerHTML = '';
                    containers.comparisonVolume.innerHTML = '';
                }
            } catch (error) {
                console.error('[ERROR] Comparison fetch error:', error.message);
                containers.comparison.innerHTML = `<p style="color:#ff6b6b;">Error: ${error.message}</p>`;
                containers.comparisonTable.innerHTML = '';
                containers.comparisonVolume.innerHTML = '';
            }
        } else {
            containers.comparison.innerHTML = '<p style="color:#8d98b8;">Select 2 or more companies to view the comparison chart.</p>';
            containers.comparisonTable.innerHTML = '<p style="color:#8d98b8;">Select 2 or more companies to view the comparison table.</p>';
            containers.comparisonVolume.innerHTML = '';
        }

        const now = new Date();
        containers.updated.textContent = `Last updated: ${now.toLocaleString()}`;
        containers.status.textContent = `Showing analytics for ${stockData.company_name} (${stockData.period}).`;
        animateDashboard();
    } catch (error) {
        containers.status.textContent = `Error: ${error.message}`;
        containers.updated.textContent = '';
    } finally {
        showLoading(false);
    }
}

function applyCompareLimit() {
    const selected = Array.from(selectors.compare.selectedOptions);
    if (selected.length > 5) {
        selected[5].selected = false;
    }
}

function addEventListeners() {
    selectors.company.addEventListener('change', fetchAndRender);
    selectors.period.addEventListener('change', fetchAndRender);
    selectors.showPrice.addEventListener('change', fetchAndRender);
    selectors.showCandle.addEventListener('change', fetchAndRender);
    selectors.showVolume.addEventListener('change', fetchAndRender);
    selectors.showBollinger.addEventListener('change', fetchAndRender);
    selectors.showReturns.addEventListener('change', fetchAndRender);
    selectors.showRsi.addEventListener('change', fetchAndRender);
    selectors.compare.addEventListener('change', () => {
        console.log('[DEBUG] Compare dropdown change detected');
        applyCompareLimit();
        const selectedCount = Array.from(selectors.compare.selectedOptions).length;
        console.log('[DEBUG] Currently selected:', selectedCount, 'companies');
        fetchAndRender();
    });
    selectors.refresh.addEventListener('click', fetchAndRender);
}

async function initDashboard() {
    showLoading(true);
    await fetchCompanies();
    addEventListeners();
    await fetchAndRender();
    setInterval(fetchAndRender, 300000);
}

window.addEventListener('load', () => {
    initDashboard().catch(err => {
        containers.status.textContent = `Initialization failed: ${err.message}`;
        showLoading(false);
    });
});
