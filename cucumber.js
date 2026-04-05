const common = `
  features/**/*.feature
  --require-module ts-node/register
  --require features/support/steps.ts
  --require src/hooks/hooks.ts
  --format progress-bar
  --format html:test-results/cucumber-report.html
  --format json:test-results/cucumber-report.json
  --format summary
  --parallel ${process.env.PARALLEL_WORKERS || 4}
`;

module.exports = {
  default: common,
};
