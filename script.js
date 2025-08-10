function calculateSalary() {
    // Get values from the input fields
    const currentSalary = parseFloat(document.getElementById('currentSalary').value) || 0;
    const fixedDeductions = parseFloat(document.getElementById('fixedDeductions').value) || 0;
    const canteenDeductions = parseFloat(document.getElementById('canteenDeductions').value) || 0;
    const overtimePayPerHour = parseFloat(document.getElementById('overtimePayPerHour').value) || 0;
    const overtimeHours = parseFloat(document.getElementById('overtimeHours').value) || 0;

    // Calculate overtime earnings
    const overtimeEarnings = overtimePayPerHour * overtimeHours;

    // Calculate total deductions
    const totalDeductions = fixedDeductions + canteenDeductions;

    // Calculate the net salary
    const netSalary = (currentSalary + overtimeEarnings) - totalDeductions;

    // Display the result
    document.getElementById('netSalary').textContent = netSalary.toFixed(2);
}