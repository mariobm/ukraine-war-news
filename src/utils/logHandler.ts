import { createLogger } from "bunyan";

export const log = createLogger({
  level: "info",
  name: "ukraine-news",
});
