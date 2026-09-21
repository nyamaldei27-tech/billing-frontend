import { useRef, useState } from "react";

import { useForm } from "@tanstack/react-form";

import useCustomerStore from "../../stores/customerStore";

import type { Customer } from "../../services/customerService";

import "../../App.css";

function Customers() {
  const {
    customers,
    loading,
    error,
    fetchCustomers,
    fetchCustomerById,
    addCustomer,
    editCustomer,
    removeCustomer,
  } = useCustomerStore();

  // ADD CUSTOMER
  const [showAddForm, setShowAddForm] = useState(false);

  const middleNameRef =
    useRef<HTMLInputElement>(null);

  const lastNameRef =
    useRef<HTMLInputElement>(null);

  const emailRef =
    useRef<HTMLInputElement>(null);

  // CUSTOMER COUNTER
  const [customersAdded, setCustomersAdded] =
    useState(0);

  // THREE DOT MENU
  const [openMenuId, setOpenMenuId] =
    useState<number | null>(null);

  // SEARCH
  const [searchTerm, setSearchTerm] =
    useState("");

  const [customersLoaded, setCustomersLoaded] =
    useState(false);

  // VIEW CUSTOMER
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [showCustomerDetails, setShowCustomerDetails] =
    useState(false);

  // EDIT CUSTOMER
  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const [showEditForm, setShowEditForm] =
    useState(false);

  // MENU DIRECTION
  const [menuDirection, setMenuDirection] =
    useState<"down" | "up">("down");

  // --------------------------------------------------
  // HELPER
  // --------------------------------------------------

  const capitalizeName = (value: string) => {
    return value
      .trimStart()
      .replace(/\s+/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  // --------------------------------------------------
  // ADD CUSTOMER FORM
  // --------------------------------------------------

  const addCustomerForm = useForm({
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
    },

    onSubmit: async ({ value }) => {
      try {
        await addCustomer({
          firstName: capitalizeName(
            value.firstName.trim()
          ),

          middleName: value.middleName.trim()
            ? capitalizeName(
                value.middleName.trim()
              )
            : "",

          lastName: capitalizeName(
            value.lastName.trim()
          ),

          email: value.email.trim(),
        });

        setCustomersAdded(
          (count) => count + 1
        );

        setCustomersLoaded(true);

        addCustomerForm.reset();

        setShowAddForm(false);
      } catch (err) {
        alert(
          err instanceof Error
            ? err.message
            : "Failed to create customer"
        );
      }
    },
  });

  // --------------------------------------------------
  // EDIT CUSTOMER FORM
  // --------------------------------------------------

  const editCustomerForm = useForm({
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
    },

    onSubmit: async ({ value }) => {
      if (!editingCustomer) {
        return;
      }

      try {
        const updatedCustomer =
          await editCustomer(
            editingCustomer.id,
            {
              firstName: capitalizeName(
                value.firstName.trim()
              ),

              middleName:
                value.middleName.trim()
                  ? capitalizeName(
                      value.middleName.trim()
                    )
                  : "",

              lastName: capitalizeName(
                value.lastName.trim()
              ),

              email: value.email.trim(),
            }
          );

        if (
          selectedCustomer &&
          selectedCustomer.id ===
            editingCustomer.id
        ) {
          setSelectedCustomer(
            updatedCustomer
          );
        }

        setEditingCustomer(null);
        setShowEditForm(false);

        editCustomerForm.reset();
      } catch (err) {
        alert(
          err instanceof Error
            ? err.message
            : "Failed to update customer"
        );
      }
    },
  });

  // --------------------------------------------------
  // LOAD CUSTOMERS
  // --------------------------------------------------

  const getCustomers = async () => {
    try {
      await fetchCustomers();
      setCustomersLoaded(true);
    } catch {
      // Store handles the error state.
    }
  };

  // --------------------------------------------------
  // HIDE CUSTOMER LIST
  // --------------------------------------------------

  const hideCustomerList = () => {
    setCustomersLoaded(false);
    setSearchTerm("");
    setOpenMenuId(null);
  };

  // --------------------------------------------------
  // REMOVE CUSTOMER FROM LIST
  // --------------------------------------------------

  const removeCustomerList = async (
    id: number
  ) => {
    try {
      await removeCustomer(id);
      setOpenMenuId(null);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete customer"
      );
    }
  };

  // --------------------------------------------------
  // VIEW CUSTOMER
  // --------------------------------------------------

  const getCustomer = async (id: number) => {
    try {
      const customer =
        await fetchCustomerById(id);

      setSelectedCustomer(customer);
      setShowCustomerDetails(true);
      setOpenMenuId(null);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to load customer"
      );
    }
  };

  // --------------------------------------------------
  // DELETE CUSTOMER
  // --------------------------------------------------

  const deleteCustomer = async (
    id: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) {
      return;
    }

    await removeCustomerList(id);

    if (selectedCustomer?.id === id) {
      setSelectedCustomer(null);
      setShowCustomerDetails(false);
    }
  };

  // --------------------------------------------------
  // OPEN EDIT CUSTOMER
  // --------------------------------------------------

  const startEditingCustomer = (
    customer: Customer
  ) => {
    setEditingCustomer(customer);

    editCustomerForm.reset();

    editCustomerForm.setFieldValue(
      "firstName",
      customer.firstName
    );

    editCustomerForm.setFieldValue(
      "middleName",
      customer.middleName ?? ""
    );

    editCustomerForm.setFieldValue(
      "lastName",
      customer.lastName
    );

    editCustomerForm.setFieldValue(
      "email",
      customer.email
    );

    setShowEditForm(true);
    setOpenMenuId(null);
  };

  // --------------------------------------------------
  // FILTER CUSTOMERS
  // --------------------------------------------------

  const filteredCustomers =
    customers.filter((customer) => {
      const search =
        searchTerm.toLowerCase();

      return (
        customer.firstName
          .toLowerCase()
          .includes(search) ||

        (customer.middleName ?? "")
          .toLowerCase()
          .includes(search) ||

        customer.lastName
          .toLowerCase()
          .includes(search) ||

        customer.email
          .toLowerCase()
          .includes(search)
      );
    });

  // --------------------------------------------------
  // CLOSE ADD MODAL
  // --------------------------------------------------

  const closeAddForm = () => {
    addCustomerForm.reset();
    setShowAddForm(false);
  };

  // --------------------------------------------------
  // CLOSE EDIT MODAL
  // --------------------------------------------------

  const closeEditForm = () => {
    editCustomerForm.reset();
    setEditingCustomer(null);
    setShowEditForm(false);
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="customers-page">

      {/* HEADER */}

      <div className="customers-header">

        <div>
          <h1>Customers</h1>

          <p>
            Manage your customers and their
            information.
          </p>
        </div>

        <div className="customer-actions">

          <button
            className="primary-button"
            onClick={() => {
              addCustomerForm.reset();
              setShowAddForm(true);
            }}
          >
            Add Customer
          </button>

        </div>

      </div>

      {/* SUMMARY */}

      <div className="customer-summary">

        <div className="summary-card">
          <span className="summary-label">
            Total Customers
          </span>

          <strong>
            {customers.length}
          </strong>
        </div>

        <div className="summary-card">
          <span className="summary-label">
            Customers Added
          </span>

          <strong>
            {customersAdded}
          </strong>
        </div>

      </div>

      {/* CUSTOMER LIST */}

      <div className="customers-card">

        <div className="card-header">

          <div>

            <h2>Customer List</h2>

            <p>
              {customersLoaded
                ? `${filteredCustomers.length} customer${
                    filteredCustomers.length === 1
                      ? ""
                      : "s"
                  }`
                : "Load customers to view the list"}
            </p>

          </div>

          <div className="card-header-actions">
        {customersLoaded && (
          <div className="card-header-actions">

            <input
              className="customer-search"
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />

          </div>
         )}

         {customersLoaded && (
              <button
                className="secondary-button"
                onClick={hideCustomerList}
              >
                Hide List
              </button>
            )}

            <button
              className="secondary-button"
              onClick={getCustomers}
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : "Get Customers"}
            </button>

          </div>

        </div>


        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!customersLoaded ? (
          <div className="empty-state">

            <h3>No customers loaded</h3>

            <p>
              Click "Get Customers" to load
              your customers.
            </p>

          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="empty-state">

            <h3>No customers found</h3>

            <p>
              Try changing your search or
              add a new customer.
            </p>

          </div>
        ) : (
          <div className="customers-table-wrapper">

            <table className="customers-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>First Name</th>
                  <th>Middle Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredCustomers.map(
                  (customer, index) => (
                    <tr key={customer.id}>

                      <td>
                        {customer.id}
                      </td>

                      <td>
                        {customer.firstName}
                      </td>

                      <td>
                        {customer.middleName ||
                          "—"}
                      </td>

                      <td>
                        {customer.lastName}
                      </td>

                      <td>
                        {customer.email}
                      </td>

                      <td>
                        {new Date(
                          customer.createdAt
                        ).toLocaleDateString()}
                      </td>

                      <td className="customer-menu-cell">

                        <button
                          className="customer-menu-button"
                          onClick={(event) => {
                            event.stopPropagation();

                            if (
                              openMenuId ===
                              customer.id
                            ) {
                              setOpenMenuId(null);
                              return;
                            }

                            setMenuDirection(
                              index >=
                                filteredCustomers.length -
                                  2
                                ? "up"
                                : "down"
                            );

                            setOpenMenuId(
                              customer.id
                            );
                          }}
                        >
                          ⋮
                        </button>

                        {openMenuId ===
                          customer.id && (
                          <div
                            className={`customer-menu ${
                              menuDirection ===
                              "up"
                                ? "customer-menu-up"
                                : ""
                            }`}
                          >

                            <button
                              onClick={() =>
                                getCustomer(
                                  customer.id
                                )
                              }
                            >
                              View
                            </button>

                            <button
                              onClick={() =>
                                startEditingCustomer(
                                  customer
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="danger"
                              onClick={() =>
                                deleteCustomer(
                                  customer.id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>
                        )}

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* -------------------------------------------- */}
      {/* ADD CUSTOMER MODAL */}
      {/* -------------------------------------------- */}

      {showAddForm && (
        <div
          className="modal-overlay"
          onClick={closeAddForm}
        >

          <div
            className="modal-card"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <h2>Add Customer</h2>

                <p>
                  Create a new customer
                  account.
                </p>
              </div>

              <button
                className="modal-close-button"
                onClick={closeAddForm}
              >
                ×
              </button>

            </div>

            <form
              className="customer-form"
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                addCustomerForm.handleSubmit();
              }}
            >

              {/* FIRST NAME */}

              <addCustomerForm.Field
                name="firstName"
                validators={{
                  onChange: ({ value }) => {
                    const trimmed =
                      value.trim();

                    if (!trimmed) {
                      return "First name is required";
                    }

                    if (
                      trimmed.length < 2
                    ) {
                      return "First name must be at least 2 characters";
                    }

                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className="form-group">

                    <label htmlFor="add-first-name">
                      First Name
                    </label>

                    <input
                      id="add-first-name"
                      type="text"
                      value={
                        field.state.value
                      }
                      onChange={(event) =>
                        field.handleChange(
                          capitalizeName(
                            event.target.value
                          )
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key ===
                          "Enter"
                        ) {
                          event.preventDefault();
                          middleNameRef.current?.focus();
                        }
                      }}
                      onBlur={
                        field.handleBlur
                      }
                      placeholder="First name"
                    />

                    {field.state.meta.errors
                      .length > 0 && (
                      <p className="form-error">
                        {
                          field.state.meta
                            .errors[0]
                        }
                      </p>
                    )}

                  </div>
                )}
              </addCustomerForm.Field>

              {/* MIDDLE NAME */}

              <addCustomerForm.Field
                name="middleName"
                validators={{
                  onChange: ({ value }) => {
                    const trimmed =
                      value.trim();

                    if (
                      trimmed &&
                      trimmed.length < 2
                    ) {
                      return "Middle name must be at least 2 characters";
                    }

                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className="form-group">

                    <label htmlFor="add-middle-name">
                      Middle Name
                    </label>

                    <input
                      ref={middleNameRef}
                      id="add-middle-name"
                      type="text"
                      value={
                        field.state.value
                      }
                      onChange={(event) =>
                        field.handleChange(
                          capitalizeName(
                            event.target.value
                          )
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key ===
                          "Enter"
                        ) {
                          event.preventDefault();
                          lastNameRef.current?.focus();
                        }
                      }}
                      onBlur={
                        field.handleBlur
                      }
                      placeholder="Middle name (optional)"
                    />

                    {field.state.meta.errors
                      .length > 0 && (
                      <p className="form-error">
                        {
                          field.state.meta
                            .errors[0]
                        }
                      </p>
                    )}

                  </div>
                )}
              </addCustomerForm.Field>

              {/* LAST NAME */}

              <addCustomerForm.Field
                name="lastName"
                validators={{
                  onChange: ({ value }) => {
                    const trimmed =
                      value.trim();

                    if (!trimmed) {
                      return "Last name is required";
                    }

                    if (
                      trimmed.length < 2
                    ) {
                      return "Last name must be at least 2 characters";
                    }

                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className="form-group">

                    <label htmlFor="add-last-name">
                      Last Name
                    </label>

                    <input
                      ref={lastNameRef}
                      id="add-last-name"
                      type="text"
                      value={
                        field.state.value
                      }
                      onChange={(event) =>
                        field.handleChange(
                          capitalizeName(
                            event.target.value
                          )
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key ===
                          "Enter"
                        ) {
                          event.preventDefault();
                          emailRef.current?.focus();
                        }
                      }}
                      onBlur={
                        field.handleBlur
                      }
                      placeholder="Last name"
                    />

                    {field.state.meta.errors
                      .length > 0 && (
                      <p className="form-error">
                        {
                          field.state.meta
                            .errors[0]
                        }
                      </p>
                    )}

                  </div>
                )}
              </addCustomerForm.Field>

              {/* EMAIL */}

              <addCustomerForm.Field
                name="email"
                validators={{
                  onChange: ({ value }) => {
                    const trimmed =
                      value.trim();

                    if (!trimmed) {
                      return "Email is required";
                    }

                    const emailRegex =
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                    if (
                      !emailRegex.test(
                        trimmed
                      )
                    ) {
                      return "Enter a valid email address";
                    }

                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className="form-group">

                    <label htmlFor="add-email">
                      Email
                    </label>

                    <input
                      ref={emailRef}
                      id="add-email"
                      type="email"
                      value={
                        field.state.value
                      }
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value
                        )
                      }
                      onBlur={
                        field.handleBlur
                      }
                      placeholder="customer@example.com"
                    />

                    {field.state.meta.errors
                      .length > 0 && (
                      <p className="form-error">
                        {
                          field.state.meta
                            .errors[0]
                        }
                      </p>
                    )}

                  </div>
                )}
              </addCustomerForm.Field>

              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeAddForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    addCustomerForm.state
                      .isSubmitting
                  }
                >
                  {addCustomerForm.state
                    .isSubmitting
                    ? "Creating..."
                    : "Create Customer"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* -------------------------------------------- */}
      {/* EDIT CUSTOMER MODAL */}
      {/* -------------------------------------------- */}

      {showEditForm &&
        editingCustomer && (
          <div
            className="modal-overlay"
            onClick={closeEditForm}
          >

            <div
              className="modal-card"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="modal-header">

                <div>
                  <h2>Edit Customer</h2>

                  <p>
                    Update customer
                    information.
                  </p>
                </div>

                <button
                  className="modal-close-button"
                  onClick={closeEditForm}
                >
                  ×
                </button>

              </div>

              <form
                className="customer-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  editCustomerForm.handleSubmit();
                }}
              >

                {/* FIRST NAME */}

                <editCustomerForm.Field
                  name="firstName"
                  validators={{
                    onChange: ({ value }) => {
                      const trimmed =
                        value.trim();

                      if (!trimmed) {
                        return "First name is required";
                      }

                      if (
                        trimmed.length < 2
                      ) {
                        return "First name must be at least 2 characters";
                      }

                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <div className="form-group">

                      <label htmlFor="edit-first-name">
                        First Name
                      </label>

                      <input
                        id="edit-first-name"
                        type="text"
                        value={
                          field.state.value
                        }
                        onChange={(event) =>
                          field.handleChange(
                            capitalizeName(
                              event.target.value
                            )
                          )
                        }
                        onBlur={
                          field.handleBlur
                        }
                        placeholder="First name"
                      />

                      {field.state.meta.errors
                        .length > 0 && (
                        <p className="form-error">
                          {
                            field.state.meta
                              .errors[0]
                          }
                        </p>
                      )}

                    </div>
                  )}
                </editCustomerForm.Field>

                {/* MIDDLE NAME */}

                <editCustomerForm.Field
                  name="middleName"
                  validators={{
                    onChange: ({ value }) => {
                      const trimmed =
                        value.trim();

                      if (
                        trimmed &&
                        trimmed.length < 2
                      ) {
                        return "Middle name must be at least 2 characters";
                      }

                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <div className="form-group">

                      <label htmlFor="edit-middle-name">
                        Middle Name
                      </label>

                      <input
                        id="edit-middle-name"
                        type="text"
                        value={
                          field.state.value
                        }
                        onChange={(event) =>
                          field.handleChange(
                            capitalizeName(
                              event.target.value
                            )
                          )
                        }
                        onBlur={
                          field.handleBlur
                        }
                        placeholder="Middle name (optional)"
                      />

                      {field.state.meta.errors
                        .length > 0 && (
                        <p className="form-error">
                          {
                            field.state.meta
                              .errors[0]
                          }
                        </p>
                      )}

                    </div>
                  )}
                </editCustomerForm.Field>

                {/* LAST NAME */}

                <editCustomerForm.Field
                  name="lastName"
                  validators={{
                    onChange: ({ value }) => {
                      const trimmed =
                        value.trim();

                      if (!trimmed) {
                        return "Last name is required";
                      }

                      if (
                        trimmed.length < 2
                      ) {
                        return "Last name must be at least 2 characters";
                      }

                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <div className="form-group">

                      <label htmlFor="edit-last-name">
                        Last Name
                      </label>

                      <input
                        id="edit-last-name"
                        type="text"
                        value={
                          field.state.value
                        }
                        onChange={(event) =>
                          field.handleChange(
                            capitalizeName(
                              event.target.value
                            )
                          )
                        }
                        onBlur={
                          field.handleBlur
                        }
                        placeholder="Last name"
                      />

                      {field.state.meta.errors
                        .length > 0 && (
                        <p className="form-error">
                          {
                            field.state.meta
                              .errors[0]
                          }
                        </p>
                      )}

                    </div>
                  )}
                </editCustomerForm.Field>

                {/* EMAIL */}

                <editCustomerForm.Field
                  name="email"
                  validators={{
                    onChange: ({ value }) => {
                      const trimmed =
                        value.trim();

                      if (!trimmed) {
                        return "Email is required";
                      }

                      const emailRegex =
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                      if (
                        !emailRegex.test(
                          trimmed
                        )
                      ) {
                        return "Enter a valid email address";
                      }

                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <div className="form-group">

                      <label htmlFor="edit-email">
                        Email
                      </label>

                      <input
                        id="edit-email"
                        type="email"
                        value={
                          field.state.value
                        }
                        onChange={(event) =>
                          field.handleChange(
                            event.target.value
                          )
                        }
                        onBlur={
                          field.handleBlur
                        }
                        placeholder="customer@example.com"
                      />

                      {field.state.meta.errors
                        .length > 0 && (
                        <p className="form-error">
                          {
                            field.state.meta
                              .errors[0]
                          }
                        </p>
                      )}

                    </div>
                  )}
                </editCustomerForm.Field>

                <div className="form-actions">

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={closeEditForm}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={
                      editCustomerForm.state
                        .isSubmitting
                    }
                  >
                    {editCustomerForm.state
                      .isSubmitting
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      {/* -------------------------------------------- */}
      {/* VIEW CUSTOMER MODAL */}
      {/* -------------------------------------------- */}

      {showCustomerDetails &&
        selectedCustomer && (
          <div
            className="modal-overlay"
            onClick={() => {
              setShowCustomerDetails(false);
              setSelectedCustomer(null);
            }}
          >

            <div
              className="modal-card customer-details-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="modal-header">

                <div>
                  <h2>
                    Customer Details
                  </h2>

                  <p>
                    Customer #
                    {selectedCustomer.id}
                  </p>
                </div>

                <button
                  className="modal-close-button"
                  onClick={() => {
                    setShowCustomerDetails(
                      false
                    );

                    setSelectedCustomer(
                      null
                    );
                  }}
                >
                  ×
                </button>

              </div>

              <div className="customer-details-grid">

                <div>
                  <span>
                    First Name
                  </span>

                  <strong>
                    {
                      selectedCustomer.firstName
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Middle Name
                  </span>

                  <strong>
                    {
                      selectedCustomer.middleName ||
                      "—"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Last Name
                  </span>

                  <strong>
                    {
                      selectedCustomer.lastName
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Email
                  </span>

                  <strong>
                    {
                      selectedCustomer.email
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Created At
                  </span>

                  <strong>
                    {new Date(
                      selectedCustomer.createdAt
                    ).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>
                    Updated At
                  </span>

                  <strong>
                    {new Date(
                      selectedCustomer.updatedAt
                    ).toLocaleString()}
                  </strong>
                </div>

              </div>

              <div className="form-actions">

                <button
                  className="secondary-button"
                  onClick={() => {
                    setShowCustomerDetails(
                      false
                    );

                    setSelectedCustomer(
                      null
                    );
                  }}
                >
                  Close
                </button>

                <button
                  className="primary-button"
                  onClick={() =>
                    startEditingCustomer(
                      selectedCustomer
                    )
                  }
                >
                  Edit Customer
                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}

export default Customers;