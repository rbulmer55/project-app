import { useUserStore } from "@/stores/user";
import axios, { AxiosResponse, AxiosError } from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
const apiKey = import.meta.env.VITE_API_KEY;

const userStore = useUserStore();

export interface Summary {
  id?: string;
  clientId: string;
  projectId: string;
  summary: string;
  lastUpdated: string;
}

export interface SummaryDataView {
  id: string;
  client: string;
  project: string;
  summary: string;
  lastUpdated: string;
}

export async function getSummaries(
  clientId: string,
  projectId: string,
): Promise<Summary[]> {
  try {
    const rawResp: AxiosResponse = await axios.get(
      `${apiUrl}/clients/${clientId}/projects/${projectId}/summaries`,
      {
        headers: {
          "x-api-key": `${apiKey}`,
          Authorization: `Bearer ${userStore.cognitoInfo.id_token}`,
        },
      },
    );

    const { summaries } = rawResp.data;
    return summaries as Summary[];
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
      `Could not retrieve summaries: ${JSON.stringify(error.message)}`,
    );
    return [] as Summary[];
  }
}
