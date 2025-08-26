import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("AnimalVotingModule", (m) => {
  const animalVoting = m.contract("AnimalVoting");

  return { animalVoting };
});