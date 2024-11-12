import { useUserStore } from "@/stores/user";
import axios, { AxiosResponse, AxiosError } from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
const apiKey = import.meta.env.VITE_API_KEY;

const userStore = useUserStore();

export interface Engagement {
  id?: string;
  clientId: string;
  projectId: string;
  description: string;
  value: string;
  engagementDate: string;
}

export interface EngagementDataView {
  id: string;
  client: string;
  project: string;
  description: string;
  value: string;
  engagementDate: string;
}

export async function getEngagements(
  clientId: string,
  projectId: string,
): Promise<Engagement[]> {
  try {
    const rawResp: AxiosResponse = await axios.get(
      `${apiUrl}/clients/${clientId}/projects/${projectId}/engagements`,
      {
        headers: {
          "x-api-key": `${apiKey}`,
          Authorization: `Bearer ${userStore.cognitoInfo.id_token}`,
        },
      },
    );

    const { engagements } = rawResp.data;
    return engagements as Engagement[];
  } catch (e) {
    const error = e as AxiosError;
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw Error(
        JSON.stringify({
          status: 401,
          message: "Token invalid, please log back in",
        }),
      );
    }
    console.log(
      `Could not retrieve engagements: ${JSON.stringify(error.message)}`,
    );
    return [] as Engagement[];
  }
}

export async function createEngagement(
  engagementRequest: Engagement,
): Promise<string> {
  try {
    const { clientId, projectId, ...engagement } = engagementRequest;
    const rawResp: AxiosResponse = await axios.post(
      `${apiUrl}/clients/${clientId}/projects/${projectId}/engagements`,
      engagement,
      {
        headers: {
          "x-api-key": `${apiKey}`,
          Authorization: `Bearer ${userStore.cognitoInfo.id_token}`,
        },
      },
    );

    const { body } = rawResp.data;
    return body as string;
  } catch (e) {
    const error = e as AxiosError;
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw Error(
        JSON.stringify({
          status: 401,
          message: "Token invalid, please log back in",
        }),
      );
    }
    throw new Error(
      `Could not create engagement: ${JSON.stringify(error.message)}`,
    );
  }
}
