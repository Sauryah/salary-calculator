// Format number as Indian Rupees
function formatRupee(amount) {
    return new Intl.NumberFormat('en-IN', { 
        style: 'currency', 
        currency: 'INR' 
    }).format(amount);
}

function calculateSalary() {
    // Get values from inputs
    const currentSalary = parseFloat(document.getElementById('currentSalary').value) || 0;
    const fixedDeductions = parseFloat(document.getElementById('fixedDeductions').value) || 0;
    const canteenDeductions = parseFloat(document.getElementById('canteenDeductions').value) || 0;
    const overtimePayPerHour = parseFloat(document.getElementById('overtimePayPerHour').value) || 0;
    const overtimeHours = parseFloat(document.getElementById('overtimeHours').value) || 0;

    // Calculate overtime earnings
    const overtimeEarnings = overtimePayPerHour * overtimeHours;

    // Total deductions
    const totalDeductions = fixedDeductions + canteenDeductions;

    // Net Salary
    const netSalary = (currentSalary + overtimeEarnings) - totalDeductions;

    // Update result
    document.getElementById('netSalary').textContent = formatRupee(netSalary);

    // Show breakdown
    document.getElementById('breakdown').innerHTML = `
        <p><strong>Base Salary:</strong> ${formatRupee(currentSalary)}</p>
        <p><strong>Overtime Earnings:</strong> ${formatRupee(overtimeEarnings)}</p>
        <p><strong>Total Deductions:</strong> ${formatRupee(totalDeductions)}</p>
    `;
    document.getElementById('breakdown').classList.remove('hidden');
}

// Auto-update calculation when typing
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', calculateSalary);
});
