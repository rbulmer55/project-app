#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ClientStack } from '../lib/client-stack';
import { CloudfrontCertificateStack } from '../lib/cloudfront-certificate-stack';
import { config } from '../lib/config/config';

const app = new cdk.App();

let certStack;
/**
 * Required for cloudfront SSL certificates
 * Must be in US region
 */
if (config.stage === 'prod') {
	certStack = new CloudfrontCertificateStack(
		app,
		`${config.stage}-EngagementCertStack`,
		{
			env: { account: config.account, region: 'us-east-1' },
			crossRegionReferences: true,
		}
	);
}
new ClientStack(app, `${config.stage}-EngagementClientStack`, {
	env: { account: config.account, region: config.region },
	crossRegionReferences: true,
	cloudfrontCertificate: certStack ? certStack.cloudfrontCertificate : null,
});
