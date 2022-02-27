import { log } from "./logHandler.js";
export const errorHandler = (context: string, err: unknown): void => {
  const error = err as Error;
  log.error(`There was an error in the ${context}:`);
  log.error(error.message);
  log.error(error.stack);
};
