-- Add menu availability columns
ALTER TABLE menus
ADD COLUMN is_always_available boolean DEFAULT true,
ADD COLUMN available_start_time time DEFAULT '00:00',
ADD COLUMN available_end_time time DEFAULT '23:59';

-- Drop the type column since we're replacing it with availability
ALTER TABLE menus
DROP COLUMN type;
