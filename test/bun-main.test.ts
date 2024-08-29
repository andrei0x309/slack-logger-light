import { expect, test } from "bun:test";
import { FCHubUtils } from '../src/main'

const SIGNER_KEY = process.env.SIGNER_KEY as string;
const FID = process.env.FID as string;
const HUB_URL = process.env.HUB_URL;
const HUB_USER = process.env.HUB_USER;
const HUB_PASS = process.env.HUB_PASS;

const hubUtils = new FCHubUtils(SIGNER_KEY, parseInt(FID), HUB_URL, HUB_USER, HUB_PASS);

test("Get fid By name", async () => {
    expect(await hubUtils.getFidFromUsername("clearwallet")).toBe(parseInt(FID));
});

test("Test send cast", async () => {
    const text = "Test @andrei0x309";
    const castHash = await hubUtils.createFarcasterPost({
        content: text
    });
    const stringHash = Buffer.from(castHash).toString('hex');
    console.log(castHash);
    expect(stringHash).toBeDefined();
});