import { useRef, useState } from "react";

import useCustomerStore from "../../stores/customerStore";
import type { Customer } from "../../services/customerService";

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

  // ----------------------------------------
  // ADD CUSTOMER
  // ----------------------------------------

  const [showAddForm, setShowAddForm] =
    useState(false);

  const [firstName, setFirstName] =
    useState("");

  const [middleName, setMiddleName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const middleNameRef =
    useRef<HTMLInputElement>(null);

  const lastNameRef =
    useRef<HTMLInputElement>(null);

  const emailRef =
    useRef<HTMLInputElement>(null);

  // ----------------------------------------
  // CUSTOMER COUNTER
  // ----------------------------------------

  const [customersAdded, setCustomersAdded] =
    useState(0);

  // ----------------------------------------
  // THREE DOT MENU
  // ----------------------------------------

  const [openMenuId, setOpenMenuId] =
    useState<number | null>(null);

  // ----------------------------------------
  // SEARCH
  // ----------------------------------------

  const [searchTerm, setSearchTerm] =
    useState("");

  const [customersLoaded, setCustomersLoaded] =
    useState(false);

  // ----------------------------------------
  // VIEW CUSTOMER
  // ----------------------------------------

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [showCustomerDetails, setShowCustomerDetails] =
    useState(false);

  // ----------------------------------------
  // EDIT CUSTOMER
  // ----------------------------------------

  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const [editFirstName, setEditFirstName] =
    useState("");

  const [editMiddleName, setEditMiddleName] =
    useState("");

  const [editLastName, setEditLastName] =
    useState("");

  const [editEmail, setEditEmail] =
    useState("");

  const [showEditForm, setShowEditForm] =
    useState(false);

  const [menuDirection, setMenuDirection] =
    useState<"down" | "up">("down");

  // ----------------------------------------
  // CAPITALIZE NAMES
  // ----------------------------------------

  const capitalizeName = (
    value: string
  ) => {
    return value
      .split(" ")
      .map((word) => {
        if (!word) {
          return "";
        }

        return (
          word.charAt(0).toUpperCase() +
          word.slice(1).toLowerCase()
        );
      })
      .join(" ");
  };

  // ----------------------------------------
  // GET ALL CUSTOMERS
  // ----------------------------------------

  const getCustomers = async () => {
    setOpenMenuId(null);

    try {
      await fetchCustomers();

      setCustomersLoaded(true);
    } catch {
      setCustomersLoaded(false);
    }
  };

  // ----------------------------------------
  // HIDE CUSTOMER LIST
  // ----------------------------------------

  const removeCustomerList = () => {
    setSearchTerm("");
    setCustomersLoaded(false);
    setOpenMenuId(null);
  };

  // ----------------------------------------
  // GET ONE CUSTOMER
  // ----------------------------------------

  const getCustomer = async (
    id: number
  ) => {
    setOpenMenuId(null);

    try {
      const customer =
        await fetchCustomerById(id);

      if (customer) {
        setSelectedCustomer(customer);
        setShowCustomerDetails(true);
      }
    } catch {
      // Error is handled by customerStore.
    }
  };

  // ----------------------------------------
  // DELETE CUSTOMER
  // ----------------------------------------

  const deleteCustomer = async (
    id: number
  ) => {
    setOpenMenuId(null);

    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeCustomer(id);

      if (
        selectedCustomer?.id === id
      ) {
        setSelectedCustomer(null);
        setShowCustomerDetails(false);
      }
    } catch {
      // Error is handled by customerStore.
    }
  };

  // ----------------------------------------
  // CREATE CUSTOMER
  // ----------------------------------------

  const createCustomer = async () => {
    const customer = {
      firstName:
        capitalizeName(firstName),

      middleName: middleName
        ? capitalizeName(middleName)
        : "",

      lastName:
        capitalizeName(lastName),

      email: email.trim(),
    };

    try {
      await addCustomer(customer);

      setCustomersAdded(
        (count) => count + 1
      );

      setFirstName("");
      setMiddleName("");
      setLastName("");
      setEmail("");

      setShowAddForm(false);

      setCustomersLoaded(true);
    } catch {
      // Error is handled by customerStore.
    }
  };

  // ----------------------------------------
  // START EDITING CUSTOMER
  // ----------------------------------------

  const startEditingCustomer = (
    customer: Customer
  ) => {
    setEditingCustomer(customer);

    setEditFirstName(
      customer.firstName
    );

    setEditMiddleName(
      customer.middleName || ""
    );

    setEditLastName(
      customer.lastName
    );

    setEditEmail(
      customer.email
    );

    setOpenMenuId(null);
    setShowEditForm(true);
  };

  // ----------------------------------------
  // UPDATE CUSTOMER
  // ----------------------------------------

  const updateCustomer = async () => {
    if (!editingCustomer) {
      return;
    }

    const updatedCustomer = {
      firstName:
        capitalizeName(editFirstName),

      middleName: editMiddleName
        ? capitalizeName(editMiddleName)
        : "",

      lastName:
        capitalizeName(editLastName),

      email: editEmail.trim(),
    };

    try {
      const updated =
        await editCustomer(
          editingCustomer.id,
          updatedCustomer
        );

      setSelectedCustomer(
        (current) =>
          current?.id === updated.id
            ? updated
            : current
      );

      setEditingCustomer(null);
      setShowEditForm(false);
    } catch {
      // Error is handled by customerStore.
    }
  };

  // ----------------------------------------
  // FILTER CUSTOMERS
  // ----------------------------------------

  const filteredCustomers =
    customers.filter((customer) => {
      const search =
        searchTerm
          .toLowerCase()
          .trim();

      const fullName =
        `${customer.firstName} ${
          customer.middleName ?? ""
        } ${
          customer.lastName
        }`.toLowerCase();

      return (
        fullName.includes(search) ||
        customer.email
          .toLowerCase()
          .includes(search) ||
        customer.id
          .toString()
          .includes(search)
      );
    });

  // ----------------------------------------
  // RETURN
  // ----------------------------------------

  return (
    <main className="customers-page">

      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="customers-header">

        <div>
          <h1>Customers</h1>

          <p>
            Manage your customers and account information.
          </p>
        </div>

        <div className="customer-actions">

          {customersLoaded && (
            <input
              type="text"
              className="customer-search"
              placeholder="Search customer by name,id..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />
          )}

          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setShowAddForm(true);
              setOpenMenuId(null);
            }}
          >
            + Add Customer
          </button>

        </div>

      </div>

      {/* ======================================
          ADD CUSTOMER MODAL
      ====================================== */}

      {showAddForm && (
        <div className="modal-overlay">

          <div className="modal-card">

            <div className="modal-header">

              <div>
                <h2>Add Customer</h2>

                <p>
                  Enter the customer's account information.
                </p>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={() =>
                  setShowAddForm(false)
                }
              >
                ×
              </button>

            </div>

            <div className="customer-form">

              <div className="form-group">

                <label htmlFor="firstName">
                  First Name
                </label>

                <input
                  id="firstName"
                  type="text"
                  placeholder="Enter first name"
                  value={firstName}
                  autoFocus
                  onChange={(event) =>
                    setFirstName(
                      capitalizeName(
                        event.target.value
                      )
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter"
                    ) {
                      event.preventDefault();

                      middleNameRef.current?.focus();
                    }
                  }}
                />

              </div>

              <div className="form-group">

                <label htmlFor="middleName">
                  Middle Name
                </label>

                <input
                  id="middleName"
                  ref={middleNameRef}
                  type="text"
                  placeholder="Enter middle name"
                  value={middleName}
                  onChange={(event) =>
                    setMiddleName(
                      capitalizeName(
                        event.target.value
                      )
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter"
                    ) {
                      event.preventDefault();

                      lastNameRef.current?.focus();
                    }
                  }}
                />

              </div>

              <div className="form-group">

                <label htmlFor="lastName">
                  Last Name
                </label>

                <input
                  id="lastName"
                  ref={lastNameRef}
                  type="text"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(
                      capitalizeName(
                        event.target.value
                      )
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter"
                    ) {
                      event.preventDefault();

                      emailRef.current?.focus();
                    }
                  }}
                />

              </div>

              <div className="form-group">

                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  ref={emailRef}
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter"
                    ) {
                      event.preventDefault();

                      createCustomer();
                    }
                  }}
                />

              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setShowAddForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={createCustomer}
                >
                  Create Customer
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* ======================================
          EDIT CUSTOMER MODAL
      ====================================== */}

      {showEditForm &&
        editingCustomer && (
          <div className="modal-overlay">

            <div className="modal-card">

              <div className="modal-header">

                <div>
                  <h2>Edit Customer</h2>

                  <p>
                    Update this customer's account information.
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close-button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingCustomer(null);
                  }}
                >
                  ×
                </button>

              </div>

              <div className="customer-form">

                <div className="form-group">

                  <label htmlFor="editFirstName">
                    First Name
                  </label>

                  <input
                    id="editFirstName"
                    type="text"
                    value={editFirstName}
                    autoFocus
                    onChange={(event) =>
                      setEditFirstName(
                        capitalizeName(
                          event.target.value
                        )
                      )
                    }
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="editMiddleName">
                    Middle Name
                  </label>

                  <input
                    id="editMiddleName"
                    type="text"
                    value={editMiddleName}
                    onChange={(event) =>
                      setEditMiddleName(
                        capitalizeName(
                          event.target.value
                        )
                      )
                    }
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="editLastName">
                    Last Name
                  </label>

                  <input
                    id="editLastName"
                    type="text"
                    value={editLastName}
                    onChange={(event) =>
                      setEditLastName(
                        capitalizeName(
                          event.target.value
                        )
                      )
                    }
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="editEmail">
                    Email
                  </label>

                  <input
                    id="editEmail"
                    type="email"
                    value={editEmail}
                    onChange={(event) =>
                      setEditEmail(
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="form-actions">

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingCustomer(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={updateCustomer}
                  >
                    Save Changes
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

      {/* ======================================
          VIEW CUSTOMER MODAL
      ====================================== */}

      {showCustomerDetails &&
        selectedCustomer && (
          <div className="modal-overlay">

            <div className="modal-card customer-details-modal">

              <div className="modal-header">

                <div>
                  <h2>Customer Details</h2>

                  <p>
                    Account information for this customer.
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close-button"
                  onClick={() => {
                    setShowCustomerDetails(false);
                    setSelectedCustomer(null);
                  }}
                >
                  ×
                </button>

              </div>

              <div className="customer-details-grid">

                <div>
                  <span>ID</span>

                  <strong>
                    {selectedCustomer.id}
                  </strong>
                </div>

                <div>
                  <span>First Name</span>

                  <strong>
                    {selectedCustomer.firstName}
                  </strong>
                </div>

                <div>
                  <span>Middle Name</span>

                  <strong>
                    {selectedCustomer.middleName ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>Last Name</span>

                  <strong>
                    {selectedCustomer.lastName}
                  </strong>
                </div>

                <div>
                  <span>Email</span>

                  <strong>
                    {selectedCustomer.email}
                  </strong>
                </div>

                <div>
                  <span>Created</span>

                  <strong>
                    {new Date(
                      selectedCustomer.createdAt
                    ).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>Updated</span>

                  <strong>
                    {new Date(
                      selectedCustomer.updatedAt
                    ).toLocaleString()}
                  </strong>
                </div>

              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setShowCustomerDetails(false);
                    setSelectedCustomer(null);
                  }}
                >
                  Close
                </button>

              </div>

            </div>

          </div>
        )}

      {/* ======================================
          CUSTOMER SUMMARY
      ====================================== */}

      <div className="customer-summary">

        <div className="summary-card">

          <span>Customers Added</span>

          <strong>
            {customersAdded}
          </strong>

        </div>

      </div>

      {/* ======================================
          CUSTOMER LIST
      ====================================== */}

      <section className="customers-card">

        <div className="card-header">

          <h2>Customer List</h2>

          <div className="card-header-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={getCustomers}
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : "Get Customers"}
            </button>

            {customersLoaded && (
              <button
                type="button"
                className="secondary-button"
                onClick={removeCustomerList}
              >
                Hide List
              </button>
            )}

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="empty-state">
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="empty-state">
            Loading customers...
          </div>
        )}

        {/* NOTHING LOADED YET */}

        {!loading &&
          !error &&
          !customersLoaded && (
            <div className="empty-state">

              <h3>
                No customers loaded
              </h3>

              <p>
                Click "Get Customers" to load your customers.
              </p>

            </div>
          )}

        {/* NO SEARCH RESULTS */}

        {!loading &&
          !error &&
          customersLoaded &&
          customers.length > 0 &&
          filteredCustomers.length === 0 && (
            <div className="empty-state">

              <h3>
                No customers found
              </h3>

              <p>
                No customers match "{searchTerm}".
              </p>

            </div>
          )}

        {/* CUSTOMER TABLE */}

        {!loading &&
          !error &&
          customersLoaded &&
          filteredCustomers.length > 0 && (
            <table className="customers-table">

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Names</th>
                  <th>Email</th>
                  <th></th>
                </tr>

              </thead>

              <tbody>

                {filteredCustomers.map(
                  (customer) => (
                    <tr
                      key={customer.id}
                    >

                      <td>
                        {customer.id}
                      </td>

                      <td>
                        {customer.firstName}{" "}

                        {customer.middleName
                          ? `${customer.middleName} `
                          : ""}

                        {customer.lastName}
                      </td>

                      <td>
                        {customer.email}
                      </td>

                      <td className="customer-menu-cell">

                        <button
                          type="button"
                          className="customer-menu-button"
                          onClick={(event) => {
                            if (
                              openMenuId ===
                              customer.id
                            ) {
                              setOpenMenuId(
                                null
                              );

                              return;
                            }

                            const button =
                              event.currentTarget;

                            const rect =
                              button.getBoundingClientRect();

                            const menuHeight =
                              130;

                            if (
                              rect.bottom +
                                menuHeight >
                              window.innerHeight
                            ) {
                              setMenuDirection(
                                "up"
                              );
                            } else {
                              setMenuDirection(
                                "down"
                              );
                            }

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
                              type="button"
                              onClick={() =>
                                getCustomer(
                                  customer.id
                                )
                              }
                            >
                              👁 View
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                startEditingCustomer(
                                  customer
                                )
                              }
                            >
                              ✏ Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteCustomer(
                                  customer.id
                                )
                              }
                            >
                              🗑 Delete
                            </button>

                          </div>
                        )}

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>
          )}

      </section>

    </main>
  );
}

export default Customers;