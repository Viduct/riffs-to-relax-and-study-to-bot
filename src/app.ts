import dotenv from "dotenv";
import { shuffle } from "d3-array";
import { addSongs, getSongs, initSpotify, removeSongs } from "./services";

dotenv.config();
initSpotify();

const { SONG_POOL_PLAYLIST_ID, PLAYLIST_ID } = process.env;

const fastify = require("fastify")({
   logger: false,
});

fastify.post("/shuffle", async (request, reply) => {
   const songPool = await getSongs(SONG_POOL_PLAYLIST_ID);
   const oldSongs = await getSongs(PLAYLIST_ID);

   if (oldSongs) {
      await removeSongs(PLAYLIST_ID, oldSongs);
   }

   await addSongs(PLAYLIST_ID, shuffle(songPool.map(song => song.uri)).slice(0, 99));

   reply.type("application/json").code(200);
   return { hello: "world" };
});

fastify.listen(3000, (err, address) => {
   if (err) {
      throw err;
   }
   fastify.log.info(`server listening on ${address}`);
});
