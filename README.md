## farcaster-hub-utils

Simple library to simplify the interaction with the Farcaster Hub.
Works with a private an authorized signer key and account fid.

### Usage

```typescript
import { FcHubUtils } from 'farcaster-hub-utils';
import { PK, FID, HUB_URL, HUB_USER, HUB_PASS } from './secret';

const fcHubUtils = new FcHubUtils(PK, FID, HUB_URL?, HUB_USER?, HUB_PASS?);

// Invoke some interaction with the hub

const castText = 'Hello World!';

fcHubUtils.createFarcasterPost({
    content: castText,
})

```

### Changelog

[Changelog](./CHANGELOG.md)

### Notes

- The `PK` is the private key of the signer.
- The `FID` is the account fid.
- HUB_URL, HUB_USER, HUB_PASS are optional parameters to connect to the hub, if not provided, an public hub will be used.
- For now mainly used for posting cast using the `createFarcasterPost` method which supporst, posting to channels, and replying to posts and post media if you have supported media public urls.
