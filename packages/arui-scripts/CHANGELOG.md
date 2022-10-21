# [13.2.0-feat-further-speedup.4](https://git.moscow.alfaintra.net/ef/arui-scripts/compare/v13.2.0-feat-further-speedup.3...v13.2.0-feat-further-speedup.4) (2022-10-21)


### Bug Fixes

* **babel:** determine babel-runtime version from app ([c5f0533](https://git.moscow.alfaintra.net/ef/arui-scripts/commit/c5f0533aafc9f248dcfff20cafc986f0fb54c106))

# [13.2.0-feat-further-speedup.3](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v13.1.3...v13.2.0-feat-further-speedup.3) (2022-10-21)



# 13.2.0-feat-further-speedup.3 (2022-10-21)


### Bug Fixes

* **babel:** update to latest runtime version ([b698ca4](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/b698ca416f233ec938c639eac37701cef7b95cd2))
* **dev-server:** allow unsafe-eval script src when using eval-based source maps ([ef31821](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/ef31821c1b60da27be2bbe4c6bc9ade0e5910ee9))



# 13.2.0-feat-further-speedup.2 (2022-10-21)


### Bug Fixes

* update babel runtime ([562d988](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/562d98824af4b78a2593fe25a51855ecd0db93bc))



# 13.2.0-feat-further-speedup.1 (2022-10-21)


### Bug Fixes

* **babel:** correctly determine babel-runtime version ([4dea00f](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/4dea00fe98d4ea8a168542abab37ef1998df4808))
* **dev:** ignore build dir in watch mode ([185d61d](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/185d61dc180f723f4750f57acc41edfa547f2492))


### Features

* **webpack:** change default dev source-map mode ([d184d6e](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/d184d6e614014e0671d224ccb706322c1d284bee))
* **webpack:** disable webpack 4 compatibility by default ([9cba80d](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/9cba80d7c990ad84ec7335f096cc422d558f81be))



# 13.2.0-feat-babel-config-update.2 (2022-09-30)


### Bug Fixes

* **babel:** add core-js as dependency ([e08d8c8](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/e08d8c801181a5e4eda0ac73024d4685001e3ab7))



# 13.2.0-feat-babel-config-update.1 (2022-09-29)


### Features

* update babel config, add partial processing of node_modules ([8e2cd71](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/8e2cd71fa0dbd299555a5872378cfe1dc6507c81))



## [13.1.3](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v13.1.2...v13.1.3) (2022-09-26)


### Bug Fixes

* changed warnings display ([24c341a](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/24c341ad79b59edb869dc1063657be1b220ac931))



## [13.1.2](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v13.1.1...v13.1.2) (2022-09-21)


### Bug Fixes

* **bundle-analyze:** support multiple client configs ([8c9bc77](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/8c9bc771d10c1bf038106f7bb83bd582b45394ac))



## [13.1.1](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v13.1.0...v13.1.1) (2022-08-05)



## 13.0.1-feat-speadup.1 (2022-08-03)


### Performance Improvements

* **webpack-dev:** add caching ([ed76817](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/ed7681710130e6d0716114b11c5b698a15eb4b45))



# [13.1.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v13.0.0...v13.1.0) (2022-08-05)



# 13.1.0-feature-yarn2.1 (2022-08-04)


### Features

* add yarn 2 support ([5d4bb8c](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/5d4bb8c5e4debb3d0db430c094effbedd9b7bcc3))



# [13.0.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v12.5.0...v13.0.0) (2022-07-11)


### Bug Fixes

* **server:** disable minimization of server ([30e211b](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/30e211ba8ae306164c33a262f48444972383e2f7))


### Features

* **server:** disable source-map support banner by default ([c486695](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/c486695d30b4fd7c96c891b1920a67db8c47d854))


### BREAKING CHANGES

* **server:** source-map-support banner is no longer added by default
  source-map-support significantly slow down code, especially if you use exceptions. In case you still need it you can use `installServerSourceMaps` option



# [12.5.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v12.4.1...v12.5.0) (2022-06-30)


### Bug Fixes

* **start.template.ts:** added condition for max_total_memory ([84e1462](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/84e14623c452b8edde662c54974c1e4f168625e9))



## [12.4.1](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v12.4.0...v12.4.1) (2022-06-07)


### Bug Fixes

* **ts-config:** ignore local tsconfigs for ts-node ([0235ade](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/0235ade62cbf9d14ac55f7c518ca170fdc7d364e))
* **ts-configs:** disable processing of js files with ts-node ([edbb9d2](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/edbb9d2d23ba1c0f7950fedf5fff394b695c6cd5))



# [12.4.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v12.3.0...v12.4.0) (2022-05-25)


### Features

* add removeDevDependenciesDuringDockerBuild setting ([51f016f](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/51f016f3aad3e2e5e489659d0b26e6005cacdafe))



# [12.3.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v12.2.0...v12.3.0) (2022-04-18)


### Bug Fixes

* changes after code review ([439fbda](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/439fbda458fa369f20d41d6e77d8b3b3906af4bf))
* **package.json:** up peerDependencies ([7ff5c69](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/7ff5c69ade098078e4f3980ddb2f66c3a79c2a1b))
* **webpack-dev:** disable default override of NODE_ENV ([49b1464](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/49b1464d2574514374aec223c5fde3fed025c93a))
* **webpack:** restore css minimization in dev ([84c404e](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/84c404e82e8afe9b6ac7c1d9dfbf5cd50d47e9d2))
* **yarn.lock:** up ([3496603](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/3496603b59984c90b1cece92c647b926f5743375))


### Features

* add support for ts override files ([d36b5da](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/d36b5dac0ac73dc580cc0a22c47438d6136e6b9e))
* allow using config files instead of package config ([5063d23](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/5063d23abc1a13b503c73b0906d68aaa57840a74))
* **alpine-node-nginx:** bump default node version to 14.17.6 ([2a19101](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/2a19101e9a745050c4b10922b366c149f84aa1c6))
* **alpine-node-nginx:** switch to docker-node base image ([ffdc236](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/ffdc2369d4e29d4272427b030e605b39c7541073))
* **alpine-node-nginx:** update brotli to v1.0.9 ([0c6b0a0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/0c6b0a0eadd5a314a7dc2f616dc5a33e5e574a7f))
* webpack updated to 5 version ([d1b361b](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/d1b361b2d29c0a4841b04f3bfaf27fed3d6b67d2))
* **webpack-client:** add stats file generation ([f6301da](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/f6301da5ebf6f7975a1b810c904cafd9c1d3f8f8))


### BREAKING CHANGES

* overrides will probably be broken



# 11.8.0-feat-webpack5.7 (2021-10-26)


### Bug Fixes

* **start/client:** added \n ([8ba993e](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/8ba993e2523b230fa7c411fa2351884afe189d98))



# 11.8.0-feat-webpack5.6 (2021-10-26)


### Bug Fixes

* **start/client:** remove \n ([216e619](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/216e61998d507498a1976c50d1ece2d9f840fbb3))



# 11.8.0-feat-webpack5.5 (2021-10-26)


### Features

* **commands/start:** added spawn ([289fdd5](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/289fdd5d804d68ec8bb9d77ef5f384705590bbec))



# 11.8.0-feat-webpack5.4 (2021-10-22)


### Bug Fixes

* **configs/dev-server:** added liveReload: false ([b8a62c0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/b8a62c04cef6178ece302636fcc12cf6c0256c49))



# 11.8.0-feat-webpack5.3 (2021-10-21)


### Bug Fixes

* **configs/webpack.client.dev:** changed sockIntegration for ReactRefreshWebpackPlugin ([dffc5db](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/dffc5dbd258e1572f54d82049996673b7d32fb25))



# 11.8.0-feat-webpack5.2 (2021-10-21)


### Bug Fixes

* **test:** added new line ([117aa8d](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/117aa8d33e28f08b2e720b258be52efd66020d21))



# 11.8.0-feat-webpack5.1 (2021-10-20)


### Features

* **react-refresh-webpack-plugin:** use for hot reload ([6c36686](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/6c36686a00666939d32d0ef8c0be25982fe38953))



# 11.3.0-feat-webpack5.1 (2021-05-28)


### Bug Fixes

* **build:** in webpack5 maybe undefined message ([d942899](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/d94289960a761d8543949f3596c6d689fe8a9fc4))
* **package.json:** add terser-webpack-plugin ([520c3f3](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/520c3f3637d43a887878472815cb31d7a5df56d9))
* **webpack.client.dev:** undefined process ([176e180](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/176e180d1ac26db678c98c250bc5e648d22abb86))
* **yarn.lock:** retry ([8e91803](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/8e91803f315996eb6e0b5c534747ce24770aca5c))
* **yarn.lock:** udpate checksum fsevents ([3a47287](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/3a4728780f3c872bc4835800662d2f10272e5ae2))
* **yarn.lock:** update ([50659c6](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/50659c65ee84997cefa0168ef6912ace826252c6))


### Features

* **css-minimizer-plugin:** add ([204c743](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/204c743b6910d8ca75e60d3163f45f98fe615905))
* **webpack-dev-server:** update ([33fa3fc](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/33fa3fc881951836ee636b9efb91b2ba465bbce2))



# 10.6.0-feature-webpack-5.5 (2021-03-23)


### Bug Fixes

* **dev-server:** set endline ([1dc6476](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/1dc64766ed2b9b63921209e18994b1f980fd444f))



# 10.6.0-feature-webpack-5.4 (2021-03-23)


### Bug Fixes

* **configs:** node_env ([18eabca](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/18eabca69563a1038ac62725f4366f0350b09b3a))



# 10.6.0-feature-webpack-5.3 (2021-03-22)


### Features

* **package.json:** update libs ([e7df2e7](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/e7df2e77bef2b833e0fc0c6a9eac1edf64f92cdb))



# 10.6.0-feature-webpack-5.2 (2021-02-25)


### Features

* **webpack-dev-server:** update ([3e1590b](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/3e1590babea2ad2f4f5a0ecc8370648309daefaf))



# 10.6.0-feature-webpack-5.1 (2021-02-25)


### Features

* clean code & add pnp-plugin ([899d4b7](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/899d4b714c06fbbc0faab86579080cfde2e1726c))



# 10.6.0-feat-webpack-5-with-yarn-2.2 (2021-02-24)


### Features

* **webpack.client.dev:** add webpack-dev-server to entry ([b3a8bf4](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/b3a8bf48d2d234e369756b2476decf3629bafe2c))
* **webpack.client.dev:** update plugins ([77c14d8](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/77c14d8b5a99cf8e8d4d43e2d9d0b8534194d87c))



# 10.5.0-feat-webpack-5-with-yarn-2.4 (2021-02-21)


### Features

* client webpack plugins ([5f3d5fe](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/5f3d5fe077f797f7826e233d16c3b368080854f2))



# 10.5.0-feat-webpack-5-with-yarn-2.3 (2021-02-20)


### Features

* add  pnp plugin and remove hmr ([40ec248](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/40ec248acfdafce63b16093d7af0c1ef63897370))



# 10.5.0-feat-webpack-5-with-yarn-2.2 (2021-02-20)


### Features

* **yarn:** install packages from sources ([0fe186b](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/0fe186b31109c9df53b5586c920efab2fefe0d80))



# 10.5.0-feat-webpack-5-with-yarn-2.1 (2021-02-19)


### Bug Fixes

* **configs:** rename newclick-composite-components in nodeExternals whitelist ([0256e6a](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/0256e6a6ade69d0456c992b526c492b57ce00d28))
* **hmr:** use run-script-webpack-plugin ([ef1c3bc](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/ef1c3bc6f62b260af5582a20a70169355069d3a3))
* **nginx:** disable server tokens globaly ([c6bd588](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/c6bd588a4bd373a9f3aba67f0b8b50faf2c77d74))
* **nginx:** keep nginx special vars in place when using envsubst ([623b84f](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/623b84f5242b4ab6875ecbb88ef8290f3be5e7b4))
* **overrides:** remove unnecessary `hasOverrides` check ([c339adf](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/c339adf33b9b368f99aad8607becb2e2b24ebc3a))
* **start.sh:** correctly build nginx conf ([6a29d96](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/6a29d9684f6015e24b50c4a2ab7239950660a5ff))
* **start.sh:** replace all nginx variables in line ([70a90df](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/70a90df9ba482417b80f05fd818508acbf014efc))
* support custom start folder ([7700b8b](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/7700b8b6eb85e247579be717104ca1320db21e5c))


### Features

* **css-vars:** remove polyfill, set keepCssVars=false by default ([79b603a](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/79b603a9590459b260910f03b3d3cc60cad2e46b))
* **nginx:** add envsubst for nginx config ([0697a6f](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/0697a6fb8f28c1c85698d257a2ac355bc4f27187))
* **nginx:** add original host to nginx template ([d831503](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/d831503e582f969e17c99260669ec145eab79e8d))
* **overrides:** add nginx, dockerfile and start.sh overrides ([114f11b](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/114f11b5aa74df2a3f5db1404b4d1f7ae9078faa))
* **overrides:** pass app configs to override functions ([4b64c29](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/4b64c2949952f173515adcffac1af7ac01ad856d))
* update node version to 14.16.1 ([3329e5f](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/3329e5fa8b693ca71e2dd625d44eab88ca000d90))
* **webpack:** update ([d3d7a22](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/d3d7a2274d2d2c8985d3f3548a913f1fc0f84c48))



# 11.2.0-feat-presets.1 (2021-05-05)


### Bug Fixes

* **css-vars:** add polyfill for ie11 when using css vars ([7a045dc](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/7a045dcec8f10febaf88ed7293098c71532ecad3))
* **nodejs:** allow to use more memory on constrained environments ([0111531](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/011153185fe92b3bda5e3df45111e6f7638acb2a))


### Features

* **config:** add presets support ([1ecd788](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/1ecd7880c709a56609291c1fffc2cce7fb5c4b1e)), closes [#173](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/issues/173)
* **configs:** update css breakpoints to px ([07b239b](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/07b239b19fe503c7299774dfbd4587b6f6aa2388))
* **configs:** update postcss-custom-media plugin, move breakpoints to file ([0dacfd5](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/0dacfd504c54fb867bb872a47832b231c7fc32ec))
* **nginx:** hide server version from headers and error pages ([ff2c2f7](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/ff2c2f70b01e67f675fcaf32a27057593bef72bb))
* update jest dependencies ([c20a933](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/c20a9339e82d46e23d1802d9180d42d627fc432d))
* update node version to 12.20.1 ([07f6bed](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/07f6bedd2485f84fbc37af33de1d234052c0b838))
* upgrade minimal nodejs version ([6e9df76](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/6e9df768505314ccff6451a00cb5d869f05df457))


### BREAKING CHANGES

* Drop support for node 10. Only nodejs >= 12.0 is now supported



# [10.2.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v10.1.4...v10.2.0) (2021-01-20)



## [10.1.4](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v10.1.3...v10.1.4) (2021-01-15)


### Bug Fixes

* fix folder error ([eb5faa1](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/eb5faa1a8221d09b75de477db2c8754ba909d881))



## [10.1.3](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v10.1.2...v10.1.3) (2020-12-18)


### Bug Fixes

* **dev-server:** fix wrong path and url comparison on windows ([d488311](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/d488311d88343647d19f65daa2364dcb9fb7035c))



## [10.1.2](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v10.1.1...v10.1.2) (2020-12-17)


### Bug Fixes

* **nginx:** always use only ipv4 host ([fe73d1c](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/fe73d1c41d3f14afdc41c137b760a253eaea2755))



## [10.1.1](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v10.1.0...v10.1.1) (2020-11-30)


### Bug Fixes

* **tsconfig:** formatting fix ([32b2248](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/32b22485197a90bb004deb7d5dedd14f2b89dc10))
* **tsconfig:** separate build config from published config ([a55051d](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/a55051d06f2ee8df86a6c78ebee5d13dba2a713c))



# [10.1.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v10.0.1...v10.1.0) (2020-11-10)


### Features

* **webpack-client:** use svg-url-loader for svg ([638d601](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/638d6015b1c49863468a0599609e3e107d08bc2d))



## [10.0.1](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v10.0.0...v10.0.1) (2020-11-09)


### Bug Fixes

* **alpine-node:** push docker image on commit ([7e8c286](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/7e8c286a8f038dee5c5f6f020e5f3dc7c9a193d6))
* **webpack-dev:** add public path, so images loads correctly in dev mode ([e5c8a16](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/e5c8a1640d674324ef835a68b76b251cd8772575))
* **webpack-server:** add date-fns to externals, so it won't conflict with arui-feather date-fns ([131e9b2](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/131e9b2d17804f6af378bb3c8adfbbd36ec4a8ee))



# [10.0.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v9.7.0...v10.0.0) (2020-10-26)


### Bug Fixes

* **alpine-node-nginx:** fix gpg errors ([33e6f72](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/33e6f722b6dee26a0e66dcc979e05729f1927b79))
* **dependencies:** ts as peer dependency ([438c7e7](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/438c7e76023ab4e65bc67c0efa95a50da78f8395))
* **get-entry:** remove console.log ([39d735d](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/39d735db9b3709248ae3b8c7083541ac0c2187c6))
* **jest:** correctly resolve path to all file mappers ([fcc34f9](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/fcc34f99cca471c34b85c2b7dab4d838430770ca))
* replace remaining require with imports ([094d6c2](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/094d6c24f80a3d4fb9d6e72629f6505a3b307904))
* **ts-node:** configure it from single place ([e68eda5](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/e68eda5058b694497af69978410c29541d541b0b))
* **webpack-server:** fix node-externals in workspaces ([c283ae0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/c283ae0c9dface9e99a501f544a9ffc16ed2c22c))
* **yarn:** fix ci configs ([b4d1162](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/b4d1162c92febf6167edcb83c81f6e884f71d092))


### Features

* **alpine-node-nginx:** add docker build workflow ([2d95808](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/2d958084feac5ba52b5d269eb90ed946f87eb7ba))
* **alpine-node-nginx:** read version from version file ([dce6105](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/dce6105a5a189c009947d4cddc947ce35ed555c6))
* ts in all webpack configs ([e051e29](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/e051e293a73c837d8d0cc53f32e262f0883a8d87))
* yarn 2 support ([73bef4f](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/73bef4f711c9b3c446665d38994447cdd896577e))



# [9.7.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v9.6.0...v9.7.0) (2020-10-22)


### Features

* **webpack:** split dynamic import from node_modules to chunk ([ba6a286](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/ba6a286f3cd827854e98e047fea979c3fcdf82e7))



# [9.6.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v9.5.0...v9.6.0) (2020-10-08)


### Features

* **postcss-config:** add keepCssVars, revert plugin ([2d8a0d6](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/2d8a0d6bd288e0fe880975155d21145c9eb9b374))



# [9.5.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v9.4.1...v9.5.0) (2020-09-22)


### Features

* **webpack:** replace style tags with optimized css bundle in dev ([22681f2](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/22681f2c3e89de7c2c27d9fca286ecd69aad01cc))



## [9.4.1](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v9.4.0...v9.4.1) (2020-09-11)


### Features

* **postcss-config:** add postcss-color-mod-function ([a619453](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/a61945301ef4290e2e93d6e47a2be1527b6df5ff))



# [9.4.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v9.3.2...v9.4.0) (2020-08-19)


### Bug Fixes

* **check-required-files:** skip empty files from config ([34701c5](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/34701c5d0387cc586c9d7b1962ba37a619d93996))


### Features

* **webpack:** add support for multiple entrypoints ([508c5c1](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/508c5c1349979772dded3f422e4ed7c392692dad))



## [9.3.2](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v9.3.1...v9.3.2) (2020-08-18)


### Features

* **supporting-browsers:** add supporting-browsers to overrides ([2671fd5](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/2671fd500ff090ef5a75b924b418f2867509c005))



## [9.3.1](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v9.3.0...v9.3.1) (2020-07-28)



# [9.3.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v9.2.0...v9.3.0) (2020-07-03)


### Bug Fixes

* **assets-size:** use brotli-size as optional dependency ([144980b](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/144980bb0b1b31508b64622101b8f90a184aa62d))
* **config:** add theme setting and change to eng ([1befdf6](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/1befdf652b9340bcdcf8559632b41c954eaf5272))
* **deps:** update @alfalab/postcss-custom-properties ([24078ba](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/24078ba2dbd66c583e607fd7fcdaef304b3aab95))
* **tests:** remove unused flag ([328bab6](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/328bab63d816bf13bbfb3fe2ca726fb673eef132))
* **tsconfig:** disable removeComments flag ([30cc24e](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/30cc24e2a33559875e291574a40b2e1a83e9058b)), closes [#117](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/issues/117)
* **webpack-server:** source-map-support is now optional ([7996d82](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/7996d827359d70e17a711e5ae60a941519b51ed2)), closes [#43](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/issues/43)


### Features

* **assets-size:** print brotli size when possible ([d744fa4](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/d744fa436f193508ad078d3529f7c3a8bdfee65c)), closes [#114](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/issues/114)
* **config:** check passed settings ([7653a90](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/7653a907122a1eba0ee503ff564f77b671b02f97))
* **webpack:** add bundle-analyze command ([705d87e](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/705d87e69efca87b4e0f80e8fe1ea80b15344812)), closes [#115](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/issues/115)



# [9.2.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v9.1.0...v9.2.0) (2020-06-15)


### Bug Fixes

* **client:** disable brotli on node < 10 ([fc274f9](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/fc274f916302aad1b9bd3a6e5eeaa85273bb18c3))


### Features

* **client:** add brotli support ([062e42c](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/062e42c973fa284dcb3914f35014d919b69c6412))



# [9.1.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v9.0.4...v9.1.0) (2020-06-03)


### Bug Fixes

* **postcss.config.js:** add docs, export theme setting from app-configs ([7a367c4](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/7a367c4f5076ab14cd3dc409ae27eb49a283112a))
* **postcss.config.js:** fix and simplify theme setting ([bed0cab](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/bed0cab30fa266584bd85cb24274fced4729c369))



## [9.0.4](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v9.0.3...v9.0.4) (2020-06-02)


### Bug Fixes

* **tsconfig:** allow import json modules ([45e5c07](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/45e5c07ed7f8038767b34fb9ef6afe5221c222fd))


### Features

* **docker-build:** fetch registry from args ([79bac18](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/79bac18070cf3e754b622163f0daa970b4eddc20))



## [9.0.3](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v9.0.2...v9.0.3) (2020-05-25)



## [9.0.2](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v9.0.1...v9.0.2) (2020-05-19)


### Features

* add newclick-composite-components to whitelist ([ff6c1f8](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/ff6c1f8099b8b7f725d3944d063d5d7a83ba96e0))



## [9.0.1](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v9.0.0...v9.0.1) (2020-04-27)


### Bug Fixes

* **webpack-client:** work with array-style webpack configs correctly ([6f8c912](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/6f8c912981456d57003f7912dbd34acc0920ab5f))



# [9.0.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v8.5.1...v9.0.0) (2020-04-20)


### Features

* **config:** use node 12 as default base image ([cc8ef06](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/cc8ef06e914abc9ba14599c71ab31e74a7a30ae9))



## [8.5.1](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v8.5.0...v8.5.1) (2020-04-16)


### Features

* css vars theming ([1c8029b](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/1c8029b76133776cfb2094afa83680ba20671c7b))



# [8.5.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v8.4.0...v8.5.0) (2020-04-01)



# [8.4.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v8.3.4...v8.4.0) (2020-03-23)


### Bug Fixes

* update babel version ([5f7d508](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/5f7d50877f935ae5d89da2407929f1308854593b))


### Features

* **conf:** disable allowJs rule ([49cfc56](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/49cfc56c32b03ccf851d8476311e3cabc9d7d547))



## [8.3.4](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v8.3.3...v8.3.4) (2020-03-06)



## [8.3.3](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v8.3.2...v8.3.3) (2020-03-06)


### Bug Fixes

* remove bad tests ([81cb375](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/81cb375e6fe9acb5e5054c5db6f7f24e03fda8b6))
* restore utils ([0434106](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/043410691e3bc76d8ee987ec7e55a624cb46c33e))
* **tests:** textRegex path ([9ed4589](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/9ed4589fcea2a39a9ac85932d270115de454b844))



## [8.3.2](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v8.3.1...v8.3.2) (2020-03-04)


### Bug Fixes

* **nginx.conf.template:** updated rule for request's max body size ([5364789](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/536478978fc3dec3c80bf05a598e1296fa2f806a))



## [8.3.1](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v8.3.0...v8.3.1) (2020-03-04)


### Features

* add .editorconfig ([c0238d4](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/c0238d4beaeffb61634327efb53a30ab18ba40ef))
* change some rules in .editorconfig ([cae471b](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/cae471b79f3f576b9764b936d2841c4681521e29))
* update @babel/preset-env, remove usless deps ([10b9993](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/10b9993e53121f4296bc451367564963d28e577b))
* update yarn.lock ([889fbf0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/889fbf04890c250a6c8b50fe1cc7a600bfe27db2))



# [8.3.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v8.2.6...v8.3.0) (2020-02-11)



## [8.2.6](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v8.2.5...v8.2.6) (2020-02-05)


### Bug Fixes

* hotfix, according latest webpack dev server docs ([268a6fc](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/268a6fc2bedc45ee7557da78c2bf41feef52cca9))



## [8.2.5](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v8.2.4...v8.2.5) (2020-02-05)



## [8.2.4](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v8.2.3...v8.2.4) (2020-02-05)


### Features

* use react dev utils for css modules ([35c4329](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/35c432915d280cdd2616212b125dafbf04744398))



## [8.2.3](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v8.2.2...v8.2.3) (2020-02-02)


### Bug Fixes

* fix regexp to exclude test files outside of src dir ([8a8729b](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/8a8729bad9fc9ebf3897e96dc00a95bf3f8b7ee7))



## [8.2.2](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v8.2.1...v8.2.2) (2020-01-28)


### Bug Fixes

* remove invalid option ([1de8fae](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/1de8faefe66bb219b2537a4b1e15f44106bb784a))
* up css loader ([32dec5e](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/32dec5e49f363c34550bb16e9c7e099fb0d3246c))



## [8.2.1](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v8.2.0...v8.2.1) (2020-01-17)


### Bug Fixes

* **jest-config:** fix test files regexp ([d208b34](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/d208b34a86f54c569548ed9b0172a82eb6726f80))



# [8.2.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v8.0.0...v8.2.0) (2020-01-16)


### Bug Fixes

* **config:** change assets RegExp in proxy ([3321833](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/3321833ad774244d4b759dd91e3b982e2f25de6d))
* **config:** use publicPath config property for assets path ([61f7a83](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/61f7a83d0a262582848d0b7075fea92c184c78d5))
* **dev-server:** make correct method startWith -> startsWith ([cf91a62](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/cf91a62e3401385bb621646f61ba95c83fe5e6a3))


### Features

* **babel:** add optional chaining and nullish coalescing support ([8fa3211](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/8fa32114378cba1243564e7121904f4d55cfb884))
* **ci:** add yarn cache ([17ff911](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/17ff911c3fabdec755bfc98575f4bb9c159e0f69))
* **jest:** dynamic pass paths from tsconfig for aliases ([cfaed8f](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/cfaed8f28f5aec2fbb8c65af24230a42897c008a))
* **jest:** make more correct title for some variables ([28766c6](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/28766c6ff174abaa3e35bb1aaafb7e9004aa1efe))



# [8.0.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v7.0.0...v8.0.0) (2019-12-24)


### Bug Fixes

* changed commitlint settings ([50a6a39](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/50a6a39fa0847da81277c49c1941a5b4eff89321))
* deleted baseUrl ([95158e3](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/95158e3f2546ad39bb65f68ce29ec3968a5ebd93))
* deleted commitlint as dep ([c83af3e](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/c83af3e96ee4a8fca9ad7284cab7ca04e0635062))
* reintaling husky ([46f955c](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/46f955c7609c3e7b85ffdec437d7da5c34fe3429))
* removed recursive symlink ([f1b6459](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/f1b645973c2a4e6e134a484dd0b00dad4696e6e9))
* returned proccess.argv ([9199bb8](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/9199bb82fdf62e071a773601a221ba7de1e7a57b))
* trying fix build ([7c2e76b](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/7c2e76b94a54ceb4470c74ddf13ae5d12c901c73))


### Features

* add prod tsconfig ([82f91e7](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/82f91e7d24186d8ec6c104c4bf3257137ff5052d))
* close [#59](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/issues/59) ([7f36f8b](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/7f36f8b3059bca18ff3e0813f5e25a7a2c350dca))



# [7.0.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v6.0.3...v7.0.0) (2019-12-05)



## [6.0.3](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v6.0.2...v6.0.3) (2019-12-04)



## [6.0.2](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v6.0.1...v6.0.2) (2019-12-04)


### Features

* allow override scripts settings by env ([172dc48](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/172dc481babd40db322c4d49629e468b41592b1e))



## [6.0.1](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v6.0.0...v6.0.1) (2019-11-27)


### Bug Fixes

* fix css modules loader ([77cdcb3](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/77cdcb33da4f82d8c1cf593546f178c77b6553d3))



# [6.0.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v5.6.2...v6.0.0) (2019-11-27)


### Features

* use css modules naming convention ([836670a](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/836670ac2bc807041619ab74d39b23195e89d532))



## [5.6.2](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v5.6.1...v5.6.2) (2019-11-14)



## [5.6.1](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v5.6.0...v5.6.1) (2019-10-02)



# [5.6.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v5.5.0...v5.6.0) (2019-09-13)


### Bug Fixes

* fix postcss webpack server config ([bbfcd53](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/bbfcd534185016cfc8d042fcf396293edabcc60e))
* fixed issue with shadowing path module ([b499974](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/b499974472673b381b06436be88497d3f79c46ef))


### Features

* additional build path ([5cc67c9](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/5cc67c9ddc8246b86903f323249be49eaff89870))



# [5.5.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v5.4.0...v5.5.0) (2019-08-22)


### Features

* add css modules support for *.pcss files ([f927623](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/f9276236484024d53da1c6e152185c85be044074))



# [5.4.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v5.3.0...v5.4.0) (2019-06-28)


### Features

* **client:** remove unused measureFileSizesBeforeBuild call ([de0c68a](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/de0c68af603b473e145632b7de834cf101d7d310))



# [5.3.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v5.2.0...v5.3.0) (2019-06-27)



# [5.2.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v5.1.0...v5.2.0) (2019-06-25)


### Features

* **webpack.client.prod:** use TerserPlugin for minimization ([425adeb](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/425adeb47dd6d078f9f590e1276904c10dae8563))



# [5.1.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v5.0.0...v5.1.0) (2019-05-30)



# [5.0.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v4.2.6...v5.0.0) (2019-04-25)


### Bug Fixes

* **postinstall:** more obvious error messages on symlink creation issues ([0e348c1](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/0e348c121a25e3cdfbd1bc3d4c3ea787c849c6c5))


### Features

* synchronized contents of archive build with contents of docker build ([97a1fa2](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/97a1fa24207efc5fc991efd159568acba63e62d0))
* **webpack:** remove React ProvidePlugin ([01e6b5a](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/01e6b5a40358562cebe2cac364728599ba7bbdbd))



## [4.2.6](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v4.2.5...v4.2.6) (2019-02-28)



## [4.2.5](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v4.2.4...v4.2.5) (2019-02-14)


### Bug Fixes

* remove toLowerCase() call on argValue from docker-build ([6ee433c](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/6ee433cbc51194a98bb9fd4a7cb0e0febf6a5051))



## [4.2.4](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v4.2.3...v4.2.4) (2019-01-23)


### Bug Fixes

* **test:** Comment about skipped arguments added ([ce555ce](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/ce555ce67370ab069b4f3d5969142c7953aadbf9))
* **test:** Fixed argument handling to test provided files only ([8711585](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/871158582e56ef393bf8a3e0fc8855ed059cff8a))



## [4.2.3](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v4.2.2...v4.2.3) (2019-01-17)


### Features

* **webpack-dev-server:** up version to 3.1.4 ([0be5c9f](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/0be5c9fc4062f347a3693f1cabd36cadd49c8ed1))



## [4.2.2](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v4.2.1...v4.2.2) (2019-01-10)


### Bug Fixes

* **dependencies:** update webpack-dev-server ([b7727c6](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/b7727c668abbcca121b8e65449f6fd700bea214e))



## [4.2.1](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v4.2.0...v4.2.1) (2018-12-26)


### Bug Fixes

* **postcss-config:** change extensions for postcss-custom-media plugin ([9e3a560](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/9e3a5608edc5dab15328cd53f8430f7eab51afca))



# [4.2.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v4.1.2...v4.2.0) (2018-12-18)


### Features

* **docker-build:** added ability to override dockerfile ([76a3a3a](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/76a3a3af0fa721534fbddd60af45c9104a69c230))



## [4.1.2](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v4.1.1...v4.1.2) (2018-12-10)


### Bug Fixes

* **client:** correct base path for css extractor plugin ([1195fa7](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/1195fa7125bdfb91fca7503a1501947385d59e47))



## [4.1.1](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v4.1.0...v4.1.1) (2018-12-06)


### Bug Fixes

* provided default value for clientPolyfillsEntry when no arui-feather is installed ([623593e](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/623593e4aea37d026a2dad8b1c73639259677e40))
* **webpack-minimizer:** update webpack, disable z-index optimize ([f936b1b](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/f936b1b301eb7dd2215dba175271c6fd5edb0c40))



# [4.1.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v4.0.3...v4.1.0) (2018-12-04)


### Features

* **browserlist:** forget dead browsers ([926bc1d](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/926bc1d6b5448aabcabb15b8a94b743c82c7a1df))



## [4.0.3](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v4.0.2...v4.0.3) (2018-12-04)


### Bug Fixes

* **webpack.client:** remove pathinfo from client prod build ([c2d86a3](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/c2d86a31aa10ba4649b8691385ccbfae3fd14484))


### Features

* **ci:** add travis ci ([9c30459](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/9c30459f065814211f3923f912e1399e1725060e))
* **scripts:** add install step for test project ([e834431](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/e8344319c2e926a8229a37fb851ad0b165503fbd))



## [4.0.2](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v4.0.1...v4.0.2) (2018-11-23)


### Bug Fixes

* move test to other directory, fix npmignore ([73f93e4](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/73f93e4d7956a2379465a97f7c85e7d10544c3e6))



## [4.0.1](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v3.0.0...v4.0.1) (2018-11-23)


### Bug Fixes

* small review fixes ([7888b6b](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/7888b6b8fc9f4a095edd5cfc9c3e689ee22afaf1))


### Features

* add `useTscLoader` flag, fix some problems with ts compilation ([568f509](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/568f5098bfe5956ee6bc5bdaef1edab69b9c582f))
* migrate to webpack 4 ([acbb30b](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/acbb30bf07b27f064b6a8c249ed448e4277895f8))



# [3.0.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v2.2.1...v3.0.0) (2018-11-14)


### Features

* **webpack:** ignore non-js require in node.js in node_modules ([2de1ea7](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/2de1ea7d48947636b84aca06c61b7b1b933a3b84))



## [2.2.1](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v2.1.1...v2.2.1) (2018-10-22)


### Features

* **jest-preset:** add testURL ([374d924](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/374d92436a12cc9df967c0ea701b2f168931f34f))



## [2.1.1](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v2.1.0...v2.1.1) (2018-10-02)


### Bug Fixes

* **app-configs:** typo in serverPort ([72ea7e3](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/72ea7e31f71d18841e81d74ca23b1fbfbb764f98))



# [2.1.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v2.0.5...v2.1.0) (2018-09-28)



## [2.0.5](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v2.0.4...v2.0.5) (2018-08-23)


### Bug Fixes

* **webpack-client-prod:** keep keyframes names ([fdd4298](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/fdd4298d58826910356150b39c65fedfc5d274ee))



## [2.0.4](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v2.0.3...v2.0.4) (2018-08-08)


### Bug Fixes

* **app-configs:** fix baseDockerImage ([0100b06](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/0100b06c2479a23be8fa3d180e6ae549c4605c2d))



## [2.0.3](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v2.0.2...v2.0.3) (2018-08-06)


### Bug Fixes

* changed octal value ([40a9dfa](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/40a9dfa7c4a9da244f9e343c9929c48e6faf3dd4))



## [2.0.2](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v2.0.1...v2.0.2) (2018-08-06)


### Bug Fixes

* remove erroneous commit ([cda07da](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/cda07da38362750a121317660244ee2ae2a892a7))



## [2.0.1](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/v2.0.0...v2.0.1) (2018-08-06)


### Bug Fixes

* add file mode while writing the start.sh file ([82747cd](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/82747cdb927da794bc4e52e2aed71e615a61a669))
* make start.sh executable ([0998e7b](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/0998e7b98bf628a35e941695641ab755b979e706))



# [2.0.0](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/compare/ae5f4adb6fb876e5869150ca1e08dfab96afea93...v2.0.0) (2018-08-02)


### Features

* allow to pass options with 'arui-scripts' property ([ae5f4ad](https://git.moscow.alfaintra.net/projects/EF/repos/arui-scripts/commits/ae5f4adb6fb876e5869150ca1e08dfab96afea93))
