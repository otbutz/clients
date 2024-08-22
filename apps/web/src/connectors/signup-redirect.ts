require("./signup-redirect.scss");

window.addEventListener("load", () => {
  const currentUrl = new URL(window.location.href);

  const token = currentUrl.searchParams.get("token");
  const email = currentUrl.searchParams.get("email");
  const fromEmail = currentUrl.searchParams.get("fromEmail");

  // Encode all parameters to ensure safe and correct URL handling
  const encodedToken = encodeURIComponent(token || "");
  const encodedEmail = encodeURIComponent(email || "");
  const encodedFromEmail = encodeURIComponent(fromEmail || "");

  // Send user onward into angular context. This redirect exists b/c Android can't handle
  // having # in a url as it is reserved character.
  // example window.location.origin: https://vault.bitwarden.com
  const newUrl = `${window.location.origin}/#/finish-signup?token=${encodedToken}&email=${encodedEmail}&fromEmail=${encodedFromEmail}`;
  window.location.href = newUrl;
});
