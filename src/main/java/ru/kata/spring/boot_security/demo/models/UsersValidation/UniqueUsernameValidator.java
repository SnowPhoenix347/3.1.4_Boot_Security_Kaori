package ru.kata.spring.boot_security.demo.models.UsersValidation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;
import ru.kata.spring.boot_security.demo.services.UsersService;

public class UniqueUsernameValidator implements ConstraintValidator<UniqueUsername, String> {

    @Autowired
    private UsersService usersService;

    @Override
    public boolean isValid(String username, ConstraintValidatorContext context) {
        return usersService.isUsernameUnique(username);
    }
}
