// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiPromise, HttpProvider, WsProvider } from '@polkadot/api';
import { VersionedRegistry } from '@polkadot/api/base/types';
import { ApiOptions, RpcMethodResult } from '@polkadot/api/types';
import {
  BlockHash,
  RuntimeVersion,
  SignedBlock,
  Header,
  BlockNumber,
} from '@polkadot/types/interfaces';
import { AnyFunction, AnyNumber } from '@polkadot/types/types';
import { SubqueryProject } from '../configure/project.model';
import { getLogger } from '../utils/logger';
import { IndexerEvent, NetworkMetadataPayload } from './events';
import { ApiAt } from './types';

const NOT_SUPPORT = (name: string) => () => {
  throw new Error(`${name}() is not supported`);
};

const logger = getLogger('api');

@Injectable()
export class ApiService implements OnApplicationShutdown {
  private api: ApiPromise;
  private currentBlockHash: string;
  private currentRuntimeVersion: RuntimeVersion;
  private apiOption: ApiOptions;
  networkMeta: NetworkMetadataPayload;

  isInitialized = false;

  constructor(
    protected project: SubqueryProject,
    private eventEmitter: EventEmitter2,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    await Promise.all([this.api?.disconnect()]);
  }

  async init(): Promise<ApiService> {
    const { chainTypes, network } = this.project;
    let provider: WsProvider | HttpProvider;
    let throwOnConnect = false;
    if (network.endpoint.startsWith('ws')) {
      provider = new WsProvider(network.endpoint);
    } else if (network.endpoint.startsWith('http')) {
      provider = new HttpProvider(network.endpoint);
      throwOnConnect = true;
    }

    this.apiOption = {
      provider,
      throwOnConnect,
      ...chainTypes,
    };
    this.api = await ApiPromise.create(this.apiOption);

    this.eventEmitter.emit(IndexerEvent.ApiConnected, { value: 1 });
    this.api.on('connected', () => {
      this.eventEmitter.emit(IndexerEvent.ApiConnected, { value: 1 });
    });
    this.api.on('disconnected', () => {
      this.eventEmitter.emit(IndexerEvent.ApiConnected, { value: 0 });
    });

    this.networkMeta = {
      chain: this.api.runtimeChain.toString(),
      specName: this.api.runtimeVersion.specName.toString(),
      genesisHash: this.api.genesisHash.toString(),
    };

    if (
      network.genesisHash &&
      network.genesisHash !== this.networkMeta.genesisHash
    ) {
      const err = new Error(
        `Network genesisHash doesn't match expected genesisHash. expected="${network.genesisHash}" actual="${this.networkMeta.genesisHash}`,
      );
      logger.error(err, err.message);
      throw err;
    }

    this.isInitialized = true;
    return this;
  }

  getApi(): ApiPromise {
    return this.api;
  }

  async getPatchedApi(
    blockHash: string | BlockHash,
    parentBlockHash?: string | BlockHash,
  ): Promise<ApiAt> {
    this.currentBlockHash = blockHash.toString();
    if (parentBlockHash) {
      this.currentRuntimeVersion = await this.api.rpc.state.getRuntimeVersion(
        parentBlockHash,
      );
    }
    const apiAt = (await this.api.at(
      blockHash,
      this.currentRuntimeVersion,
    )) as ApiAt;
    this.patchApiRpc(this.api, apiAt);
    return apiAt;
  }

  private redecorateRpcFunction<T extends 'promise' | 'rxjs'>(
    original: RpcMethodResult<T, AnyFunction>,
  ): RpcMethodResult<T, AnyFunction> {
    if (original.meta.params) {
      const hashIndex = original.meta.params.findIndex(
        ({ isHistoric, name }) => isHistoric,
      );
      if (hashIndex > -1) {
        const ret = ((...args: any[]) => {
          const argsClone = [...args];
          argsClone[hashIndex] = this.currentBlockHash;
          return original(...argsClone);
        }) as RpcMethodResult<T, AnyFunction>;
        ret.raw = NOT_SUPPORT('api.rpc.*.*.raw');
        ret.meta = original.meta;
        return ret;
      }
    }
    const ret = NOT_SUPPORT('api.rpc.*.*') as unknown as RpcMethodResult<
      T,
      AnyFunction
    >;
    ret.raw = NOT_SUPPORT('api.rpc.*.*.raw');
    ret.meta = original.meta;
    return ret;
  }

  private patchApiRpc(api: ApiPromise, apiAt: ApiAt): void {
    apiAt.rpc = Object.entries(api.rpc).reduce((acc, [module, rpcMethods]) => {
      acc[module] = Object.entries(rpcMethods).reduce(
        (accInner, [name, rpcPromiseResult]) => {
          accInner[name] = this.redecorateRpcFunction(rpcPromiseResult);
          return accInner;
        },
        {},
      );
      return acc;
    }, {} as ApiPromise['rpc']);
  }

  async getFinalizedHead(): Promise<BlockHash> {
    return this.api.rpc.chain.getFinalizedHead();
  }

  async getBlock(finalizedHead: BlockHash): Promise<SignedBlock> {
    return this.api.rpc.chain.getBlock(finalizedHead);
  }

  async getHeader(): Promise<Header> {
    return this.api.rpc.chain.getHeader();
  }

  async getBlockHash(blockNumber: BlockNumber | AnyNumber): Promise<BlockHash> {
    return this.api.rpc.chain.getBlockHash(blockNumber);
  }

  async getRuntimeVersion(
    at?: string | BlockHash | Uint8Array,
  ): Promise<RuntimeVersion> {
    return this.api.rpc.state.getRuntimeVersion(at);
  }

  async getBlockRegistry(
    blockHash: Uint8Array,
    knownVersion?: RuntimeVersion,
  ): Promise<VersionedRegistry<'promise'>> {
    return this.api.getBlockRegistry(blockHash, knownVersion);
  }

  get runtimeVersionSpecName(): string {
    return this.api.runtimeVersion.specName.toString();
  }

  get genesisHash(): string {
    return this.api.genesisHash.toString();
  }

  // @todo Very Polkadot specific
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async querySystemEventsRange([firstBlockHash, endBlockHash]) {
    return this.api.query.system.events.range([firstBlockHash, endBlockHash]);
  }
  // @todo Very Polkadot specific
  async querySystemLastRuntimeUpgradeRange([firstBlockHash, endBlockHash]) {
    return this.api.query.system.lastRuntimeUpgrade.range([
      firstBlockHash,
      endBlockHash,
    ]);
  }
  // @todo Very Polkadot specific
  async querySystemEventsAt(hash: BlockHash) {
    return this.api.query.system.events.at(hash);
  }
}
