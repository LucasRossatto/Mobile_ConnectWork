import { logger } from "react-native-logs";

const log = logger.createLogger({
  severity: "debug",
  transportOptions: {
    colors: {
      info: "blueBright",
      warn: "yellowBright",
      error: "redBright",
      debug: "white",
    },
  },
});

export default log;