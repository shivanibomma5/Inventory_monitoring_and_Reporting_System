package com.inventory.security;

import com.inventory.entity.Role;
import com.inventory.entity.User;
import com.inventory.utils.AuthUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class AuthUtilTest {

    private AuthUtil authUtil;

    // Same Base64 key as application.properties
    private static final String SECRET =
            "dGhpcy1pcy1hLXNlY3JldC1rZXktZm9yLWludmVudG9yeS1zeXN0ZW0tMjAyNg==";

    private User adminUser;
    private User staffUser;

    @BeforeEach
    void setUp() {
        authUtil = new AuthUtil();
        // Inject @Value fields manually in unit tests (no Spring context)
        ReflectionTestUtils.setField(authUtil, "secretKey", SECRET);
        ReflectionTestUtils.setField(authUtil, "expirationMs", 86400000L); // 24h

        adminUser = User.builder()
                .id(1L).username("admin").password("hashed")
                .email("admin@test.com").role(Role.ADMIN).active(true).build();

        staffUser = User.builder()
                .id(2L).username("staff1").password("hashed")
                .email("cust@test.com").role(Role.STAFF).active(true).build();
    }

    // ── generateToken / extractUsername ───────────────────────────────────────

    @Test
    void generateToken_returnsNonNullToken() {
        String token = authUtil.generateToken(adminUser);
        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    void extractUsername_fromGeneratedToken_returnsCorrectUsername() {
        String token = authUtil.generateToken(adminUser);
        assertEquals("admin", authUtil.extractUsername(token));
    }

    @Test
    void extractUsername_differentUsers_returnCorrectUsernames() {
        String adminToken    = authUtil.generateToken(adminUser);
        String staffToken = authUtil.generateToken(staffUser);
        assertEquals("admin",     authUtil.extractUsername(adminToken));
        assertEquals("staff1", authUtil.extractUsername(staffToken));
    }

    // ── extractRole ───────────────────────────────────────────────────────────

    @Test
    void extractRole_adminToken_returnsADMIN() {
        String token = authUtil.generateToken(adminUser);
        assertEquals("ADMIN", authUtil.extractRole(token));
    }

    @Test
    void extractRole_staffToken_returnsSTAFF() {
        String token = authUtil.generateToken(staffUser);
        assertEquals("STAFF", authUtil.extractRole(token));
    }

    // ── isTokenValid ──────────────────────────────────────────────────────────

    @Test
    void isTokenValid_correctUserAndFreshToken_returnsTrue() {
        String token = authUtil.generateToken(adminUser);
        assertTrue(authUtil.isTokenValid(token, adminUser));
    }

    @Test
    void isTokenValid_tokenBelongsToOtherUser_returnsFalse() {
        String adminToken = authUtil.generateToken(adminUser);
        // staff1's username won't match "admin" in the token
        assertFalse(authUtil.isTokenValid(adminToken, staffUser));
    }

    @Test
    void isTokenValid_expiredToken_returnsFalse() {
        // Override expiry to -1ms (already expired)
        ReflectionTestUtils.setField(authUtil, "expirationMs", -1L);
        String token = authUtil.generateToken(adminUser);
        assertFalse(authUtil.isTokenValid(token, adminUser));
    }

    // ── malformed token ───────────────────────────────────────────────────────

    @Test
    void extractUsername_malformedToken_throwsException() {
        assertThrows(Exception.class, () -> authUtil.extractUsername("not.a.jwt"));
    }

    @Test
    void extractUsername_emptyToken_throwsException() {
        assertThrows(Exception.class, () -> authUtil.extractUsername(""));
    }
}
