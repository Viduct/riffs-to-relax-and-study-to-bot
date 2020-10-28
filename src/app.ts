import { shuffle } from "d3-array";
import { addSongs, getSongs, initSpotify, refreshAccess, removeSongs, requestAccess } from "./services";
import fastifyCors from "fastify-cors";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { PLAYLIST_ID, PORT, SECURITY_TOKEN, SONG_POOL_PLAYLIST_ID, STATE, URL_SUFFIX } from "./context";

const initServer = async () => {

   const fastify: FastifyInstance = require("fastify")({
      logger: {
         level: "info",
      },
   });

   await initSpotify(fastify);

   fastify.register(fastifyCors, {
         origin: "*",
      },
   );

   fastify.addSchema({
      $id: "shuffle",
      type: "object",
      properties: {
         token: { type: "string" },
      },
   });

   fastify.post(`/shuffle-${URL_SUFFIX}`, {
      schema: {
         body: { $ref: "shuffle#" },
      },
      handler: async (request: FastifyRequest, reply: FastifyReply) => {
         if (request.body["token"] !== SECURITY_TOKEN) {
            reply.type("application/json").code(401);
            return { message: `Not authorized` };
         }

         fastify.log.info(`Received request to /shuffle`);

         await refreshAccess();

         const songPool = await getSongs(SONG_POOL_PLAYLIST_ID);
         const oldSongs = await getSongs(PLAYLIST_ID);

         if (oldSongs) {
            await removeSongs(PLAYLIST_ID, oldSongs);
         }

         await addSongs(PLAYLIST_ID, shuffle(songPool.map(song => song.uri)).slice(0, 99));

         reply.type("application/json").code(200);
         return { message: `Successfully shuffled playlist with ID ${SONG_POOL_PLAYLIST_ID}.` };
      },
   });

   fastify.get("/callback", async (request: FastifyRequest, reply: FastifyReply) => {
      const { code, state } = request.query as any;

      fastify.log.info(`Received callback`);

      if (state !== STATE) {
         fastify.log.info(`State doesn't match`);
         reply.type("application/json").code(401);
         return { message: "error" };
      }

      await requestAccess(code);

      reply.type("application/json").code(200);
      return { message: "success" };
   });

   fastify.listen(PORT, "0.0.0.0", (err, address) => {
      if (err) {
         throw err;
      }
      fastify.log.info(`server listening on ${address}`);
   });
};

initServer().then(() => console.log("Server initialized!"));
