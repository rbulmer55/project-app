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
              </div>
            </v-col>
            <v-col cols="3"></v-col>
            <v-col cols="6" align-self="center">
              <v-card>
                <v-form
                  :disabled="!clientSelected"
                  @submit.prevent="submit"
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
let id = 2;

import { VForm } from "vuetify/components";
import { format } from "date-fns";
export default {
  data: () => ({
    client: null,
    clientSelected: false,
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
    loading: false,
    projectName: "",
    projectStartDate: null,
  }),
  methods: {
    async submitSelectClient(event: any) {
      this.clientSelected = true;
    },
    async submit(event: any) {
      this.loading = true;
      const { valid } = await (
        this.$refs.addProjectForm as typeof VForm
      ).validate();
      if (!valid) {
        alert("Form is invalid");
        this.loading = false;
        return;
      }
      const selectedDate = format(
        new Date((this.projectStartDate || "").toString()),
        "dd/MM/yyyy",
      );

      this.projects.push({
        id: `${id}`,
        clientId: "1",
        projectName: this.projectName,
        projectStartDate: selectedDate,
      });
      id++;
      (this.$refs.addProjectForm as typeof VForm).reset();
      this.loading = false;
    },
  },
};
</script>
