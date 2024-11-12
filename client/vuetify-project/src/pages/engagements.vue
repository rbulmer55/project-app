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
              <h2 class="text-h4 font-weight-black text-blue">Engagements</h2>

              <div class="text-h5 font-weight-light mb-2">
                View and manage Engagements below
              </div>
            </div>
          </v-col>
          <v-col cols="12" align-self="center">
            <v-card width="100%">
              <v-form>
                <v-select
                  v-model="client"
                  item-title="name"
                  :items="clients"
                  :rules="[(v) => !!v || 'Client is required']"
                  label="Client"
                  required
                  return-object
                  @update:model-value="clientChanged"
                ></v-select>
                <div>
                  <span style="color: gray" v-if="!client"
                    >Please choose a client</span
                  >
                </div>
              </v-form>
            </v-card>
          </v-col>
          <v-col cols="12" align-self="center">
            <v-card width="100%">
              <v-form
                :disabled="!client"
                @submit.prevent="submitSelectProject"
                ref="selectProjectForm"
              >
                <v-select
                  v-model="project"
                  item-title="name"
                  :items="projects"
                  :rules="[(v) => !!v || 'Project is required']"
                  label="Project"
                  required
                  return-object
                ></v-select>
                <v-btn
                  :disabled="!project"
                  class="mt-2"
                  type="submit"
                  block
                  color="blue"
                  :loading="loading"
                  >Load Engagements</v-btn
                >
                <div>
                  <span style="color: gray" v-if="!project"
                    >Please choose a project</span
                  >
                </div>
              </v-form>
            </v-card>
          </v-col>
          <v-row>
            <v-col v-if="projectSelected" cols="12">
              <v-data-table :items="engagements"></v-data-table>
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
                  Add a new engagement
                </div>
                <v-alert
                  v-if="createEngagementResponse.result"
                  max-width="50%"
                  class="justify-center align-center text-center mx-auto"
                  :color="createEngagementResponse.result"
                  :icon="'$' + createEngagementResponse.result"
                  :title="createEngagementResponse.result.toUpperCase()"
                  :text="createEngagementResponse.message"
                ></v-alert>
              </div>
            </v-col>
            <v-col cols="3"></v-col>
            <v-col cols="6" align-self="center">
              <v-card>
                <v-form
                  :disabled="!projectSelected"
                  @submit.prevent="submitEngagement"
                  ref="addEngagementForm"
                >
                  <v-text-field
                    prepend-icon="mdi-pen"
                    v-model="description"
                    :rules="[(v) => !!v || 'Description is required']"
                    label="Description"
                  ></v-text-field>
                  <v-text-field
                    prepend-icon="mdi-pen"
                    v-model="value"
                    :rules="[(v) => !!v || 'Value is required']"
                    label="Value"
                  ></v-text-field>
                  <v-date-input
                    :disabled="!projectSelected"
                    label="Engagement Date"
                    variant="outlined"
                    persistent-placeholder
                    v-model="engagementDate"
                    :rules="[(v) => !!v || 'Engagement date is required']"
                  ></v-date-input>

                  <v-btn
                    :disabled="!projectSelected"
                    class="mt-2"
                    type="submit"
                    block
                    color="blue"
                    :loading="loading"
                    >Submit</v-btn
                  >
                  <div>
                    <span style="color: gray" v-if="!projectSelected"
                      >You must choose a client project before adding an
                      engagement</span
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
import { Project, getProjects } from "../services/project-service";
import {
  Engagement,
  getEngagements,
  createEngagement,
  EngagementDataView,
} from "../services/engagement-service";
import router from "@/router";

export default {
  data: () => ({
    client: null as unknown as Client,
    project: null as unknown as Project,
    clientSelected: false,
    projectSelected: false,
    clients: [] as Client[],
    projects: [] as Project[],
    engagements: [] as EngagementDataView[],
    createEngagementResponse: {
      message: "",
      result: "",
    },
    loading: false,
    engagementDate: null,
    description: "",
    value: "",
  }),
  methods: {
    formatEngagements(engagements: Engagement[]) {
      this.engagements = engagements.map(
        ({ id = "", clientId, projectId, ...engagement }) => {
          const clientName =
            this.clients.find((client: Client) => client.id === clientId)
              ?.name || "";
          const projectName =
            this.projects.find((project: Project) => project.id === projectId)
              ?.name || "";
          return {
            id,
            client: clientName,
            project: projectName,
            ...engagement,
          };
        },
      );
    },
    async clientChanged(event: any) {
      this.loading = true;

      // without log, event runs too quick
      console.log(this.client);

      if (!this.client) {
        this.loading = false;
        return;
      }
      try {
        this.projects = await getProjects(this.client.id || "");
      } catch (e: any) {
        const error = JSON.parse(e.message);
        this.handleError(error);
      } finally {
        this.loading = false;
        this.clientSelected = true;
      }
    },
    async submitSelectProject(event: any) {
      this.loading = true;

      const { valid } = await (
        this.$refs.selectProjectForm as typeof VForm
      ).validate();

      if (!valid) {
        this.loading = false;
        return;
      }
      try {
        const engagements = await getEngagements(
          this.client.id || "",
          this.project.id || "",
        );
        this.formatEngagements(engagements);
      } catch (e: any) {
        const error = JSON.parse(e.message);
        this.handleError(error);
      } finally {
        this.loading = false;
        this.projectSelected = true;
      }
    },
    async submitEngagement(event: any) {
      this.loading = true;
      const { valid } = await (
        this.$refs.addEngagementForm as typeof VForm
      ).validate();
      if (!valid) {
        alert("Form is invalid");
        this.loading = false;
        return;
      }
      const selectedDate = format(
        new Date((this.engagementDate || "").toString()),
        "dd/MM/yyyy",
      );

      if (!this.client.id) throw Error("Client not selected.");
      if (!this.project.id) throw Error("Project not selected.");
      try {
        const response = await createEngagement({
          clientId: this.client.id,
          projectId: this.project.id,
          description: this.description,
          value: this.value,
          engagementDate: selectedDate,
        });
        this.createEngagementResponse = {
          message: response,
          result: "success",
        };
        (this.$refs.addEngagementForm as typeof VForm).reset();
        const engagements = await getEngagements(
          this.client.id || "",
          this.project.id || "",
        );
        this.formatEngagements(engagements);
        this.loading = false;
      } catch (e: any) {
        const error = JSON.parse(e.message);
        this.handleError(error);
      } finally {
        this.loading = false;
      }
      (this.$refs.addEngagementForm as typeof VForm).reset();
      this.loading = false;
    },
    handleError(error: any) {
      if (error.status === 401) {
        this.createEngagementResponse = {
          message: error.message,
          result: "error",
        };
        router.push("/logout");
      }
      this.createEngagementResponse = {
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
