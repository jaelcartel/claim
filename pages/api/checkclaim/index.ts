import { verify } from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ClaimRes, UtxoRecord } from '../../../interfaces';
import { getUsersClaim } from '../../../utils/db';
import bf from '../../../utils/blockfrost'

export default async function (req: NextApiRequest, res: NextApiResponse) {
    let claimRes: ClaimRes
    let record: UtxoRecord

    try {
        record = await getUsersClaim(req.body)
        console.log(req.body)  
        if(record === null) {
            claimRes = { claim: {claimed: false, whitelisted: false}, error: "No claiming history. Contact us for support." }
            return res.status(200).json(claimRes);
        }
        var dt = new Date()
        dt.setHours( dt.getHours() - 5);
        if(dt.getTime() > new Date(record.used).getTime()) {
            
            let tx = await bf({
                endpoint: `/txs/${record.txHash}`,
                method: 'GET'
            })
            if(tx && tx.hash) {
                claimRes = { claim: {claimed: true, whitelisted: true}, error: `Your claiming transaction ${record.txHash} was already included in the blockchain.` }
                return res.status(200).json(claimRes);
            }
            else{
                claimRes = { claim: {claimed: true, whitelisted: true}, error: `It seems like tx didn't go through. Please reach out to us on our discord.` }
                return res.status(200).json(claimRes);
            }
        } 
        else {
            claimRes = { claim: {claimed: true, whitelisted: true}, error: `Because of the congestion, wait at least 5 hours after you submit to try again.` }
            return res.status(200).json(claimRes);
        }
       
    } catch(err) {
        claimRes = { claim: {claimed: false, whitelisted: false}, error: err }
        return res.status(200).json(claimRes);
    }
}
