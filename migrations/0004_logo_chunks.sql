CREATE TABLE IF NOT EXISTS brand_logo_chunks (
  logoId TEXT NOT NULL REFERENCES brand_logos(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  data TEXT NOT NULL,
  PRIMARY KEY (logoId, position)
);
CREATE TRIGGER IF NOT EXISTS cleanup_brand_logo_chunks AFTER DELETE ON brand_logos
BEGIN
  DELETE FROM brand_logo_chunks WHERE logoId = OLD.id;
END;
