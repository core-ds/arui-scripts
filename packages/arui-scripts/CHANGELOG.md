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
