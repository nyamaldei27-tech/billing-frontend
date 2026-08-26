package com.example.acount_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerRequest {

    @NotBlank(message = "First name is required")
    @Size(
            min = 2,
            max = 50,
            message = "First name must be between 2 and 50 characters"
    )
    @Pattern(
            regexp = "^[a-zA-Z\\s\\-]+$",
            message = "First name can only contain letters, spaces, or hyphens"
    )
    private String firstName;

    @Size(
            max = 50,
            message = "Middle name cannot exceed 50 characters"
    )
    @Pattern(
            regexp = "^[a-zA-Z\\s\\-]*$",
            message = "Middle name can only contain letters, spaces, or hyphens"
    )
    private String middleName;

    @NotBlank(message = "Last name is required")
    @Size(
            min = 2,
            max = 50,
            message = "Last name must be between 2 and 50 characters"
    )
    @Pattern(
            regexp = "^[a-zA-Z\\s\\-]+$",
            message = "Last name can only contain letters, spaces, or hyphens"
    )
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    private String email;
}