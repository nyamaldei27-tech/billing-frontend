import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";

import "./EditProfile.css";

import useCustomerStore from "../../stores/customerStore";

function EditProfile() {
  const {
    fetchCurrentCustomer,
    updateCurrentCustomer,
  } = useCustomerStore();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // --------------------------------------------------
  // HELPER
  // --------------------------------------------------

  const capitalizeName = (value: string) => {
    return value
      .trimStart()
      .replace(/\s+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // --------------------------------------------------
  // EDIT PROFILE FORM
  // --------------------------------------------------

  const editProfileForm = useForm({
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
    },

    onSubmit: async ({ value }) => {
      try {
        await updateCurrentCustomer({
          firstName: capitalizeName(value.firstName.trim()),
          middleName: value.middleName.trim()
            ? capitalizeName(value.middleName.trim())
            : "",
          lastName: capitalizeName(value.lastName.trim()),
          email: value.email.trim(),
        });

        alert("Profile updated successfully.");
      } catch (error) {
        console.error(
          "Failed to update profile:",
          error
        );

        alert("Failed to update profile.");
      }
    },
  });

  // --------------------------------------------------
  // LOAD CURRENT CUSTOMER
  // --------------------------------------------------

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        setLoadError("");

        const customer = await fetchCurrentCustomer();

        if (!customer) {
          setLoadError(
            "Customer profile could not be found."
          );
          return;
        }

        editProfileForm.setFieldValue(
          "firstName",
          customer.firstName || ""
        );

        editProfileForm.setFieldValue(
          "middleName",
          customer.middleName || ""
        );

        editProfileForm.setFieldValue(
          "lastName",
          customer.lastName || ""
        );

        editProfileForm.setFieldValue(
          "email",
          customer.email || ""
        );
      } catch (error) {
        console.error(
          "Failed to load customer:",
          error
        );

        setLoadError(
          "Failed to load customer profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [fetchCurrentCustomer, editProfileForm]);

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (loading) {
    return (
      <main className="edit-profile-page">
        <h1>Loading profile...</h1>
      </main>
    );
  }

  // --------------------------------------------------
  // ERROR STATE
  // --------------------------------------------------

  if (loadError) {
    return (
      <main className="edit-profile-page">
        <div className="edit-profile-header">
          <h1>Edit Profile</h1>
          <p>{loadError}</p>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <main className="edit-profile-page">
      <div className="edit-profile-header">
        <h1>Edit Profile</h1>

        <p>
          Update your personal information.
        </p>
      </div>

      <section className="edit-profile-card">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();

            editProfileForm.handleSubmit();
          }}
        >
          <div className="edit-profile-grid">
            {/* FIRST NAME */}

            <editProfileForm.Field
              name="firstName"
              validators={{
                onChange: ({ value }) => {
                  const trimmed = value.trim();

                  if (!trimmed) {
                    return "First name is required";
                  }

                  if (trimmed.length < 2) {
                    return (
                      "First name must be at least 2 characters"
                    );
                  }

                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="edit-profile-field">
                  <label htmlFor="profile-first-name">
                    First Name
                  </label>

                  <input
                    id="profile-first-name"
                    type="text"
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(
                        capitalizeName(
                          event.target.value
                        )
                      )
                    }
                    onBlur={field.handleBlur}
                  />

                  {field.state.meta.errors.length >
                    0 && (
                    <p className="form-error">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </editProfileForm.Field>

            {/* MIDDLE NAME */}

            <editProfileForm.Field
              name="middleName"
              validators={{
                onChange: ({ value }) => {
                  const trimmed = value.trim();

                  if (
                    trimmed &&
                    trimmed.length < 2
                  ) {
                    return (
                      "Middle name must be at least 2 characters"
                    );
                  }

                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="edit-profile-field">
                  <label htmlFor="profile-middle-name">
                    Middle Name
                  </label>

                  <input
                    id="profile-middle-name"
                    type="text"
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(
                        capitalizeName(
                          event.target.value
                        )
                      )
                    }
                    onBlur={field.handleBlur}
                  />

                  {field.state.meta.errors.length >
                    0 && (
                    <p className="form-error">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </editProfileForm.Field>

            {/* LAST NAME */}

            <editProfileForm.Field
              name="lastName"
              validators={{
                onChange: ({ value }) => {
                  const trimmed = value.trim();

                  if (!trimmed) {
                    return "Last name is required";
                  }

                  if (trimmed.length < 2) {
                    return (
                      "Last name must be at least 2 characters"
                    );
                  }

                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="edit-profile-field">
                  <label htmlFor="profile-last-name">
                    Last Name
                  </label>

                  <input
                    id="profile-last-name"
                    type="text"
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(
                        capitalizeName(
                          event.target.value
                        )
                      )
                    }
                    onBlur={field.handleBlur}
                  />

                  {field.state.meta.errors.length >
                    0 && (
                    <p className="form-error">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </editProfileForm.Field>

            {/* EMAIL */}

            <editProfileForm.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  const trimmed = value.trim();

                  if (!trimmed) {
                    return "Email is required";
                  }

                  const emailRegex =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                  if (!emailRegex.test(trimmed)) {
                    return (
                      "Enter a valid email address"
                    );
                  }

                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="edit-profile-field">
                  <label htmlFor="profile-email">
                    Email
                  </label>

                  <input
                    id="profile-email"
                    type="email"
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(
                        event.target.value
                      )
                    }
                    onBlur={field.handleBlur}
                  />

                  {field.state.meta.errors.length >
                    0 && (
                    <p className="form-error">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </editProfileForm.Field>
          </div>

          <div className="edit-profile-actions">
            <button
              type="submit"
              className="edit-profile-save-button"
              disabled={
                editProfileForm.state.isSubmitting
              }
            >
              {editProfileForm.state.isSubmitting
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default EditProfile;