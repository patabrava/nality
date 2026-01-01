-- Ensure public.users is rebuilt if it was manually cleared but auth.users still has records
-- This reuses handle_new_user with an UPSERT to restore missing public.users rows on any auth.users update (e.g., last_sign_in_at changes on login).

-- Clean up in case it already exists
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Recreate trigger to upsert into public.users whenever auth.users is updated
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
