import {
  ec,
  stark,
  hash,
  Account,
  Provider,
  Signer,
  number,
  Contract,
} from "starknet";
import ABI from "./erc20.json";
const accountClassHash =
  "0x033434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2";
const argentProxyClassHash =
  "0x25ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918";
const OZContractClassHash =
  "0x058d97f7d76e78f44905cc30cb65b91ea49a4b908a76703c54197bca90f81773";

const privateKey =
  "0xdb0ec29e22b7383271b72476ff9d1223b34fcdff33bb156e4124e97ff1208b7b";

function App() {
  const init = () => {
    const starkKeyPair = ec.genKeyPair();
    console.log({ starkKeyPair });
    const starkKeyPublic = ec.getStarkKey(starkKeyPair);
  };

  const createNewAccount = async () => {
    const provider = new Provider({
      sequencer: {
        baseUrl: "https://alpha4.starknet.io",
        feederGatewayUrl: "feeder_gateway",
        gatewayUrl: "gateway",
      },
    });

    const privateKey =
      "0xdb0ec29e22b7383271b72476ff9d1223b34fcdff33bb156e4124e97ff1208b7b"; // get from step 1
    const starkKeyPair = ec.getKeyPair(privateKey);
    const starkKeyPub = ec.getStarkKey(starkKeyPair);

    const precalculatedAddress = hash.calculateContractAddressFromHash(
      starkKeyPub, // salt
      OZContractClassHash,
      [starkKeyPub],
      0
    );

    const account = new Account(provider, precalculatedAddress, starkKeyPair);
    console.log({ account });
    account
      .deployAccount({
        classHash: OZContractClassHash,
        constructorCalldata: [starkKeyPub],
        contractAddress: precalculatedAddress,
        addressSalt: starkKeyPub,
      })
      .then((res) => console.log({ res }));

    // await provider.waitForTransaction(accountResponse.transaction_hash);
    // console.log(accountResponse);
  };

  const sendErc20Token = async () => {
    const starkKeyPair = ec.getKeyPair(
      "0xdb0ec29e22b7383271b72476ff9d1223b34fcdff33bb156e4124e97ff1208b7b"
    );
    const starkKeyPub = ec.getStarkKey(starkKeyPair);
    const provider = new Provider({
      sequencer: {
        baseUrl: "https://alpha4.starknet.io",
        feederGatewayUrl: "feeder_gateway",
        gatewayUrl: "gateway",
      },
    });
    const precalculatedAddress = hash.calculateContractAddressFromHash(
      starkKeyPub, // salt
      argentProxyClassHash, // OZContractClassHash,
      [starkKeyPub],
      0
    );

    const account = new Account(provider, precalculatedAddress, starkKeyPair);
    console.log({ account });
  };

  const SignTxn = async () => {
    const { toBN, toHex } = number;
    const starkKeyPair = ec.getKeyPair(
      "0xdb0ec29e22b7383271b72476ff9d1223b34fcdff33bb156e4124e97ff1208b7b"
    );
    const starkKeyPub = ec.getStarkKey(starkKeyPair);
    const signer = new Signer(starkKeyPair);

    let transactionDetail = {
      nonce: 0,
      walletAddress: number
        .toBN(
          "0x0690Abd257299C1c21E877406dB275Cb5430353B916C3B7cdC57B7Ef57Ef143c"
        )
        .toString(),
      chainId: "0x534e5f474f45524c49", //StarknetChainId.TESTNET -- v1 testnet,
    };

    let transation = {
      contractAddress:
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      entrypoint: "transfer",
      calldata: stark.compileCalldata({
        recipient:
          "0x4df152798516adc073999cbd71a3dff9875ae8e29b19243026efd429c8e0fd1",
        amount: "0x5af3107a4000",
      }),
    };

    const signature = await signer.signTransaction(
      [transation],
      transactionDetail
    );

    const provider = new Provider({
      sequencer: {
        baseUrl: "https://cors.codecrane.com/https://alpha4.starknet.io",
        feederGatewayUrl: "feeder_gateway",
        gatewayUrl: "gateway",
      },
    });

    let sign0 = toHex(toBN(signature[0]));
    let sign1 = toHex(toBN(signature[1]));

    console.log({ sign0, sign1 });
    let value = await provider.callContract({
      contractAddress:
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      entrypoint: "transfer",
      calldata: stark.compileCalldata({
        recipient:
          "0x4df152798516adc073999cbd71a3dff9875ae8e29b19243026efd429c8e0fd1",
        amount: "0x5af3107a4000",
        signature: signature,
      }),
    });

    console.log({ value });
  };

  const signMulticallTxn = () => {
    const starkKeyPair = ec.getKeyPair(privateKey);
    const accountAddress =
      "0x0690Abd257299C1c21E877406dB275Cb5430353B916C3B7cdC57B7Ef57Ef143c";
    const account = new Account(
      Provider,
      accountAddress.toLowerCase(),
      starkKeyPair
    );

    const ethContract = new Contract(
      ABI,
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
    );

    account.getNonce().then((nonce) => {
      account
        .execute(
          [
            {
              contractAddress: ethContract.address,
              entrypoint: "approve",
              calldata: [
                "0x05806908591457559439330610fC022aB0212C67548e55C8d51e9E5edF2b7Dc5",
                "10",
                "0",
              ],
            },
          ],
          undefined,
          { maxFee: "60240850062409", nonce: nonce }
        )
        .then((data) => console.log(data));
    });
  };

  return (
    <div className="App">
      <input value="sample" />
      <button>send</button>
      <button onClick={createNewAccount}>Create New Account</button>
      <button onClick={SignTxn}>Send Erc20</button>
      <button onClick={signMulticallTxn}>Multicall</button>
    </div>
  );
}

export default App;
