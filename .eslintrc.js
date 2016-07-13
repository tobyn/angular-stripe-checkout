module.exports = {
    env: {
        browser: true,
        commonjs: true
    },
    extends: "eslint:recommended",
    rules: {
        "indent": ["error", 2, { outerIIFEBody: 0 }],
        "linebreak-style": ["error", "unix"],
        "quotes": ["error", "single"],
        "semi": ["error", "always"]
    }
};
