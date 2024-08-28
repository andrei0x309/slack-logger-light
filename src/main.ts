import { 
	// makeUserNameProofClaim, 
	// EthersEip712Signer, 
	// Eip712Signer,
	makeCastRemove,
	NobleEd25519Signer,
	FarcasterNetwork,
	makeCastAdd,
	CastAddBody,
	CastType,
	getSSLHubRpcClient,
	getAuthMetadata
  } from '@farcaster/hub-nodejs';


class FCHubUtils {
	private PK: string;
	private HUB_URL: string = "https://api.neynar.com:2281";
	private HUB_USER: string = "";
	private HUB_PASS: string = "";
	private signer: NobleEd25519Signer;
	private hubClient: ReturnType<typeof getSSLHubRpcClient>;
	private hubClientAuthMetadata: ReturnType<typeof getAuthMetadata>;
	private fid: number; // 709233

	constructor(PK: string, fid: number,  HUB_URL?: string, HUB_USER?: string, HUB_PASS?: string) {
		if (HUB_URL) {
			if(HUB_URL.includes('//')) {
				HUB_URL = HUB_URL.split('//')[1];
			}

			if(HUB_URL.includes('/')) {
				HUB_URL = HUB_URL.split('/')[0];
			}

			this.HUB_URL = HUB_URL;
		}
		if (HUB_USER) {
			this.HUB_USER = HUB_USER;
		}
		if (HUB_PASS) {
			this.HUB_PASS = HUB_PASS;
		}
		this.PK = PK;
		this.fid = fid;
		this.signer = new NobleEd25519Signer(Buffer.from(this.PK.replace('0x', ''), 'hex'));
		this.hubClient = getSSLHubRpcClient(this.HUB_URL);
		this.hubClientAuthMetadata = getAuthMetadata(this.HUB_USER, this.HUB_PASS);
	}


	publishCast = async (
		castAdd: CastAddBody,
	  ): Promise<Uint8Array> => {
		if (!this.signer) {
		  throw new Error('Failed to retrieve farcaster signer')
		}
	  	  
		const dataOptions = {
		  fid: this.fid,
		  network: FarcasterNetwork.MAINNET
		}
	  
		const cast = await makeCastAdd(
		  castAdd,
		  dataOptions,
		  this.signer
		)
	  
		if (!cast.isOk()) {
		  throw new Error(cast._unsafeUnwrapErr().toString())
		}
	  
		const castMessage = await this.hubClient.submitMessage(cast._unsafeUnwrap(), this.hubClientAuthMetadata)
	  
		if (!castMessage.isOk()) {
		  const hubError = castMessage._unsafeUnwrapErr().toString()
		  console.error(`Failed to publish cast due to network error castAdd=${JSON.stringify(castAdd)} fid=${this.fid} err=${hubError}`)
		  throw new Error(hubError)
		}
	  
		return castMessage._unsafeUnwrap().hash
	  }
	  
	  byteLength = (str: string) => Buffer.byteLength(str, 'utf8')
	  
	  parseEmbeds (text: string) {
		const URL_REGEX = /http[s]?:\/\/.*?( |\n|\t|$){1}/igm
		return (text.match(URL_REGEX) || []).map((url) => url.replace(' ', '')).map((url) => {
		  return { url }
		})
	  }
	  
	  parseFarcasterMentions (text: string) {
		const reResults = [...text.matchAll(/@\w+(.eth)?/g)]
		const mentions: number[] = []
		const mentionsPositions: number[] = []
		let mentionsText = text
		let offset = 0
		for (const reResult of reResults) {
		  const mention = reResult[0].slice(1)
		  const position = this.byteLength(text.slice(0, (reResult.index)))
		  mentions.push(mention.length)
		  mentionsPositions.push(position - offset)
		  mentionsText = mentionsText.replace(`@${mention}`, '')
		  offset += this.byteLength(`@${mention}`)
		}
	  
		return {
		  mentions,
		  mentionsPositions,
		  mentionsText
		}
	  }
	  
	  
	  createFarcasterPost = async ({
		media = [] as Array<{ farcaster: string }>,
		content = '',
		replyTo = undefined as { hash: string; fid: string } | undefined,
	  }) => {
		const text = content
	  
		const byteLength = Buffer.byteLength(text, 'utf8')
		let isLongCast = false
	  
		if (byteLength > 320) {
		  isLongCast = true
		}
	  
		if (byteLength > 1024) {
		  throw new Error('Post exceeds Farcaster character limit')
		}
	  
		const publishContent: CastAddBody = {
		  text,
		  mentions: [],
		  mentionsPositions: [],
		  embeds: [],
		  embedsDeprecated: [],
		  type: isLongCast ? CastType.LONG_CAST : CastType.CAST
		}
	  
		if (media) {
		  publishContent.embeds = media.slice(0, 2).map(m => ({ url: m.farcaster }))
		}
	  
		publishContent.embeds = publishContent.embeds.concat(this.parseEmbeds(text)).slice(0, 2)
	  
		const { mentions, mentionsPositions, mentionsText } = await this.parseFarcasterMentions(text)
		publishContent.mentions = mentions
		publishContent.mentionsPositions = mentionsPositions
		publishContent.text = mentionsText
	  
		if (replyTo?.hash) {
		  const hash = replyTo.hash.startsWith('0x') ? replyTo.hash.slice(2) : replyTo.hash
		  publishContent.parentCastId = {
			fid: Number(replyTo.fid),
			hash: Buffer.from(hash, 'hex')
		  }
		} else {
		  publishContent.parentUrl = String(replyTo)
		}
	  
		const hash = await this.publishCast(publishContent)
	  
		return hash
	  }

	  deleteCast = async (hash: string) => {
		try {
		 const deleteCastMessage = await makeCastRemove({
			targetHash: Buffer.from(hash, 'hex'),
		 }, {
			fid: this.fid,
			network: FarcasterNetwork.MAINNET
		 }, this.signer)

		 if (!deleteCastMessage.isOk()) {
			const hubError = deleteCastMessage._unsafeUnwrapErr().toString()
			console.error(`Failed to delete cast due to network error hash=${hash} fid=${this.fid} err=${hubError}`)
			return false
		 }

		 const deleteCastResponse = await this.hubClient.submitMessage(deleteCastMessage._unsafeUnwrap(), this.hubClientAuthMetadata)
		 
		 if (!deleteCastResponse.isOk()) {
			const hubError = deleteCastResponse._unsafeUnwrapErr().toString()
			console.error(`Failed to delete cast due to network error hash=${hash} fid=${this.fid} err=${hubError}`)
			return false
		 }

		 return true

		 } catch (e) {
				console.error(`Failed to delete cast due to network error hash=${hash} fid=${this.fid} err=${e}`)
				return false
		 }
		}

}

export { FCHubUtils }
