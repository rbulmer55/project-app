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
          <v-data-table :items="clients"></v-data-table>
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
                <v-alert
                  v-if="createClientResponse.result"
                  max-width="50%"
                  class="justify-center align-center text-center mx-auto"
                  :color="createClientResponse.result"
                  :icon="'$' + createClientResponse.result"
                  :title="createClientResponse.result.toUpperCase()"
                  :text="createClientResponse.message"
                ></v-alert>
              </div>
            </v-col>
            <v-col cols="3"></v-col>
            <v-col cols="6" align-self="center">
              <v-card>
                <v-form @submit.prevent="submitClient" ref="addClientForm">
                  <v-text-field
                    prepend-icon="mdi-pen"
                    v-model="clientName"
                    :rules="nameRules"
                    label="Name"
                  ></v-text-field>
                  <v-text-field
                    prepend-icon="mdi-pen"
                    v-model="clientIndustry"
                    :rules="industryRules"
                    label="Industry"
                  ></v-text-field>
                  <v-text-field
                    prepend-icon="mdi-pen"
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
import { VForm } from "vuetify/components";
import { getClients, createClient, Client } from "../services/client-service";
import router from "@/router";

export default {
  data: () => ({
    clients: [] as Client[],
    loading: false,
    clientName: "",
    clientIndustry: "",
    clientSector: "",
    createClientResponse: {
      message: "",
      result: "",
    },
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
    checkForDuplicateOnCreate(name: string) {
      if (this.clients.some((client) => client.name === name)) return true;
      return false;
    },
    async submitClient(event: any) {
      this.loading = true;
      const { valid } = await (
        this.$refs.addClientForm as typeof VForm
      ).validate();
      if (!valid) {
        this.loading = false;
        return;
      }

      if (
        !this.createClientResponse.message &&
        this.checkForDuplicateOnCreate(this.clientName)
      ) {
        this.createClientResponse = {
          message:
            "You are creating a client with a duplicate name. If you wish to continue, re-submit the form",
          result: "info",
        };
        this.loading = false;
        return;
      }

      try {
        const response = await createClient({
          name: this.clientName,
          industry: this.clientIndustry,
          sector: this.clientSector,
        });
        this.createClientResponse = { message: response, result: "success" };
        (this.$refs.addClientForm as typeof VForm).reset();
        this.clients = await getClients();
      } catch (e: any) {
        const error = JSON.parse(e.message);
        this.handleError(error);
      } finally {
        this.loading = false;
      }
    },
    handleError(error: any) {
      if (error.status === 401) {
        this.createClientResponse = {
          message: error.message,
          result: "error",
        };
        router.push("/logout");
      }
      this.createClientResponse = {
        message: JSON.stringify(error.message),
        result: "error",
      };
    },
  },
  async mounted() {
    this.loading = true;
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
