package com.example.wx.web;

import com.example.wx.model.Entry;
import com.example.wx.repo.EntryRepository;
import com.example.wx.util.JwtUtil;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.*;

@RestController
@RequestMapping("/search")
public class SearchController {
  @Autowired
  private EntryRepository entries;

  private Long auth(String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
    String token = authHeader.substring(7);
    return JwtUtil.parseUserId(token);
  }

  @GetMapping("")
  public ResponseEntity<?> search(
    @RequestHeader(value = "Authorization", required = false) String authHeader,
    @RequestParam(name = "keyword", required = false) String keyword,
    @RequestParam(name = "tags", required = false) List<String> tags,
    @RequestParam(name = "startDate", required = false) String startDate,
    @RequestParam(name = "endDate", required = false) String endDate,
    @RequestParam(name = "mood", required = false) String mood,
    @RequestParam(name = "minRating", required = false) Integer minRating,
    @RequestParam(name = "checkin", required = false) Boolean checkin
  ) {
    Long uid = auth(authHeader);
    if (uid == null) return ResponseEntity.status(401).build();
    List<Entry> all = entries.findByUserIdOrderByDateDesc(uid);
    List<Entry> res = new ArrayList<>();
    for (Entry e : all) {
      if (keyword != null && (e.getText() == null || !e.getText().contains(keyword))) continue;
      if (tags != null && !tags.isEmpty()) {
        List<String> et = e.getTags() == null ? List.of() : e.getTags();
        boolean ok = true;
        for (String t : tags) if (!et.contains(t)) ok = false;
        if (!ok) continue;
      }
      if (mood != null && !mood.isEmpty() && !mood.equals(e.getMood())) continue;
      if (minRating != null && (e.getRating() == null ? 0 : e.getRating()) < minRating) continue;
      if (checkin != null && ((e.getCheckin() == null ? false : e.getCheckin()) != checkin)) continue;
      if (startDate != null && startDate.length() > 0 && e.getDate().compareTo(startDate) < 0) continue;
      if (endDate != null && endDate.length() > 0 && e.getDate().compareTo(endDate) > 0) continue;
      res.add(e);
    }
    return ResponseEntity.ok(res);
  }
}
