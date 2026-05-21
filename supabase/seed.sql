-- NOTE: the audio_path values are PLACEHOLDERS. The Player milestone replaces them
-- with real public URLs of royalty-free MP3s uploaded to the `audio` storage bucket.
insert into public.categories (id, name, accent_color) values
  ('11111111-1111-1111-1111-111111111111', 'Meditation', '#22D795'),
  ('22222222-2222-2222-2222-222222222222', 'Sleep',      '#00A462'),
  ('33333333-3333-3333-3333-333333333333', 'Move',       '#D3F761'),
  ('44444444-4444-4444-4444-444444444444', 'Focus',      '#6D9100');

insert into public.tracks (title, subtitle, category_id, duration_sec, audio_path, image_url) values
  ('Morning calm', 'Stress relief', '11111111-1111-1111-1111-111111111111', 600, '<public-url-1.mp3>', null),
  ('Stress release', 'Meditation',  '11111111-1111-1111-1111-111111111111', 480, '<public-url-2.mp3>', null),
  ('Night sky cast', 'Sleep',       '22222222-2222-2222-2222-222222222222', 1800, '<public-url-3.mp3>', null),
  ('Morning yoga', 'Move',          '33333333-3333-3333-3333-333333333333', 900, '<public-url-4.mp3>', null),
  ('Deep work', 'Focus',            '44444444-4444-4444-4444-444444444444', 1500, '<public-url-5.mp3>', null);
