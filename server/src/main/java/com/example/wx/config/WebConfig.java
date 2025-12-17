package com.example.wx.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
  @Value("${uploads.root:${user.dir}/uploads}")
  private String uploadsRoot;
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
      .allowedOrigins("*")
      .allowedMethods("GET","POST","PUT","DELETE","OPTIONS")
      .allowedHeaders("*")
      .allowCredentials(false);
  }
  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    String location = "file:" + (uploadsRoot.endsWith("/") ? uploadsRoot : uploadsRoot + "/");
    registry.addResourceHandler("/uploads/**").addResourceLocations(location);
  }
}
