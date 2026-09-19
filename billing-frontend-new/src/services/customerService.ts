import api from "./api";

export interface Customer {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
}

export const getCustomers = async (): Promise<Customer[]> => {
  const response = await api.get("/api/accounts");

  return response.data;
};

export const getCustomerById = async (
  id: number
): Promise<Customer> => {
  const response = await api.get(`/api/accounts/${id}`);

  return response.data;
};

export const getCurrentCustomer = async (): Promise<Customer> => {
  const response = await api.get("/api/accounts/me");

  return response.data;
};

export const createCustomer = async (
  customer: CustomerRequest
): Promise<Customer> => {
  const response = await api.post(
    "/api/accounts",
    customer
  );

  return response.data;
};

export const updateCustomer = async (
  id: number,
  customer: CustomerRequest
): Promise<Customer> => {
  const response = await api.put(
    `/api/accounts/${id}`,
    customer
  );

  return response.data;
};

export const updateCurrentCustomer = async (
  customer: CustomerRequest
): Promise<Customer> => {
  const response = await api.put(
    "/api/accounts/me",
    customer
  );

  return response.data;
};

export const deleteCustomer = async (
  id: number
): Promise<void> => {
  await api.delete(`/api/accounts/${id}`);
};