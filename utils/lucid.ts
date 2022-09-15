import { Blockfrost, WalletProvider, Lucid, Assets, C } from 'lucid-cardano'

const initializeLucid = async (walletName: string = null) => {
    // await Lucid.initialize(
    //     new Blockfrost('https://cardano-testnet.blockfrost.io/api/v0', 'testnetRvOtxC8BHnZXiBvdeM9b3mLbi8KQPwzA'),
    //     'Testnet'
    // )
    await Lucid.initialize(
        new Blockfrost('https://cardano-mainnet.blockfrost.io/api/v0', 'mainnet9VCCfn2rZ2R4Y8LNJ833QrXfCgrHHz9w'),
        'Mainnet'
    )

    if(walletName) await Lucid.selectWallet(walletName as WalletProvider)
    return Lucid
}

export default initializeLucid
