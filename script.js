document.getElementById('calculateBtn').addEventListener('click', calculateSalary);
document.getElementById('toggleTheme').addEventListener('click', toggleTheme);
document.getElementById('exportPDF').addEventListener('click', exportToPDF);
document.getElementById('exportExcel').addEventListener('click', exportToExcel);

function calculateSalary() {
    const salary = parseFloat(document.getElementById('currentSalary').value) || 0;
    const fixedDed = parseFloat(document.getElementById('fixedDeductions').value) || 0;
    const canteenDed = parseFloat(document.getElementById('canteenDeductions').value) || 0;
    const overtimeRate = parseFloat(document.getElementById('overtimePayPerHour').value) || 0;
    const overtimeHrs = parseFloat(document.getElementById('overtimeHours').value) || 0;

    const overtimeEarnings = overtimeRate * overtimeHrs;
    const totalDeductions = fixedDed + canteenDed;
    const netSalary = (salary + overtimeEarnings) - totalDeductions;

    document.getElementById('netSalary').textContent = netSalary.toFixed(2);

    const breakdownTable = document.querySelector('#salaryBreakdown tbody');
    breakdownTable.innerHTML = `
        <tr><td>Base Salary</td><td>${salary.toFixed(2)}</td></tr>
        <tr><td>Overtime Earnings</td><td>${overtimeEarnings.toFixed(2)}</td></tr>
        <tr><td>Total Deductions</td><td>${totalDeductions.toFixed(2)}</td></tr>
        <tr><td><strong>Net Salary</strong></td><td><strong>${netSalary.toFixed(2)}</strong></td></tr>
    `;

    // Save to local storage
    localStorage.setItem('salaryData', JSON.stringify({
        salary, fixedDed, canteenDed, overtimeRate, overtimeHrs
    }));
}

// Load saved data
window.onload = () => {
    const savedData = JSON.parse(localStorage.getItem('salaryData'));
    if (savedData) {
        document.getElementById('currentSalary').value = savedData.salary;
        document.getElementById('fixedDeductions').value = savedData.fixedDed;
        document.getElementById('canteenDeductions').value = savedData.canteenDed;
        document.getElementById('overtimePayPerHour').value = savedData.overtimeRate;
        document.getElementById('overtimeHours').value = savedData.overtimeHrs;
    }
};

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Salary Breakdown", 10, 10);
    doc.autoTable({ html: '#salaryBreakdown' });
    doc.save("salary_breakdown.pdf");
}

function exportToExcel() {
    const table = document.getElementById("salaryBreakdown");
    const wb = XLSX.utils.table_to_book(table);
    XLSX.writeFile(wb, "salary_breakdown.xlsx");
}
