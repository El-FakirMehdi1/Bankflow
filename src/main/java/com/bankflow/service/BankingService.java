
package com.bankflow.service;

import com.bankflow.model.BankAccount;
import com.bankflow.model.Transaction;
import com.bankflow.repository.BankAccountRepository;
import com.bankflow.repository.TransactionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BankingService {

    private final BankAccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public BankingService(
            BankAccountRepository accountRepository,
            TransactionRepository transactionRepository) {

        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public Transaction transferMoney(
            String senderNumber,
            String receiverNumber,
            BigDecimal amount) {

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid transfer amount");
        }

        if (senderNumber.equals(receiverNumber)) {
            throw new IllegalArgumentException("Cannot transfer to the same account");
        }

        BankAccount sender = accountRepository
                .findByAccountNumber(senderNumber)
                .orElseThrow(() -> new RuntimeException("Sender account not found"));

        BankAccount receiver = accountRepository
                .findByAccountNumber(receiverNumber)
                .orElseThrow(() -> new RuntimeException("Receiver account not found"));

        if (sender.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        sender.setBalance(sender.getBalance().subtract(amount));
        receiver.setBalance(receiver.getBalance().add(amount));

        Transaction transaction = new Transaction();
        transaction.setSender(sender);
        transaction.setReceiver(receiver);
        transaction.setAmount(amount);
        transaction.setDescription("Bank transfer");

        accountRepository.save(sender);
        accountRepository.save(receiver);

        return transactionRepository.save(transaction);
    }
    public BigDecimal getBalance(String accountNumber, Long userId) {

        BankAccount account = accountRepository
                .findByAccountNumberAndOwnerId(accountNumber, userId)
                .orElseThrow(() -> new RuntimeException("Account not found or access denied"));

        return account.getBalance();
    }
    public void verifyAccountOwner(String accountNumber, Long userId) {

        accountRepository
                .findByAccountNumberAndOwnerId(accountNumber, userId)
                .orElseThrow(() -> new RuntimeException("Account not found or access denied"));
    }
    public List<Transaction> getTransactions(String accountNumber, Long userId) {

        BankAccount account = accountRepository
                .findByAccountNumberAndOwnerId(accountNumber, userId)
                .orElseThrow(() -> new RuntimeException("Account not found or access denied"));

        return transactionRepository
                .findBySenderIdOrReceiverIdOrderByCreatedAtDesc(
                        account.getId(),
                        account.getId()
                );
    }
    public BankAccount getAccountForUser(Long userId) {

        return accountRepository.findFirstByOwner_Id(userId)
                .orElseThrow(() ->
                        new RuntimeException("Bank account not found")
                );
    }
}
