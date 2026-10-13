CREATE TABLE IF NOT EXISTS brands (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, logoUrl TEXT NOT NULL DEFAULT '', logoKey TEXT NOT NULL DEFAULT '', active INTEGER NOT NULL DEFAULT 1);
INSERT INTO brands SELECT 'gold-premium','gold-premium','Gold Premium Series','','gold-premium',1 WHERE NOT EXISTS (SELECT 1 FROM metadata WHERE key='brands-seeded');
INSERT INTO brands SELECT 'landerlan','landerlan','Landerlan','','landerlan',1 WHERE NOT EXISTS (SELECT 1 FROM metadata WHERE key='brands-seeded');
INSERT INTO brands SELECT 'zphc','zphc','ZPHC','','zphc',1 WHERE NOT EXISTS (SELECT 1 FROM metadata WHERE key='brands-seeded');
INSERT INTO brands SELECT 'cooper-pharma','cooper-pharma','Cooper Pharma','','cooper-pharma',1 WHERE NOT EXISTS (SELECT 1 FROM metadata WHERE key='brands-seeded');
INSERT INTO brands SELECT 'canada-labs','canada-labs','Canada Labs','','canada-labs',1 WHERE NOT EXISTS (SELECT 1 FROM metadata WHERE key='brands-seeded');
INSERT INTO brands SELECT 'alpha-pharma','alpha-pharma','Alpha Pharma','','alpha-pharma',1 WHERE NOT EXISTS (SELECT 1 FROM metadata WHERE key='brands-seeded');
INSERT INTO brands SELECT 'pharmacom','pharmacom','Pharmacom Labs','','pharmacom',1 WHERE NOT EXISTS (SELECT 1 FROM metadata WHERE key='brands-seeded');
INSERT OR IGNORE INTO metadata VALUES ('brands-seeded');
CREATE TRIGGER IF NOT EXISTS protect_brand_deletion BEFORE DELETE ON brands
WHEN EXISTS (SELECT 1 FROM products WHERE brandSlug=OLD.slug)
BEGIN SELECT RAISE(ABORT, 'A marca possui produtos vinculados'); END;
CREATE TRIGGER IF NOT EXISTS require_product_brand BEFORE INSERT ON products
WHEN NOT EXISTS (SELECT 1 FROM brands WHERE slug=NEW.brandSlug)
BEGIN SELECT RAISE(ABORT, 'Marca inexistente'); END;
CREATE TRIGGER IF NOT EXISTS require_updated_product_brand BEFORE UPDATE OF brandSlug ON products
WHEN NOT EXISTS (SELECT 1 FROM brands WHERE slug=NEW.brandSlug)
BEGIN SELECT RAISE(ABORT, 'Marca inexistente'); END;
