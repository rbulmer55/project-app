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
              </div>
            </v-col>
            <v-col cols="3"></v-col>
            <v-col cols="6" align-self="center">
              <v-card>
                <v-form
                  :disabled="!projectSelected"
                  @submit.prevent="submit"
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
                    v-model="date"
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
let id = 2;

import { VForm } from "vuetify/components";
import { format } from "date-fns";
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
    engagements: [
      {
        id: "1",
        clientId: "1",
        projectId: "1",
        date: "01/01/2001",
        description: "Advised on query optimisation",
        value:
          "Helped the customer to save time retireving data for their user",
      },
    ],
    loading: false,
    date: null,
    description: "",
    value: "",
  }),
  methods: {
    async submitSelectClient(event: any) {
      this.clientSelected = true;
    },
    async submitSelectProject(event: any) {
      this.projectSelected = true;
    },
    async submit(event: any) {
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
        new Date((this.date || "").toString()),
        "dd/MM/yyyy",
      );

      this.engagements.push({
        id: `${id}`,
        projectId: "1",
        clientId: "1",
        description: this.description,
        value: this.value,
        date: selectedDate,
      });
      id++;
      (this.$refs.addEngagementForm as typeof VForm).reset();
      this.loading = false;
    },
  },
};
</script>
