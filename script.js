let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let monthlyBudget = Number(localStorage.getItem("monthlyBudget")) || 0;

let editingExpenseId = null;

function addExpense() {
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const note = document.getElementById("note").value;
    const date = document.getElementById("date").value;

    if (!amount || !category || !date) {
        alert("Please enter amount, category and date.");
        return;
    }

    if (editingExpenseId !== null) {
        const expense = expenses.find(
            (expense) => expense.id === editingExpenseId
        );

        if (expense) {
            expense.amount = Number(amount);
            expense.category = category;
            expense.note = note || "No note";
            expense.date = date;
        }

        editingExpenseId = null;
        document.querySelector(".expense-form button").innerText = "Add Expense";

    } else {
        const expense = {
            id: Date.now(),
            amount: Number(amount),
            category: category,
            note: note || "No note",
            date: date
        };

        expenses.push(expense);
    }

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

    document.getElementById("amount").value = "";
    document.getElementById("category").value = "";
    document.getElementById("note").value = "";
    document.getElementById("date").value = "";

    displayExpenses();
}


function saveBudget() {
    const budget = document.getElementById("monthlyBudget").value;

    if (!budget || Number(budget) <= 0) {
        alert("Please enter a valid monthly budget.");
        return;
    }

    monthlyBudget = Number(budget);

    localStorage.setItem("monthlyBudget", monthlyBudget);

    document.getElementById("monthlyBudget").value = "";

    displayExpenses();

    alert("Monthly budget saved!");
}


function displayExpenses() {
    const expenseList = document.getElementById("expenseList");
    const totalAmount = document.getElementById("totalAmount");
    const todayAmount = document.getElementById("todayAmount");
    const monthAmount = document.getElementById("monthAmount");
    const budgetAmount = document.getElementById("budgetAmount");
    const remainingAmount = document.getElementById("remainingAmount");
    const budgetPercentage = document.getElementById("budgetPercentage");
    const progressFill = document.getElementById("progressFill");
    const categoryList = document.getElementById("categoryList");

    expenseList.innerHTML = "";
    categoryList.innerHTML = "";

    let total = 0;
    let todayTotal = 0;
    let monthTotal = 0;

    const categories = {};

    const today = new Date();

    const todayString =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0");

    const currentMonth =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0");


    expenses.forEach((expense) => {

        total += expense.amount;

        if (expense.date === todayString) {
            todayTotal += expense.amount;
        }

        if (expense.date.startsWith(currentMonth)) {
            monthTotal += expense.amount;

            if (!categories[expense.category]) {
                categories[expense.category] = 0;
            }

            categories[expense.category] += expense.amount;
        }


        const expenseItem = document.createElement("div");

        expenseItem.className = "expense-item";

        expenseItem.innerHTML = `
            <div class="expense-info">
                <strong>${expense.category}</strong>
                <small>${expense.note} • ${expense.date}</small>
            </div>

            <div>
                <span class="expense-amount">
                    ₹${expense.amount.toFixed(2)}
                </span>
<button
    class="edit-btn"
    onclick="editExpense(${expense.id})">
    ✏️
</button>
                <button
                    class="delete-btn"
                    onclick="deleteExpense(${expense.id})">
                    🗑️
                </button>
            </div>
        `;

        expenseList.appendChild(expenseItem);
    });


    totalAmount.textContent = total.toFixed(2);
    todayAmount.textContent = todayTotal.toFixed(2);
    monthAmount.textContent = monthTotal.toFixed(2);
    budgetAmount.textContent = monthlyBudget.toFixed(2);


    const remaining = monthlyBudget - monthTotal;

    remainingAmount.textContent = remaining.toFixed(2);


    // Budget Progress

    let percentage = 0;

    if (monthlyBudget > 0) {
        percentage = (monthTotal / monthlyBudget) * 100;
    }

    const displayPercentage = Math.min(percentage, 100);

    budgetPercentage.textContent = percentage.toFixed(1) + "%";

    progressFill.style.width = displayPercentage + "%";


    if (percentage >= 100) {
        progressFill.style.background = "red";
    } else if (percentage >= 80) {
        progressFill.style.background = "orange";
    } else {
        progressFill.style.background = "#22c55e";
    }


    if (remaining < 0) {
        remainingAmount.style.color = "red";
    } else {
        remainingAmount.style.color = "green";
    }


    // Category Spending

    Object.entries(categories).forEach(([category, amount]) => {

        const categoryItem = document.createElement("div");

        categoryItem.className = "category-item";

        const categoryPercentage =
            monthTotal > 0
                ? (amount / monthTotal) * 100
                : 0;

        categoryItem.innerHTML = `
            <div class="category-header">
                <span class="category-name">
                    ${category}
                </span>

                <span class="category-total">
                    ₹${amount.toFixed(2)}
                </span>
            </div>

            <div class="category-progress">
                <div
                    class="category-progress-fill"
                    style="width: ${categoryPercentage}%">
                </div>
            </div>
        `;

        categoryList.appendChild(categoryItem);
    });


    if (Object.keys(categories).length === 0) {
        categoryList.innerHTML =
            "<p>No expenses this month yet.</p>";
    }
}
function filterExpenses() {
    const search = document.getElementById("searchInput").value.toLowerCase().trim();
    const category = document.getElementById("filterCategory").value;
    const date = document.getElementById("filterDate").value;

    const filteredExpenses = expenses.filter(function(expense) {

        const text = JSON.stringify(expense).toLowerCase();

        const searchMatch = search === "" || text.includes(search);
        const categoryMatch = category === "" || expense.category === category;
        const dateMatch = date === "" || expense.date === date;

        return searchMatch && categoryMatch && dateMatch;
    });

    displayFilteredExpenses(filteredExpenses);
}
function displayFilteredExpenses(filteredExpenses) {
    const expenseList = document.getElementById("expenseList");
    expenseList.innerHTML = "";

    if (filteredExpenses.length === 0) {
        expenseList.innerHTML = "<p>No expenses found.</p>";
        return;
    }

    filteredExpenses.forEach((expense) => {
        const expenseItem = document.createElement("div");
        expenseItem.className = "expense-item";

        expenseItem.innerHTML = `
            <div class="expense-info">
                <strong>${expense.category}</strong>
                <small>${expense.note} • ${expense.date}</small>
            </div>

            <div>
                <span class="expense-amount">
                    ₹${expense.amount.toFixed(2)}
                </span>

                <button
                    class="edit-btn"
                    onclick="editExpense(${expense.id})">
                    ✏️
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteExpense(${expense.id})">
                    🗑️
                </button>
            </div>
        `;

        expenseList.appendChild(expenseItem);
    });
}
function clearFilters() {
    document.getElementById("searchInput").value = "";
    document.getElementById("filterCategory").value = "";
    document.getElementById("filterDate").value = "";

    displayExpenses();
}
function deleteExpense(id) {

    expenses = expenses.filter(
        (expense) => expense.id !== id
    );

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

    displayExpenses();
}
function editExpense(id) {
    const expense = expenses.find((expense) => expense.id === id);

    if (!expense) return;

    editingExpenseId = id;

    document.getElementById("amount").value = expense.amount;
    document.getElementById("category").value = expense.category;
    document.getElementById("note").value = expense.note;
    document.getElementById("date").value = expense.date;

    document.querySelector(".expense-form button").innerText = "Update Expense";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

displayExpenses();
const chartCanvas = document.getElementById("expenseChart");

const categoryTotals = {};

expenses.forEach((expense) => {
    if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
    }

    categoryTotals[expense.category] += Number(expense.amount);
});

new Chart(chartCanvas, {
    type: "doughnut",
    data: {
        labels: Object.keys(categoryTotals),
        datasets: [{
            data: Object.values(categoryTotals)
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: "bottom"
            }
        }
    }
});
function generateMonthlyReport() {
    const selectedMonth = document.getElementById("reportMonth").value;
    const reportDiv = document.getElementById("monthlyReport");

    if (!selectedMonth) {
        reportDiv.innerHTML = "<p>Please select a month.</p>";
        return;
    }

    const monthlyExpenses = expenses.filter((expense) =>
        expense.date.startsWith(selectedMonth)
    );

    if (monthlyExpenses.length === 0) {
        reportDiv.innerHTML = "<p>No expenses found for this month.</p>";
        return;
    }

    const total = monthlyExpenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
    );

    const highestExpense = monthlyExpenses.reduce((highest, expense) =>
        Number(expense.amount) > Number(highest.amount) ? expense : highest
    );

    const categoryTotals = {};

    monthlyExpenses.forEach((expense) => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }

        categoryTotals[expense.category] += Number(expense.amount);
    });

    let categoryHTML = "";

    Object.entries(categoryTotals).forEach(([category, amount]) => {
        categoryHTML += `
            <p>
                <strong>${category}</strong>: ₹${amount.toFixed(2)}
            </p>
        `;
    });

    reportDiv.innerHTML = `
        <div class="report-summary">
            <h3>Monthly Total: ₹${total.toFixed(2)}</h3>

            <p>
                <strong>Total Transactions:</strong>
                ${monthlyExpenses.length}
            </p>

            <p>
                <strong>Highest Expense:</strong>
                ${highestExpense.category} - ₹${Number(highestExpense.amount).toFixed(2)}
            </p>

            <h4>Category-wise Spending</h4>

            ${categoryHTML}
        </div>
    `;
}
function exportCSV() {
    if (expenses.length === 0) {
        alert("No expenses to export.");
        return;
    }

    let csv = "Category,Note,Date,Amount\n";

    expenses.forEach((expense) => {
        csv += `"${expense.category}","${expense.note}","${expense.date}","${expense.amount}"\n`;
    });

    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "daily-expenses.csv";

    link.click();

    URL.revokeObjectURL(url);
}
 function exportPDF() {
    if (expenses.length === 0) {
        alert("No expenses to export.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Daily Expense Tracker", 20, 20);

    doc.setFontSize(12);

    let y = 35;

    expenses.forEach((expense, index) => {
        doc.text(
            `${index + 1}. ${expense.category} - ${expense.note} - ${expense.date} - INR ${Number(expense.amount).toFixed(2)}`,
            20,
            y
        );

        y += 10;

        if (y > 280) {
            doc.addPage();
            y = 20;
        }
    });

    const total = expenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
    );

    doc.setFontSize(14);
    doc.text(`Total Expenses: INR ${total.toFixed(2)}`, 20, y + 5);

    doc.save("daily-expenses-report.pdf");
}
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");

    const button = document.getElementById("darkModeBtn");

    if (document.body.classList.contains("dark-mode")) {
        button.innerHTML = "☀️ Light Mode";
        localStorage.setItem("darkMode", "enabled");
    } else {
        button.innerHTML = "🌙 Dark Mode";
        localStorage.setItem("darkMode", "disabled");
    }
}
if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");

    const button = document.getElementById("darkModeBtn");

    if (button) {
        button.innerHTML = "☀️ Light Mode";
    }
}