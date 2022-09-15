export interface Utxo {
    tx_hash:      string;
    tx_index:     number;
    output_index: number;
    amount:       Amount[];
    block:        string;
    data_hash:    null;
}

export interface Amount {
    unit:     string;
    quantity: string;
}

export interface UtxoRecord {
    id:     number
    used:   Date
    usedById: string //addr
    txHash: string
    hash: string
    // used: boolean;
}

export interface WhitelistedUser {
    id:     string; //addr
    claimed: boolean;
}

export interface IClaim {
    addr: string,
    whitelisted: boolean,
    claimed: boolean,
}

export interface ClaimRes {
    claim: IClaim,
    error: string
}