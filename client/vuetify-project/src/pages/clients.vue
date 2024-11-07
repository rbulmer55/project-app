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
          <div>
            <h2 class="text-h4 font-weight-black text-blue">Clients</h2>

            <div class="text-h5 font-weight-light mb-2">
              View and manage clients below
            </div>
          </div>
          <v-data-table :items="items"></v-data-table>
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
                  Add a new client
                </div>
              </div>
            </v-col>
            <v-col cols="3"></v-col>
            <v-col cols="6" align-self="center">
              <v-card>
                <v-form @submit.prevent="submit" ref="addClientForm">
                  <v-text-field
                    v-model="clientName"
                    :rules="nameRules"
                    label="Name"
                  ></v-text-field>
                  <v-text-field
                    v-model="clientIndustry"
                    :rules="industryRules"
                    label="Industry"
                  ></v-text-field>
                  <v-text-field
                    v-model="clientSector"
                    :rules="sectorRules"
                    label="Sector"
                  ></v-text-field>
                  <v-btn
                    class="mt-2"
                    type="submit"
                    block
                    color="blue"
                    :loading="loading"
                    >Submit</v-btn
                  >
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

<script lang="ts" setup></script>

<script lang="ts">
let id = 2;
import { VForm } from "vuetify/components";
export default {
  data: () => ({
    items: [
      {
        id: "1",
        name: "CEF",
        Industry: "Electrical Wholesale",
        Sector: "Wholesale and Manufacturing",
      },
    ],
    loading: false,
    clientName: "",
    clientIndustry: "",
    clientSector: "",
    nameRules: [
      (value: any) => {
        if (value) return true;
        return "You must enter a client name.";
      },
    ],
    industryRules: [
      (value: any) => {
        if (value) return true;
        return "You must enter a client industry.";
      },
    ],
    sectorRules: [
      (value: any) => {
        if (value) return true;
        return "You must enter a client sector.";
      },
    ],
  }),
  methods: {
    async submit(event: any) {
      this.loading = true;
      this.items.push({
        id: `${id}`,
        name: this.clientName,
        Industry: this.clientIndustry,
        Sector: this.clientSector,
      });
      id++;
      (this.$refs.addClientForm as typeof VForm).reset();
      this.loading = false;
    },
  },
};
</script>
