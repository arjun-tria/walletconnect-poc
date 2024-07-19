# WalletConnect PoC

### How to run

1. Clone the repository and create a `.env` file with the variable `REACT_APP_MNEMONIC=your mnemonic phrase`.
2. Run `npm install` and `npm start` to start the project.
3. Visit `http://localhost:3000` in your browser.
4. Go to `https://opensea.io`, click on Login and choose WalletConnect.
5. Copy the WalletConnect URI and paste it in the input field.
6. Your session will be created and logged, the message will be signed and sent to Opensea and you can see your wallet address connected in the top right corner in Opensea.