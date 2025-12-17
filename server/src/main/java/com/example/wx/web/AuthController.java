package com.example.wx.web;

import com.example.wx.model.User;
import com.example.wx.repo.UserRepository;
import com.example.wx.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCrypt;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
  @Autowired
  private UserRepository users;

  @PostMapping(value = "/register")
  public ResponseEntity<?> register(@RequestBody(required = false) Map<String, String> body, @RequestParam Map<String, String> form) {
    Map<String,String> payload = body != null ? body : form;
    String u = (payload.getOrDefault("username", "")).trim();
    String p = payload.getOrDefault("password", "");
    if (u.isEmpty() || p.isEmpty()) return ResponseEntity.badRequest().body(Map.of("ok", false));
    if (users.findByUsername(u).isPresent()) return ResponseEntity.ok(Map.of("ok", false));
    User user = new User();
    user.setUsername(u);
    user.setPasswordHash(BCrypt.hashpw(p, BCrypt.gensalt()));
    users.save(user);
    return ResponseEntity.ok(Map.of("ok", true));
  }

  @PostMapping(value = "/login")
  public ResponseEntity<?> login(@RequestBody(required = false) Map<String, String> body, @RequestParam Map<String, String> form) {
    Map<String,String> payload = body != null ? body : form;
    String u = (payload.getOrDefault("username", "")).trim();
    String p = payload.getOrDefault("password", "");
    User user = users.findByUsername(u).orElse(null);
    if (user == null || !BCrypt.checkpw(p, user.getPasswordHash())) return ResponseEntity.ok(Map.of("ok", false));
    String token = JwtUtil.generateToken(user.getId(), user.getUsername());
    return ResponseEntity.ok(Map.of("ok", true, "token", token));
  }
}
