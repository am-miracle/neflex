// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {DeployNftCollectionFactory} from "../../script/DeployNftCollectionFactory.s.sol";
import {NFTCollectionFactory} from "../../src/NFTCollectionFactory.sol";

contract NftCollectionFactoryTest is Test {
    HelperConfig helperConfig;
    DeployNftCollectionFactory deployer;
    NFTCollectionFactory nftCollectionFactory;

    function setup() external {
        deployer = new DeployNftCollectionFactory();
        (nftCollectionFactory, helperConfig) = deployer.run();
    }
}
