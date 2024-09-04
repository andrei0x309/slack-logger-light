import { expect, test } from "bun:test";
import { FCHubUtils } from '../src/main'

const SIGNER_KEY = process.env.SIGNER_KEY as string;
const FID = Number(process.env.FID as string);
const HUB_URL = process.env.HUB_URL;
const HUB_USER = process.env.HUB_USER;
const HUB_PASS = process.env.HUB_PASS;
const HUB_URL2 = process.env.HUB_URL2;

const hubUtils = new FCHubUtils(SIGNER_KEY, FID, HUB_URL, HUB_USER, HUB_PASS);

let testOrSkip: typeof test | typeof test.skip;

const testEnabled = {
    "getFidFromUsername": true,
    "createFarcasterPost": false,
    "getCastsFromFid": false,
    "testChangeHub": false,
    "testChangeSigner": false,
}

testOrSkip = testEnabled.getFidFromUsername ? test : test.skip;
testOrSkip("Get fid By name", async () => {
    expect(await hubUtils.getFidFromUsername("clearwallet")).toBe(FID);
});

testOrSkip = testEnabled.createFarcasterPost ? test : test.skip;
testOrSkip("Test send cast", async () => {
    const text = "Test @andrei0x309";
    const castHash = await hubUtils.createFarcasterPost({
        content: text
    });
    const stringHash = Buffer.from(castHash).toString('hex');
    console.log(castHash);
    expect(stringHash).toBeDefined();
});

testOrSkip = testEnabled.getCastsFromFid ? test : test.skip;
testOrSkip("Get cast by FID", async () => {
    const FID = 1791
    const casts = await hubUtils.getCastsByFid({
        fid: FID,
        limit: 1,
        fromTimestamp: Date.now() - 1000 * 60 * 60 * 24 * 7
    });
 
    console.log(casts?.casts[0].cast?.text);
    console.log(new Date(casts?.casts[0].timestamp ?? 0).toISOString());

    expect(casts).toBeDefined();
})

 
testOrSkip = testEnabled.testChangeHub ? test : test.skip;
testOrSkip("Test change hub", async () => {
    await hubUtils.changeHub({
        HUB_URL: HUB_URL2
    });
    expect(await hubUtils.getFidFromUsername("clearwallet")).toBe(FID);
});
