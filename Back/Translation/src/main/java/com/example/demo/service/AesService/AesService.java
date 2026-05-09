package com.example.demo.service.AesService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;

@Component
public class AesService{

    @Value("${aes.secret.key}")
    private String secretKey;

    private SecretKeySpec getKey() {
        byte[] key = secretKey.getBytes(StandardCharsets.UTF_8);
        return new SecretKeySpec(Arrays.copyOf(key, 32), "AES");
    }

    public String encrypt(String data) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, getKey());
        return Base64.getEncoder().encodeToString(cipher.doFinal(data.getBytes()));
    }

    public String decrypt(String encrypted) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, getKey());
        return new String(cipher.doFinal(Base64.getDecoder().decode(encrypted)));
    }
}