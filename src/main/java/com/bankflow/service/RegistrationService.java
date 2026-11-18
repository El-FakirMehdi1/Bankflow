package com.bankflow.service;

import com.bankflow.model.AppUser;
import com.bankflow.model.BankAccount;
import com.bankflow.repository.UserRepository;
import com.bankflow.repository.BankAccountRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class RegistrationService {

    private final UserRepository userRepository;
    private final BankAccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public RegistrationService(
            UserRepository userRepository,
            BankAccountRepository accountRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public BankAccount register(
            String fullName,
            String email,
            String username,
            String password) {

        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        AppUser user = new AppUser();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));

        userRepository.save(user);

        String accountNumber;

        do {
            accountNumber = "BA" +
                    UUID.randomUUID().toString()
                            .replace("-", "")
                            .substring(0, 10).toUpperCase();
        } while (accountRepository.existsByAccountNumber(accountNumber));

        BankAccount account = new BankAccount();
        account.setAccountNumber(accountNumber);
        account.setBalance(BigDecimal.ZERO);
        account.setOwner(user);

        return accountRepository.save(account);
    }
}