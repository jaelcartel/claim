import { GetServerSideProps } from "next";
import { DiscordUser } from "../utils/types";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useToast } from '../hooks/useToast';
import { ClaimRes } from '../interfaces'
import  Header from '../components/Header'
import Footer from '../components/Footer'
import Claim from '../components/Claim'
import Head from 'next/head';


export default function Index(props: Props) {
  const [canClaim, setCanClaim] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [claimStatus, setClaimStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [addr, setAddr] = useState('')
  const [addrSubmit, setAddrSubmit] = useState(false)
  const toast = useToast(3000);

  const txSubmittedCallback = txid => {
    console.log("txSubmittedCallback")
    setClaimed(true)
    setCanClaim(false)
  }

  const checkClaimStatus = async () => {
    const claimRes: ClaimRes = await fetch('/api/checkclaim/'+addr).then(res => {
      return res.json()
    }).then(json => json)

    setClaimStatus(claimRes.error)
    setClaimed(claimRes.claim.claimed)
    if(claimRes.claim.whitelisted === true) {
      if(claimRes.claim.claimed === false) {
        toast('success', claimRes.error)
        setCanClaim(true)
        setClaimed(false)
      } else if(claimRes.claim.claimed === true) {
        toast('error', claimRes.error)
        setCanClaim(false)
        setClaimed(true)
      }
    } 
  }

  const checkClaim = async (event) => {
    event.persist();
    setAddrSubmit(prev => !prev)
    setLoading(true)    
    const claimRes: ClaimRes = await fetch('/api/toclaim/'+addr).then(res => {
      return res.json()
    }).then(json => json)
    if(claimRes.claim.whitelisted === true) {
      if(claimRes.claim.claimed === false) {
        toast('success', 'You have unclaimed tokens!')
        setCanClaim(true)
        setClaimed(false)
      } else if(claimRes.claim.claimed === true) {
        toast('error', 'You already claimed your tokens!')
        setCanClaim(false)
        setClaimed(true)
      }
    } else {
      toast('error', 'This address may not claim.')
      setCanClaim(false)
      setClaimed(false)
      setAddrSubmit(false)
    }
    setLoading(false)
  }

  const WalletConnect = dynamic(() => import(`../components/WalletConnect`), {
    ssr: false,
  });
  useEffect(() => {
    //checkClaim()

    return () => {
      setCanClaim(false)
      setLoading(false)
    }
  }, [])


  const handleAddr = event => {
    event.persist();
  
    let value = event.target.value;
    setAddr(value)
  };

  const handleAddrSubmit = event => {
    event.persist();
    setAddrSubmit(prev => !prev)
  };

  return (
    <>
        <div className="flex flex-col h-screen justify-between layout font-primary">
          <Head>
            <title>Faucet for Cardano Native Assets</title>
            <meta
              name="description"
              content="Faucet for Cardano native assets - by ADAO"
            />
            <link rel="icon" href="/ADAO - Full Logo - Blue Gradient.svg" />
          </Head>
          <Header />
          <main className="flex-grow justify-center items-center p-10">
          {!addrSubmit && 
            <div className="flex justify-center items-center">
            <div className="bg-white p-4 w-96 rounded-md">
              <h1 className="text-lg font-bold text-gray-500">Eligible Address</h1>
              <div className="mt-5 mb-2 border-2 py-1 px-3 flex justify-between rounde-md rounded-md">
                <input 
                    id='addrInput' 
                    name='addr' 
                    onChange={handleAddr} 
                    className="flex-grow outline-none text-gray-600 focus:text-blue-600" 
                    type="text" 
                    placeholder="Check address..." 
                />
                <spa onClick={checkClaim}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 hover:text-blue-400 transition duration-100 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </spa>
              </div>
            </div>
          </div>
        }
        {(canClaim && addr) &&
        <>
          <Claim />
          <WalletConnect successCallback={txSubmittedCallback}/>
        </>
        }
       

        {claimed ? <button onClick={checkClaimStatus}>Check the status of a previously submitted claim for {addr}</button> : <></>}
        </main>
        <Footer />
      </div>
   
 
    </>
  );
}

// export const getServerSideProps: GetServerSideProps<Props> = async function (ctx) {
  
//   // const { parseUser } = await import( "../utils/parse-user")
  
//   // const user = parseUser(ctx);

//   // if (!user) {
//   //   return {
//   //     redirect: {
//   //       destination: "/api/oauth",
//   //       permanent: false,
//   //     },
//   //   };
//   // }

//   // return { };
// };
