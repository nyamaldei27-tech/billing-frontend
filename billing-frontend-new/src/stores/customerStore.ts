import { create } from "zustand";

import {
  getCustomers,
  getCustomerById,
  getCurrentCustomer,
  createCustomer,
  updateCustomer,
  updateCurrentCustomer,
  deleteCustomer,
  type Customer,
  type CustomerRequest,
} from "../services/customerService";

interface CustomerState {
  customers: Customer[];

  currentCustomer: Customer | null;

  loading: boolean;

  error: string | null;

  fetchCustomers: () => Promise<void>;

  fetchCustomerById: (
    id: number
  ) => Promise<Customer | null>;

  fetchCurrentCustomer: () => Promise<Customer | null>;

  addCustomer: (
    customer: CustomerRequest
  ) => Promise<Customer>;

  editCustomer: (
    id: number,
    customer: CustomerRequest
  ) => Promise<Customer>;

  updateCurrentCustomer: (
    customer: CustomerRequest
  ) => Promise<Customer>;

  removeCustomer: (
    id: number
  ) => Promise<void>;
}

const useCustomerStore = create<CustomerState>(
  (set) => ({
    customers: [],

     currentCustomer: null,

    loading: false,

    error: null,

    /* GET ALL CUSTOMERS */

    fetchCustomers: async () => {
      set({
        loading: true,
        error: null,
      });

      try {
        const customers =
          await getCustomers();

        set({
          customers,
          loading: false,
        });
      } catch (error) {
        console.error(
          "Failed to load customers:",
          error
        );

        set({
          loading: false,
          error: "Unable to load customers.",
        });

        throw error;
      }
    },

    /* GET ONE CUSTOMER BY ID */

    fetchCustomerById: async (id) => {
      set({
        error: null,
      });

      try {
        const customer =
          await getCustomerById(id);

        return customer;
      } catch (error) {
        console.error(
          "Failed to load customer:",
          error
        );

        set({
          error: "Unable to load customer.",
        });

        throw error;
      }
    },

    /* GET CURRENT LOGGED-IN CUSTOMER */

    fetchCurrentCustomer: async () => {
      set({
        error: null,
      });

      try {
        const customer =
          await getCurrentCustomer();

          set({
      currentCustomer: customer,
    });

        return customer;
      } catch (error) {
        console.error(
          "Failed to load current customer:",
          error
        );

        set({
          error:
            "Unable to load your profile.",
        });

        throw error;
      }
    },

    /* CREATE CUSTOMER */

    addCustomer: async (customer) => {
      set({
        error: null,
      });

      try {
        const newCustomer =
          await createCustomer(customer);

        set((state) => ({
          customers: [
            ...state.customers,
            newCustomer,
          ],
        }));

        return newCustomer;
      } catch (error) {
        console.error(
          "Failed to create customer:",
          error
        );

        set({
          error: "Unable to create customer.",
        });

        throw error;
      }
    },

    /* UPDATE CUSTOMER BY ID */

    editCustomer: async (
      id,
      customer
    ) => {
      set({
        error: null,
      });

      try {
        const updatedCustomer =
          await updateCustomer(
            id,
            customer
          );

        set((state) => ({
          customers:
            state.customers.map(
              (existingCustomer) =>
                existingCustomer.id === id
                  ? updatedCustomer
                  : existingCustomer
            ),
        }));

        return updatedCustomer;
      } catch (error) {
        console.error(
          "Failed to update customer:",
          error
        );

        set({
          error: "Unable to update customer.",
        });

        throw error;
      }
    },

    /* UPDATE CURRENT LOGGED-IN CUSTOMER */

    updateCurrentCustomer: async (
      customer
    ) => {
      set({
        error: null,
      });

      try {
        const updatedCustomer =
          await updateCurrentCustomer(
            customer
          );

        set((state) => ({
          customers:
            state.customers.map(
              (existingCustomer) =>
                existingCustomer.id ===
                updatedCustomer.id
                  ? updatedCustomer
                  : existingCustomer
            ),
        }));

        return updatedCustomer;
      } catch (error) {
        console.error(
          "Failed to update current customer:",
          error
        );

        set({
          error:
            "Unable to update your profile.",
        });

        throw error;
      }
    },

    /* DELETE CUSTOMER */

    removeCustomer: async (id) => {
      set({
        error: null,
      });

      try {
        await deleteCustomer(id);

        set((state) => ({
          customers:
            state.customers.filter(
              (customer) =>
                customer.id !== id
            ),
        }));
      } catch (error) {
        console.error(
          "Failed to delete customer:",
          error
        );

        set({
          error: "Unable to delete customer.",
        });

        throw error;
      }
    },
  })
);

export default useCustomerStore;