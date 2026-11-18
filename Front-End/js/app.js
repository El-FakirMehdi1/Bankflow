

// 1. Login / Register Navigation


const loginView = document.getElementById("loginView");
const registerView = document.getElementById("registerView");

document.getElementById("showRegister").addEventListener("click", () => {
    loginView.hidden = true;
    registerView.hidden = false;
});

document.getElementById("showLogin").addEventListener("click", () => {
    registerView.hidden = true;
    loginView.hidden = false;
});



// 2. Register Form


const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        registerMessage.textContent = "Passwords do not match!";
        registerMessage.style.color = "#ff5c70";
        return;
    }

    const registerButton = document.getElementById("registerButton");
    registerButton.disabled = true;
    registerMessage.textContent = "Creating your account...";
    registerMessage.style.color = "#929bb0";

    try {
        const response = await fetch("http://localhost:8081/rpc", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "register",
                params: {
                    fullName: fullName,
                    email: email,
                    username: username,
                    password: password
                },
                id: "register-1"
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        registerMessage.textContent =
            "Account created successfully! Your account: " +
            data.result.accountNumber;

        registerMessage.style.color = "#42d99b";

        // Prepare Login
        document.getElementById("username").value = username;

        setTimeout(() => {
            registerView.hidden = true;
            loginView.hidden = false;
            registerForm.reset();
            registerMessage.textContent = "";
        }, 2500);

    } catch (error) {
        registerMessage.textContent = error.message;
        registerMessage.style.color = "#ff5c70";
    } finally {
        registerButton.disabled = false;
    }
});

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const loginButton = document.getElementById("loginButton");

    loginButton.disabled = true;
    loginMessage.textContent = "Signing in...";
    loginMessage.style.color = "#929bb0";

    try {
        const response = await fetch("http://localhost:8081/rpc", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "login",
                params: {
                    username: username,
                    password: password
                },
                id: "login-1"
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        loginMessage.textContent =
            "Welcome, " + data.result.fullName + "!";

        loginMessage.style.color = "#42d99b";

        console.log("Login successful:", data.result);

        // Redirect only after successful login
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 500);

    } catch (error) {
        loginMessage.textContent = error.message;
        loginMessage.style.color = "#ff5c70";

        loginButton.disabled = false;
    }
});
