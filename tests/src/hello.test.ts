import { expect } from "chai";
import { SecretNetworkClient, Wallet } from "secretjs";
import {
  ensureChainIsReady,
  getGenesisWallets,
  getLocalSecretConnection,
  requestFaucetForAddress,
  storeAndInitContract,
} from "./utils/localsecret";

describe("Basic tests", () => {
  let client: SecretNetworkClient;

  before(async () => {
    client = getLocalSecretConnection();
    await ensureChainIsReady(client);
  });

  it("Can get current block height", async () => {
    const block = await client.query.tendermint.getLatestBlock({});
    expect(block.block_id.hash).to.not.be.null;
  });

  it("Has correct account balance", async () => {
    const [a, b, c, d] = getGenesisWallets();
    let balance = await client.query.bank.balance({
      address: a.address,
      denom: "uscrt",
    });
    expect(parseInt(balance.balance.amount)).to.be.gte(99 * 1e6);
  });
  it("Correctly instantiates a contract", async () => {
    let [a] = getGenesisWallets();
    let signingClient = getLocalSecretConnection(a);
    let address = await storeAndInitContract(
      signingClient,
      "./contract.wasm",
      {},
      "New Contract " + Date.now()
    );
    console.log(address);
    expect(address).to.be.not.eq("");
  });

  it("Can request faucet", async () => {
    let randomWallet = new Wallet();
    let address = randomWallet.address;
    await requestFaucetForAddress(address);
    let balance = await client.query.bank.balance({
      address: address,
      denom: "uscrt",
    });
    expect(parseInt(balance.balance.amount)).to.be.gte(1000 * 1e6);
  });
});
