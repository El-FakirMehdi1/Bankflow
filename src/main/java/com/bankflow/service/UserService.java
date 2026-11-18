
package com.bankflow.service;

import com.bankflow.model.AppUser;
import com.bankflow.repository.UserRepository;

import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AppUser findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public boolean usernameExists(String username) {
        return userRepository.existsByUsername(username);
    }
}
