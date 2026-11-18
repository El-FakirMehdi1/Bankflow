
document.addEventListener("DOMContentLoaded", () => {

    // Load account information
    loadDashboard();

    // Existing buttons
    document.getElementById("refreshBalance")
        .addEventListener("click", loadDashboard);

    document.getElementById("logoutButton")
        .addEventListener("click", logout);

    document.getElementById("sidebarLogout")
        .addEventListener("click", logout);

    // Transactions button
    document.getElementById("showTransactions")
        .addEventListener("click", () => {
            document.getElementById("transactionsSection")
                .scrollIntoView({ behavior: "smooth" });
        });

    // Transfer modal
    const transferModal = document.getElementById("transferModal");

    document.getElementById("showTransfer")
        .addEventListener("click", openTransferModal);

    document.getElementById("navTransfer")
        .addEventListener("click", openTransferModal);

    document.getElementById("closeTransfer")
        .addEventListener("click", closeTransferModal);

    transferModal.addEventListener("click", (event) => {
        if (event.target === transferModal) {
            closeTransferModal();
        }
    });

    document.getElementById("transferForm")
        .addEventListener("submit", handleTransfer);

    // Sidebar controls
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    document.getElementById("menuToggle")
        .addEventListener("click", () => {

            if (window.innerWidth <= 900) {
                sidebar.classList.add("open");
                overlay.classList.add("active");
            } else {
                sidebar.classList.toggle("collapsed");
                document.querySelector(".dashboard-content")
                    .classList.toggle("sidebar-expanded");
            }
        });

    document.getElementById("closeSidebar")
        .addEventListener("click", closeSidebar);

    overlay.addEventListener("click", closeSidebar);

    // Navigation between pages
    document.querySelectorAll(".nav-item[data-page]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const page = button.dataset.page;

                showPage(page);

                // Update active navigation item
                document.querySelectorAll(".nav-item")
                    .forEach(item => item.classList.remove("active"));

                button.classList.add("active");

                closeSidebar();

                // Transactions are currently inside Dashboard
                if (page === "transactions") {
                    setTimeout(() => {
                        document.getElementById("transactionsSection")
                            .scrollIntoView({ behavior: "smooth" });
                    }, 100);
                }
            });
        });

});


// ===================================
// SIDEBAR
// ===================================

function closeSidebar() {

    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("sidebarOverlay").classList.remove("active");
}


// ===================================
// PAGE NAVIGATION
// ===================================

function showPage(page) {

    const pages = {
        dashboard: "dashboardPage",
        rpcMonitor: "rpcMonitorPage",
        rpcMethods: "rpcMethodsPage"
    };

    // Transactions currently belong to Dashboard
    const targetPage = page === "transactions"
        ? "dashboardPage"
        : pages[page];

    if (!targetPage) return;

    document.querySelectorAll(".navigation-page, #dashboardPage")
        .forEach(element => {
            element.hidden = true;
        });

    document.getElementById(targetPage).hidden = false;

    // Start at the top when changing page
    window.scrollTo({ top: 0, behavior: "smooth" });
}


// ===================================
// TRANSFER MODAL
// ===================================

function openTransferModal() {
    document.getElementById("transferModal")
        .classList.add("active");

    closeSidebar();
}

function closeTransferModal() {
    document.getElementById("transferModal")
        .classList.remove("active");
}


// ===================================
// LOAD DASHBOARD
// ===================================


async function loadDashboard() {

    try {

        const account = await rpcCall("getMyAccount");

        document.getElementById("dashboardUsername").textContent =
            account.username;

        document.getElementById("welcomeName").textContent =
            account.fullName;

        document.getElementById("userAvatar").textContent =
            account.fullName.charAt(0).toUpperCase();

        document.getElementById("accountNumber").textContent =
            account.accountNumber;

        document.getElementById("accountBalance").textContent =
            Number(account.balance).toFixed(2) + " MAD";

        await loadTransactions(account.accountNumber);

    } catch (error) {

        console.error("Dashboard error:", error);

        alert("Session expired. Please login again.");

        window.location.href = "index.html";
    }
}



// ===================================
// LOGOUT
// ===================================

async function logout() {

    try {

        await rpcCall("logout");

        window.location.href = "index.html";

    } catch (error) {

        alert(error.message);
    }
}


// ===================================
// LOAD TRANSACTIONS
// ===================================

async function loadTransactions(accountNumber) {

    const transactionsList =
        document.getElementById("transactionsList");

    try {

        const transactions = await rpcCall("getTransactions", {
            accountNumber: accountNumber
        });

        transactionsList.innerHTML = "";

        if (transactions.length === 0) {
            transactionsList.textContent = "No transactions yet.";
            return;
        }

        transactions.forEach(transaction => {

            const isOutgoing =
                transaction.sender === accountNumber;

            const item = document.createElement("div");
            item.className = "transaction-item";

            const info = document.createElement("div");
            info.className = "transaction-info";

            const title = document.createElement("h4");
            title.textContent = isOutgoing
                ? "Money Sent"
                : "Money Received";

            const details = document.createElement("p");
            details.textContent = isOutgoing
                ? "To: " + transaction.receiver
                : "From: " + transaction.sender;

            const date = document.createElement("small");
            date.textContent =
                new Date(transaction.createdAt).toLocaleString();

            info.append(title, details, date);

            const amount = document.createElement("span");

            amount.className = isOutgoing
                ? "transaction-outgoing"
                : "transaction-incoming";

            const value = Number(transaction.amount).toFixed(2);

            amount.textContent =
                (isOutgoing ? "-" : "+") + value + " MAD";

            item.append(info, amount);

            transactionsList.appendChild(item);
        });

    } catch (error) {

        console.error("Transactions error:", error);

        transactionsList.textContent =
            "Unable to load transactions.";
    }
}


// ===================================
// TRANSFER MONEY
// ===================================

async function handleTransfer(event) {

    event.preventDefault();

    const receiverAccount =
        document.getElementById("receiverAccount").value.trim();

    const amount =
        Number(document.getElementById("transferAmount").value);

    const message =
        document.getElementById("transferMessage");

    const submitButton =
        document.getElementById("transferSubmit");

    message.textContent = "";
    message.className = "";

    if (!receiverAccount) {
        message.textContent =
            "Please enter the receiver account number.";
        message.className = "error";
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        message.textContent =
            "Please enter a valid amount.";
        message.className = "error";
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Processing...";

    try {

        const account = await rpcCall("getMyAccount");

        await rpcCall("transferMoney", {

            senderAccount: account.accountNumber,
            receiverAccount: receiverAccount,
            amount: amount

        });

        message.textContent =
            "Transfer completed successfully!";

        message.className = "success";

        document.getElementById("transferForm").reset();

        await loadDashboard();

        setTimeout(() => {

            closeTransferModal();

            message.textContent = "";
            message.className = "";

        }, 1800);

    } catch (error) {

        message.textContent = error.message;
        message.className = "error";

    } finally {

        submitButton.disabled = false;
        submitButton.textContent = "Confirm Transfer";
    }
}
