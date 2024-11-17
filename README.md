## slack-logger-light

This is a simple slack to channel logger, is super light practically a fetch call to the slack api,
it needs the app token, and the channel id, you can use multiple instances to log to multiple channels.

pkg: `slack-logger-light`

Super basic perfect for constrained environments, like cloud functions, or small projects, less than 1kb.

### Basic Usage

```typescript
import { SlackLogger } from 'slack-logger-light';

const logger = new SlackLogger({
    APP_TOKEN: 'xoxb-1234567890-1234567890123-12345678901234567890123456789012', // Your app token
    CHANNEL_ID: 'C1234567890', // The channel id can be copied from slack APP, or from the channel url
});

logger.log('Hello World');

```

### Notes

- Message is sent raw you can use markdown slack syntax, for additional formatting.
- You can chnage the channelId, or the app token, if you don't want to create new instances.
- You can use multiple instances to log to multiple channels.
- Make sure that your app has the correct permissions to post to the channel and that the channel exists and is public or the app has access to it(for private channels app needs to be added to the channel).
- In case of errors, logger will console.error the error, and the message will not be sent, you can disable the console.error by setting the optional `NO_CONSOLE_LOG_ON_ERROR` to true when creating the instance.
- There are some basic bun tests, that you can run with `bun test` if you create a `.env` file following the `.env.example` file.

### Changelog

[Changelog](./CHANGELOG.md)
