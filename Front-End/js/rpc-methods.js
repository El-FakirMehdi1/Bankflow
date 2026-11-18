
document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // RPC METHODS DOCUMENTATION
    // =====================================

    const methods = {

        login: {
            title: "login",
            category: "Authentication",
            description: "Authenticates a user using their username and password. The server verifies the credentials and creates an HTTP session.",
            parameters: [
                { name: "username", type: "String", description: "The user's username." },
                { name: "password", type: "String", description: "The user's password." }
            ],
            request: {
                jsonrpc: "2.0",
                method: "login",
                params: {
                    username: "mehdi",
                    password: "1234"
                },
                id: "1"
            },
            response: {
                jsonrpc: "2.0",
                result: {
                    username: "mehdi",
                    fullName: "Mehdi El Fakir",
                    message: "Login successful"
                },
                error: null,
                id: "1"
            }
        },

        register: {
            title: "register",
            category: "Authentication",
            description: "Creates a new user account. The server validates the information, encrypts the password and creates a bank account.",
            parameters: [
                { name: "fullName", type: "String", description: "The user's full name." },
                { name: "email", type: "String", description: "The user's email address." },
                { name: "username", type: "String", description: "A unique username." },
                { name: "password", type: "String", description: "The account password." }
            ],
            request: {
                jsonrpc: "2.0",
                method: "register",
                params: {
                    fullName: "Ahmed Ali",
                    email: "ahmed@example.com",
                    username: "ahmed",
                    password: "123456"
                },
                id: "2"
            },
            response: {
                jsonrpc: "2.0",
                result: {
                    message: "Registration successful",
                    username: "ahmed",
                    email: "ahmed@example.com",
                    accountNumber: "BA1234567890",
                    balance: 0
                },
                error: null,
                id: "2"
            }
        },

        getMyAccount: {
            title: "getMyAccount",
            category: "Account",
            description: "Returns the authenticated user's account information using the active HTTP session. No parameters are required.",
            parameters: [],
            request: {
                jsonrpc: "2.0",
                method: "getMyAccount",
                params: {},
                id: "3"
            },
            response: {
                jsonrpc: "2.0",
                result: {
                    username: "mehdi",
                    fullName: "Mehdi El Fakir",
                    accountNumber: "BA1001",
                    balance: 5000
                },
                error: null,
                id: "3"
            }
        },

        getBalance: {
            title: "getBalance",
            category: "Account",
            description: "Retrieves the balance of a bank account. The server checks the active session and verifies account ownership.",
            parameters: [
                { name: "accountNumber", type: "String", description: "The bank account number." }
            ],
            request: {
                jsonrpc: "2.0",
                method: "getBalance",
                params: {
                    accountNumber: "BA1001"
                },
                id: "4"
            },
            response: {
                jsonrpc: "2.0",
                result: {
                    accountNumber: "BA1001",
                    balance: 5000
                },
                error: null,
                id: "4"
            }
        },

        transferMoney: {
            title: "transferMoney",
            category: "Banking",
            description: "Transfers money between two bank accounts. The server checks ownership and balance, then executes the transaction.",
            parameters: [
                { name: "senderAccount", type: "String", description: "The sender's account number." },
                { name: "receiverAccount", type: "String", description: "The receiver's account number." },
                { name: "amount", type: "Number", description: "The amount to transfer." }
            ],
            request: {
                jsonrpc: "2.0",
                method: "transferMoney",
                params: {
                    senderAccount: "BA1001",
                    receiverAccount: "BA1002",
                    amount: 100
                },
                id: "5"
            },
            response: {
                jsonrpc: "2.0",
                result: {
                    transactionId: 1,
                    status: "SUCCESS",
                    amount: 100
                },
                error: null,
                id: "5"
            }
        },

        getTransactions: {
            title: "getTransactions",
            category: "Banking",
            description: "Returns the transaction history of an account, ordered from newest to oldest. The server verifies account ownership.",
            parameters: [
                { name: "accountNumber", type: "String", description: "The account number whose transactions are requested." }
            ],
            request: {
                jsonrpc: "2.0",
                method: "getTransactions",
                params: {
                    accountNumber: "BA1001"
                },
                id: "6"
            },
            response: {
                jsonrpc: "2.0",
                result: [
                    {
                        transactionId: 1,
                        sender: "BA1001",
                        receiver: "BA1002",
                        amount: 100,
                        description: "Bank transfer",
                        createdAt: "2026-11-14T12:00:00"
                    }
                ],
                error: null,
                id: "6"
            }
        },

        logout: {
            title: "logout",
            category: "Authentication",
            description: "Ends the current user's session by invalidating the HTTP session on the server.",
            parameters: [],
            request: {
                jsonrpc: "2.0",
                method: "logout",
                params: {},
                id: "7"
            },
            response: {
                jsonrpc: "2.0",
                result: {
                    message: "Logout successful"
                },
                error: null,
                id: "7"
            }
        }

    };


    // =====================================
    // HTML ELEMENTS
    // =====================================

    const detailsPanel = document.getElementById("methodDetailsPanel");
    const detailsTitle = document.getElementById("methodDetailsTitle");
    const detailsDescription = document.getElementById("methodDetailsDescription");
    const parametersContainer = document.getElementById("methodParameters");
    const requestExample = document.getElementById("methodRequestExample");
    const responseExample = document.getElementById("methodResponseExample");
    const closeDetailsButton = document.getElementById("closeMethodDetails");


    // =====================================
    // DISPLAY METHOD DETAILS
    // =====================================

    function showMethodDetails(methodName) {

        const method = methods[methodName];

        if (!method || !detailsPanel) {
            return;
        }

        detailsTitle.textContent = method.title;
        detailsDescription.textContent = method.description;

        // Parameters
        parametersContainer.innerHTML = "";

        if (method.parameters.length === 0) {

            const emptyMessage = document.createElement("div");
            emptyMessage.className = "parameter-item";
            emptyMessage.textContent = "No parameters required.";
            parametersContainer.appendChild(emptyMessage);

        } else {

            method.parameters.forEach(parameter => {

                const item = document.createElement("div");
                item.className = "parameter-item";

                const name = document.createElement("strong");
                name.textContent = parameter.name + " : " + parameter.type;

                const description = document.createElement("span");
                description.textContent = parameter.description;

                item.appendChild(name);
                item.appendChild(description);

                parametersContainer.appendChild(item);

            });

        }

        // JSON examples
        requestExample.textContent = JSON.stringify(method.request, null, 4);
        responseExample.textContent = JSON.stringify(method.response, null, 4);

        detailsPanel.hidden = false;

        detailsPanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }


    // =====================================
    // VIEW BUTTONS
    // =====================================

    document.querySelectorAll(".method-view-button").forEach(button => {

        button.addEventListener("click", () => {

            const methodName = button.dataset.method;

            showMethodDetails(methodName);

        });

    });


    // =====================================
    // CLOSE DETAILS
    // =====================================

    if (closeDetailsButton) {

        closeDetailsButton.addEventListener("click", () => {

            detailsPanel.hidden = true;

        });

    }


    // =====================================
    // SIDEBAR
    // =====================================

    const sidebar = document.getElementById("sidebar");
    const menuToggle = document.getElementById("menuToggle");
    const closeSidebar = document.getElementById("closeSidebar");
    const dashboardContent = document.querySelector(".dashboard-content");

    if (menuToggle && sidebar) {

        menuToggle.addEventListener("click", () => {

            if (window.innerWidth <= 768) {
                sidebar.classList.toggle("open");
            } else {
                sidebar.classList.toggle("collapsed");

                if (dashboardContent) {
                    dashboardContent.classList.toggle("expanded");
                }
            }

        });

    }

    if (closeSidebar && sidebar) {

        closeSidebar.addEventListener("click", () => {
            sidebar.classList.remove("open");
        });

    }


    // =====================================
    // USER INFORMATION
    // =====================================

    async function loadMethodsUser() {

        try {

            const account = await rpcCall("getMyAccount");

            const usernameElement = document.getElementById("dashboardUsername");
            const avatarElement = document.getElementById("userAvatar");

            if (usernameElement) {
                usernameElement.textContent = account.username;
            }

            if (avatarElement) {
                avatarElement.textContent =
                    account.fullName.charAt(0).toUpperCase();
            }

        } catch (error) {

            console.error("Unable to load user:", error);

            alert("Session expired. Please login again.");

            window.location.href = "index.html";

        }

    }


    // =====================================
    // LOGOUT
    // =====================================

    async function logoutMethodsPage() {

        try {

            await rpcCall("logout");

        } catch (error) {

            console.error("Logout error:", error);

        } finally {

            window.location.href = "index.html";

        }

    }

    const logoutButton = document.getElementById("logoutButton");
    const sidebarLogout = document.getElementById("sidebarLogout");

    if (logoutButton) {
        logoutButton.addEventListener("click", logoutMethodsPage);
    }

    if (sidebarLogout) {
        sidebarLogout.addEventListener("click", logoutMethodsPage);
    }


    // =====================================
    // INITIALIZE PAGE
    // =====================================

    loadMethodsUser();

});
