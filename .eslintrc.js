module.exports = {
    "plugins": [
        "react",
        "jsx-a11y",
        "import",
        "babel",
    ],
    "parser": "babel-eslint",
    "parserOptions": {
      "emcaVersion": 7,
      "sourceType": "module",
      "ecmaFeatures": {
        "arrowFunctions": true,
        "binaryLiterals": true,
        "blockBindings": true,
        "classes": true,
        "defaultParams": true,
        "destructuring": true,
        "experimentalObjectRestSpread": true,
        "forOf": true,
        "generators": true,
        "jsx": true,
        "modules": true,
        "objectLiteralComputedProperties": true,
        "objectLiteralDuplicateProperties": true,
        "objectLiteralShorthandMethods": true,
        "objectLiteralShorthandProperties": true,
        "octalLiterals": true,
        "regexUFlag": true,
        "regexYFlag": true,
        "superInFunctions": true,
        "templateStrings": true,
        "unicodeCodePointEscapes": true,
        "globalReturn": true,
      },
    },
    "rules": {
      "no-console": 0,
      "generator-star-spacing": 1,
      "babel/new-cap": 1,
      "array-bracket-spacing": 1,
      "object-shorthand": 1,
      "arrow-parens": 1,
      "babel/no-await-in-loop": 1,
      // Require stateless functions when not using lifecycle methods, setState or ref
      "react/prefer-stateless-function": "error",
      // Prevent usage of .bind() in JSX props
      "react/jsx-no-bind": ["error", {
        ignoreRefs: true,
        allowArrowFunctions: true,
        allowBind: false,
      }],
      "semi": 1,
      "strict": 0,
    },
};
