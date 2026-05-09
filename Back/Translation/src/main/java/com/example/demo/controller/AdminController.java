package com.example.demo.controller;

import com.example.demo.Entitty.Images;
import com.example.demo.Entitty.Users;
import com.example.demo.enums.Role;
import com.example.demo.service.AdminService.AdminService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.demo.service.AuthService.AuthService;

@RestController
@RequestMapping("/Api/Admin")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")  // ADD THIS

public class AdminController {

    @Autowired
    AdminService adminService;
    @Autowired
    AuthService authService;
    @PostMapping("/register")
    public ResponseEntity<Users> registerAdmin(@RequestBody Users user) {
        user.setRole(Role.ADMIN);
        Users registeredUser = authService.registerUser(user);
        return ResponseEntity.ok(registeredUser);
    }

    // all images with user and report
    @GetMapping("/images")
    public ResponseEntity<Page<Images>> getAllImages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminService.getAllImages(page, size));
    }

    // resolved reports
    @GetMapping("/reports/resolved")
    public ResponseEntity<Page<Images>> getResolvedReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminService.getResolvedReports(page, size));
    }

    // unresolved reports
    @GetMapping("/reports/unresolved")
    public ResponseEntity<Page<Images>> getUnresolvedReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminService.getUnresolvedReports(page, size));
    }


    // delete user by id
    @PreAuthorize("hasAuthority('DELETE_USER')")
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully");
    }

    // all images WITH reports for specific user
    @GetMapping("/users/{userId}/reports")
    public ResponseEntity<Page<Images>> getAllReportsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminService.getAllReportsByUser(userId, page, size));
    }
}