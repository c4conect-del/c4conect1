export const logoPreviewMigration = `CREATE TRIGGER IF NOT EXISTS cleanup_brand_logo_preview AFTER DELETE ON brand_logos
BEGIN
  DELETE FROM brand_logos WHERE id = OLD.id || '-preview';
END;
`;
