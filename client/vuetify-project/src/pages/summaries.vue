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
                  item-title="projectName"
                  :items="projects"
                  :rules="[(v) => !!v || 'Project is required']"
                  label="Project"
                  required
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
export default {
  data: () => ({
    client: null,
    project: null,
    clientSelected: false,
    projectSelected: false,
    clients: [
      {
        id: "1",
        name: "CEF",
        Industry: "Electrical Wholesale",
        Sector: "Wholesale and Manufacturing",
      },
    ],
    projects: [
      {
        id: "1",
        clientId: "1",
        projectName: "CEF e-catalog",
        projectStartDate: "01/01/2001",
      },
    ],
    summaries: [
      {
        id: "1",
        clientId: "1",
        projectId: "1",
        lastUpdated: "01/01/2001",
        summary: "A well structured engagement summary goes here...",
      },
    ],
    loading: false,
  }),
  methods: {
    async submitSelectClient(event: any) {
      this.clientSelected = true;
    },
    async submitSelectProject(event: any) {
      this.projectSelected = true;
    },
  },
};
</script>
