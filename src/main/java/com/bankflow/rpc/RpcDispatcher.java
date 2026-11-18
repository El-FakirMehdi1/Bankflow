
package com.bankflow.rpc;

import com.bankflow.service.BankingService;
import com.bankflow.service.RegistrationService;
import com.bankflow.service.UserService;

import com.bankflow.model.BankAccount;
import com.bankflow.model.AppUser;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpSession;

import tools.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.util.Map;

@Component
public class RpcDispatcher {

    private final BankingService bankingService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final RegistrationService registrationService;

    public RpcDispatcher(
            BankingService bankingService,
            UserService userService,
            PasswordEncoder passwordEncoder,
            RegistrationService registrationService) {

        this.bankingService = bankingService;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.registrationService = registrationService;
    }

    // =====================================
    // INVALID PARAMETER EXCEPTION
    // =====================================

    private static class InvalidParamsException extends RuntimeException {

        public InvalidParamsException(String message) {
            super(message);
        }
    }

    // =====================================
    // PARAMETER VALIDATION
    // =====================================

    private String requireText(JsonNode params, String name) {

        JsonNode value = params == null ? null : params.get(name);

        if (value == null || !value.isString() || value.asText().isBlank()) {
            throw new InvalidParamsException(
                    "Missing or invalid parameter: " + name
            );
        }

        return value.asText();
    }

    private BigDecimal requireAmount(JsonNode params, String name) {

        JsonNode value = params == null ? null : params.get(name);

        if (value == null || !value.isNumber()) {
            throw new InvalidParamsException(
                    "Missing or invalid parameter: " + name
            );
        }

        return value.decimalValue();
    }

    // =====================================
    // MAIN RPC DISPATCHER
    // =====================================

    public RpcResponse dispatch(RpcRequest request, HttpSession session) {

        // Validate JSON-RPC request
        if (request == null ||
                !"2.0".equals(request.getJsonrpc()) ||
                request.getMethod() == null ||
                request.getMethod().isBlank() ||
                request.getId() == null) {

            return new RpcResponse(
                    new RpcError(-32600, "Invalid Request"),
                    request == null ? null : request.getId()
            );
        }

        try {

            JsonNode params = request.getParams();

            if (params != null && !params.isObject()) {
                throw new InvalidParamsException(
                        "Params must be a JSON object"
                );
            }

            switch (request.getMethod()) {

                // =====================================
                // LOGIN
                // =====================================

                case "login": {

                    String username = requireText(params, "username");
                    String password = requireText(params, "password");

                    var user = userService.findByUsername(username);

                    if (!passwordEncoder.matches(password, user.getPassword())) {

                        return new RpcResponse(
                                new RpcError(-32001, "Invalid credentials"),
                                request.getId()
                        );
                    }

                    session.setAttribute("userId", user.getId());
                    session.setAttribute("username", user.getUsername());

                    return new RpcResponse(
                            Map.of(
                                    "username", user.getUsername(),
                                    "fullName", user.getFullName(),
                                    "message", "Login successful"
                            ),
                            request.getId()
                    );
                }

                // =====================================
                // GET MY ACCOUNT
                // =====================================

                case "getMyAccount": {

                    Object userIdObject = session.getAttribute("userId");

                    if (userIdObject == null) {

                        return new RpcResponse(
                                new RpcError(-32002, "Please login first"),
                                request.getId()
                        );
                    }

                    Long userId = (Long) userIdObject;

                    BankAccount account =
                            bankingService.getAccountForUser(userId);

                    AppUser user = userService.findByUsername(
                            (String) session.getAttribute("username")
                    );

                    return new RpcResponse(
                            Map.of(
                                    "username", user.getUsername(),
                                    "fullName", user.getFullName(),
                                    "accountNumber", account.getAccountNumber(),
                                    "balance", account.getBalance()
                            ),
                            request.getId()
                    );
                }

                // =====================================
                // GET BALANCE
                // =====================================

                case "getBalance": {

                    Object userIdObject = session.getAttribute("userId");

                    if (userIdObject == null) {

                        return new RpcResponse(
                                new RpcError(-32002, "Please login first"),
                                request.getId()
                        );
                    }

                    Long userId = (Long) userIdObject;

                    String accountNumber =
                            requireText(params, "accountNumber");

                    BigDecimal balance =
                            bankingService.getBalance(accountNumber, userId);

                    return new RpcResponse(
                            Map.of("balance", balance),
                            request.getId()
                    );
                }

                // =====================================
                // REGISTER
                // =====================================

                case "register": {

                    String fullName = requireText(params, "fullName");
                    String email = requireText(params, "email");
                    String username = requireText(params, "username");
                    String password = requireText(params, "password");

                    BankAccount account = registrationService.register(
                            fullName,
                            email,
                            username,
                            password
                    );

                    return new RpcResponse(
                            Map.of(
                                    "message", "Account created successfully",
                                    "username", username,
                                    "email", email,
                                    "accountNumber", account.getAccountNumber(),
                                    "balance", account.getBalance()
                            ),
                            request.getId()
                    );
                }

                // =====================================
                // TRANSFER MONEY
                // =====================================

                case "transferMoney": {

                    String senderAccount =
                            requireText(params, "senderAccount");

                    String receiverAccount =
                            requireText(params, "receiverAccount");

                    BigDecimal amount =
                            requireAmount(params, "amount");

                    Object userIdObject = session.getAttribute("userId");

                    if (userIdObject == null) {

                        return new RpcResponse(
                                new RpcError(-32002, "Please login first"),
                                request.getId()
                        );
                    }

                    Long userId = (Long) userIdObject;

                    bankingService.verifyAccountOwner(senderAccount, userId);

                    var transaction = bankingService.transferMoney(
                            senderAccount,
                            receiverAccount,
                            amount
                    );

                    return new RpcResponse(
                            Map.of(
                                    "transactionId", transaction.getId(),
                                    "amount", transaction.getAmount(),
                                    "status", "SUCCESS"
                            ),
                            request.getId()
                    );
                }

                // =====================================
                // LOGOUT
                // =====================================

                case "logout": {

                    session.invalidate();

                    return new RpcResponse(
                            Map.of("message", "Logout successful"),
                            request.getId()
                    );
                }

                // =====================================
                // GET TRANSACTIONS
                // =====================================

                case "getTransactions": {

                    Object userIdObject = session.getAttribute("userId");

                    if (userIdObject == null) {

                        return new RpcResponse(
                                new RpcError(-32002, "Please login first"),
                                request.getId()
                        );
                    }

                    Long userId = (Long) userIdObject;

                    String accountNumber =
                            requireText(params, "accountNumber");

                    var transactions = bankingService.getTransactions(
                            accountNumber,
                            userId
                    );

                    var result = transactions.stream()
                            .map(transaction -> Map.of(
                                    "transactionId", transaction.getId(),
                                    "sender", transaction.getSender().getAccountNumber(),
                                    "receiver", transaction.getReceiver().getAccountNumber(),
                                    "amount", transaction.getAmount(),
                                    "description", transaction.getDescription(),
                                    "createdAt", transaction.getCreatedAt()
                            ))
                            .toList();

                    return new RpcResponse(
                            result,
                            request.getId()
                    );
                }

                // =====================================
                // METHOD NOT FOUND
                // =====================================

                default:

                    return new RpcResponse(
                            new RpcError(-32601, "Method not found"),
                            request.getId()
                    );
            }

        } catch (InvalidParamsException e) {

            return new RpcResponse(
                    new RpcError(-32602, e.getMessage()),
                    request.getId()
            );

        } catch (Exception e) {

            return new RpcResponse(
                    new RpcError(-32000, e.getMessage()),
                    request.getId()
            );
        }
    }
}
