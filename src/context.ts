import dotenv from "dotenv";

dotenv.config();

export const {
   SPOTIFY_CLIENT_ID,
   SPOTIFY_CLIENT_SECRET,
   SONG_POOL_PLAYLIST_ID,
   PLAYLIST_ID,
   SECURITY_TOKEN,
   URL_SUFFIX,
   CALLBACK_URL,
   ACCESS_TOKEN,
   REFRESH_TOKEN,
   CODE,
   STATE,
   PORT
} = process.env;
