import {
  MethodResponse,
  MethodOptions,
  CognitoUserPoolsAuthorizer,
} from 'aws-cdk-lib/aws-apigateway';

export const generateMethodOptions = (
  auth: CognitoUserPoolsAuthorizer,
): MethodOptions => {
  return {
    methodResponses: standardMethodResponses,
    apiKeyRequired: true,
    authorizer: auth,
  };
};

export const standardMethodResponses: MethodResponse[] = [
  {
    statusCode: '200',
    responseParameters: {
      'method.response.header.Access-Control-Allow-Origin': false,
    },
  },
  { statusCode: '400' },
  { statusCode: '401' },
  { statusCode: '403' },
  { statusCode: '500' },
];
