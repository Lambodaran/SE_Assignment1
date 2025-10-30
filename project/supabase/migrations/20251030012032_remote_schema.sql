drop extension if exists "pg_net";

drop policy "Anyone can submit scores" on "public"."leaderboard";

drop policy "Anyone can view leaderboard" on "public"."leaderboard";


  create policy "Anyone can submit scores"
  on "public"."leaderboard"
  as permissive
  for insert
  to anon, authenticated
with check (true);



  create policy "Anyone can view leaderboard"
  on "public"."leaderboard"
  as permissive
  for select
  to anon, authenticated
using (true);



