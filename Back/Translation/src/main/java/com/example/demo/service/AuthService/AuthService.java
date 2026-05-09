package com.example.demo.service.AuthService;

import com.example.demo.Entitty.Users;
import com.example.demo.Exceptions.UserAlreadyExistsException;
import com.example.demo.Exceptions.UserNotFoundException;
import com.example.demo.repoistery.AuthRepository;
import com.example.demo.service.JwtService.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.demo.repoistery.UserRepository;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    AuthRepository authRepository;

    @Autowired
    UserRepository userRepository;
    
    @Autowired
    AuthenticationManager authenticationManager;

    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    @Autowired
    JwtService jwtService;
    public Users registerUser(Users user) {
        // check if user already exists
        if (authRepository.findByUsername(user.getUsername() ) != null) {
            throw new UserAlreadyExistsException("Username already taken");
        }
        user.setPassword(encoder.encode(user.getPassword()));
        return authRepository.save(user);
    }

    public String verify(Users user) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
            );
            if (authentication.isAuthenticated()) {
                Users dbUser = userRepository.findByUsername(user.getUsername())
                    .orElseThrow(() -> new UserNotFoundException("User not found"));
                Map<String, Object> claims = new HashMap<>();
                claims.put("Role", dbUser.getRole().name()); // ← .name() converts enum to String e.g. "ADMIN"
                return jwtService.generateToken(claims, dbUser.getUsername());
            }
        } catch (Exception e) {
            throw new UserNotFoundException("Invalid username or password");
        }
        return null;
    }

}


