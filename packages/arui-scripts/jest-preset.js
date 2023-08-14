module.exports = {
    testRegex: "src/.*(test|spec|/__test__/|/__tests__/).*\\.(jsx?|tsx?)$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
    collectCoverageFrom: [
        "src/**/*.{js,jsx,ts,tsx}"
    ],
    testURL: "http://localhost",
    transform: {
        "^.+\\.jsx?$": require.resolve('./build/configs/jest/babel-transform'),
        "^.+\\.tsx?$": require.resolve('ts-jest'),
        "^(?!.*\\.(js|jsx|ts|tsx|css|json)$)": require.resolve('./build/configs/jest/file-transform')
    },
    moduleNameMapper: {
        "\\.css$": require.resolve('./build/configs/jest/css-mock')
    },
    snapshotSerializers: [
        require.resolve('jest-snapshot-serializer-class-name-to-string')
    ]
}
