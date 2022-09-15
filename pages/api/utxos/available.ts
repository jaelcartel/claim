import type { NextApiRequest, NextApiResponse } from 'next';
import { getInUseHashesArray } from '../../../utils/db';
import sample from 'lodash.sample';
import { assetsToJsonString } from '../../../utils/cardano';
import initializeLucid from '../../../utils/lucid';
import { UTxO } from 'lucid-cardano';

export default async function (req: NextApiRequest, res: NextApiResponse) {

    // const searchAddress =  process.env.WALLET_ADDRESS 
    const searchAddress =   'addr1x95p7aqla4n0qvu0zgumlq9lccaxg4gzjs9m3az8fwkzf9ngra6plmtx7qec7y3eh7qtl336v32s99qthr6ywjavyjtq8xyeca'
    const lib = await initializeLucid(null)
    const addrUtxos: UTxO[] = await lib.provider.getUtxos(searchAddress)
    // console.log(addrUtxos)
    if(!addrUtxos || addrUtxos.length < 1 || !addrUtxos[0].txHash) return res.status(200).json('ERROR: No utxos are currently available');
    
    const busyUtxoHashes: string[] = await getInUseHashesArray(addrUtxos.map(u => `${u.txHash}_${u.outputIndex}`))
    let availableUtxos
    if(!busyUtxoHashes || busyUtxoHashes.length < 1) {
        availableUtxos = addrUtxos
    } else {
        availableUtxos = addrUtxos.filter(utxo => !busyUtxoHashes.includes(`${utxo.txHash}_${utxo.outputIndex}`))
    }
    if(availableUtxos.length > 0){
        const rndUtxo: UTxO = sample(availableUtxos)
        let resUtxo = {}
        if(rndUtxo) resUtxo = [rndUtxo].map(utxo => {
            return {
                txHash: utxo.txHash,
                outputIndex: utxo.outputIndex,
                assets: assetsToJsonString(utxo.assets),
                address: utxo.address,
                datumHash: utxo.datumHash,
                datum: utxo.datum,
            }
        })[0]
        return res.status(200).json(resUtxo)
    } else {
        return res.status(200).json({error: "No utxos are currently available"})
    }
}
