import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { EngagementInput } from 'types';

const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });

export const summariseProjectEngagements = async (
  engagements: EngagementInput[],
  userPrompt: string,
): Promise<string> => {
  const prompt = {
    prompt: `With the following customer engagements: ${JSON.stringify(engagements)}, ${userPrompt}`,
    max_tokens: 400,
    temperature: 0.75,
  };
  try {
    const bedrockResponse = await bedrock.send(
      new InvokeModelCommand({
        modelId: 'cohere.command-light-text-v14',
        body: JSON.stringify({ ...prompt }),
        contentType: 'application/json',
        accept: 'application/json',
      }),
    );

    const { generations } = JSON.parse(
      new TextDecoder().decode(bedrockResponse.body),
    ) as {
      generations: {
        finish_reason: string;
        id: string;
        text: string;
      }[];
    };

    return generations[0].text;

    // Handle the response as needed
  } catch (error) {
    console.error('Error invoking Bedrock:', error);
    throw new Error(`Error invoking Bedrock: ${JSON.stringify(error)}`);
  }
};
