/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  semi: true,
  trailingComma: 'none',
  singleQuote: true,
  printWidth: 100,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: ['^@core/(.*)$', '<THIRD_PARTY_MODULES>', '^@server/(.*)$', '^@ui/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true
};

export default config;
