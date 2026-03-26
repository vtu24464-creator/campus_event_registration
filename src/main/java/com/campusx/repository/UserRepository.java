package com.campusx.repository;

import com.campusx.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByRollNumber(String rollNumber);

    Optional<User> findByEmailAndIsActiveTrue(String email);
}
