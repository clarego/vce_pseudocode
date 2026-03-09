/*
  # Enable Realtime for Leaderboard Table

  Adds the leaderboard table to Supabase's realtime publication
  so that clients subscribed via postgres_changes receive live updates
  whenever leaderboard rows are inserted or updated.
*/

alter publication supabase_realtime add table leaderboard;
