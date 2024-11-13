#!/usr/bin/env node

import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';

import { EngagementServiceStatelessStack } from '../stateless/stateless';
import { EngagementServiceStatefulStack } from '../stateful/stateful';
import { Stage } from 'types';
import { getEnvironmentConfig } from '../app-config';

const { STAGE: stage = Stage.develop } = process.env;
const appConfig = getEnvironmentConfig(stage as Stage);

const app = new cdk.App();
const stateful = new EngagementServiceStatefulStack(
  app,
  `${appConfig.shared.stage}-EngagementServiceStatefulStack`,
  {
    env: {
      account: appConfig.env.account,
      region: appConfig.env.region,
    },
  },
);
new EngagementServiceStatelessStack(
  app,
  `${appConfig.shared.stage}-EngagementServiceStatelessStack`,
  {
    engagementTable: stateful.engagementTable,
    engagementQueue: stateful.engagementQueue,
    appConfig,
    env: {
      account: appConfig.env.account,
      region: appConfig.env.region,
    },
  },
);
