require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true // ✅ Enables intermediate representation (fixes stack-too-deep errors)
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  }
};
