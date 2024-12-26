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
              <h2 class="text-h4 font-weight-black text-blue">Summaries</h2>

              <div class="text-h5 font-weight-light mb-2">
                View Engagement Summaries below
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
                />
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
                  >Load Summaries</v-btn
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
              <v-data-table :items="summaries"></v-data-table>
            </v-col>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
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
import { Client, getClients } from "../services/client-service";
import { Project, getProjects } from "../services/project-service";
import {
  Summary,
  getSummaries,
  SummaryDataView,
} from "../services/summary-service";
import router from "@/router";

export default {
  data: () => ({
    client: null as unknown as Client,
    project: null as unknown as Project,
    clientSelected: false,
    projectSelected: false,
    clients: [] as Client[],
    projects: [] as Project[],
    summaries: [] as SummaryDataView[],
    loading: false,
  }),
  methods: {
    formatSummaries(summaries: Summary[]) {
      console.log(summaries);
      this.summaries = summaries.map(
        ({ id = "", clientId, projectId, ...summary }) => {
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
            ...summary,
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
        const summaries = await getSummaries(
          this.client.id || "",
          this.project.id || "",
        );
        console.log(summaries);
        this.formatSummaries(summaries);
      } catch (e: any) {
        const error = JSON.parse(e.message);
        this.handleError(error);
      } finally {
        this.loading = false;
        this.projectSelected = true;
      }
    },
    handleError(error: any) {
      if (error.status === 401) {
        router.push("/logout");
      }
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
