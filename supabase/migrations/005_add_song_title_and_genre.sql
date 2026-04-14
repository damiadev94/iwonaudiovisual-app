-- ============================================
-- ADD SONG TITLE AND GENRE TO SUBMISSIONS
-- ============================================

alter table public.song_submissions 
add column song_title text;

alter table public.song_submissions 
add column genre text;

comment on column public.song_submissions.song_title is 'El nombre de la cancion enviada por el artista';
comment on column public.song_submissions.genre is 'El genero musical de la cancion';
