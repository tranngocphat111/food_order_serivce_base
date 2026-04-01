package iuh.fit.se.foodservices.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Utilities;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3Service {

    private final S3Client s3;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.region}")
    private String region;

    public S3Service(@Value("${aws.region}") String region) {
        String accessKey = System.getProperty("AWS_ACCESS_KEY_ID");
        String secretKey = System.getProperty("AWS_SECRET_ACCESS_KEY");

        if (accessKey != null && secretKey != null) {
            // Build S3Client with explicit credentials from .env
            AwsBasicCredentials awsCreds = AwsBasicCredentials.create(accessKey, secretKey);
            this.s3 = S3Client.builder()
                    .region(Region.of(region))
                    .credentialsProvider(StaticCredentialsProvider.create(awsCreds))
                    .build();
        } else {
            // Fallback: use default credential provider chain (env vars, shared credentials file, IAM role, etc.)
            this.s3 = S3Client.builder()
                    .region(Region.of(region))
                    .build();
        }
    }

    public String uploadFile(MultipartFile file) throws IOException {
        String key = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

        PutObjectRequest por = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .acl(ObjectCannedACL.PUBLIC_READ)
                .contentType(file.getContentType())
                .build();

        s3.putObject(por, RequestBody.fromBytes(file.getBytes()));
        return key;
    }

    public String getFileUrl(String key) {
        S3Utilities utilities = s3.utilities();
        GetUrlRequest request = GetUrlRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();
        return utilities.getUrl(request).toExternalForm();
    }

    public void deleteFile(String key) {
        DeleteObjectRequest dor = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();
        s3.deleteObject(dor);
    }
}
