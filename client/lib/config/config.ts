interface Config {
	stage: string;
	appUrl: string;
	domain: string;
	hostedZoneId: string;
}

if (!process.env.STAGE) {
	throw Error('Environment Variable: Stage is missing');
}

if (!process.env.APPURL) {
	throw Error('Environment Variable: AppUrl is missing');
}

if (!process.env.DOMAIN) {
	throw Error('Environment Variable: Domain is missing');
}

if (!process.env.HOSTED_ZONE) {
	throw Error('Environment Variable: HostedZone is missing');
}

export const config: Config = {
	stage: process.env.STAGE,
	appUrl: process.env.APPURL,
	domain: process.env.DOMAIN,
	hostedZoneId: process.env.HOSTED_ZONE,
};
