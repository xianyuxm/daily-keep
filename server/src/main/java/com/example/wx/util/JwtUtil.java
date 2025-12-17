package com.example.wx.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;

public class JwtUtil {
  private static final Key key = Keys.hmacShaKeyFor("wx-daily-keep-secret-key-1234567890".getBytes());
  public static String generateToken(Long userId, String username) {
    return Jwts.builder()
      .setSubject(username)
      .claim("uid", userId)
      .setIssuedAt(new Date())
      .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 7))
      .signWith(key, SignatureAlgorithm.HS256)
      .compact();
  }
  public static Long parseUserId(String token) {
    try {
      return ((Number) Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().get("uid")).longValue();
    } catch (Exception e) {
      return null;
    }
  }
}
