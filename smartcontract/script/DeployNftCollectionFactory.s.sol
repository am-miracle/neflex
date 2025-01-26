// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {NFTCollectionFactory} from "../src/NFTCollectionFactory.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

/**
 * @title DeployNftCollectionFactory
 * @notice Script to deploy the NFTCollectionFactory contract.
 */
contract DeployNftCollectionFactory is Script {
    function run() external returns (NFTCollectionFactory) {
        HelperConfig helperConfig = new HelperConfig();
        (
            uint256 deployerKey,
            ,
            string memory nftName,
            string memory nftSymbol,
            string memory nftBaseUri,
            uint256 maxSupply,
        ) = helperConfig.activeNetworkConfig();

        require(deployerKey != 0, "Deployer key not set");

        vm.startBroadcast(deployerKey);

        // Deploy factory with correct ownership flow
        NFTCollectionFactory factory = new NFTCollectionFactory(nftName, nftSymbol, nftBaseUri, maxSupply);
        // Transfer factory ownership to deployer after setup
        factory.transferOwnership(msg.sender);

        vm.stopBroadcast();

        return factory;
    }
}
