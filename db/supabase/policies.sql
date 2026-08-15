-- Run after the generated PostgreSQL schema in the Supabase SQL editor.
-- The application route handlers remain the authorization boundary for admin mutations.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public."users" where id = auth.uid()::text and role = 'admin');
$$;

alter table public."users" enable row level security;
alter table public."investorAccounts" enable row level security;
alter table public."portfolioLedger" enable row level security;
alter table public."roiEntries" enable row level security;
alter table public."referralLinks" enable row level security;
alter table public."referralAttributions" enable row level security;
alter table public."referralRewards" enable row level security;
alter table public."referralWithdrawals" enable row level security;
alter table public."notifications" enable row level security;
alter table public."deposits" enable row level security;
alter table public."depositInstructions" enable row level security;
alter table public."kycApplications" enable row level security;
alter table public."investorWithdrawals" enable row level security;
alter table public."traders" enable row level security;
alter table public."plans" enable row level security;

create policy users_self_read on public."users" for select using (id = auth.uid()::text or public.is_admin());
create policy users_self_update on public."users" for update using (id = auth.uid()::text or public.is_admin());
create policy investor_account_self_read on public."investorAccounts" for select using ("investorId" = auth.uid()::text or public.is_admin());
create policy ledger_self_read on public."portfolioLedger" for select using ("investorId" = auth.uid()::text or public.is_admin());
create policy roi_self_read on public."roiEntries" for select using ("investorId" = auth.uid()::text or public.is_admin());
create policy referral_links_self_access on public."referralLinks" for all using ("ownerId" = auth.uid()::text or public.is_admin()) with check ("ownerId" = auth.uid()::text or public.is_admin());
create policy referral_attribution_participant_read on public."referralAttributions" for select using ("referrerId" = auth.uid()::text or "referredInvestorId" = auth.uid()::text or public.is_admin());
create policy referral_reward_participant_read on public."referralRewards" for select using ("referrerId" = auth.uid()::text or "referredInvestorId" = auth.uid()::text or public.is_admin());
create policy referral_withdrawal_owner_access on public."referralWithdrawals" for all using ("investorId" = auth.uid()::text or public.is_admin()) with check ("investorId" = auth.uid()::text or public.is_admin());
create policy notifications_owner_read on public."notifications" for select using ("userId" = auth.uid()::text or public.is_admin());
create policy deposits_owner_read on public."deposits" for select using ("investorId" = auth.uid()::text or public.is_admin());
create policy deposit_instructions_authenticated_read on public."depositInstructions" for select using (auth.uid() is not null and active = 1 or public.is_admin());
create policy kyc_owner_access on public."kycApplications" for all using ("investorId" = auth.uid()::text or public.is_admin()) with check ("investorId" = auth.uid()::text or public.is_admin());
create policy investor_withdrawal_owner_access on public."investorWithdrawals" for all using ("investorId" = auth.uid()::text or public.is_admin()) with check ("investorId" = auth.uid()::text or public.is_admin());
create policy traders_authenticated_read on public."traders" for select using (auth.uid() is not null);
create policy plans_authenticated_read on public."plans" for select using (auth.uid() is not null and active = 1);

-- Storage bucket: create a private bucket named quantovest-media first.
insert into storage.buckets (id, name, public) values ('quantovest-media', 'quantovest-media', false) on conflict (id) do nothing;
create policy media_owner_read on storage.objects for select using (bucket_id = 'quantovest-media' and (storage.foldername(name))[2] = auth.uid()::text);
create policy media_owner_insert on storage.objects for insert with check (bucket_id = 'quantovest-media' and (storage.foldername(name))[2] = auth.uid()::text);
create policy media_owner_update on storage.objects for update using (bucket_id = 'quantovest-media' and (storage.foldername(name))[2] = auth.uid()::text);
create policy media_owner_delete on storage.objects for delete using (bucket_id = 'quantovest-media' and (storage.foldername(name))[2] = auth.uid()::text);
create policy media_admin_read on storage.objects for select using (bucket_id = 'quantovest-media' and public.is_admin());
