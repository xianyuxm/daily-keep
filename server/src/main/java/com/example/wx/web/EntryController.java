package com.example.wx.web;

import com.example.wx.model.Entry;
import com.example.wx.repo.EntryRepository;
import com.example.wx.util.JwtUtil;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/entries")
public class EntryController {
  @Autowired
  private EntryRepository entries;
  @Value("${uploads.root:${user.dir}/uploads}")
  private String uploadsRoot;

  private Long auth(String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
    String token = authHeader.substring(7);
    return JwtUtil.parseUserId(token);
  }

  @GetMapping("")
  public ResponseEntity<?> list(@RequestHeader(value = "Authorization", required = false) String authHeader) {
    Long uid = auth(authHeader);
    if (uid == null) return ResponseEntity.status(401).build();
    return ResponseEntity.ok(entries.findByUserIdOrderByDateDesc(uid));
  }

  @PostMapping("")
  public ResponseEntity<?> upsert(@RequestHeader(value = "Authorization", required = false) String authHeader, @RequestBody Entry body) {
    Long uid = auth(authHeader);
    if (uid == null) return ResponseEntity.status(401).build();
    List<Entry> sameDate = entries.findByUserIdAndDate(uid, body.getDate());
    Entry e = sameDate.isEmpty() ? new Entry() : sameDate.get(0);
    e.setUserId(uid);
    e.setDate(body.getDate());
    e.setTitle(body.getTitle());
    e.setText(body.getText());
    e.setPhotos(body.getPhotos());
    e.setTags(body.getTags());
    e.setMood(body.getMood());
    e.setRating(body.getRating());
    e.setCheckin(body.getCheckin());
    e.setWeather(body.getWeather());
    e.setTemperature(body.getTemperature());
    e.setUpdatedAt(System.currentTimeMillis());
    if (e.getId() == null) e.setCreatedAt(System.currentTimeMillis());
    entries.save(e);
    return ResponseEntity.ok(e);
  }

  @PostMapping("/upload")
  public ResponseEntity<?> upload(@RequestHeader(value = "Authorization", required = false) String authHeader, @RequestParam("file") MultipartFile file) throws Exception {
    Long uid = auth(authHeader);
    if (uid == null) return ResponseEntity.status(401).build();
    Path dir = Paths.get(uploadsRoot, String.valueOf(uid));
    Files.createDirectories(dir);
    String filename = System.currentTimeMillis() + "-" + UUID.randomUUID() + "-" + Objects.requireNonNull(file.getOriginalFilename()).replaceAll("\\s+", "_");
    Path path = dir.resolve(filename);
    Files.write(path, file.getBytes());
    String url = "/uploads/" + uid + "/" + filename;
    return ResponseEntity.ok(Map.of("url", url));
  }
}
