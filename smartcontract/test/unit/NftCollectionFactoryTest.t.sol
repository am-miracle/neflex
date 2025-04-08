// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {DeployNftCollectionFactory} from "../../script/DeployNftCollectionFactory.s.sol";
import {NFTCollectionFactory} from "../../src/NFTCollectionFactory.sol";
import {NFTCollection} from "../../src/NFTCollection.sol";

contract NftCollectionFactoryTest is Test {
    HelperConfig public helperConfig;
    DeployNftCollectionFactory public deployer;
    NFTCollectionFactory public nftCollectionFactory;

    address public owner;
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    string public nftName;
    string public nftSymbol;
    string public nftBaseUri;
    uint256 public _maxSupply;

    function setUp() public {
        deployer = new DeployNftCollectionFactory();
        nftCollectionFactory = deployer.run();
        helperConfig = new HelperConfig();

        owner = nftCollectionFactory.owner();

        // Get config values from HelperConfig
        (,,,,,uint256 maxSupply,) = helperConfig.activeNetworkConfig();
        _maxSupply = maxSupply;

        // Get default collection to verify config
        address defaultCollection = nftCollectionFactory.getDefaultCollection();
        NFTCollection collection = NFTCollection(defaultCollection);

        nftName = collection.name();
        nftSymbol = collection.symbol();
        nftBaseUri = collection.getBaseTokenURI();
    }

    // Test deployment initialization
    function testDeploymentInitialization() public view {
        // Verify factory ownership
        assertEq(nftCollectionFactory.owner(), owner, "Owner should be set correctly");

        // Verify default max supply matches config
        assertEq(
            nftCollectionFactory.getDefaultMaxSupply(), 
            _maxSupply,
            "Default max supply should match config"
        );

        // Verify default collection exists
        address defaultCollection = nftCollectionFactory.getDefaultCollection();
        assertTrue(defaultCollection != address(0), "Default collection should be deployed");

        // Verify default collection properties
        NFTCollection collection = NFTCollection(defaultCollection);
        assertEq(collection.name(), nftName, "Default collection name should match");
        assertEq(collection.symbol(), nftSymbol, "Default collection symbol should match");
        assertEq(collection.getBaseTokenURI(), nftBaseUri, "Default collection URI should match");
        assertEq(collection.getMaxSupply(), _maxSupply, "Default collection max supply should match");
        assertTrue(collection.isPublicMintEnabled(), "Default collection should have public mint enabled");
    }

    // Test creating a new collection
    function testCreateNewCollection() public {
        string memory name = "TestCollection";
        string memory symbol = "TST";
        string memory uri = "ipfs://test/";
        uint256 customMaxSupply = 500;

        vm.prank(user1);
        address newCollection = nftCollectionFactory.createCollection(name, symbol, uri, customMaxSupply);

        // Verify collection properties
        NFTCollection collection = NFTCollection(newCollection);
        assertEq(collection.name(), name, "Collection name should match");
        assertEq(collection.symbol(), symbol, "Collection symbol should match");
        assertEq(collection.getBaseTokenURI(), uri, "Collection URI should match");
        assertEq(collection.getMaxSupply(), customMaxSupply, "Collection max supply should match");
        assertEq(collection.owner(), user1, "Collection owner should be creator");

        // Verify factory tracking
        address[] memory userCollections = nftCollectionFactory.getCreatorCollections(user1);
        assertEq(userCollections.length, 1, "Creator should have 1 collection");
        assertEq(userCollections[0], newCollection, "Collection address should match");
    }

    // Test creating collection with default max supply
    function testCreateCollectionWithDefaultMaxSupply() public {
        vm.prank(user1);
        address newCollection = nftCollectionFactory.createCollection("Default", "DFT", "ipfs://default/", 0);

        NFTCollection collection = NFTCollection(newCollection);
        assertEq(
            collection.getMaxSupply(),
            nftCollectionFactory.getDefaultMaxSupply(),
            "Should use default max supply when 0 is provided"
        );
    }

    // Test multiple collections per creator
    function testMultipleCollectionsPerCreator() public {
        vm.startPrank(user1);

        address collection1 = nftCollectionFactory.createCollection("First", "FST", "ipfs://first/", 100);
        address collection2 = nftCollectionFactory.createCollection("Second", "SCD", "ipfs://second/", 200);

        vm.stopPrank();

        address[] memory collections = nftCollectionFactory.getCreatorCollections(user1);
        assertEq(collections.length, 2, "Should have 2 collections");
        assertEq(collections[0], collection1, "First collection address should match");
        assertEq(collections[1], collection2, "Second collection address should match");
    }

    // Test multiple creators
    function testMultipleCreators() public {
        vm.prank(user1);
        address user1Collection = nftCollectionFactory.createCollection("User1", "U1", "ipfs://user1/", 100);

        vm.prank(user2);
        address user2Collection = nftCollectionFactory.createCollection("User2", "U2", "ipfs://user2/", 200);

        assertEq(
            nftCollectionFactory.getCreatorCollectionCount(user1), 
            1,
            "User1 should have 1 collection"
        );
        assertEq(
            nftCollectionFactory.getCreatorCollectionCount(user2),
            1, 
            "User2 should have 1 collection"
        );
        assertEq(
            nftCollectionFactory.getCreatorCollections(user1)[0],
            user1Collection,
            "User1 collection address should match"
        );
        assertEq(
            nftCollectionFactory.getCreatorCollections(user2)[0],
            user2Collection,
            "User2 collection address should match"
        );
    }

    // Test default collection is not counted in creator collections
    function testDefaultCollectionNotTracked() public view {
        address defaultCollection = nftCollectionFactory.getDefaultCollection();
        address[] memory ownerCollections = nftCollectionFactory.getCreatorCollections(owner);

        assertEq(ownerCollections.length, 0, "Default collection should not be tracked");
        assertTrue(defaultCollection != address(0), "Default collection should exist");
    }

    // Test invalid index access
    function testRevertsWhenInvalidIndex() public {
        vm.expectRevert("NFTCollectionFactory: Index out of bounds");
        nftCollectionFactory.getCreatorCollection(user1, 0);
    }
}