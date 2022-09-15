import { verify} from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ClaimRes, IClaim } from '../../../interfaces';
import { userWhitelistedAndClaimed } from '../../../utils/db';

export default async function (req: NextApiRequest, res: NextApiResponse) {
    let claimRes: ClaimRes
    console.log(req.body)
    // return res.status(200).json(req.body)

    let claim: IClaim =  {claimed: false, whitelisted: false, addr: req.body.addr}
    // console.log(claim)
    try {
        claim = await userWhitelistedAndClaimed(req.body.addr)
    } catch(err) {
        claimRes = { claim: claim, error: err }
        return res.status(200).json(claimRes);
    }
    return res.status(200).json({ claim: claim, error: ''});
}
