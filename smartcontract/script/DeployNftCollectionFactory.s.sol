// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {NFTCollectionFactory} from "../src/NFTCollectionFactory.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract DeployNftCollectionFactory is Script {
    function run() external returns (NFTCollectionFactory) {
        HelperConfig helperConfig = new HelperConfig();
        (uint256 deployerKey,,,,, uint256 maxSupply,) = helperConfig.activeNetworkConfig();

        vm.startBroadcast(deployerKey);
        // Pass msg.sender as the initial owner
        NFTCollectionFactory factory = new NFTCollectionFactory(msg.sender, maxSupply);
        vm.stopBroadcast();

        return factory;
    }
}
