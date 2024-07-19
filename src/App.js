import React, { useState, useEffect } from 'react';
import { Web3Wallet } from '@walletconnect/web3wallet';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
import { Core } from '@walletconnect/core';

import { getWalletAddress } from './wallet';
import { executeFunction } from './signer-functions';

function App() {
  const [projectId] = useState('f911abe9ec3f8d92755049023968eafc');
  const [web3wallet, setWeb3wallet] = useState(null);
  const [supportedChains] = useState(['eip155:1', 'eip155:137']);
  const [supportedMethods] = useState(['personal_sign', 'eth_sendTransaction', 'eth_signTypedData']);
  const [supportedEvents] = useState(['accountsChanged', 'chainChanged']);
  const [proposer, setProposer] = useState(null);
  const [sessionDetails, setSessionDetails] = useState('');
  const [sessionRequest, setSessionRequest] = useState(null);
  const [signature, setSignature] = useState('');

  useEffect(() => {
    async function init() {
      const core = new Core({
        projectId,
      });
    
      const web3wallet = await Web3Wallet.init({
        core,
        metadata: {
          name: 'React Wallet Example',
          description: 'React Wallet for WalletConnect',
          url: 'https://walletconnect.com/',
          icons: ['https://avatars.githubusercontent.com/u/37784886'],
        },
      });

      setWeb3wallet(web3wallet);

      web3wallet.on('session_proposal', async ({ id, params }) => {
        console.log('Session Proposal: ', { id, params });

        setProposer(params.proposer.metadata);

        try {
          const approvedNamespaces = buildApprovedNamespaces({
            proposal: params,
            supportedNamespaces: {
              eip155: {
                chains: supportedChains,
                methods: supportedMethods,
                events: supportedEvents,
                accounts: [
                  `eip155:1:${getWalletAddress()}`,
                  `eip155:137:${getWalletAddress()}`
                ]
              }
            }
          });

          const session = await web3wallet.approveSession({ id, namespaces: approvedNamespaces });

          setSessionDetails(JSON.stringify(session))
        } catch(error) {
          console.error('Failed to approve session: ', error);
          await web3wallet.rejectSession({ id, reason: getSdkError('USER_REJECTED') });
        }
      });

      web3wallet.on('session_request', async ({ topic, params, id }) => {
        console.log('Session Request: ', { topic, params, id });

        setSessionRequest(params);

        const { request } = params

        const response = await executeFunction({ id, method: request.method, params: request.params });

        setSignature(response.result);

        await web3wallet.respondSessionRequest({ topic, response });
      });
    }

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const url = e.target.uri.value;

    await web3wallet.core.pairing.pair({ uri: url });
  }

  return (
    <>{!web3wallet ? <div>Loading...</div> :
      <form onSubmit={(e) => handleSubmit(e)} style={formStyle}>
        <input name='uri' id='uri' type='text' placeholder='Enter WalletConnect URI' style={inputStyle} />
        <button style={buttonStyle} type='submit'>Start Session</button>
      </form>}

      <br />

      {proposer ? <><div style={formStyle}>
        <h2><strong> Current Session </strong></h2>
        <p> <strong> dApp Name: </strong> {proposer.name} <img alt="" src={proposer.icons[0]} height='20px' width='20px' /> </p>
      </div>

      <div style={formStyle}>
        <h2><strong>Session Details</strong></h2>
        <textarea name="response" rows={5} cols={50} readOnly value={sessionDetails} placeholder='session details'></textarea>
      </div></> : null}

      <br />

      {sessionRequest ?
        <>
          <div style={formStyle}>
            <h2><strong>Session Request</strong></h2>
            <p> <strong> Request Method: </strong> {sessionRequest.request.method} </p>
            <p> <strong> Request Params: </strong> {JSON.stringify(sessionRequest.request.params)} </p>
          </div>
        </> : null}

        {signature ?
        <>
          <div style={formStyle}>
            <h2><strong>Signature</strong></h2>
            <p> {signature} </p>
          </div>
        </> : null}
    </>
  );
}

const formStyle = {
  margin: '15px',
};

const buttonStyle = {
  fontFamily: 'Poppins, sans-serif',
  border: 'none',
  borderRadius: '20px',
  backgroundColor: 'black',
  color: 'white',
  padding: '10px 20px',
  fontSize: '16px',
  cursor: 'pointer',
  margin: '5px'
};

const inputStyle = {
  height: '30px',
  width: '1200px',
  fontSize: '16px',
};

export default App;
