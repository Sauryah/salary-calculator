// Elements
const currentSalary = document.getElementById('currentSalary');
const fixedDeductions = document.getElementById('fixedDeductions');
const canteenDeductions = document.getElementById('canteenDeductions');
const overtimePayPerHour = document.getElementById('overtimePayPerHour');
const overtimeHours = document.getElementById('overtimeHours');
const hourlyPay = document.getElementById('hourlyPay');
const hoursWorked = document.getElementById('hoursWorked');

const calculateBtn = document.getElementById('calculateBtn');
const clearBtn = document.getElementById('clearBtn');
const netSalaryDisplay = document.getElementById('netSalary');
const exportPdf = document.getElementById('exportPdf');
const copyBtn = document.getElementById('copyBtn');
const saveBtn = document.getElementById('saveBtn');
const historyList = document.getElementById('historyList');

let historyData = [];

// Calculate function
function calculateSalary() {
  const salary = parseFloat(currentSalary.value) || 0;
  const fixedDeduct = parseFloat(fixedDeductions.value) || 0;
  const canteenDeduct = parseFloat(canteenDeductions.value) || 0;
  const otPay = parseFloat(overtimePayPerHour.value) || 0;
  const otHours = parseFloat(overtimeHours.value) || 0;
  const hrPay = parseFloat(hourlyPay.value) || 0;
  const hrsWorked = parseFloat(hoursWorked.value) || 0;

  const overtimeEarnings = otPay * otHours;
  const hourlyEarnings = hrPay * hrsWorked;
  const totalDeductions = fixedDeduct + canteenDeduct;

  const netSalary = salary + overtimeEarnings + hourlyEarnings - totalDeductions;

  netSalaryDisplay.textContent = `₹${netSalary.toFixed(2)}`;
  return netSalary;
}

// Clear inputs
function clearFields() {
  [
    currentSalary,
    fixedDeductions,
    canteenDeductions,
    overtimePayPerHour,
    overtimeHours,
    hourlyPay,
    hoursWorked,
  ].forEach(input => input.value = '');
  netSalaryDisplay.textContent = '₹0.00';
}

// Export PDF
async function exportAsPDF() {
  exportPdf.disabled = true;
  try {
    const el = document.querySelector('.calculator-container');
    const canvas = await html2canvas(el, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('salary-calculation.pdf');
  } catch (e) {
    alert('Error exporting PDF: ' + e.message);
  }
  exportPdf.disabled = false;
}

// Copy to clipboard
function copyToClipboard() {
  const text = netSalaryDisplay.textContent;
  if (text === '₹0.00') {
    alert('Please calculate salary first!');
    return;
  }
  navigator.clipboard.writeText(text)
    .then(() => alert('Net Salary copied to clipboard!'))
    .catch(() => alert('Failed to copy!'));
}

// Save session
function saveSession() {
  const netSalary = calculateSalary();

  if (netSalary === 0) {
    alert('Calculate salary before saving a session.');
    return;
  }

  const session = {
    date: new Date().toLocaleString(),
    currentSalary: currentSalary.value || '0',
    fixedDeductions: fixedDeductions.value || '0',
    canteenDeductions: canteenDeductions.value || '0',
    overtimePayPerHour: overtimePayPerHour.value || '0',
    overtimeHours: overtimeHours.value || '0',
    hourlyPay: hourlyPay.value || '0',
    hoursWorked: hoursWorked.value || '0',
    netSalary: netSalary.toFixed(2),
  };

  historyData.push(session);
  localStorage.setItem('salaryCalcHistory', JSON.stringify(historyData));
  renderHistory();
  alert('Session saved!');
}

// Render history list
function renderHistory() {
  historyList.innerHTML = '';

  if (historyData.length === 0) {
    historyList.innerHTML = '<li>No saved sessions</li>';
    return;
  }

  historyData.slice().reverse().forEach((session, index) => {
    const li = document.createElement('li');
    li.tabIndex = 0;
    li.textContent = `${session.date} — ₹${session.netSalary}`;
    li.title = 'Click to load this session';
    li.addEventListener('click', () => loadSession(session));
    li.addEventListener('keypress', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        loadSession(session);
      }
    });
    historyList.appendChild(li);
  });
}

// Load session back into inputs
function loadSession(session) {
  currentSalary.value = session.currentSalary;
  fixedDeductions.value = session.fixedDeductions;
  canteenDeductions.value = session.canteenDeductions;
  overtimePayPerHour.value = session.overtimePayPerHour;
  overtimeHours.value = session.overtimeHours;
  hourlyPay.value = session.hourlyPay;
  hoursWorked.value = session.hoursWorked;
  netSalaryDisplay.textContent = `₹${parseFloat(session.netSalary).toFixed(2)}`;
}

// Initialize from localStorage
function init() {
  const saved = localStorage.getItem('salaryCalcHistory');
  if (saved) {
    try {
      historyData = JSON.parse(saved);
    } catch {
      historyData = [];
    }
  }
  renderHistory();
}

calculateBtn.addEventListener('click', calculateSalary);
clearBtn.addEventListener('click', clearFields);
exportPdf.addEventListener('click', exportAsPDF);
copyBtn.addEventListener('click', copyToClipboard);
saveBtn.addEventListener('click', saveSession);

window.addEventListener('load', init);
