/** @type {import('next').NextConfig} */
const isPages = process.env.GITHUB_ACTIONS === "true";
// GitHub Pages serves a project site from /minicanva/, not the domain root.
const basePath = isPages ? "/minicanva" : "";

const nextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  // Exposed so client code can prefix root-relative asset paths it builds itself
  // (e.g. the sample story's /mock/*.svg), which basePath doesn't rewrite automatically.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
