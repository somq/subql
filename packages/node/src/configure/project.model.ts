// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RegisteredTypes } from '@polkadot/types/types';
import {
  parseChainTypes,
  ProjectNetworkConfig,
  ProjectManifestVersioned,
  manifestIsV0_0_1,
  manifestIsV0_2_0,
  ReaderFactory,
  parseProjectManifest,
  Reader,
  isRuntimeDataSourceV0_2_0,
  GithubReader,
  ReaderOptions,
} from '@subql/common';
import { SubqlDatasource, SubqlRuntimeDatasource } from '@subql/types';
import yaml from 'js-yaml';
import { pick } from 'lodash';
import { getLogger } from '../utils/logger';

const logger = getLogger('configure');

export class SubqueryProject {
  private _projectManifest: ProjectManifestVersioned;

  static async create(
    path: string,
    networkOverrides?: Partial<ProjectNetworkConfig>,
    readerOptions?: ReaderOptions,
  ): Promise<SubqueryProject> {
    const reader = await ReaderFactory.create(path, readerOptions);

    const projectManifest = parseProjectManifest(
      await reader.getProjectSchema(),
    );
    return new SubqueryProject(projectManifest, reader, networkOverrides);
  }

  constructor(
    manifest: ProjectManifestVersioned,
    private readonly reader: Reader,
    private networkOverrides?: Partial<ProjectNetworkConfig>,
  ) {
    this._projectManifest = manifest;

    if (reader instanceof GithubReader) {
      // No support because we cant run build, or install dependencies
      throw new Error('Projects from github is not supported');
    }

    manifest.dataSources?.forEach(function (dataSource) {
      if (!dataSource.startBlock || dataSource.startBlock < 1) {
        if (dataSource.startBlock < 1) logger.warn('start block changed to #1');
        dataSource.startBlock = 1;
      }
    });
  }

  get id(): string {
    //projectId // TODO, define projectId, used by poi
    return this.root;
  }

  get projectManifest(): ProjectManifestVersioned {
    return this._projectManifest;
  }

  get network(): Partial<ProjectNetworkConfig> {
    const impl = this._projectManifest.asImpl;

    if (manifestIsV0_0_1(impl)) {
      return {
        ...impl.network,
        ...this.networkOverrides,
      };
    }

    if (manifestIsV0_2_0(impl)) {
      const network = {
        ...impl.network,
        ...this.networkOverrides,
      };

      if (!network.endpoint) {
        throw new Error(
          `Network endpoint must be provided for network. genesisHash="${network.genesisHash}"`,
        );
      }

      return network;
    }

    throw new Error(
      `unsupported specVersion: ${this._projectManifest.specVersion}`,
    );
  }

  get dataSources(): SubqlDatasource[] {
    return this._projectManifest.dataSources;
  }

  get schema(): Promise<string> {
    return this.reader.getFile(this._projectManifest.schema) as Promise<string>;
  }

  get root(): string | undefined {
    return this.reader.root;
  }

  get chainTypes(): Promise<RegisteredTypes | undefined> {
    const impl = this._projectManifest.asImpl;
    if (manifestIsV0_0_1(impl)) {
      return Promise.resolve(
        pick<RegisteredTypes>(impl.network, [
          'types',
          'typesAlias',
          'typesBundle',
          'typesChain',
          'typesSpec',
        ]),
      );
    }

    if (manifestIsV0_2_0(impl)) {
      if (!impl.network.chaintypes) {
        return;
      }

      return this.reader
        .getFile(impl.network.chaintypes.file)
        .then((res) => yaml.load(res))
        .then(parseChainTypes);
    }
  }

  async getDataSourceEntry(ds: SubqlRuntimeDatasource): Promise<string> {
    // TODO cache results, entry is used as an id for sandbox
    if (isRuntimeDataSourceV0_2_0(ds)) {
      return ds.mapping.file;
    } else {
      const pkg = await this.reader.getPkg();

      if (!pkg.main) {
        return './dist';
      }
      return pkg.main.startsWith('./') ? pkg.main : `./${pkg.main}`;
    }
  }

  async loadDataSourceEntry(entry: string): Promise<string> {
    // XXX these all get parsed by yaml parser
    return this.reader.getFile(entry) as Promise<string>;
  }
}
