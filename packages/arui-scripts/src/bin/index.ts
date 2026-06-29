#! /usr/bin/env node

import { createCli } from './create-cli';

createCli().parse(process.argv);
