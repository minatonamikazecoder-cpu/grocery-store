export const loadAdminAssets = () => {
  // Load admin CSS
  let link = document.getElementById("admin-style") as HTMLLinkElement;
  if (!link) {
    link = document.createElement("link");
    link.id = "admin-style";
    link.rel = "stylesheet";
    link.href = "/admin/css/styles.css";
    document.head.appendChild(link);
  }

  // Remove user style if exists
  const userStyle = document.getElementById("user-style");
  if (userStyle) {
    userStyle.remove();
  }
};
