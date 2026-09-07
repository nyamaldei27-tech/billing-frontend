import { useEffect, useState } from "react";
import "./EditProfile.css";

function EditProfile() {
  const customerId = 2;

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const response = await fetch(
          `http://localhost:8083/api/accounts/${customerId}`
        );

        if (!response.ok) {
          throw new Error("Failed to load customer");
        }

        const customer = await response.json();

        setFirstName(customer.firstName || "");
        setMiddleName(customer.middleName || "");
        setLastName(customer.lastName || "");
        setEmail(customer.email || "");
      } catch (error) {
        console.error("Failed to load customer:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, []);

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setSaving(true);

    try {
      const response = await fetch(
        `http://localhost:8083/api/accounts/${customerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName,
            middleName,
            lastName,
            email,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update customer");
      }

      alert("Profile updated successfully.");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="edit-profile-page">
        <h1>Loading profile...</h1>
      </main>
    );
  }

  return (
    <main className="edit-profile-page">

      <div className="edit-profile-header">
        <h1>Edit Profile</h1>

        <p>
          Update your personal information.
        </p>
      </div>

      <section className="edit-profile-card">

        <form onSubmit={handleSubmit}>

          <div className="edit-profile-grid">

            <div className="edit-profile-field">
              <label>First Name</label>

              <input
                type="text"
                value={firstName}
                onChange={(event) =>
                  setFirstName(event.target.value)
                }
                required
              />
            </div>

            <div className="edit-profile-field">
              <label>Middle Name</label>

              <input
                type="text"
                value={middleName}
                onChange={(event) =>
                  setMiddleName(event.target.value)
                }
              />
            </div>

            <div className="edit-profile-field">
              <label>Last Name</label>

              <input
                type="text"
                value={lastName}
                onChange={(event) =>
                  setLastName(event.target.value)
                }
                required
              />
            </div>

            <div className="edit-profile-field">
              <label>Email</label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>

          </div>

          <div className="edit-profile-actions">

            <button
              type="submit"
              className="edit-profile-save-button"
              disabled={saving}
            >
              {saving
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