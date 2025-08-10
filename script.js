// script.js
import { Chart, registerables } from 'https://cdn.jsdelivr.net/npm/chart.js/dist/chart.esm.js';
Chart.register(...registerables);

// Elements
const startingDie = document.getElementById('startingDie');
const elongationPercentage = document.getElementById('elongationPercentage');
const numberOfDies = document.getElementById('numberOfDies');
const calculateBtn = document.getElementById('calculateBtn');
const clearBtn = document.getElementById('clearBtn');
const dieList = document.getElementById('dieList');
const summaryMessage = document.getElementById('summaryMessage');
const resultSection = document.getElementById('resultSection');
const exportPdf = document.getElementById('exportPdf');
const exportXlsx = document.getElementById('exportXlsx');
const saveHistory = document.getElementById('saveHistory');
const historyList = document.getElementById('historyList');
const copyAll = document.getElementById('copyAll');
const themeSwitch = document.getElementById('themeSwitch');

// Chart
const ctx = document.getElementById('diesChart').getContext('2d');
let diesChart = new Chart(ctx, {
  type: 'line',
  data: { labels: [], datasets: [{ label: 'Die size', data: [], tension: 0.3, fill: false }] },
  options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { display: false } } }
});

// Safe localStorage wrapper
const storageAvailable = (() => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
})();

const safeStorage = {
  getItem: (key) => {
    if (!storageAvailable) return null;
    try { return localStorage.getItem(key); } catch { return null; }
  },
  setItem: (key, value) => {
    if (!storageAvailable) return;
    try { localStorage.setItem(key, value); } catch {}
  }
};

// Theme
if (safeStorage.getItem('theme') === 'dark') {
  if (window.innerWidth > 720) {
    document.body.classList.add('dark');
    themeSwitch.checked = true;
  }
}

themeSwitch.addEventListener('change', () => {
  // Only allow dark mode toggle on desktop width
  if (window.innerWidth <= 720) {
    themeSwitch.checked = false;
    return;
  }
  document.body.classList.toggle('dark');
  safeStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// Listen window resize to disable dark mode on small screens
window.addEventListener('resize', () => {
  if (window.innerWidth <= 720 && document.body.classList.contains('dark')) {
    document.body.classList.remove('dark');
    themeSwitch.checked = false;
    safeStorage.setItem('theme', 'light');
  }
});

// Load history
const loadHistory = () => {
  const arr = JSON.parse(safeStorage.getItem('dieHistory') || '[]');
  historyList.innerHTML = '';
  arr.slice().reverse().forEach((s, i) => {
    const li = document.createElement('li');
    li.textContent = `${s.date} — ${s.summary}`;
    li.addEventListener('click', () => {
      restoreSession(s);
    });
    historyList.appendChild(li);
  });
};

// Restore session helper
const restoreSession = (s) => {
  startingDie.value = s.start;
  elongationPercentage.value = s.elon;
  numberOfDies.value = s.count;
  document.querySelectorAll('input[name="direction"]').forEach(r => r.checked = (r.value === s.dir));
  calculate();
};

// Calculation
const getDirection = () => document.querySelector('input[name="direction"]:checked').value;

function calculate() {
  dieList.innerHTML = '';
  summaryMessage.textContent = '';

  const start = parseFloat(startingDie.value);
  const elong = parseFloat(elongationPercentage.value);
  const count = parseInt(numberOfDies.value, 10);
  const dir = getDirection();

  if (![start, elong, count].every(v => !isNaN(v) && v > 0)) {
    summaryMessage.textContent = '⚠ Please enter valid positive numbers in all fields.';
    resultSection.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  const factor = Math.sqrt(1 + (elong / 100));
  let current = start;
  const arr = [current];
  for (let i = 0; i < count; i++) {
    current = (dir === 'previous') ? current * factor : current / factor;
    arr.push(current);
  }

  const display = (dir === 'previous') ? arr.slice().reverse() : arr;

  summaryMessage.textContent = `${count} ${dir === 'previous' ? 'previous' : 'next'} dies from ${start.toFixed(3)}`;

  display.forEach((d, idx) => {
    const li = document.createElement('li');
    const label = (idx === 0) ? (dir === 'previous' ? 'Final Die' : 'Starting Die') : (dir === 'previous' ? `Prev ${idx}` : `Next ${idx}`);
    li.innerHTML = `<span>${label}</span><strong>${d.toFixed(3)}</strong>`;
    dieList.appendChild(li);
  });

  // update chart
  diesChart.data.labels = display.map((_, i) => i + 1);
  diesChart.data.datasets[0].data = display.map(d => Number(d.toFixed(6)));
  diesChart.update();

  resultSection.scrollIntoView({ behavior: 'smooth' });
}

calculateBtn.addEventListener('click', calculate);
clearBtn.addEventListener('click', () => {
  startingDie.value = '';
  elongationPercentage.value = '';
  numberOfDies.value = '';
  dieList.innerHTML = '';
  summaryMessage.textContent = '';
  diesChart.data.labels = [];
  diesChart.data.datasets[0].data = [];
  diesChart.update();
});

// Exports
exportPdf.addEventListener('click', async () => {
  exportPdf.disabled = true;
  try {
    const el = document.querySelector('.card');
    const canvas = await html2canvas(el, { scale: 2 });
    const img = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(img, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('die-schedule.pdf');
  } catch (err) {
    alert('Failed to export PDF: ' + err.message);
  } finally {
    exportPdf.disabled = false;
  }
});
