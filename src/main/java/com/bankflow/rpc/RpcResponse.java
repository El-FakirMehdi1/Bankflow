
package com.bankflow.rpc;


public class RpcResponse {

    private String jsonrpc = "2.0";
    private Object result;
    private RpcError error;
    private String id;

    public RpcResponse() {
    }

    public RpcResponse(Object result, String id) {
        this.result = result;
        this.id = id;
    }

    public RpcResponse(RpcError error, String id) {
        this.error = error;
        this.id = id;
    }

    public String getJsonrpc() {
        return jsonrpc;
    }

    public Object getResult() {
        return result;
    }

    public RpcError getError() {
        return error;
    }

    public String getId() {
        return id;
    }
}
