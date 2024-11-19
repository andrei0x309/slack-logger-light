import { Logger } from "@tsed/logger";
import './custom-slack-logger-appender'
import "@tsed/logger-file"

const SLACK_APP_TOKEN = process?.env?.["SLACK_APP_TOKEN"] || ''

const pad = num => (num > 9 ? "" : "0") + num;

// Example channel IDs
const channelIDs = {
  "test": "C081LPREJF3",
  "all": "C081LPREJXX",
  // other channels here
}

export const getCustomeLogger = (name: string) => {
  const logger = new Logger(name);
  const customGenerator = () => {
    const time = new Date();
    const yearAndMonth = time.getFullYear() + "-" + pad(time.getMonth() + 1);
    const day = pad(time.getDate());

    return `./logs/${name}-${yearAndMonth}-${day}.log`;
  } 

  logger.appenders.set("stdout", {
    type: "stdout",
    levels: ["info", "debug", "trace"],
  })
  .set("stderr", {
    type: "stderr",
    levels: ["fatal", "error", "warn"],
    layout: {
      type: "pattern",
      pattern: "%d %p %c %X{user} %m%n"
    }
  })
  .set("file", {
    type: "file",
    filename: customGenerator(),
    layout: {
      type: "json",
      separator: ","
    }
  });

  if(channelIDs[name]) {
    logger.appenders.set("cslack", {
      type: "cslack",
      channel_id: channelIDs[name],
      token: SLACK_APP_TOKEN
    });
  }

  return logger;
}

const logger = getCustomeLogger('all');
 
export { logger }