// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";

/**
 * @title HelperConfig
 * @notice This contract contains network-specific configurations for deploying contracts.
 */
contract HelperConfig is Script {
    struct NetworkConfig {
        uint256 deployerKey;
        uint256 marketplaceFee; // in basis points (e.g., 250 = 2.5%)
        string nftName;
        string nftSymbol;
        string nftBaseUri;
        uint256 maxSupply;
        uint96 defaultRoyaltyFee; // in basis points
    }

    uint256 public immutable DEFAULT_ANVIL_DEPLOYER_KEY =
        0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    uint256 public immutable DEFAULT_MARKETPLACE_FEE = 250; // 2.5%
    uint256 public immutable DEFAULT_MAX_SUPPLY = 10000;
    uint96 public immutable DEFAULT_ROYALTY_FEE = 1000; // 10%

    NetworkConfig public activeNetworkConfig;

    constructor() {
        if (block.chainid == 11155111) {
            activeNetworkConfig = getSepoliaEthConfig();
        } else if (block.chainid == 1) {
            activeNetworkConfig = getMainnetEthConfig();
        } else {
            activeNetworkConfig = getOrCreateAnvilEthConfig();
        }
    }

    /**
     * @notice Returns the configuration for the Sepolia network.
     */
    function getSepoliaEthConfig() public view returns (NetworkConfig memory) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        require(deployerKey != 0, "PRIVATE_KEY not set for Sepolia");

        return NetworkConfig({
            deployerKey: deployerKey,
            marketplaceFee: DEFAULT_MARKETPLACE_FEE,
            nftName: "Neflex",
            nftSymbol: "NFLX",
            nftBaseUri: "https://ipfs.io/ipfs/Qme3CH3LTP1NBwxesnKMqNxEorMBNDQzYvgjrHKoUdmiDG/",
            maxSupply: DEFAULT_MAX_SUPPLY,
            defaultRoyaltyFee: DEFAULT_ROYALTY_FEE
        });
    }

    /**
     * @notice Returns the configuration for the Mainnet network.
     */
    function getMainnetEthConfig() public view returns (NetworkConfig memory) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        require(deployerKey != 0, "PRIVATE_KEY not set for Mainnet");

        return NetworkConfig({
            deployerKey: deployerKey,
            marketplaceFee: DEFAULT_MARKETPLACE_FEE,
            nftName: "Neflex",
            nftSymbol: "NFLX",
            nftBaseUri: "https://ipfs.io/ipfs/Qme3CH3LTP1NBwxesnKMqNxEorMBNDQzYvgjrHKoUdmiDG/",
            maxSupply: DEFAULT_MAX_SUPPLY,
            defaultRoyaltyFee: DEFAULT_ROYALTY_FEE
        });
    }

    /**
     * @notice Returns the configuration for the Anvil network or creates one if it doesn't exist.
     */
    function getOrCreateAnvilEthConfig() public view returns (NetworkConfig memory) {
        if (activeNetworkConfig.deployerKey != 0) {
            return activeNetworkConfig;
        }

        return NetworkConfig({
            deployerKey: DEFAULT_ANVIL_DEPLOYER_KEY,
            marketplaceFee: DEFAULT_MARKETPLACE_FEE,
            nftName: "Neflex",
            nftSymbol: "NFLX",
            nftBaseUri: "https://ipfs.io/ipfs/Qme3CH3LTP1NBwxesnKMqNxEorMBNDQzYvgjrHKoUdmiDG/",
            maxSupply: DEFAULT_MAX_SUPPLY,
            defaultRoyaltyFee: DEFAULT_ROYALTY_FEE
        });
    }
}
