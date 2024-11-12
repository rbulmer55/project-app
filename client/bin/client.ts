#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ClientStack } from '../lib/client-stack';
import { config } from '../lib/config/config';

const app = new cdk.App();
new ClientStack(app, `${config.stage}-EngagementClientStack`, {});
