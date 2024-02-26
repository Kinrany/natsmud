import * as nats from "https://deno.land/x/nats@v1.16.0/src/mod.ts";

const gracefulExit = (client: nats.NatsConnection) => async () => {
  await client.close();
  Deno.exit();
};

if (import.meta.main) {
  const client = await nats.connect({ servers: "nats://demo.nats.io:4222" });
  console.log("Connected to " + client.getServer());
  // const jetstream = await client.jetstreamManager();
  // const stream = await jetstream.streams.add({
  //   name: "MUD",
  //   subjects: ["mud.>"],
  // });
  const service = await client.services.add({
    name: "mud",
    version: "1.0.0",
    description: "Lets build a multi-user dungeon!",
  });
  const group = service.addGroup("mud");
  group.addEndpoint("help", (err, msg) => {
    if (err) {
      console.error(err);
      return;
    }

    msg.respond(
      "Welcome to the MUD! Type 'nats req mud.join' to start playing.",
    );
  });
  group.addEndpoint("join", (err, msg) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log("Received:", msg.headers, msg.string());
    msg.respondError(420, "Not implemented");
  });

  Deno.addSignalListener("SIGINT", gracefulExit(client));
  Deno.addSignalListener("SIGTERM", gracefulExit(client));
}
