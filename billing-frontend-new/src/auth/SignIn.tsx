import keycloak from "../auth/keycloak";

export default function SignIn() {

  const handleSignIn = () => {
    console.log("SIGN IN BUTTON CLICKED");
    keycloak.login();
  };

  return (
    <div>
      <h1>Billing System</h1>

      <h2>Welcome back to B BillingApp</h2>

      <button
        type="button"
        onClick={handleSignIn}
      >
        Sign In
      </button>
    </div>
  );
}