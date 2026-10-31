import { bootstrap } from "./app.controller";

bootstrap().catch((error: unknown) => {
  console.log("Faild To Start Application", error);
  process.exit(1);
});
