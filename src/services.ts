import dotenv from "dotenv";
import SpotifyWebApi from "spotify-web-api-node";

dotenv.config();

const {
   SPOTIFY_CLIENT_ID,
   SPOTIFY_CLIENT_SECRET,
   ACCESS_TOKEN,
   REFRESH_TOKEN,
   CODE,
} = process.env;

let spotifyApi;

export const initSpotify = () => {
   spotifyApi = new SpotifyWebApi({
      clientId: SPOTIFY_CLIENT_ID,
      clientSecret: SPOTIFY_CLIENT_SECRET,
      redirectUri: "http://localhost:3000/callback",
   });
   spotifyApi.setAccessToken(ACCESS_TOKEN);
   spotifyApi.setRefreshToken(REFRESH_TOKEN);

   const scopes = ["playlist-modify-private", "playlist-modify-public", "playlist-read-private"];
   const state = "some-state-of-my-choice";

// Create the authorization URL
   const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

   console.log(authorizeURL);

   if (!ACCESS_TOKEN) {
      spotifyApi.authorizationCodeGrant(CODE).then(
         (data) => {
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
};

export const getSongs = async (playlist) => {
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
