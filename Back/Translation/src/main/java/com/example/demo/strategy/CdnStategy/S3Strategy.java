package com.example.demo.strategy.CdnStategy;

import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

public class S3Strategy implements CdnBase {

    private final S3Client s3Client;
    private final String bucketName;
    private final String region;
    private final String basePrefix;

    public S3Strategy(S3Client s3Client, String bucketName, String region, String basePrefix) {
        this.s3Client = s3Client;
        this.bucketName = bucketName;
        this.region = region;
        this.basePrefix = basePrefix;
    }

    @Override
    public String upload(MultipartFile file) throws Exception {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String key = basePrefix + "/" + file.getOriginalFilename();

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .contentLength(file.getSize())
                .build();

        s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));

        return buildUrl(key);
    }

    @Override
    public void delete(String url) throws Exception {
        String key = extractKeyFromUrl(url);

        DeleteObjectRequest request = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        s3Client.deleteObject(request);
    }

    private String buildUrl(String key) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);
    }

    private String extractKeyFromUrl(String url) {
        return url.substring(url.indexOf(".amazonaws.com/") + ".amazonaws.com/".length());
    }
}