import SpotifyWebApi from "spotify-web-api-node";
import { FastifyInstance } from "fastify";
import {
   SPOTIFY_CLIENT_ID,
   SPOTIFY_CLIENT_SECRET,
   ACCESS_TOKEN,
   REFRESH_TOKEN,
   CODE,
   STATE,
   CALLBACK_URL,
} from "./context";

let spotifyApi: SpotifyWebApi;
let fastify: FastifyInstance;

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

   fastify.log.info(authorizeURL);

   if (!ACCESS_TOKEN && CODE) {
      await requestAccess(CODE);
   }
};

export const requestAccess = async (code) => await spotifyApi.authorizationCodeGrant(code).then(setTokens, error);

export const refreshAccess = async () => await spotifyApi.refreshAccessToken().then(setTokens, error);

export const getSongs = async (playlist): Promise<any> => {
   return await spotifyApi.getPlaylistTracks(playlist).then((data) => {
      fastify.log.info(`Getting songs from ${playlist} successful`);
      return data.body.items.map(item => ({
         uri: item.track.uri,
      }));

   }, error);
};

export const removeSongs = async (playlist, songsToRemove) => {
   await spotifyApi.removeTracksFromPlaylist(playlist, songsToRemove, {}).then(() => {
      fastify.log.info(`Removing from ${playlist} successful`);
   }, error);
};

export const addSongs = async (playlist, songsToAdd) => {
   await spotifyApi.addTracksToPlaylist(playlist, songsToAdd, {}).then(() => {
      fastify.log.info(`Adding songs to ${playlist} successful`);
   }, error);
};

const setTokens = (data) => {
   fastify.log.info("Got new access and refresh token");
   spotifyApi.setAccessToken(data.body["access_token"]);
   spotifyApi.setRefreshToken(data.body["refresh_token"]);
}

const error = (error) => {
   fastify.log.error(error)
}
