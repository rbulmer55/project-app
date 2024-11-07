import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
	UserPool,
	UserPoolClient,
	UserPoolDomain,
} from 'aws-cdk-lib/aws-cognito';
import { config } from './config/config';

export class ClientStack extends cdk.Stack {
	public readonly userPoolId: string;
	public readonly clientId: string;
	public readonly hostedDomain: string;

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		/**
		 * Create our basic user pool
		 */
		const userPool = new UserPool(this, 'engagement-user-pool', {
			userPoolName: `engagement-${config.stage}-user-pool`,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});
		this.userPoolId = userPool.userPoolId;

		/**
		 * Create a hosted domain for activating and alternative login
		 * Optional.
		 */
		const hostedDomain = new UserPoolDomain(this, 'engagement-domain', {
			userPool,
			cognitoDomain: { domainPrefix: `engagement-${config.stage}-app` },
		});
		this.hostedDomain = hostedDomain.domainName;

		/**
		 * Create an App client to integrate with the userpool
		 */
		const appClient = new UserPoolClient(this, 'engagement-pool-client', {
			userPool,
			authFlows: { userSrp: true },
			oAuth: {
				flows: {
					implicitCodeGrant: false,
					authorizationCodeGrant: true,
				},
				//change this with UI deployments
				callbackUrls: [`${config.appUrl}/login/oauth2/code/cognito/`],
				logoutUrls: [`${config.appUrl}/`],
			},
		});
		this.clientId = appClient.userPoolClientId;
	}
}
