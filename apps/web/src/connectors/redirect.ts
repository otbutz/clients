require("./redirect.scss");

window.addEventListener("load", () => {
  // ex: https://vault.bitwarden.com/redirect-connector.html#finish-signup?token=fakeToken&email=example%40example.com&fromEmail=true
  const currentUrl = new URL(window.location.href);

  // Get the fragment (everything after the #)
  const fragment = currentUrl.hash.substring(1); // Remove the leading #

  const newUrl = `${window.location.origin}/#/${fragment}`;
  window.location.href = newUrl;
});
