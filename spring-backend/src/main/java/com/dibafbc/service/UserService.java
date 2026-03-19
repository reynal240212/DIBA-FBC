package com.dibafbc.service;

import com.dibafbc.model.User;
import com.dibafbc.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;

    public List<User> getAllUsers() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public void deleteUser(UUID id) {
        repository.deleteById(id);
    }
}
