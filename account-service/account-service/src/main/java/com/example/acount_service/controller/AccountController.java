package com.example.acount_service.controller;

import com.example.acount_service.dto.CustomerRequest;
import com.example.acount_service.dto.CustomerResponse;
import com.example.acount_service.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {

        this.accountService = accountService;
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> createCustomer(
            @Valid @RequestBody CustomerRequest request) {

        CustomerResponse createdCustomer =
                accountService.createCustomer(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdCustomer);
    }


    @GetMapping("/me")
    public ResponseEntity<CustomerResponse> getCurrentCustomer(
            Authentication authentication) {

        return ResponseEntity.ok(
                accountService.getCurrentCustomer(authentication)
        );
    }

    @PutMapping("/me")
    public ResponseEntity<CustomerResponse> updateCurrentCustomer(
            Authentication authentication,
            @Valid @RequestBody CustomerRequest request) {

        return ResponseEntity.ok(
                accountService.updateCurrentCustomer(
                        authentication,
                        request
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomerById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                accountService.getCustomerById(id)
        );
    }

    @GetMapping
    public ResponseEntity<List<CustomerResponse>> getAllCustomers() {

        return ResponseEntity.ok(
                accountService.getAllCustomers()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request) {

        return ResponseEntity.ok(
                accountService.updateCustomer(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(
            @PathVariable Long id) {

        accountService.deleteCustomer(id);

        return ResponseEntity.noContent().build();
    }

}