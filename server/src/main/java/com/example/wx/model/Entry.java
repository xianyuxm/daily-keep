package com.example.wx.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Entry {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @Column(nullable = false)
  private String date;
  @Column(length = 4000)
  private String text;
  @Column(length = 255)
  private String title;
  @ElementCollection
  private List<String> photos;
  @ElementCollection
  private List<String> tags;
  private String mood;
  private Integer rating;
  private Boolean checkin;
  private String weather;
  private Integer temperature;
  private Long userId;
  private Long createdAt;
  private Long updatedAt;

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getDate() { return date; }
  public void setDate(String date) { this.date = date; }
  public String getText() { return text; }
  public void setText(String text) { this.text = text; }
  public String getTitle() { return title; }
  public void setTitle(String title) { this.title = title; }
  public List<String> getPhotos() { return photos; }
  public void setPhotos(List<String> photos) { this.photos = photos; }
  public List<String> getTags() { return tags; }
  public void setTags(List<String> tags) { this.tags = tags; }
  public String getMood() { return mood; }
  public void setMood(String mood) { this.mood = mood; }
  public Integer getRating() { return rating; }
  public void setRating(Integer rating) { this.rating = rating; }
  public Boolean getCheckin() { return checkin; }
  public void setCheckin(Boolean checkin) { this.checkin = checkin; }
  public String getWeather() { return weather; }
  public void setWeather(String weather) { this.weather = weather; }
  public Integer getTemperature() { return temperature; }
  public void setTemperature(Integer temperature) { this.temperature = temperature; }
  public Long getUserId() { return userId; }
  public void setUserId(Long userId) { this.userId = userId; }
  public Long getCreatedAt() { return createdAt; }
  public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }
  public Long getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(Long updatedAt) { this.updatedAt = updatedAt; }
}
