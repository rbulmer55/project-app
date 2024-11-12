import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
	UserPool,
	UserPoolClient,
	UserPoolDomain,
} from 'aws-cdk-lib/aws-cognito';
import { config } from './config/config';
import { Bucket, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { resolve } from 'path';
import {
	Distribution,
	OriginAccessIdentity,
	PriceClass,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import {
	Certificate,
	CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager';
import { HostedZone } from 'aws-cdk-lib/aws-route53';

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
			idTokenValidity: cdk.Duration.hours(8),
			accessTokenValidity: cdk.Duration.hours(8),
		});
		this.clientId = appClient.userPoolClientId;

		/**
		 * Create our website bucket
		 */
		const websiteBucket = new Bucket(this, 'WebsiteBucket', {
			accessControl: BucketAccessControl.PRIVATE,
		});
		/**
		 * Deploy VUE SPA to the bucket
		 */
		new BucketDeployment(this, 'BucketDeployment', {
			destinationBucket: websiteBucket,
			sources: [Source.asset(resolve(__dirname, '../vuetify-project/dist'))],
		});
		/**
		 * Create a cloudfront distrubtion
		 */
		const originAccessIdentity = new OriginAccessIdentity(
			this,
			'OriginAccessIdentity',
			{}
		);
		websiteBucket.grantRead(originAccessIdentity);

		if (config.stage !== 'prod') {
			new Distribution(this, 'Distribution', {
				defaultRootObject: 'index.html',
				defaultBehavior: {
					origin: new S3Origin(websiteBucket, { originAccessIdentity }),
				},
				priceClass: PriceClass.PRICE_CLASS_100,
			});
		} else {
			// Retrieve the hosted zone
			const hostedZone = HostedZone.fromHostedZoneAttributes(
				this,
				'hostedZone',
				{
					hostedZoneId: config.hostedZoneId,
					zoneName: config.domain,
				}
			);

			/**
			 * Create SSL certificate
			 */
			const cert = new Certificate(this, 'Certificate', {
				domainName: `engagements.${config.domain}`,
				validation: CertificateValidation.fromDns(hostedZone),
			});

			new Distribution(this, 'Distribution', {
				domainNames: [config.domain],
				defaultRootObject: 'index.html',
				defaultBehavior: {
					origin: new S3Origin(websiteBucket, { originAccessIdentity }),
				},
				priceClass: PriceClass.PRICE_CLASS_100,
				certificate: cert,
			});
		}
	}
}
