package com.example.wx.repo;

import com.example.wx.model.Entry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EntryRepository extends JpaRepository<Entry, Long> {
  List<Entry> findByUserIdOrderByDateDesc(Long userId);
  List<Entry> findByUserIdAndDate(Long userId, String date);
}
