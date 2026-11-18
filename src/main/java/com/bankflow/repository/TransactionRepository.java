
package com.bankflow.repository;

import com.bankflow.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    List<Transaction> findBySenderIdOrReceiverIdOrderByCreatedAtDesc(
            Long senderId, Long receiverId);
}
