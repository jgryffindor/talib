import { Base, Network as ManyNetwork } from "@liftedinit/many-js";
import { Injectable } from "@nestjs/common";
import { Blockchain } from "../utils/network/blockchain";
import { Events } from "../utils/network/events";
import { Ledger } from "../utils/network/ledger";

type N = ManyNetwork & {
  base: Base;
  blockchain: Blockchain;
  events: Events;
  ledger: Ledger;
};

@Injectable()
export class NetworkService {
  private cache = new Map<string, N>();

  async forUrl(url: string): Promise<N> {
    const maybeNetwork = this.cache.get(url);
    if (maybeNetwork) {
      return maybeNetwork;
    }

    const network = new ManyNetwork(url);
    network.apply([Base, Blockchain, Events, Ledger]);
    this.cache.set(url, network as N);
    return network as N;
  }
}
