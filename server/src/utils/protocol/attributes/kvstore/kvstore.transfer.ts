import { Address } from "@liftedinit/many-js";
import { parseAddress, parseBuffer } from "../../../cbor-parsers";
import { Analyzer } from "../../analyzer";

interface ArgumentT {
  key: string;
  owner: string;
  new_owner?: string;
}

type ResultT = null;

interface EventT {
  key: string;
  owner: string;
  new_owner?: string;
}

export class KvstoreTransferAnalyzer extends Analyzer<
  ArgumentT,
  ResultT,
  EventT
> {
  static method = "kvstore.transfer";
  static eventType = [13, 0];

  parseArgs(sender: Address, payload: Map<any, any>): ArgumentT {
    return {
      key: parseBuffer(payload.get(0)).toString("base64"),
      owner: (parseAddress(payload.get(1), true) || sender).toString(),
      new_owner: parseAddress(payload.get(2), true).toString(),
    };
  }

  analyzeResponse() {
    return null;
  }

  analyzeEvent(payload: Map<any, any>): EventT {
    return {
      key: payload.get(1).toString("base64"),
      owner: parseAddress(payload.get(2), true).toString(),
      new_owner: parseAddress(payload.get(3), true).toString(),
    };
  }
}
