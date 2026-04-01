package iuh.fit.se.foodservices.controller;

import iuh.fit.se.foodservices.entity.Food;
import iuh.fit.se.foodservices.repository.FoodRepository;
import iuh.fit.se.foodservices.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/foods")
public class FoodController {

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private S3Service s3Service;

    @GetMapping
    public List<Food> getAllFoods() {
        return foodRepository.findAll();
    }

    @PostMapping
    public Food createFood(@RequestBody Food food) {
        food.setCreatedAt(LocalDateTime.now());
        food.setUpdatedAt(LocalDateTime.now());
        if (food.getIsAvailable() == null) {
            food.setIsAvailable(true);
        }
        if (food.getStockQty() == null) {
            food.setStockQty(100);
        }
        return foodRepository.save(food);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Food> updateFood(@PathVariable Long id, @RequestBody Food foodDetails) {
        Optional<Food> optionalFood = foodRepository.findById(id);
        if (optionalFood.isPresent()) {
            Food food = optionalFood.get();
            food.setName(foodDetails.getName());
            food.setPrice(foodDetails.getPrice());
            food.setDescription(foodDetails.getDescription());
            food.setCategoryId(foodDetails.getCategoryId());
            food.setIsAvailable(foodDetails.getIsAvailable());
            food.setStockQty(foodDetails.getStockQty());
            food.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(foodRepository.save(food));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFood(@PathVariable Long id) {
        if (foodRepository.existsById(id)) {
            Food food = foodRepository.findById(id).orElse(null);
            // Delete image from S3 if it exists
            if (food != null && food.getImageUrl() != null && !food.getImageUrl().isEmpty()) {
                try {
                    extractAndDeleteFromS3(food.getImageUrl());
                } catch (Exception ignored) {
                }
            }
            foodRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<Food> uploadFoodImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        java.util.Optional<Food> optionalFood = foodRepository.findById(id);
        if (!optionalFood.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Food food = optionalFood.get();

            // Delete old image if exists
            if (food.getImageUrl() != null && !food.getImageUrl().isEmpty()) {
                try {
                    extractAndDeleteFromS3(food.getImageUrl());
                } catch (Exception ignored) {
                }
            }

            // Upload new image
            String key = s3Service.uploadFile(file);
            String url = s3Service.getFileUrl(key);
            food.setImageUrl(url);
            food.setUpdatedAt(LocalDateTime.now());
            Food saved = foodRepository.save(food);
            return ResponseEntity.ok(saved);
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{id}/image")
    public ResponseEntity<Void> deleteFoodImage(@PathVariable Long id) {
        java.util.Optional<Food> optionalFood = foodRepository.findById(id);
        if (!optionalFood.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Food food = optionalFood.get();
        if (food.getImageUrl() != null && !food.getImageUrl().isEmpty()) {
            try {
                extractAndDeleteFromS3(food.getImageUrl());
            } catch (Exception ignored) {
            }
            food.setImageUrl(null);
            food.setUpdatedAt(LocalDateTime.now());
            foodRepository.save(food);
        }
        return ResponseEntity.noContent().build();
    }

    /**
     * Helper method to extract S3 key from URL and delete the object.
     * URL format: https://bucket-name.s3.region.amazonaws.com/key
     */
    private void extractAndDeleteFromS3(String imageUrl) {
        try {
            // Extract key from URL (key is the path after the domain)
            String key = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            s3Service.deleteFile(key);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete image from S3", e);
        }
    }
}
