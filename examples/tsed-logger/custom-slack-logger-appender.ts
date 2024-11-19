import {Appender, BaseAppender, LogEvent} from "@tsed/logger";
import { SlackLogger } from 'slack-logger-light';

@Appender({name: "cslack"})
export class CustomSlackAppender extends BaseAppender {
  write(loggingEvent: LogEvent) {
    const logger = new SlackLogger({
      APP_TOKEN: this.config['token'], // The slack app token
      CHANNEL_ID: this.config['channel_id'], // The slack channel id
  });
    const text = this.layout(loggingEvent, this.config['timezoneOffset']);
    const removeColors = text.replace(/\x1b\[[0-9;]*m/g, '');
    logger.log(removeColors);
  }
}