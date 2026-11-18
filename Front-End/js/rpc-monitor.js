
const RPC_MONITOR_STORAGE_KEY = "bankflow_rpc_logs";

let rpcLogs = [];

try {
    rpcLogs = JSON.parse(
        localStorage.getItem(RPC_MONITOR_STORAGE_KEY) || "[]"
    );

    if (!Array.isArray(rpcLogs)) {
        rpcLogs = [];
    }

    rpcLogs.sort((a, b) =>
        new Date(b.requestTime || b.timestamp) -
        new Date(a.requestTime || a.timestamp)
    );

} catch (error) {
    console.error("Unable to load RPC history:", error);
    rpcLogs = [];
}


// ===================================
// INITIALIZATION
// ===================================

document.addEventListener("DOMContentLoaded", () => {

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

    // Logout
    document.getElementById("logoutButton")
        .addEventListener("click", logout);

    document.getElementById("sidebarLogout")
        .addEventListener("click", logout);

    // Clear RPC history
    document.getElementById("clearRpcLogs")
        .addEventListener("click", () => {

            rpcLogs = [];

            localStorage.removeItem(RPC_MONITOR_STORAGE_KEY);

            updateRpcStatistics();
            renderRpcLogs();

            document.getElementById("rpcDetailsPanel").hidden = true;
        });

    // Close request details
    document.getElementById("closeRpcDetails")
        .addEventListener("click", () => {
            document.getElementById("rpcDetailsPanel").hidden = true;
        });

    // Listen to new RPC calls
    window.addEventListener("rpc-call-complete", (event) => {

        rpcLogs.push(event.detail);

        rpcLogs.sort((a, b) =>
            new Date(b.requestTime || b.timestamp) -
            new Date(a.requestTime || a.timestamp)
        );

        rpcLogs = rpcLogs.slice(0, 100);

        localStorage.setItem(
            RPC_MONITOR_STORAGE_KEY,
            JSON.stringify(rpcLogs)
        );

        updateRpcStatistics();
        renderRpcLogs();
    });

    // Initial display
    renderRpcLogs();
    updateRpcStatistics();

});


// ===================================
// SIDEBAR
// ===================================

function closeSidebar() {

    document.getElementById("sidebar").classList.remove("open");

    document.getElementById("sidebarOverlay")
        .classList.remove("active");
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
// UPDATE STATISTICS
// ===================================

function updateRpcStatistics() {

    const total = rpcLogs.length;

    const successful = rpcLogs.filter(
        log => log.status === "SUCCESS"
    ).length;

    const failed = rpcLogs.filter(
        log => log.status === "ERROR"
    ).length;

    const averageTime = total > 0
        ? rpcLogs.reduce(
            (sum, log) => sum + Number(log.duration || 0), 0
        ) / total
        : 0;

    document.getElementById("rpcTotalRequests").textContent = total;

    document.getElementById("rpcSuccessRequests").textContent =
        successful;

    document.getElementById("rpcFailedRequests").textContent = failed;

    document.getElementById("rpcAverageTime").textContent =
        averageTime.toFixed(2) + " ms";
}


// ===================================
// DISPLAY RPC HISTORY
// ===================================

function renderRpcLogs() {

    const tableBody = document.getElementById("rpcLogsList");

    tableBody.innerHTML = "";

    if (rpcLogs.length === 0) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td colspan="6" class="rpc-empty">
                No RPC requests recorded yet.
            </td>
        `;

        tableBody.appendChild(row);
        return;
    }

    rpcLogs.forEach((log, index) => {

        const row = document.createElement("tr");

        const statusClass = log.status === "SUCCESS"
            ? "success"
            : "error";

        const formattedTime = new Date(
            log.requestTime || log.timestamp
        ).toLocaleTimeString();

        row.innerHTML = `
            <td>
                <span class="rpc-method-name">
                    ${escapeHtml(log.method)}
                </span>
            </td>

            <td>${escapeHtml(log.requestId || log.request?.id || "-")}</td>

            <td>
                <span class="rpc-status ${statusClass}">
                    ${escapeHtml(log.status)}
                </span>
            </td>

            <td>${Number(log.duration || 0).toFixed(2)} ms</td>

            <td>${formattedTime}</td>

            <td>
                <button class="rpc-details-button" data-index="${index}">
                    Details
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    tableBody.querySelectorAll(".rpc-details-button")
        .forEach(button => {

            button.addEventListener("click", () => {

                const index = Number(button.dataset.index);

                showRpcDetails(rpcLogs[index]);
            });
        });
}


// ===================================
// SHOW REQUEST DETAILS
// ===================================

function showRpcDetails(log) {

    const detailsPanel =
        document.getElementById("rpcDetailsPanel");

    const requestTime = log.requestTime || log.timestamp || "-";
    const completedAt = log.completedAt || "-";

    document.getElementById("rpcRequestDetails").textContent =
        JSON.stringify({
            source: log.source || "Legacy request",
            requestTime,
            request: log.request
        }, null, 4);

    document.getElementById("rpcResponseDetails").textContent =
        JSON.stringify({
            completedAt,
            status: log.status,
            duration: log.duration + " ms",
            response: log.response,
            error: log.error
        }, null, 4);

    detailsPanel.hidden = false;

    detailsPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ===================================
// HTML ESCAPE
// ===================================

function escapeHtml(value) {

    return String(value ?? "-").replace(/[&<>"']/g, character => {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}
