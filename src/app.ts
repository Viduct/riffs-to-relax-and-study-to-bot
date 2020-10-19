import dotenv from "dotenv";
import { shuffle } from "d3-array";
import { addSongs, getSongs, initSpotify, removeSongs, requestAccess } from "./services";
import fastifyCors from "fastify-cors";
import { FastifyReply, FastifyRequest } from "fastify";

dotenv.config();
initSpotify();

const { SONG_POOL_PLAYLIST_ID, PLAYLIST_ID, STATE, PORT } = process.env;

const fastify = require("fastify")({
   logger: true,
});

fastify.register(fastifyCors, {
      origin: () => {
         return true;
      },
   },
);

fastify.post("/shuffle", async (request, reply) => {
   console.log("Received request to /shuffle");
   const songPool = await getSongs(SONG_POOL_PLAYLIST_ID);
   const oldSongs = await getSongs(PLAYLIST_ID);

   if (oldSongs) {
      await removeSongs(PLAYLIST_ID, oldSongs);
   }

   await addSongs(PLAYLIST_ID, shuffle(songPool.map(song => song.uri)).slice(0, 99));

   reply.type("application/json").code(200);
   return { hello: "world" };
});

fastify.get("/callback", async (request: FastifyRequest, reply: FastifyReply) => {
   const { code, state } = request.query as any;

   console.log("Received callback from Spotify");

   if (state !== STATE) {
      console.log("State doesn't match");
      console.log(state);
      console.log(STATE);
      reply.type("application/json").code(403);
      return { message: "error" };
   }

   console.log("Will request access token");
   await requestAccess(code);

   reply.type("application/json").code(200);
   return { message: "success" };
});

fastify.listen(PORT, '0.0.0.0', (err, address) => {
   if (err) {
      throw err;
   }
   fastify.log.info(`server listening on ${address}`);
});
