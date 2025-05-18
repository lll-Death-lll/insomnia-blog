-- Add disabled parameter
ALTER TABLE users ADD is_disabled BOOLEAN DEFAULT FALSE;

-- Update existing users
UPDATE users
SET
    is_disabled = FALSE
WHERE
    is_disabled IS NULL;

-- Set not null
ALTER TABLE users
ALTER COLUMN is_disabled
SET
    NOT NULL;
