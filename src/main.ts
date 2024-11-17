class SlackLogger {
	private APP_TOKEN: string;
	private CHANNEL: string;
	private NO_CONSOLE_LOG_ON_ERROR: boolean = false;
	private readonly MESSEGE_EP: string = 'https://slack.com/api/chat.postMessage';
 
	constructor(
		{
			APP_TOKEN,
			CHANNEL_ID,
			NO_CONSOLE_LOG_ON_ERROR
		}: {
			APP_TOKEN: string,
			CHANNEL_ID: string,
			NO_CONSOLE_LOG_ON_ERROR?: boolean
		}
	) {
		this.APP_TOKEN = APP_TOKEN;
		this.CHANNEL = CHANNEL_ID;
		if (NO_CONSOLE_LOG_ON_ERROR !== undefined) {
			this.NO_CONSOLE_LOG_ON_ERROR = NO_CONSOLE_LOG_ON_ERROR;
		}
	}

	public changeChannel = (channel: string) => {
		this.CHANNEL = channel;
	}

	public changeAppToken = (appToken: string) => {
		this.APP_TOKEN = appToken;
	}
	
	public async log(message: string) {
		if (this.APP_TOKEN && this.CHANNEL) {
			const response = await fetch(this.MESSEGE_EP, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${this.APP_TOKEN}`
				},
				body: JSON.stringify({
					channel: this.CHANNEL,
					text: message
				})
			});

			if (!response.ok && !this.NO_CONSOLE_LOG_ON_ERROR) {
				console.error('Error sending message to slack, status:', response.status, 'Text:', await response.text());
			}

		} else if (!this.NO_CONSOLE_LOG_ON_ERROR) {
			console.error('APP_TOKEN and CHANNEL are required');
		}
	}
}


export { SlackLogger }
