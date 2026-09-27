/**
 * Chart.js Initialization Helpers with Custom Gradient Fills & Animations
 */

function renderScoreHistoryChart(canvasId, dates, scores) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Create Gradient
    const chartCtx = ctx.getContext('2d');
    const gradient = chartCtx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(43, 108, 238, 0.45)');
    gradient.addColorStop(1, 'rgba(43, 108, 238, 0.01)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'PHQ-9 Score',
                data: scores,
                borderColor: '#2b6cee',
                borderWidth: 3,
                backgroundColor: gradient,
                fill: true,
                tension: 0.35,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#2b6cee',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleFont: { family: 'Inter', size: 13, weight: 'bold' },
                    bodyFont: { family: 'Inter', size: 12 },
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return ' Score: ' + context.parsed.y + ' / 27';
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 27,
                    grid: { color: 'rgba(226, 232, 240, 0.6)' },
                    ticks: { font: { family: 'Inter', size: 11 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { family: 'Inter', size: 11 } }
                }
            }
        }
    });
}

function renderMoodChart(canvasId, dates, moods) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Mood Level (1-5)',
                data: moods,
                backgroundColor: 'rgba(35, 194, 165, 0.75)',
                borderColor: '#23c2a5',
                borderWidth: 1.5,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    min: 1,
                    max: 5,
                    ticks: {
                        stepSize: 1,
                        callback: function(val) {
                            const labels = ['', 'Very Low', 'Low', 'Neutral', 'Good', 'Very Good'];
                            return labels[val] || val;
                        }
                    }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderSentimentChart(canvasId, sentimentArray) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Positive 😊', 'Neutral 😐', 'Negative 😔'],
            datasets: [{
                data: sentimentArray,
                backgroundColor: ['#22c55e', '#64748b', '#ef4444'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            },
            cutout: '70%'
        }
    });
}
