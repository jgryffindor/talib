import { Message, NetworkModule,  } from "@liftedinit/many-js";

export interface Symbol {
  name: string; 
  symbol: string; 
  decimals: number;
}

export interface Token {
  address: ArrayBuffer;
  symbolInfo: Symbol;
}

export interface LedgerInfo {
  symbols: Token[];
}

export interface Balances {
  balances: Map<string, bigint>;
}

export interface Ledger extends NetworkModule {
  info(): Promise<LedgerInfo>;
  balance: (address?: string, symbols?: string[]) => Promise<Balances>;
}

export const Ledger: Ledger = {
  _namespace_: "ledger",

  async info() {
    const param = new Map();
    const msg = await this.call("ledger.info", param)

    return parseLedgerInfo(msg)
  },
  async balance(address?: string, symbols?: string[]): Promise<Balances> {
    const m = new Map<number, unknown>([[1, symbols ?? []]])
    address && m.set(0, address)
    const res = await this.call("ledger.balance", m)
    return parseBalance(res)
  },
}

function parseLedgerInfo(msg: Message): LedgerInfo {
  const result: LedgerInfo = { symbols: new Array() }
  const decodedContent = msg.getPayload()
  if (decodedContent) {
    if (decodedContent.has(5)) {
      const symbols = decodedContent.get(5)

      for (const symbol of symbols) {
        const address = symbol[0].toString();
        const symbolInfo = symbol[1];
        
        result.symbols.push({ address, symbolInfo: symbolInfo });
      }
    }
  }
  return result
}

export function parseSymbol(symbol: Symbol) {
  return {
    name: symbol[0].toString(),
    symbol: symbol[1].toString(),
    decimals: symbol[2]
  }
}

export function parseBalance(message: Message): Balances {
  const result = { balances: new Map() }
  const messageContent = message.getPayload()
  if (messageContent && messageContent.has(0)) {
    const symbolsToBalancesMap = messageContent.get(0)
    if (!(symbolsToBalancesMap instanceof Map)) return result
    for (const balanceEntry of symbolsToBalancesMap) {
      const symbolAddress = balanceEntry[0].toString()
      const balance = balanceEntry[1]
      result.balances.set(symbolAddress, balance)
    }
  }
  return result
}
