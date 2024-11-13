import * as cdk from 'aws-cdk-lib';
import {
	Certificate,
	CertificateValidation,
	ICertificate,
} from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';
import { config } from './config/config';
import { HostedZone } from 'aws-cdk-lib/aws-route53';

export class CloudfrontCertificateStack extends cdk.Stack {
	public readonly cloudfrontCertificate: ICertificate;
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// Retrieve the hosted zone
		const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'hostedZone', {
			hostedZoneId: config.hostedZoneId,
			zoneName: config.domain,
		});
		/**
		 * For Cloudfront the certificate must live in us-east-1
		 */
		const cert = new Certificate(this, 'Certificate', {
			domainName: `engagements.${config.domain}`,
			validation: CertificateValidation.fromDns(hostedZone),
		});
		this.cloudfrontCertificate = cert;
	}
}
