-- The public Orientation catalogue is fetched server-side with the publishable
-- key and no persisted authenticated session. Keep the intentional anon reader,
-- but do not expose this SECURITY DEFINER RPC to arbitrary signed-in accounts.

revoke execute on function public.read_orientation_program_catalog()
  from authenticated;
