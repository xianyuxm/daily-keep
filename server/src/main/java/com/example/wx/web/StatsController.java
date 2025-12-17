package com.example.wx.web;

import com.example.wx.model.Entry;
import com.example.wx.repo.EntryRepository;
import com.example.wx.util.JwtUtil;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.*;

@RestController
@RequestMapping("/stats")
public class StatsController {
  @Autowired
  private EntryRepository entries;

  private Long auth(String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
    String token = authHeader.substring(7);
    return JwtUtil.parseUserId(token);
  }

  @GetMapping("/month")
  public ResponseEntity<?> month(
      @RequestHeader(value = "Authorization", required = false) String authHeader,
      @RequestParam(name = "year") int year,
      @RequestParam(name = "month") int month
  ) {
    Long uid = auth(authHeader);
    if (uid == null) return ResponseEntity.status(401).build();
    String ym = String.format("%04d-%02d", year, month);
    List<Entry> all = entries.findByUserIdOrderByDateDesc(uid);
    Set<String> days = new HashSet<>();
    Map<String,Integer> tagCount = new HashMap<>();
    for (Entry e : all) {
      if (e.getDate() != null && e.getDate().startsWith(ym)) {
        days.add(e.getDate());
        List<String> ts = e.getTags() == null ? List.of() : e.getTags();
        for (String t : ts) tagCount.put(t, tagCount.getOrDefault(t, 0) + 1);
      }
    }
    List<Map<String,Object>> topTags = new ArrayList<>();
    tagCount.entrySet().stream()
      .sorted((a,b) -> Integer.compare(b.getValue(), a.getValue()))
      .limit(5)
      .forEach(e -> topTags.add(Map.of("tag", e.getKey(), "count", e.getValue())));
    return ResponseEntity.ok(Map.of("totalDays", days.size(), "topTags", topTags, "days", days));
  }
}
