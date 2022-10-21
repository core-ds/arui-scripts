# [13.2.0-feat-further-speedup.1](https://git.moscow.alfaintra.net/ef/arui-scripts/compare/v13.1.3...v13.2.0-feat-further-speedup.1) (2022-10-21)


### Bug Fixes

* **babel:** add core-js as dependency ([e08d8c8](https://git.moscow.alfaintra.net/ef/arui-scripts/commit/e08d8c801181a5e4eda0ac73024d4685001e3ab7))
* **babel:** correctly determine babel-runtime version ([4dea00f](https://git.moscow.alfaintra.net/ef/arui-scripts/commit/4dea00fe98d4ea8a168542abab37ef1998df4808))
* **dev:** ignore build dir in watch mode ([185d61d](https://git.moscow.alfaintra.net/ef/arui-scripts/commit/185d61dc180f723f4750f57acc41edfa547f2492))


### Features

* update babel config, add partial processing of node_modules ([8e2cd71](https://git.moscow.alfaintra.net/ef/arui-scripts/commit/8e2cd71fa0dbd299555a5872378cfe1dc6507c81))
* **webpack:** change default dev source-map mode ([d184d6e](https://git.moscow.alfaintra.net/ef/arui-scripts/commit/d184d6e614014e0671d224ccb706322c1d284bee))
* **webpack:** disable webpack 4 compatibility by default ([9cba80d](https://git.moscow.alfaintra.net/ef/arui-scripts/commit/9cba80d7c990ad84ec7335f096cc422d558f81be))

# [13.2.0-feat-babel-config-update.2](https://git.moscow.alfaintra.net/ef/arui-scripts/compare/v13.2.0-feat-babel-config-update.1...v13.2.0-feat-babel-config-update.2) (2022-09-30)


### Bug Fixes

* **babel:** add core-js as dependency ([e08d8c8](https://git.moscow.alfaintra.net/ef/arui-scripts/commit/e08d8c801181a5e4eda0ac73024d4685001e3ab7))

# [13.2.0-feat-babel-config-update.1](https://git.moscow.alfaintra.net/ef/arui-scripts/compare/v13.1.3...v13.2.0-feat-babel-config-update.1) (2022-09-29)


### Features

* update babel config, add partial processing of node_modules ([8e2cd71](https://git.moscow.alfaintra.net/ef/arui-scripts/commit/8e2cd71fa0dbd299555a5872378cfe1dc6507c81))

## [13.1.3](https://git.moscow.alfaintra.net/ef/arui-scripts/compare/v13.1.2...v13.1.3) (2022-09-26)


### Bug Fixes

* changed warnings display ([24c341a](https://git.moscow.alfaintra.net/ef/arui-scripts/commit/24c341ad79b59edb869dc1063657be1b220ac931))

## [13.1.2](https://git.moscow.alfaintra.net/ef/arui-scripts/compare/v13.1.1...v13.1.2) (2022-09-21)


### Bug Fixes

* **bundle-analyze:** support multiple client configs ([8c9bc77](https://git.moscow.alfaintra.net/ef/arui-scripts/commit/8c9bc771d10c1bf038106f7bb83bd582b45394ac))

## [13.1.1](https://git.moscow.alfaintra.net/ef/arui-scripts/compare/v13.1.0...v13.1.1) (2022-08-05)


### Performance Improvements

* **webpack-dev:** add caching ([ed76817](https://git.moscow.alfaintra.net/ef/arui-scripts/commit/ed7681710130e6d0716114b11c5b698a15eb4b45))

# [13.1.0](https://git.moscow.alfaintra.net/ef/arui-scripts/compare/v13.0.0...v13.1.0) (2022-08-05)


### Features

* add yarn 2 support ([5d4bb8c](https://git.moscow.alfaintra.net/ef/arui-scripts/commit/5d4bb8c5e4debb3d0db430c094effbedd9b7bcc3))

# [13.1.0-feature-yarn2.1](https://git.moscow.alfaintra.net/ef/arui-scripts/compare/v13.0.0...v13.1.0-feature-yarn2.1) (2022-08-04)


### Features

* add yarn 2 support ([5d4bb8c](https://git.moscow.alfaintra.net/ef/arui-scripts/commit/5d4bb8c5e4debb3d0db430c094effbedd9b7bcc3))

# [13.0.0](https://git.moscow.alfaintra.net/ef/arui-scripts/compare/v12.5.0...v13.0.0) (2022-07-11)


### Bug Fixes

* **server:** disable minimization of server ([30e211b](https://git.moscow.alfaintra.net/ef/arui-scripts/commit/30e211ba8ae306164c33a262f48444972383e2f7))


### Features

* **server:** disable source-map support banner by default ([c486695](https://git.moscow.alfaintra.net/ef/arui-scripts/commit/c486695d30b4fd7c96c891b1920a67db8c47d854))


### BREAKING CHANGES

* **server:** source-map-support banner is no longer added by default
source-map-support significantly slow down code, especially if you use exceptions. In case you still need it you can use `installServerSourceMaps` option

## [12.4.1](https://git.moscow.alfaintra.net/ef/arui-scripts/compare/v12.4.0...v12.4.1) (2022-06-07)


### Bug Fixes

* **ts-config:** ignore local tsconfigs for ts-node ([0235ade](https://git.moscow.alfaintra.net/ef/arui-scripts/commit/0235ade62cbf9d14ac55f7c518ca170fdc7d364e))
* **ts-configs:** disable processing of js files with ts-node ([edbb9d2](https://git.moscow.alfaintra.net/ef/arui-scripts/commit/edbb9d2d23ba1c0f7950fedf5fff394b695c6cd5))

# [12.4.0](https://git.moscow.alfaintra.net/ef/arui-scripts/compare/v12.3.0...v12.4.0) (2022-05-25)


### Features

* add removeDevDependenciesDuringDockerBuild setting ([51f016f](https://git.moscow.alfaintra.net/ef/arui-scripts/commit/51f016f3aad3e2e5e489659d0b26e6005cacdafe))
