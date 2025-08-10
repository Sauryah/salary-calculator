document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("salaryForm");
  const grossAmount = document.getElementById("grossAmount");
  const taxAmount = document.getElementById("taxAmount");
  const insuranceAmount = document.getElementById("insuranceAmount");
  const netAmount = document.getElementById("netAmount");
  const resultSection = document.getElementById("resultSection");
  const historyList = document.getElementById("historyList");

  const toggleThemeBtn = document.getElementById("toggleTheme");
  const exportPDFBtn = document.getElementById("exportPDF");
  const exportCSVBtn = document.getElementById("exportCSV");

  // Theme toggle
  toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    toggleThemeBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
  });

  // Load history
  const loadHistory = () => {
    historyList.innerHTML = "";
    const history = JSON.parse(localStorage.getItem("salaryHistory") || "[]");
    history.forEach((entry, idx) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${entry.date} - Net: $${entry.net}</span>
        <button data-idx="${idx}">❌</button>
      `;
      historyList.appendChild(li);
    });
  };

  historyList.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      const idx = e.target.getAttribute("data-idx");
      let history = JSON.parse(localStorage.getItem("salaryHistory") || "[]");
      history.splice(idx, 1);
      localStorage.setItem("salaryHistory", JSON.stringify(history));
      loadHistory();
    }
  });

  // Form submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const base = parseFloat(document.getElementById("baseSalary").value) || 0;
    const bonus = parseFloat(document.getElementById("bonus").value) || 0;
    const taxRate = parseFloat(document.getElementById("taxRate").value) || 0;
    const insurance = parseFloat(document.getElementById("insurance").value) || 0;

    const gross = base + bonus;
    const tax = (taxRate / 100) * gross;
    const net = gross - tax - insurance;

    grossAmount.textContent = `$${gross.toFixed(2)}`;
    taxAmount.textContent = `$${tax.toFixed(2)}`;
    insuranceAmount.textContent = `$${insurance.toFixed(2)}`;
    netAmount.textContent = `$${net.toFixed(2)}`;

    resultSection.style.display = "block";

    // Save history
    const history = JSON.parse(localStorage.getItem("salaryHistory") || "[]");
    history.unshift({
      date: new Date().toLocaleString(),
      net: net.toFixed(2),
    });
    localStorage.setItem("salaryHistory", JSON.stringify(history));
    loadHistory();
  });

  // Exports
  exportPDFBtn.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Salary Calculation", 10, 10);
    doc.text(`Gross: ${grossAmount.textContent}`, 10, 20);
    doc.text(`Tax: ${taxAmount.textContent}`, 10, 30);
    doc.text(`Insurance: ${insuranceAmount.textContent}`, 10, 40);
    doc.text(`Net: ${netAmount.textContent}`, 10, 50);
    doc.save("salary.pdf");
  });

  exportCSVBtn.addEventListener("click", () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Gross,Tax,Insurance,Net", `${grossAmount.textContent},${taxAmount.textContent},${insuranceAmount.textContent},${netAmount.textContent}`]
        .join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "salary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  loadHistory();
});
