import { Region, Stage } from '../types';

export interface EnvironmentConfig {
  shared: {
    stage: Stage;
    serviceName: string;
    metricNamespace: string;
    logging: {
      logLevel: 'DEBUG' | 'INFO' | 'ERROR';
      logEvent: 'true' | 'false';
    };
    domain: string;
    domainProtocol: string;
  };
  env: {
    account: string;
    region: string;
    hostedZoneId: string;
    userPoolId: string;
  };
  stateless: {};
  stateful: {};
}

export const getEnvironmentConfig = (stage: Stage): EnvironmentConfig => {
  const {
    HOSTED_ZONE: hostedZoneId,
    USER_POOL: userPoolId,
    AWS_ACCOUNT: account,
  } = process.env;
  if (!hostedZoneId) throw Error('Missing environment variable: HostedZone');
  if (!userPoolId) throw Error('Missing environment variable: UserPool');
  if (!account) throw Error('Missing environment variable: Account');

  switch (stage) {
    case Stage.prod:
      return {
        shared: {
          logging: {
            logLevel: 'INFO',
            logEvent: 'true',
          },
          serviceName: `engagement-service-${Stage.prod}`,
          metricNamespace: `engagement-service-ns-${Stage.prod}`,
          domain: 'architechinsights.com',
          domainProtocol: 'https',
          stage: Stage.prod,
        },
        stateless: {},
        env: {
          account,
          region: Region.dublin,
          hostedZoneId,
          userPoolId,
        },
        stateful: {},
      };
    case Stage.develop:
      return {
        shared: {
          logging: {
            logLevel: 'DEBUG',
            logEvent: 'true',
          },
          serviceName: `engagement-service-${Stage.develop}`,
          metricNamespace: `engagement-service-ns-${Stage.develop}`,
          domain: 'localhost:3000',
          domainProtocol: 'http',
          stage: Stage.develop,
        },
        stateless: {},
        env: {
          account,
          region: Region.dublin,
          hostedZoneId,
          userPoolId,
        },
        stateful: {},
      };
    default:
      return {
        shared: {
          logging: {
            logLevel: 'DEBUG',
            logEvent: 'true',
          },
          serviceName: `engagement-service-${stage}`,
          metricNamespace: `engagement-service-ns-${stage}`,
          domain: 'localhost:3000',
          domainProtocol: 'http',
          stage: stage,
        },
        stateless: {},
        env: {
          account,
          region: Region.dublin,
          hostedZoneId,
          userPoolId,
        },
        stateful: {},
      };
  }
};
