/** These tested model modules acquire application callers as the screens are implemented. */
const phaseOneModels = "^src/common/model/(LeastSquares|RowReduction|Svd)\\.ts$";

module.exports = {
  omitRules: ["no-unreachable-from-entry"],
  forbidden: [
    {
      name: "no-unreachable-from-entry-except-phase-one-models",
      severity: "error",
      from: { path: "^src/main\\.ts$" },
      to: {
        path: "^src/",
        pathNot: `^src/main\\.ts$|\\.d\\.(c|m)?ts$|${phaseOneModels}`,
        reachable: false,
      },
    },
  ],
};
