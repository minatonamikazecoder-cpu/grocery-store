export const loadUserAssets = () => {
  // Also bootstrap if needed
  let bsLink = document.getElementById("bootstrap-style") as HTMLLinkElement;
  if (!bsLink) {
    bsLink = document.createElement("link");
    bsLink.id = "bootstrap-style";
    bsLink.rel = "stylesheet";
    bsLink.href = "/css/bootstrap/bootstrap.min.css";
    document.head.appendChild(bsLink);
  }

  // Load user CSS
  let link = document.getElementById("user-style") as HTMLLinkElement;
  if (!link) {
    link = document.createElement("link");
    link.id = "user-style";
    link.rel = "stylesheet";
    link.href = "/css/style.css";
    document.head.appendChild(link);
  }

  // Remove admin style if exists
  const adminStyle = document.getElementById("admin-style");
  if (adminStyle) {
    adminStyle.remove();
  }
};
