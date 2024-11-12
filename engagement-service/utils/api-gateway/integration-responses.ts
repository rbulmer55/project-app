interface ResponseParameters {
  [destination: string]: string;
}

export const corsResponseParamters: ResponseParameters = {
  'method.response.header.Access-Control-Allow-Origin': "'*'",
};

export const errorIntegrationResponses = [
  {
    selectionPattern: '400',
    statusCode: '400',
    responseParameters: corsResponseParamters,
    responseTemplates: {
      'application/json': `{
        "error": "Invalid input, please check the api schema."
      }`,
    },
  },
  {
    selectionPattern: '5\\d{2}',
    statusCode: '500',
    responseParameters: corsResponseParamters,
    responseTemplates: {
      'application/json': `{
        "error": "Internal Service Error."
      }`,
    },
  },
];
