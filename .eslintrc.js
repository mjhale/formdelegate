module.exports = {
  plugins: ["babel", "import", "jsx-a11y", "prettier", "react"],
  extends: ["prettier", "prettier/react"],
  parser: "babel-eslint",
  parserOptions: {
    emcaVersion: 7,
    sourceType: "module",
    ecmaFeatures: {
      arrowFunctions: true,
      binaryLiterals: true,
      blockBindings: true,
      classes: true,
      defaultParams: true,
      destructuring: true,
      experimentalObjectRestSpread: true,
      forOf: true,
      generators: true,
      jsx: true,
      modules: true,
      objectLiteralComputedProperties: true,
      objectLiteralDuplicateProperties: true,
      objectLiteralShorthandMethods: true,
      objectLiteralShorthandProperties: true,
      octalLiterals: true,
      regexUFlag: true,
      regexYFlag: true,
      superInFunctions: true,
      templateStrings: true,
      unicodeCodePointEscapes: true,
      globalReturn: true
    }
  },
  rules: {
    "babel/new-cap": 1,
    "no-await-in-loop": 1,
    "no-console": 0,
    "object-shorthand": 1,
    "prettier/prettier": "error",
    // Prevent usage of .bind() in JSX props
    "react/jsx-no-bind": [
      "error",
      {
        ignoreRefs: true,
        allowArrowFunctions: true,
        allowBind: false
      }
    ],
    // Require stateless functions when not using lifecycle methods, setState or ref
    "react/prefer-stateless-function": "error",
    strict: 0
  }
};
