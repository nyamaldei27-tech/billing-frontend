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

const CUSTOMER_API_URL =
  "http://localhost:8083/api/accounts";

/* GET ALL CUSTOMERS */

export const getCustomers = async (): Promise<Customer[]> => {
  const response = await fetch(CUSTOMER_API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch customers");
  }

  return response.json();
};

/* GET ONE CUSTOMER */

export const getCustomerById = async (
  id: number
): Promise<Customer> => {
  const response = await fetch(
    `${CUSTOMER_API_URL}/${id}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch customer");
  }

  return response.json();
};

/* CREATE CUSTOMER */

export const createCustomer = async (
  customer: CustomerRequest
): Promise<Customer> => {
  const response = await fetch(
    CUSTOMER_API_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customer),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create customer");
  }

  return response.json();
};

/* UPDATE CUSTOMER */

export const updateCustomer = async (
  id: number,
  customer: CustomerRequest
): Promise<Customer> => {
  const response = await fetch(
    `${CUSTOMER_API_URL}/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customer),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update customer");
  }

  return response.json();
};

/* DELETE CUSTOMER */

export const deleteCustomer = async (
  id: number
): Promise<void> => {
  const response = await fetch(
    `${CUSTOMER_API_URL}/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete customer");
  }
};