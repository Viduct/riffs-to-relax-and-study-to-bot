import dotenv from "dotenv";
import SpotifyWebApi from "spotify-web-api-node";

dotenv.config();

const {
   SPOTIFY_CLIENT_ID,
   SPOTIFY_CLIENT_SECRET,
   ACCESS_TOKEN,
   REFRESH_TOKEN,
   CODE,
   STATE,
   CALLBACK_URL,
} = process.env;

let spotifyApi: SpotifyWebApi;

export const initSpotify = async () => {
   spotifyApi = new SpotifyWebApi({
      clientId: SPOTIFY_CLIENT_ID,
      clientSecret: SPOTIFY_CLIENT_SECRET,
      redirectUri: CALLBACK_URL,
   });
   spotifyApi.setAccessToken(ACCESS_TOKEN);
   spotifyApi.setRefreshToken(REFRESH_TOKEN);

   const scopes = ["playlist-modify-private", "playlist-modify-public", "playlist-read-private"];

   const authorizeURL = spotifyApi.createAuthorizeURL(scopes, STATE);

   console.log(authorizeURL);

   if (!ACCESS_TOKEN && CODE) {
      await requestAccess(CODE);
   }
};

export const requestAccess = async (code) => {
   return await spotifyApi.authorizationCodeGrant(code).then(
      (data) => {
         console.log("Got access token");
         console.log("The token expires in " + data.body["expires_in"]);
         console.log("The access token is " + data.body["access_token"]);
         console.log("The refresh token is " + data.body["refresh_token"]);

         // Set the access token on the API object to use it in later calls
         spotifyApi.setAccessToken(data.body["access_token"]);
         spotifyApi.setRefreshToken(data.body["refresh_token"]);
      },
      (err) => {
         console.log("Something went wrong!", err);
      },
   );
}

export const getSongs = async (playlist): Promise<any> => {
   return await spotifyApi.getPlaylistTracks(playlist).then((data) => {
      console.log(`Getting songs from ${playlist} successful`);
      return data.body.items.map(item => ({
         uri: item.track.uri,
      }));

   }, (err) => {
      console.log("Something went wrong!", err);
   });
};

export const removeSongs = async (playlist, songsToRemove) => {
   await spotifyApi.removeTracksFromPlaylist(playlist, songsToRemove, {}).then((data) => {
      console.log(`Removing from ${playlist} successful`);
   }, (err) => {
      console.log("Something went wrong!", err);
   });
};

export const addSongs = async (playlist, songsToAdd) => {
   await spotifyApi.addTracksToPlaylist(playlist, songsToAdd, {}).then((data) => {
      console.log(`Adding songs to ${playlist} successful`);
   }, (err) => {
      console.log("Something went wrong!", err);
   });
};
