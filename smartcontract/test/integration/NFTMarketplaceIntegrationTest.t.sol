// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {NFTCollectionFactory} from "../../src/NFTCollectionFactory.sol";
import {NFTMarketplace} from "../../src/NFTMarketplace.sol";
import {NFTCollection} from "../../src/NFTCollection.sol";
import {DeployNftCollectionFactory} from "../../script/DeployNftCollectionFactory.s.sol";
import {DeployNftMarketplace} from "../../script/DeployNftMarketplace.s.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NFTMarketplaceIntegrationTest is Test {
    NFTCollectionFactory public factory;
    NFTMarketplace public marketplace;
    NFTCollection public collection;

    address public deployer = makeAddr("deployer");
    address public creator = makeAddr("creator");
    address public buyer = makeAddr("buyer");
    address public bidder1 = makeAddr("bidder1");
    address public bidder2 = makeAddr("bidder2");

    uint256 public constant MINT_PRICE = 0.01 ether;
    uint256 public constant LISTING_PRICE = 0.001 ether;
    uint256 public constant BID_AMOUNT = 0.002 ether;
    uint256 public constant HIGHER_BID = 0.003 ether;
    bytes32 public constant CATEGORY = keccak256(abi.encodePacked("Art"));
    
    string public constant COLLECTION_NAME = "Test Collection";
    string public constant COLLECTION_SYMBOL = "TEST";
    string public constant BASE_URI = "ipfs://test/";
    uint256 public constant MAX_SUPPLY = 1000;

    function setUp() public {
        vm.deal(deployer, 0.4 ether);
        vm.deal(creator, 0.4 ether);
        vm.deal(buyer, 0.4 ether);
        vm.deal(bidder1, 0.4 ether);
        vm.deal(bidder2, 0.4 ether);

        // Deploy factory without prank
        DeployNftCollectionFactory deployFactory = new DeployNftCollectionFactory();
        factory = deployFactory.run();

        // Deploy marketplace without prank
        DeployNftMarketplace deployMarketplace = new DeployNftMarketplace();
        (marketplace,) = deployMarketplace.run();

        // Now use prank for collection creation
        vm.startPrank(creator);
        address collectionAddress = factory.createCollection(
            COLLECTION_NAME,
            COLLECTION_SYMBOL,
            BASE_URI,
            MAX_SUPPLY
        );
        collection = NFTCollection(collectionAddress);
        vm.stopPrank();
    }

    //////////////////////
    // Collection Tests //
    //////////////////////

    function testCreatorCanCreateCollection() public {
        vm.startPrank(creator);
        address newCollection = factory.createCollection(
            "New Collection",
            "NEW",
            "ipfs://new/",
            500
        );
        vm.stopPrank();

        assertTrue(newCollection != address(0));
        assertEq(marketplace.getCollectionName(newCollection), "New Collection");
        assertEq(factory.getCreatorCollectionCount(creator), 2);
    }

    function testCollectionMetadata() view public {
        assertEq(collection.name(), COLLECTION_NAME);
        assertEq(collection.symbol(), COLLECTION_SYMBOL);
        assertEq(collection.getMaxSupply(), MAX_SUPPLY);
    }

    function testCreatorCanMintNFT() public {
        vm.startPrank(creator);
        uint256 tokenId = collection.mint(creator, "token1.json", 100); // 1% royalty
        vm.stopPrank();

        assertEq(collection.ownerOf(tokenId), creator);
        assertEq(collection.tokenURI(tokenId), string(abi.encodePacked(BASE_URI, "token1.json")));
    }

    function testBatchMintNFTs() public {
        string[] memory uris = new string[](3);
        uris[0] = "token1.json";
        uris[1] = "token2.json";
        uris[2] = "token3.json";

        vm.startPrank(creator);
        uint256[] memory tokenIds = collection.batchMint(creator, uris, 100); // 1% royalty
        vm.stopPrank();

        assertEq(tokenIds.length, 3);
        assertEq(collection.ownerOf(tokenIds[0]), creator);
        assertEq(collection.tokenURI(tokenIds[1]), string(abi.encodePacked(BASE_URI, "token2.json")));
    }

    ///////////////////////
    // Marketplace Tests //
    ///////////////////////

    function testListAndBuyFixedPriceNFT() public {
        // Mint NFT
        vm.startPrank(creator);
        uint256 tokenId = collection.mint(creator, "token1.json", 100); // 1% royalty
        collection.approve(address(marketplace), tokenId);

        // List NFT
        marketplace.listItem(
            address(collection),
            tokenId,
            LISTING_PRICE,
            false, // not auction
            CATEGORY,
            0 // no duration needed
        );
        vm.stopPrank();

        // Calculate expected fees
        uint256 royaltyAmount = LISTING_PRICE * 1 / 100; // 1% royalty
        uint256 remainingAfterRoyalty = LISTING_PRICE - royaltyAmount;
        uint256 marketplaceFee = remainingAfterRoyalty * marketplace.getMarketplaceFee() / 10000;
        uint256 expectedCreatorEarnings = remainingAfterRoyalty - marketplaceFee;

        // Buy NFT
        vm.startPrank(buyer);
        vm.deal(buyer, LISTING_PRICE);
        marketplace.buyItem{value: LISTING_PRICE}(address(collection), tokenId);
        vm.stopPrank();

        // Verify transfer and payments
        assertEq(collection.ownerOf(tokenId), buyer);
        assertEq(marketplace.getEarnings(creator), expectedCreatorEarnings);
    }

    function testAuctionFlow() public {
        // Mint NFT
        vm.startPrank(creator);
        uint256 tokenId = collection.mint(creator, "auction1.json", 100); // 1% royalty
        collection.approve(address(marketplace), tokenId);

        // List as auction (24 hour duration)
        marketplace.listItem(
            address(collection),
            tokenId,
            LISTING_PRICE, // starting price
            true, // is auction
            CATEGORY,
            1 days // duration
        );
        vm.stopPrank();

        // Place bids
        vm.startPrank(bidder1);
        vm.deal(bidder1, BID_AMOUNT);
        marketplace.placeBid{value: BID_AMOUNT}(address(collection), tokenId);
        vm.stopPrank();

        vm.startPrank(bidder2);
        vm.deal(bidder2, HIGHER_BID);
        marketplace.placeBid{value: HIGHER_BID}(address(collection), tokenId);
        vm.stopPrank();

        // Fast forward to end of auction
        vm.warp(block.timestamp + 1 days + 1);

        uint256 royaltyAmount = HIGHER_BID * 1 / 100; // 1% royalty
        uint256 remainingAfterRoyalty = HIGHER_BID - royaltyAmount;
        uint256 marketplaceFee = remainingAfterRoyalty * marketplace.getMarketplaceFee() / 10000;
        uint256 expectedCreatorEarnings = remainingAfterRoyalty - marketplaceFee;

        // End auction
        vm.startPrank(creator);
        marketplace.endAuction(address(collection), tokenId);
        vm.stopPrank();

        // Verify results
        assertEq(collection.ownerOf(tokenId), bidder2);
        assertEq(marketplace.getEarnings(creator), expectedCreatorEarnings);
        assertEq(bidder1.balance, BID_AMOUNT); // bidder1 should have been refunded
    }

    function testRoyaltyDistribution() public {
        // Mint NFT with 10% royalty
        vm.startPrank(creator);
        uint256 tokenId = collection.mint(creator, "royalty1.json", 1000); // 10% royalty
        collection.approve(address(marketplace), tokenId);
        
        // List NFT
        marketplace.listItem(
            address(collection),
            tokenId,
            LISTING_PRICE,
            false, // not auction
            CATEGORY,
            0 // no duration needed
        );
        vm.stopPrank();

        // Get royalty info
        (address royaltyReceiver, uint256 royaltyAmount) = collection.royaltyInfo(tokenId, LISTING_PRICE);
        assertEq(royaltyReceiver, creator);
        assertEq(royaltyAmount, LISTING_PRICE * 10 / 100);

        // Buy NFT and verify royalty payment
        uint256 creatorBalanceBefore = creator.balance;
        
        vm.startPrank(buyer);
        vm.deal(buyer, LISTING_PRICE);
        marketplace.buyItem{value: LISTING_PRICE}(address(collection), tokenId);
        vm.stopPrank();

        assertEq(creator.balance - creatorBalanceBefore, royaltyAmount);
    }

    function testMarketplaceFeeCalculation() public {
        // Get marketplace fee percentage
        uint256 marketplaceFee = marketplace.getMarketplaceFee();
        
        // Mint NFT
        vm.startPrank(creator);
        uint256 tokenId = collection.mint(creator, "fee1.json", 0); // no royalty
        collection.approve(address(marketplace), tokenId);
        
        // List NFT
        marketplace.listItem(
            address(collection),
            tokenId,
            LISTING_PRICE,
            false, // not auction
            CATEGORY,
            0 // no duration needed
        );
        vm.stopPrank();

        // Calculate expected fees
        uint256 expectedMarketplaceFee = (LISTING_PRICE * marketplaceFee) / 10000;
        uint256 expectedCreatorEarnings = LISTING_PRICE - expectedMarketplaceFee;

        // Buy NFT
        vm.startPrank(buyer);
        vm.deal(buyer, LISTING_PRICE);
        marketplace.buyItem{value: LISTING_PRICE}(address(collection), tokenId);
        vm.stopPrank();

        // Verify fee distribution
        assertEq(marketplace.getEarnings(creator), expectedCreatorEarnings);
    }

    function testCategoryManagement() public {
        bytes32[] memory categories = marketplace.getCategories();
        assertTrue(categories.length > 0);

        // Try listing with invalid category should fail
        vm.startPrank(creator);
        uint256 tokenId = collection.mint(creator, "invalidcat.json", 0);
        collection.approve(address(marketplace), tokenId);
        
        bytes32 invalidCategory = keccak256(abi.encodePacked("Invalid"));
        vm.expectRevert();
        marketplace.listItem(
            address(collection),
            tokenId,
            LISTING_PRICE,
            false,
            invalidCategory,
            0
        );
        vm.stopPrank();
    }

    function testWithdrawEarnings() public {
        // Mint and list NFT
        vm.startPrank(creator);
        uint256 tokenId = collection.mint(creator, "withdraw1.json", 0);
        collection.approve(address(marketplace), tokenId);
        marketplace.listItem(address(collection), tokenId, LISTING_PRICE, false, CATEGORY, 0);
        vm.stopPrank();

        // Buy NFT
        vm.startPrank(buyer);
        vm.deal(buyer, LISTING_PRICE);
        marketplace.buyItem{value: LISTING_PRICE}(address(collection), tokenId);
        vm.stopPrank();

        // Withdraw earnings
        uint256 creatorBalanceBefore = creator.balance;
        uint256 earnings = marketplace.getEarnings(creator);
        
        vm.startPrank(creator);
        marketplace.withdrawEarnings();
        vm.stopPrank();

        assertEq(creator.balance - creatorBalanceBefore, earnings);
        assertEq(marketplace.getEarnings(creator), 0);
    }

    function testCancelListing() public {
        // Mint and list NFT
        vm.startPrank(creator);
        uint256 tokenId = collection.mint(creator, "cancel1.json", 0);
        collection.approve(address(marketplace), tokenId);
        marketplace.listItem(address(collection), tokenId, LISTING_PRICE, false, CATEGORY, 0);
        vm.stopPrank();

        // Cancel listing
        vm.startPrank(creator);
        marketplace.cancelListing(address(collection), tokenId);
        vm.stopPrank();

        // Try to buy should fail
        vm.startPrank(buyer);
        vm.deal(buyer, LISTING_PRICE);
        vm.expectRevert();
        marketplace.buyItem{value: LISTING_PRICE}(address(collection), tokenId);
        vm.stopPrank();
    }
}