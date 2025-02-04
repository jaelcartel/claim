import React, { useState } from 'react'
import { Buffer } from 'buffer'
import WalletDropdown from './WalletDropdown'
import { useToast } from '../hooks/useToast';
import Checkbox from "../components/Checkbox";
import { C, Tx, UTxO } from 'lucid-cardano'
import initializeLucid from '../utils/lucid'
import { assetsFromJson } from '../utils/cardano'


export default function WalletConnect({successCallback} : {successCallback: (txid: any) => void}) {
    const [address, setAddress] = useState('')
    const [connected, setConnected] = useState(false)
    const [walletName, setWalletName] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(true)
    const toast = useToast(3000);

    const setAddressBech32 = async (wallet: string) => {
        if(wallet) {
            let lib = await initializeLucid(wallet)
            console.log(wallet)
            const addr = await lib.wallet.address()
            if(addr) {
                setAddress(addr)
            }
        }
    }

    const checkboxData = (checkHandler) => {
        setResult(checkHandler)
        console.log(result)
    }

    const makeTx = async () => {
        setLoading(true)

        const lib = await initializeLucid(walletName)
        const res = await fetch(`/api/utxos/available`).then(res => res.json())
        if(!res) return toast('error', 'Couldnt find available utxos to serve the tokens. Try again later.')
        else if(res?.error) return toast('error', res.error)

        const localAssetCheck = '648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff19877444f4745'
        const serverAddress = "addr_test1vpeer9pltfdzalkk4psyxvc59pwxy9njf0zsk095zkutu8gcwx60f"
        const serverUtxo: UTxO = [res].map(utxo => {
            return {
                txHash: utxo.txHash,
                outputIndex: utxo.outputIndex,
                assets: utxo.assets ? assetsFromJson(JSON.parse(utxo.assets)) : {},
                address: utxo.address,
                datumHash: utxo.datumHash,
                datum: utxo.datum,
            }
        })[0]

        let serverUtxoAssetCount: bigint = serverUtxo.assets[localAssetCheck] ? BigInt(serverUtxo.assets[localAssetCheck].toString()) : BigInt(0)

        const claimingAssetQt =  BigInt(5)

        const restAmount = (serverUtxoAssetCount - claimingAssetQt).toString()

        const userAddr = await lib.wallet.address();

        try {
            const tx = await Tx.new()
                .addSigner(userAddr)
                .addSigner(serverAddress)
                .collectFrom([serverUtxo])
                .payToAddress(serverAddress, { [localAssetCheck]: BigInt(restAmount), ['lovelace'] : BigInt(1500000)})
                .complete()
                
            let sTx = Buffer.from(tx.txComplete.to_bytes(), 'hex')
            let t = Buffer.from(C.Transaction.from_bytes(sTx).to_bytes()).toString('hex')
         
            const signature = await signTx(t)
            const submitRes = await submitReq(t, signature)
            console.log('submitRes')
            console.log(submitRes)
            
            if(submitRes.error) {
                throw submitRes.error
            }

            else if(submitRes.transactionId !== '') {
                successCallback(submitRes.transactionId)
                const resTxId = submitRes.transactionId
                toast('success', `Transaction ID ${resTxId}`)
            } 
            return submitRes
        } catch(err){
            console.log(err)
            toast('error', 
                typeof err === 'object' && err !== null ?
                    JSON.stringify(err) : err ?
                        err : "Couldn\'t submit right now, please try again later."
            )
        }
        setLoading(false)
    }

    const submitReq = async (txHex: string, signatureHex: string) => {
        const rawResponse = await fetch(`/api/submit`, {
            method: 'POST',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({txHex: txHex, signatureHex: signatureHex})
        });
        console.log(rawResponse)
        return await rawResponse.json()
    }

    const signTx = async (txCbor: string) => {
        const api = await window.cardano[walletName].enable();
        console.log("Signing the tx")
        let witness: any = await api.signTx(txCbor, true);
        console.log("Witness created")
        return witness;
    }

    const enableCardano = async (wallet = 'nami') => {
        const win:any = window

        if(!win.cardano) return
  
        let baseWalletApi, fullWalletApi
        switch(wallet){
          case 'nami':
            baseWalletApi = win.cardano.nami
            break
          case 'eternl':
            baseWalletApi = win.cardano.eternl
            break
          case 'flint':
            baseWalletApi = win.cardano.flint
            break
        default:
            break
        }
  
        switch(wallet){
          case 'nami':
            fullWalletApi = await baseWalletApi.enable()
            break
          case 'eternl':
            fullWalletApi = await baseWalletApi.enable()
            break
          case 'flint':
            fullWalletApi = await baseWalletApi.enable()
            break
          default:
            break
        }

        if(!await baseWalletApi.isEnabled()) return
        else {
            console.log(fullWalletApi)
            setWalletName(wallet)
            setConnected(true)
            setAddressBech32(wallet)
        }
    }

    return (
           <div style={{flexDirection: "column"}} className="flex items-center justify-center space-x-2">
            <div className="flex">   
                {connected ? 
                    loading ?
                    <>
                        <div className="flex items-center justify-center space-x-2">
                        <div className="spinner-grow inline-block w-10 h-10 bg-current rounded-full opacity-0 pb-2 text-purple-400" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        </div>
                    </>
                    : 
                    <div>
                        <button onClick={() => {result == true ? toast("error", "Accept the Terms of Service to Claim") : makeTx(); setResult(true)}}
                            className="m-2 p-10 text-white font-bold rounded-xl drop-shadow-lg transition-all duration-500 bg-gradient-to-r from-purple-700 via-purple-400 to-purple-500 hover:to-purple-600 bg-size-200 bg-pos-0 hover:bg-pos-100">
                        <h2>
                            Claim
                        </h2>
                        </button>
                        <Checkbox checkboxData={checkboxData}/>
                    </div>
                    
                :
                <></>
                }
            </div>
            <WalletDropdown enableWallet={enableCardano} address={address}/>
        </div>
    )
}
