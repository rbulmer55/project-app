import { useUserStore } from "@/stores/user";
import axios, { AxiosResponse, AxiosError } from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
const apiKey = import.meta.env.VITE_API_KEY;

const userStore = useUserStore();

export interface Client {
  id?: string;
  name: string;
  industry: string;
  sector: string;
}

export async function getClients(): Promise<Client[]> {
  try {
    const rawResp: AxiosResponse = await axios.get(`${apiUrl}/clients`, {
      headers: {
        "x-api-key": `${apiKey}`,
        Authorization: `Bearer ${userStore.cognitoInfo.id_token}`,
      },
    });

    const { clients } = rawResp.data;
    return clients as Client[];
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
    console.log(`Could not retrieve clients: ${JSON.stringify(error.message)}`);
    return [] as Client[];
  }
}

export async function createClient(client: Client): Promise<string> {
  try {
    const rawResp: AxiosResponse = await axios.post(
      `${apiUrl}/clients`,
      client,
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
      `Could not create client: ${JSON.stringify(error.message)}`,
    );
  }
}
