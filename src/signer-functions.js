import { ethers } from 'ethers';

import { getSigner } from './wallet';

export const executeFunction = async ({ id, method, params }) => {
    const signer = getSigner();

    let response;

    switch (method) {
        case 'personal_sign':
            const requestParamsMessage = params[0];
            const message = ethers.toUtf8String(requestParamsMessage);
            response = await signer.signMessage(message);

            break;

        default:
            throw new Error(`Method ${method} not supported`);
    }

    console.log(`Method: ${method}, Response: ${response}`);
    return { id, result: response, jsonrpc: '2.0' }
}
