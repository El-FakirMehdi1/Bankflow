
package com.bankflow.config;

import com.bankflow.model.AppUser;
import com.bankflow.model.BankAccount;
import com.bankflow.repository.UserRepository;
import com.bankflow.repository.BankAccountRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(
            UserRepository userRepository,
            BankAccountRepository accountRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            createTestUser(
                    userRepository, accountRepository, passwordEncoder,
                    "mehdi", "Mehdi El Fakir",
                    "mehdi@example.com", "BA1001", "5000.00"
            );

            createTestUser(
                    userRepository, accountRepository, passwordEncoder,
                    "Meryem", "Meryem Bennani",
                    "meryem@example.com", "BA1002", "2000.00"
            );
        };
    }

    private void createTestUser(
            UserRepository userRepository,
            BankAccountRepository accountRepository,
            PasswordEncoder passwordEncoder,
            String username,
            String fullName,
            String email,
            String accountNumber,
            String balance) {

        AppUser user = userRepository.findByUsername(username)
                .orElseGet(() -> {
                    AppUser newUser = new AppUser();
                    newUser.setUsername(username);
                    newUser.setFullName(fullName);
                    newUser.setEmail(email);
                    newUser.setPassword(passwordEncoder.encode("1234"));
                    return userRepository.save(newUser);
                });

        // Convert old plain-text password to BCrypt
        if (!user.getPassword().startsWith("$2")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        if (user.getEmail() == null || user.getEmail().isBlank()) {
            user.setEmail(email);
        }

        userRepository.save(user);

        if (!accountRepository.existsByAccountNumber(accountNumber)) {
            BankAccount account = new BankAccount();
            account.setAccountNumber(accountNumber);
            account.setBalance(new BigDecimal(balance));
            account.setOwner(user);

            accountRepository.save(account);
        }
    }
}
