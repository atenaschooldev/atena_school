-- Migration: Automatically synchronize promo_codes.used_count on booking deletion or cancellation
-- When a booking is deleted or marked as cancelled (booking_status = 3), decrement the promo code used_count.
-- When a booking is uncancelled or promo_code_id changes, adjust accordingly.

CREATE OR REPLACE FUNCTION trg_bookings_sync_promo_used_count()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Handling DELETE
  IF (TG_OP = 'DELETE') THEN
    IF OLD.promo_code_id IS NOT NULL AND (OLD.booking_status IS NULL OR OLD.booking_status != 3) THEN
      UPDATE promo_codes
      SET used_count = GREATEST(0, used_count - 1),
          updated_at = NOW()
      WHERE id = OLD.promo_code_id;
    END IF;
    RETURN OLD;
  END IF;

  -- 2. Handling UPDATE
  IF (TG_OP = 'UPDATE') THEN
    -- Case A: Booking became CANCELLED (3)
    IF (OLD.booking_status IS NULL OR OLD.booking_status != 3) AND NEW.booking_status = 3 THEN
      IF NEW.promo_code_id IS NOT NULL THEN
        UPDATE promo_codes
        SET used_count = GREATEST(0, used_count - 1),
            updated_at = NOW()
        WHERE id = NEW.promo_code_id;
      END IF;

    -- Case B: Booking was reactivated from CANCELLED (3)
    ELSIF OLD.booking_status = 3 AND (NEW.booking_status IS NULL OR NEW.booking_status != 3) THEN
      IF NEW.promo_code_id IS NOT NULL THEN
        UPDATE promo_codes
        SET used_count = used_count + 1,
            updated_at = NOW()
        WHERE id = NEW.promo_code_id;
      END IF;

    -- Case C: Promo code changed on an active booking
    ELSIF (NEW.booking_status IS NULL OR NEW.booking_status != 3) AND (OLD.promo_code_id IS DISTINCT FROM NEW.promo_code_id) THEN
      IF OLD.promo_code_id IS NOT NULL THEN
        UPDATE promo_codes
        SET used_count = GREATEST(0, used_count - 1),
            updated_at = NOW()
        WHERE id = OLD.promo_code_id;
      END IF;
      IF NEW.promo_code_id IS NOT NULL THEN
        UPDATE promo_codes
        SET used_count = used_count + 1,
            updated_at = NOW()
        WHERE id = NEW.promo_code_id;
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bookings_sync_promo ON bookings;

CREATE TRIGGER trg_bookings_sync_promo
AFTER DELETE OR UPDATE OF booking_status, promo_code_id ON bookings
FOR EACH ROW
EXECUTE FUNCTION trg_bookings_sync_promo_used_count();

-- Recalculate and synchronize all existing promo codes used_count accurately
UPDATE promo_codes p
SET used_count = COALESCE((
  SELECT COUNT(*)::int
  FROM bookings b
  WHERE b.promo_code_id = p.id
    AND (b.booking_status IS NULL OR b.booking_status != 3)
), 0);
