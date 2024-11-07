interface Config {
	stage: string;
	appUrl: string;
}

if (!process.env.STAGE) {
	throw Error('Environment Variable: Stage is missing');
}

if (!process.env.APPURL) {
	throw Error('Environment Variable: AppUrl is missing');
}

export const config: Config = {
	stage: process.env.STAGE,
	appUrl: process.env.APPURL,
};
