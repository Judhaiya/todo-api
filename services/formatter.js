/**
 * @param {string} path 
 * normalize path takes in path with single forward slash and returns double forward slash
 * as file path varies due to different os or different node version in different machines
 * @returns formatted file path replaced by double slash
 */

exports.normalizePath = (path) => {
  return path.replace(/\//g, "\\");
};
