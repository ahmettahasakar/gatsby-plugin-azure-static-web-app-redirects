const fs = require("fs-extra");
const path = require("path");

const createRedirectRoute = ({
    fromPath,
    toPath,
    isPermanent
  }) => {
    return {
        "route": fromPath,
        "serve": toPath,
        "statusCode": isPermanent ? 301 : 302
    }
  }

exports.onPostBuild = ({ store }) => {
  const { redirects, program } = store.getState();

  // The path where we want to write the file `public/routes.json`
  const routesPath = path.join(program.directory, "public/routes.json");
  fs.ensureFileSync(routesPath);

  // Generate the contents of the `routes.json` file.
  const redirectRoutes = redirects.map(createRedirectRoute);

  // Return a promise chain
  return (
      fs.readFile(routesPath)
      .then((content) => {
        let routes;
        try {
          routes = JSON.parse(content.toString());
        } catch (e) {
          routes = new Object();
        }
        routes.routes = redirectRoutes;
        return fs.writeFile(routesPath, JSON.stringify(routes, null, "\t"));
      })
      .catch(e => {
        // Log any errors thrown
        console.error("onPostBuild error", JSON.stringify(e));
      })
  );
};