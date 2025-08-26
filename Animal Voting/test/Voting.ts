import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("AnimalVoting", async function () {
  const { viem } = await network.connect();

  it("Should deploy correctly", async function () {
    const contract = await viem.deployContract("AnimalVoting");
    const [deployer] = await viem.getWalletClients();
    const owner = await contract.read.owner();
    assert.equal(owner.toLowerCase(), deployer.account.address.toLowerCase());
  });

  it("Should start voting", async function () {
    const contract = await viem.deployContract("AnimalVoting");
    await contract.write.startVoting();
    
    const active = await contract.read.votingActive();
    assert.equal(active, true);
  });

  it("Should allow voting", async function () {
    const contract = await viem.deployContract("AnimalVoting");
    const [, voter] = await viem.getWalletClients();
    
    await contract.write.startVoting();
    await contract.write.vote([0n], { account: voter.account });
    
    const tigerVotes = await contract.read.votes([0n]);
    assert.equal(tigerVotes, 1n);
  });

  it("Should prevent double voting in same round", async function () {
    const contract = await viem.deployContract("AnimalVoting");
    const [, voter] = await viem.getWalletClients();
    
    await contract.write.startVoting();
    await contract.write.vote([0n], { account: voter.account });
    
    await assert.rejects(
      contract.write.vote([1n], { account: voter.account }),
      /Already voted this round/
    );
  });

  it("Should determine winner", async function () {
    const contract = await viem.deployContract("AnimalVoting");
    const wallets = await viem.getWalletClients();
    
    await contract.write.startVoting();
    
    // Vote for Zebra (1) twice, Tiger (0) once
    await contract.write.vote([1n], { account: wallets[1].account });
    await contract.write.vote([1n], { account: wallets[2].account });
    await contract.write.vote([0n], { account: wallets[3].account });
    
    const [winner, votes] = await contract.read.getWinner();
    assert.equal(winner, 1n); // Zebra
    assert.equal(votes, 2n);
  });

  it("Should end voting", async function () {
    const contract = await viem.deployContract("AnimalVoting");
    
    await contract.write.startVoting();
    await contract.write.endVoting();
    
    const active = await contract.read.votingActive();
    assert.equal(active, false);
  });

  // KEY TEST: The bug fix - users can vote in multiple rounds
  it("Should allow voting again after reset", async function () {
    const contract = await viem.deployContract("AnimalVoting");
    const [, voter] = await viem.getWalletClients();
    
    // Round 1: Vote for Tiger
    await contract.write.startVoting();
    await contract.write.vote([0n], { account: voter.account });
    await contract.write.endVoting();
    
    // Reset voting (starts new round)
    await contract.write.resetVoting();
    
    // Round 2: Same user should be able to vote again
    await contract.write.startVoting();
    await contract.write.vote([1n], { account: voter.account }); // Vote for Zebra
    
    const zebraVotes = await contract.read.votes([1n]);
    assert.equal(zebraVotes, 1n);
  });

  it("Should clear votes after reset", async function () {
    const contract = await viem.deployContract("AnimalVoting");
    const [, voter] = await viem.getWalletClients();
    
    // Round 1: Vote and check
    await contract.write.startVoting();
    await contract.write.vote([0n], { account: voter.account });
    await contract.write.endVoting();
    
    let tigerVotes = await contract.read.votes([0n]);
    assert.equal(tigerVotes, 1n);
    
    // Reset and check votes are cleared
    await contract.write.resetVoting();
    
    tigerVotes = await contract.read.votes([0n]);
    assert.equal(tigerVotes, 0n);
  });

  it("Should not allow voting when inactive", async function () {
    const contract = await viem.deployContract("AnimalVoting");
    const [, voter] = await viem.getWalletClients();
    
    await assert.rejects(
      contract.write.vote([0n], { account: voter.account }),
      /Voting not active/
    );
  });
});