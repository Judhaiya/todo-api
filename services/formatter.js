exports.normalizePath = (path) => {
  console.log("normalize path")
  return path.replace(/\//g, "\\");
};
