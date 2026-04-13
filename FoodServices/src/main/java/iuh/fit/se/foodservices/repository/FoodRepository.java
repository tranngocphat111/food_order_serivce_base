package iuh.fit.se.foodservices.repository;

import iuh.fit.se.foodservices.entity.Foods;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodRepository extends JpaRepository<Foods, Long> {
}
