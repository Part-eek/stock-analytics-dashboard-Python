function renderPriceTrendChart(containerId, data, companyName) {
    const traces = [
        {
            x: data.dates,
            y: data.close,
            mode: 'lines',
            name: 'Close Price',
            line: { color: '#667eea', width: 2 },
            fill: 'none',
        },
    ];

    if (data.sma20.length) {
        traces.push({
            x: data.dates,
            y: data.sma20,
            mode: 'lines',
            name: '20-Day SMA',
            line: { color: '#00e676', width: 1.7, dash: 'dash' },
        });
    }

    if (data.sma50.length) {
        traces.push({
            x: data.dates,
            y: data.sma50,
            mode: 'lines',
            name: '50-Day SMA',
            line: { color: '#ff5252', width: 1.7, dash: 'dash' },
        });
    }

    if (data.high_point && data.high_point.date) {
        traces.push({
            x: [data.high_point.date],
            y: [data.high_point.value],
            mode: 'markers+text',
            marker: { color: '#00e676', size: 12, line: { color: '#fff', width: 2 } },
            text: [`High: ₹${data.high_point.value.toFixed(2)}`],
            textposition: 'top center',
            showlegend: false,
        });
    }

    if (data.low_point && data.low_point.date) {
        traces.push({
            x: [data.low_point.date],
            y: [data.low_point.value],
            mode: 'markers+text',
            marker: { color: '#ff5252', size: 12, line: { color: '#fff', width: 2 } },
            text: [`Low: ₹${data.low_point.value.toFixed(2)}`],
            textposition: 'bottom center',
            showlegend: false,
        });
    }

    const layout = {
        paper_bgcolor: '#0e1117',
        plot_bgcolor: '#0e1117',
        margin: { t: 40, l: 50, r: 20, b: 50 },
        title: { text: `${companyName} — Price Trend`, font: { color: '#fff', size: 16 } },
        xaxis: { gridcolor: '#222222', color: '#aaa' },
        yaxis: { gridcolor: '#222222', color: '#aaa', title: 'Price (₹)' },
        legend: { bgcolor: 'rgba(26,26,46,0.8)', font: { color: '#fff' } },
    };

    Plotly.react(containerId, traces, layout, { responsive: true });
}

function renderCandlestickChart(containerId, data, companyName) {
    const traces = [
        {
            x: data.dates,
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
            increasing: { line: { color: '#00e676' }, fillcolor: '#00e676' },
            decreasing: { line: { color: '#ff5252' }, fillcolor: '#ff5252' },
            type: 'candlestick',
            name: 'Candlestick',
        },
    ];

    if (data.sma20.length) {
        traces.push({
            x: data.dates,
            y: data.sma20,
            mode: 'lines',
            name: '20-Day SMA',
            line: { color: '#667eea', width: 1.7, dash: 'dash' },
        });
    }

    if (data.sma50.length) {
        traces.push({
            x: data.dates,
            y: data.sma50,
            mode: 'lines',
            name: '50-Day SMA',
            line: { color: '#ffd740', width: 1.7, dash: 'dash' },
        });
    }

    const layout = {
        paper_bgcolor: '#0e1117',
        plot_bgcolor: '#0e1117',
        margin: { t: 40, l: 50, r: 20, b: 50 },
        title: { text: `${companyName} — Candlestick Chart`, font: { color: '#fff', size: 16 } },
        xaxis: { gridcolor: '#222222', color: '#aaa', rangeslider: { visible: false } },
        yaxis: { gridcolor: '#222222', color: '#aaa', title: 'Price (₹)' },
        legend: { bgcolor: 'rgba(26,26,46,0.8)', font: { color: '#fff' } },
    };

    Plotly.react(containerId, traces, layout, { responsive: true });
}

function renderVolumeChart(containerId, data, companyName) {
    const barColors = data.close.map((close, index) => {
        return close >= data.open[index] ? '#00e676' : '#ff5252';
    });

    const traces = [
        {
            x: data.dates,
            y: data.volume,
            type: 'bar',
            marker: { color: barColors },
            name: 'Volume',
        },
    ];

    if (data.volume_ma.length) {
        traces.push({
            x: data.dates,
            y: data.volume_ma,
            mode: 'lines',
            name: '20-Day Avg Volume',
            line: { color: '#667eea', width: 1.7 },
        });
    }

    const layout = {
        paper_bgcolor: '#0e1117',
        plot_bgcolor: '#0e1117',
        margin: { t: 40, l: 50, r: 20, b: 50 },
        title: { text: `${companyName} — Trading Volume`, font: { color: '#fff', size: 16 } },
        xaxis: { gridcolor: '#222222', color: '#aaa' },
        yaxis: { gridcolor: '#222222', color: '#aaa', title: 'Volume' },
        legend: { bgcolor: 'rgba(26,26,46,0.8)', font: { color: '#fff' } },
    };

    Plotly.react(containerId, traces, layout, { responsive: true });
}

function renderBollingerChart(containerId, data, companyName) {
    const traces = [
        {
            x: data.dates,
            y: data.close,
            mode: 'lines',
            name: 'Close Price',
            line: { color: '#667eea', width: 1.7 },
        },
        {
            x: data.dates,
            y: data.bb_upper,
            mode: 'lines',
            name: 'Upper Band',
            line: { color: '#ff5252', width: 1, dash: 'dash' },
        },
        {
            x: data.dates,
            y: data.bb_lower,
            mode: 'lines',
            name: 'Lower Band',
            line: { color: '#00e676', width: 1, dash: 'dash' },
            fill: 'tonexty',
            fillcolor: 'rgba(102, 126, 234, 0.08)',
        },
    ];

    const layout = {
        paper_bgcolor: '#0e1117',
        plot_bgcolor: '#0e1117',
        margin: { t: 40, l: 50, r: 20, b: 50 },
        title: { text: `${companyName} — Bollinger Bands`, font: { color: '#fff', size: 16 } },
        xaxis: { gridcolor: '#222222', color: '#aaa' },
        yaxis: { gridcolor: '#222222', color: '#aaa', title: 'Price (₹)' },
        legend: { bgcolor: 'rgba(26,26,46,0.8)', font: { color: '#fff' } },
    };

    Plotly.react(containerId, traces, layout, { responsive: true });
}

function renderReturnsChart(containerId, data, companyName) {
    const traces = [
        {
            x: data.daily_return,
            type: 'histogram',
            nbinsx: 50,
            marker: { color: '#667eea' },
            opacity: 0.85,
            name: 'Daily Return',
        },
    ];

    const mean = data.daily_return.reduce((sum, value) => sum + value, 0) / data.daily_return.length || 0;
    const layout = {
        paper_bgcolor: '#0e1117',
        plot_bgcolor: '#0e1117',
        margin: { t: 40, l: 50, r: 20, b: 50 },
        title: { text: `${companyName} — Daily Returns Distribution`, font: { color: '#fff', size: 16 } },
        xaxis: { gridcolor: '#222222', color: '#aaa', title: 'Daily Return (%)' },
        yaxis: { gridcolor: '#222222', color: '#aaa', title: 'Frequency' },
        shapes: [
            {
                type: 'line',
                x0: mean,
                x1: mean,
                y0: 0,
                y1: 1,
                yref: 'paper',
                line: { color: '#ffd740', width: 2, dash: 'dash' },
            },
        ],
        annotations: [
            {
                x: mean,
                y: 1.02,
                yref: 'paper',
                text: `Mean: ${mean.toFixed(2)}%`,
                showarrow: false,
                font: { color: '#ffd740' },
            },
        ],
        legend: { bgcolor: 'rgba(26,26,46,0.8)', font: { color: '#fff' } },
    };

    Plotly.react(containerId, traces, layout, { responsive: true });
}

function renderRsiChart(containerId, data, companyName) {
    const traces = [
        {
            x: data.dates,
            y: data.rsi,
            mode: 'lines',
            name: 'RSI',
            line: { color: '#667eea', width: 1.8 },
        },
    ];

    const layout = {
        paper_bgcolor: '#0e1117',
        plot_bgcolor: '#0e1117',
        margin: { t: 40, l: 50, r: 20, b: 50 },
        title: { text: `${companyName} — RSI (Relative Strength Index)`, font: { color: '#fff', size: 16 } },
        xaxis: { gridcolor: '#222222', color: '#aaa' },
        yaxis: { gridcolor: '#222222', color: '#aaa', title: 'RSI', range: [0, 100] },
        shapes: [
            { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 70, y1: 70, line: { color: '#ff5252', dash: 'dash' } },
            { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 30, y1: 30, line: { color: '#00e676', dash: 'dash' } },
        ],
        legend: { bgcolor: 'rgba(26,26,46,0.8)', font: { color: '#fff' } },
    };

    Plotly.react(containerId, traces, layout, { responsive: true });
}

function renderComparisonChart(containerId, series) {
    const traces = series.map(item => ({
        x: item.dates,
        y: item.normalized,
        mode: 'lines',
        name: item.name,
        line: { width: 1.8 },
    }));

    const layout = {
        paper_bgcolor: '#0e1117',
        plot_bgcolor: '#0e1117',
        margin: { t: 40, l: 50, r: 20, b: 50 },
        title: { text: 'Company Comparison — Normalized Price (Base = 100)', font: { color: '#fff', size: 16 } },
        xaxis: { gridcolor: '#222222', color: '#aaa' },
        yaxis: { gridcolor: '#222222', color: '#aaa', title: 'Normalized Price' },
        legend: { bgcolor: 'rgba(26,26,46,0.8)', font: { color: '#fff' } },
    };

    Plotly.react(containerId, traces, layout, { responsive: true });
}

function renderComparisonVolumeChart(containerId, volumeData) {
    const colors = ['#667eea', '#00e676', '#ff9800', '#ff5252', '#ab47bc'];
    const traces = volumeData.map((item, idx) => ({
        x: item.dates,
        y: item.volume,
        type: 'bar',
        name: item.name,
        marker: { color: colors[idx % colors.length] },
        opacity: 0.7,
    }));

    const layout = {
        paper_bgcolor: '#0e1117',
        plot_bgcolor: '#0e1117',
        margin: { t: 40, l: 50, r: 20, b: 50 },
        title: { text: 'Volume Comparison — Trading Volume', font: { color: '#fff', size: 16 } },
        xaxis: { gridcolor: '#222222', color: '#aaa' },
        yaxis: { gridcolor: '#222222', color: '#aaa', title: 'Volume' },
        legend: { bgcolor: 'rgba(26,26,46,0.8)', font: { color: '#fff' } },
        barmode: 'group',
    };

    Plotly.react(containerId, traces, layout, { responsive: true });
}

function clearElement(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML = '';
    }
}
