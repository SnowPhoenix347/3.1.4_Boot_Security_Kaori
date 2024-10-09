package ru.kata.spring.boot_security.demo.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.models.User;
import ru.kata.spring.boot_security.demo.services.RoleService;
import ru.kata.spring.boot_security.demo.services.UserService;
import ru.kata.spring.boot_security.demo.services.UsersDetailsService;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admins")
public class AdminController {
    private final UsersDetailsService usersDetailsService;
    private final RoleService roleService;

    @GetMapping
    public String getAdmin(){
        return "admins/admin";
    }

    @GetMapping("/users")
    public String getUsers(Model model){
        model.addAttribute("users", usersDetailsService.getAllUsers());
        return "admins/users";
    }

    @GetMapping("/create")
    public String create(Model model){
        model.addAttribute("user", new User());
        model.addAttribute("roles", roleService.findAll());
        return "admins/create";
    }

    @PostMapping("/create")
    public String create(@ModelAttribute("user")
                             @Valid User user, BindingResult bindingResult, Model model) {
        if(bindingResult.hasErrors()){
            model.addAttribute("user", user);
            model.addAttribute("roles", roleService.findAll());
            return "admins/create";
        }
        usersDetailsService.save(user);
        return "redirect:/admins/users";
    }

    @GetMapping("/update")
    public String update(@RequestParam(name = "id") Long id, Model model){
        User user = usersDetailsService.getUserById(id);
        model.addAttribute("user", user);
        model.addAttribute("roles", roleService.findAll());
        return "admins/update";
    }

    @PostMapping("/update")
    public String update(@ModelAttribute("user")
                             @Valid User user, BindingResult bindingResult, Model model) {
        if(bindingResult.hasErrors()){
            model.addAttribute("user", user);
            model.addAttribute("roles", roleService.findAll());
            return "admins/update";
        }
        usersDetailsService.update(user, user.getId());
        return "redirect:/admins/users";
    }

    @PostMapping("/delete")
    public String delete(@RequestParam(name = "id") Long id){
        usersDetailsService.delete(id);
        return "redirect:/admins/users";
    }
}
