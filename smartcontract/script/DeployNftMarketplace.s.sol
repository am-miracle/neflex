// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {NFTMarketplace} from "../src/NFTMarketplace.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

/**
 * @title DeployNftMarketplace
 * @notice Script to deploy the NFTMarketplace contract and initialize categories.
 */
contract DeployNftMarketplace is Script {
    function run() external returns (NFTMarketplace, HelperConfig) {
        HelperConfig helperConfig = new HelperConfig();
        (uint256 deployerKey, uint256 marketplaceFee,,,,,) = helperConfig.activeNetworkConfig();

        require(deployerKey != 0, "Deployer key not set");

        vm.startBroadcast(deployerKey);

        NFTMarketplace nftMarketplace = new NFTMarketplace(marketplaceFee);

        // Add initial categories
        bytes32[] memory initialCategories = getInitialCategories();
        string[] memory categoryNames = getCategoryNames();

        unchecked {
            for (uint256 i = 0; i < initialCategories.length; ++i) {
                nftMarketplace.addCategory(initialCategories[i], categoryNames[i]);
            }
        }

        vm.stopBroadcast();

        return (nftMarketplace, helperConfig);
    }

    /**
     * @notice Returns an array of initial category hashes.
     */
    function getInitialCategories() public pure returns (bytes32[] memory) {
        bytes32[] memory categories = new bytes32[](8);
        categories[0] = keccak256(abi.encodePacked("Art"));
        categories[1] = keccak256(abi.encodePacked("Collectibles"));
        categories[2] = keccak256(abi.encodePacked("GameItems"));
        categories[3] = keccak256(abi.encodePacked("Music"));
        categories[4] = keccak256(abi.encodePacked("Photography"));
        categories[5] = keccak256(abi.encodePacked("Sports"));
        categories[6] = keccak256(abi.encodePacked("Utility"));
        categories[7] = keccak256(abi.encodePacked("Other"));

        return categories;
    }

    /**
     * @notice Returns an array of initial category names.
     */
    function getCategoryNames() public pure returns (string[] memory) {
        string[] memory names = new string[](8);
        names[0] = "Art";
        names[1] = "Collectibles";
        names[2] = "Game Items";
        names[3] = "Music";
        names[4] = "Photography";
        names[5] = "Sports";
        names[6] = "Utility";
        names[7] = "Other";
        return names;
    }
}
