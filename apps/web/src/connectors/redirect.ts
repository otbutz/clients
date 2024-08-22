require("./redirect.scss");

window.addEventListener("load", () => {
  // ex: https://vault.bitwarden.com/redirect-connector.html#finish-signup?token=fakeToken&email=example%40example.com&fromEmail=true
  const currentUrl = new URL(window.location.href);

  // Get the fragment (everything after the #)
  const fragment = currentUrl.hash.substring(1); // Remove the leading #
  const fragmentParts = fragment.split("?"); // Split fragment into path and query string

  const path = fragmentParts[0]; // ex: finish-signup

  // A path is required in order to determine what action to take
  if (!path) {
    throw new Error("No path specified in the URL fragment.");
  }

  const queryString = fragmentParts[1]; // ex: token=fakeToken&email=example%40example.com&fromEmail=true

  const searchParams = new URLSearchParams(queryString);

  switch (path) {
    case "finish-signup": {
      handleFinishSignup(searchParams);
      break;

      // Add more cases here as needed
      // case "another-action":
      //     // Handle another case
      //     break;
    }
    default:
      throw new Error(`Unknown path: ${path}`);
      break;
  }
});

function handleFinishSignup(searchParams: URLSearchParams) {
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const fromEmail = searchParams.get("fromEmail");

  if (!token || !email || !fromEmail) {
    throw new Error("finish-signup redirect: Required parameters are missing.");
  }

  // Encode all parameters
  const encodedToken = encodeURIComponent(token);
  const encodedEmail = encodeURIComponent(email);
  const encodedFromEmail = encodeURIComponent(fromEmail);

  const newUrl = `${window.location.origin}/#/finish-signup?token=${encodedToken}&email=${encodedEmail}&fromEmail=${encodedFromEmail}`;
  window.location.href = newUrl;
}
