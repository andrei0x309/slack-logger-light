import { expect, test } from "bun:test";
import { SlackLogger } from '../src/main'

const SLACK_APP_KEY = process.env.SLACK_APP_KEY as string;
const SLACK_CHANNEL1 = process.env.SLACK_CHANNEL1 as string;
const SLACK_CHANNEL2 = process.env.SLACK_CHANNEL2 as string;
 
const slackLogger = new SlackLogger({
    APP_TOKEN: SLACK_APP_KEY,
    CHANNEL_ID: SLACK_CHANNEL1
});

let testOrSkip: typeof test | typeof test.skip;

const testEnabled = {
    "simpleMessage": true,
    "messageWithMarkdown": true,
}

testOrSkip = testEnabled.simpleMessage ? test : test.skip;
testOrSkip("Simple Message", async () => {
    await slackLogger.log('Hello World');
    expect(true).toBe(true);
});

testOrSkip = testEnabled.messageWithMarkdown ? test : test.skip;
testOrSkip("Message With Markdown", async () => {
    await slackLogger.changeChannel(SLACK_CHANNEL2);
    await slackLogger.log(
        'Hello World\n' +
        '```javascript\n' +
        'console.log("Hello World");\n' +
        '```'
    );
    expect(true).toBe(true);
});
