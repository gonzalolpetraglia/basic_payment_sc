import chai from "chai";
import { waffle, ethers, getNamedAccounts } from "hardhat";
import { fixtureDeployedBasicPayments } from "./common-fixtures";
import { ContractTransaction } from "ethers";
import { BasicPayments } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

const { loadFixture } = waffle;

const { expect } = chai;

describe(`BasicPayments - Send payments from contract`, function () {
  const amountReceived = ethers.utils.parseEther(3);
  const amountToBeSent = ethers.utils.parseEther(3);
  let basicPayments: BasicPayments;
  beforeEach(async function () {
    ({ basicPayments } = await loadFixture(fixtureDeployedBasicPayments));
    console.log('b');

  });
  it(`should make a succesful payment when it has funds`, function () {
    // contrato va a tener 0 ethers
    const { sender: senderAddress, receiver: receiverAddress } = await getNamedAccounts();
    const paymentTx = await basicPayments.connect(sender).deposit({ value: amountToBeSent.mul(2) });
    const sender = await ethers.getSigner(senderAddress);
    const receiver = await ethers.getSigner(receiverAddress);
    const paymentTx = await basicPayments.connect(sender).sendPayment(receiverAddress, amountToBeSent);
    await expect(paymentTx).to.changeEtherBalance(basicPayments, amountToBeSent.mul(-1));
    await expect(paymentTx).to.changeEtherBalance(sender, 0);
    await expect(paymentTx).to.changeEtherBalance(receiver, amountToBeSent);
    console.log('c');
    return expect(paymentTx).to.emit(basicPayments, "PaymentMade").withArgs(receiver.address, amountToBeSent);
    // contrato con amountToBeSent ethers
  });
  it(`should fail if the contract does not have enough funds`, function () {
    // contrato va a tener 0 ethers
    const { sender: senderAddress, receiver: receiverAddress } = await getNamedAccounts();
    const paymentTx = await basicPayments.connect(sender).deposit({ value: 1 }); // less funds than needed
    const sender = await ethers.getSigner(senderAddress);
    const receiver = await ethers.getSigner(receiverAddress);
    const paymentTx = basicPayments.connect(sender).sendPayment(receiverAddress, amountToBeSent);
    console.log('d');
    return expect(paymentTx).to.be.revertedWith("sarasa");
  });




});
