CREATE TABLE IF NOT EXISTS brand_logos (
  id TEXT PRIMARY KEY,
  mime TEXT NOT NULL,
  data TEXT NOT NULL
);
CREATE TRIGGER IF NOT EXISTS cleanup_replaced_brand_logo AFTER UPDATE OF logoUrl ON brands
WHEN OLD.logoUrl <> NEW.logoUrl
BEGIN
  DELETE FROM brand_logos WHERE '/api/logos/' || id = OLD.logoUrl
    AND NOT EXISTS (SELECT 1 FROM brands WHERE logoUrl = OLD.logoUrl);
END;
CREATE TRIGGER IF NOT EXISTS cleanup_deleted_brand_logo AFTER DELETE ON brands
BEGIN
  DELETE FROM brand_logos WHERE '/api/logos/' || id = OLD.logoUrl
    AND NOT EXISTS (SELECT 1 FROM brands WHERE logoUrl = OLD.logoUrl);
END;
