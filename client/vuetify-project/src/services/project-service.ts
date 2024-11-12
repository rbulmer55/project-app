import { useUserStore } from "@/stores/user";
import axios, { AxiosResponse, AxiosError } from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
const apiKey = import.meta.env.VITE_API_KEY;

const userStore = useUserStore();

export interface Project {
  id?: string;
  clientId: string;
  name: string;
  startDate: string;
}

export interface ProjectDataView {
  id: string;
  client: string;
  name: string;
  startDate: string;
}

export async function getProjects(clientId: string): Promise<Project[]> {
  try {
    const rawResp: AxiosResponse = await axios.get(
      `${apiUrl}/clients/${clientId}/projects`,
      {
        headers: {
          "x-api-key": `${apiKey}`,
          Authorization: `Bearer ${userStore.cognitoInfo.id_token}`,
        },
      },
    );

    const { projects } = rawResp.data;
    return projects as Project[];
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
      `Could not retrieve projects: ${JSON.stringify(error.message)}`,
    );
    return [] as Project[];
  }
}

export async function createProject(projectRequest: Project): Promise<string> {
  try {
    const { clientId, ...project } = projectRequest;
    const rawResp: AxiosResponse = await axios.post(
      `${apiUrl}/clients/${clientId}/projects`,
      project,
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
      `Could not create project: ${JSON.stringify(error.message)}`,
    );
  }
}
