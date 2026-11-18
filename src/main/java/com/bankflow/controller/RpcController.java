
package com.bankflow.controller;

import com.bankflow.rpc.RpcDispatcher;
import com.bankflow.rpc.RpcRequest;
import com.bankflow.rpc.RpcResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.*;

@RestController
public class RpcController {

    private final RpcDispatcher rpcDispatcher;


    public RpcController(RpcDispatcher rpcDispatcher) {
        this.rpcDispatcher = rpcDispatcher;
    }

    @PostMapping("/rpc")
    public RpcResponse handleRequest(
            @RequestBody RpcRequest request,
            HttpSession session) {

        return rpcDispatcher.dispatch(request,session);
    }
}
