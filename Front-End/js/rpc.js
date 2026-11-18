
const RPC_URL = "http://localhost:8081/rpc";
const RPC_STORAGE_KEY = "bankflow_rpc_logs";

async function rpcCall(method, params = {}) {

    const requestId = crypto.randomUUID();

    const request = {
        jsonrpc: "2.0",
        method: method,
        params: params,
        id: requestId
    };

    const requestTime = new Date().toISOString();
    const startTime = performance.now();

    const source = window.location.pathname
        .split("/")
        .pop()
        .replace(".html", "") || "unknown";

    let responseData = null;
    let status = "SUCCESS";
    let errorMessage = null;

    try {

        const response = await fetch(RPC_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(request)
        });

        responseData = await response.json();

        if (!response.ok) {
            throw new Error("Server communication failed.");
        }

        if (responseData.error) {
            status = "ERROR";
            errorMessage = responseData.error.message;
            throw new Error(errorMessage);
        }

        return responseData.result;

    } catch (error) {

        status = "ERROR";
        errorMessage = error.message;

        throw error;

    } finally {

        const completedAt = new Date().toISOString();

        const logEntry = {
            method,
            request,
            response: responseData,
            requestId,
            status,
            error: errorMessage,
            source,
            requestTime,
            completedAt,
            timestamp: requestTime,
            duration: Number(
                (performance.now() - startTime).toFixed(2)
            )
        };

        try {

            const savedLogs = JSON.parse(
                localStorage.getItem(RPC_STORAGE_KEY) || "[]"
            );

            savedLogs.push(logEntry);

            savedLogs.sort((a, b) =>
                new Date(b.requestTime) - new Date(a.requestTime)
            );

            localStorage.setItem(
                RPC_STORAGE_KEY,
                JSON.stringify(savedLogs.slice(0, 100))
            );

        } catch (storageError) {
            console.error("Unable to save RPC history:", storageError);
        }

        window.dispatchEvent(
            new CustomEvent("rpc-call-complete", {
                detail: logEntry
            })
        );

    }
}
