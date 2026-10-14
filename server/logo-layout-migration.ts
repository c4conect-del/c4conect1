export const logoLayoutMigration = `ALTER TABLE brands ADD COLUMN logoScale REAL NOT NULL DEFAULT 1 CHECK(logoScale >= 0.5 AND logoScale <= 3);
ALTER TABLE brands ADD COLUMN logoX REAL NOT NULL DEFAULT 0 CHECK(logoX >= -50 AND logoX <= 50);
ALTER TABLE brands ADD COLUMN logoY REAL NOT NULL DEFAULT 0 CHECK(logoY >= -50 AND logoY <= 50);
INSERT OR IGNORE INTO metadata VALUES ('logo-layout-migrated');
`;
