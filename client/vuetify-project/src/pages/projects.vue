<template>
  <v-container>
    <v-row>
      <v-col>
        <v-sheet
          class="d-flex align-center justify-center flex-wrap text-center mx-auto px-4"
          elevation="4"
          max-width="800"
          width="100%"
          rounded
        >
          <v-col cols="12">
            <div>
              <h2 class="text-h4 font-weight-black text-blue">Projects</h2>

              <div class="text-h5 font-weight-light mb-2">
                View and manage Projects below
              </div>
            </div>
          </v-col>
          <v-col cols="12" align-self="center">
            <v-card width="100%">
              <v-form
                @submit.prevent="submitSelectClient"
                ref="selectClientForm"
              >
                <v-select
                  v-model="client"
                  item-title="name"
                  :items="clients"
                  :rules="[(v) => !!v || 'Client is required']"
                  label="Client"
                  required
                  return-object
                ></v-select>
                <v-btn
                  class="mt-2"
                  type="submit"
                  block
                  color="blue"
                  :loading="loading"
                  >Load Projects</v-btn
                >
                <div>
                  <span style="color: gray" v-if="!clientSelected"
                    >Please choose a client</span
                  >
                </div>
              </v-form>
            </v-card>
          </v-col>
          <v-row>
            <v-col v-if="clientSelected" cols="12">
              <v-data-table :items="projects"></v-data-table>
            </v-col>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-sheet
          class="d-flex align-center justify-center flex-wrap text-center mx-auto px-4"
          elevation="4"
          max-width="800"
          width="100%"
          rounded
        >
          <v-row>
            <v-col cols="12" class="mx-auto">
              <div>
                <div class="text-h5 font-weight-light mb-2">
                  Add a new project
                </div>
                <v-alert
                  v-if="createProjectResponse.result"
                  max-width="50%"
                  class="justify-center align-center text-center mx-auto"
                  :color="createProjectResponse.result"
                  :icon="'$' + createProjectResponse.result"
                  :title="createProjectResponse.result.toUpperCase()"
                  :text="createProjectResponse.message"
                ></v-alert>
              </div>
            </v-col>
            <v-col cols="3"></v-col>
            <v-col cols="6" align-self="center">
              <v-card>
                <v-form
                  :disabled="!clientSelected"
                  @submit.prevent="submitProject"
                  ref="addProjectForm"
                >
                  <v-text-field
                    prepend-icon="mdi-pen"
                    v-model="projectName"
                    :rules="[(v) => !!v || 'Name is required']"
                    label="Name"
                  ></v-text-field>
                  <v-date-input
                    :disabled="!clientSelected"
                    label="Start Date"
                    variant="outlined"
                    persistent-placeholder
                    v-model="projectStartDate"
                    :rules="[(v) => !!v || 'Start Date is required']"
                  ></v-date-input>

                  <v-btn
                    :disabled="!clientSelected"
                    class="mt-2"
                    type="submit"
                    block
                    color="blue"
                    :loading="loading"
                    >Submit</v-btn
                  >
                  <div>
                    <span style="color: gray" v-if="!clientSelected"
                      >You must choose a client before adding a project</span
                    >
                  </div>
                </v-form>
              </v-card>
            </v-col>
            <v-col cols="3"></v-col>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { createVuetify } from "vuetify";
import { VDateInput } from "vuetify/labs/VDateInput";

onMounted(() => {
  createVuetify({
    components: {
      VDateInput,
    },
  });
});
</script>

<script lang="ts">
import { VForm } from "vuetify/components";
import { format } from "date-fns";
import { Client, getClients } from "../services/client-service";
import {
  Project,
  getProjects,
  createProject,
  ProjectDataView,
} from "../services/project-service";
import router from "@/router";

export default {
  data: () => ({
    client: null as unknown as Client,
    clientSelected: false,
    clients: [] as Client[],
    projects: [] as ProjectDataView[],
    createProjectResponse: {
      message: "",
      result: "",
    },
    loading: false,
    projectName: "",
    projectStartDate: null,
  }),
  methods: {
    checkForDuplicateOnCreate(name: string) {
      if (this.projects.some((project) => project.name === name)) return true;
      return false;
    },
    formatProjects(projects: Project[]) {
      this.projects = projects.map(({ id = "", clientId, ...project }) => {
        const clientName =
          this.clients.find((client: Client) => client.id === clientId)?.name ||
          "";
        return {
          id,
          client: clientName,
          ...project,
        };
      });
    },
    async submitSelectClient(event: any) {
      this.loading = true;
      const { valid } = await (
        this.$refs.selectClientForm as typeof VForm
      ).validate();
      if (!valid) {
        this.loading = false;
        return;
      }
      try {
        const projects = await getProjects(this.client.id || "");
        this.formatProjects(projects);
      } catch (e: any) {
        const error = JSON.parse(e.message);
        this.handleError(error);
      } finally {
        this.loading = false;
        this.clientSelected = true;
      }
    },
    async submitProject(event: any) {
      this.loading = true;
      const { valid } = await (
        this.$refs.addProjectForm as typeof VForm
      ).validate();
      if (!valid) {
        this.loading = false;
        return;
      }
      const selectedDate = format(
        new Date((this.projectStartDate || "").toString()),
        "dd/MM/yyyy",
      );

      if (
        !this.createProjectResponse.message &&
        this.checkForDuplicateOnCreate(this.projectName)
      ) {
        this.createProjectResponse = {
          message:
            "You are creating a project with a duplicate name. If you wish to continue, re-submit the form",
          result: "info",
        };
        this.loading = false;
        return;
      }

      if (!this.client.id) throw Error("Client not selected.");

      try {
        const response = await createProject({
          clientId: this.client.id,
          name: this.projectName,
          startDate: selectedDate,
        });

        this.createProjectResponse = { message: response, result: "success" };

        (this.$refs.addProjectForm as typeof VForm).reset();

        const projects = await getProjects(this.client.id || "");
        this.formatProjects(projects);

        this.loading = false;
      } catch (e: any) {
        const error = JSON.parse(e.message);
        this.handleError(error);
      } finally {
        this.loading = false;
      }
    },
    handleError(error: any) {
      if (error.status === 401) {
        this.createProjectResponse = {
          message: error.message,
          result: "error",
        };
        router.push("/logout");
      }
      this.createProjectResponse = {
        message: JSON.stringify(error.message),
        result: "error",
      };
    },
  },
  async mounted() {
    try {
      this.clients = await getClients();
    } catch (e: any) {
      const error = JSON.parse(e.message);
      this.handleError(error);
    } finally {
      this.loading = false;
    }
  },
};
</script>
