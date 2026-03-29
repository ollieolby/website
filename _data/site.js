function normalizeBasePath(value) {
  if (!value || value === "/") {
    return "";
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
}

module.exports = {
  title: "Ollie",
  description: "Personal site, writing, and small web experiments.",
  basePath: normalizeBasePath(process.env.BASE_PATH)
};
