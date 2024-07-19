import { ethers } from 'ethers';

export const getWalletAddress = () => {
    const wallet = ethers.HDNodeWallet.fromPhrase(process.env.REACT_APP_MNEMONIC);

    return wallet.address;
}

export const getSigner = () => {
    return ethers.HDNodeWallet.fromPhrase(process.env.REACT_APP_MNEMONIC);
}
