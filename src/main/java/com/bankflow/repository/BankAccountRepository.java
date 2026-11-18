
package com.bankflow.repository;

import com.bankflow.model.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BankAccountRepository
        extends JpaRepository<BankAccount, Long> {

    Optional<BankAccount> findByAccountNumber(String accountNumber);
    Optional<BankAccount> findByAccountNumberAndOwnerId(
            String accountNumber,
            Long ownerId
    );
    boolean existsByAccountNumber(String accountNumber);
    Optional<BankAccount> findFirstByOwner_Id(Long ownerId);
}
