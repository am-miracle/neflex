// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC2981} from "@openzeppelin/contracts/interfaces/IERC2981.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

/**
 * @title NFTMarketplace
 * @dev A marketplace for NFTs with support for direct listings and auctions.
 */
contract NFTMarketplace is ReentrancyGuard, Pausable, Ownable {
    // Custom errors
    error NFTMarketplace__PriceMustBeAboveZero();
    error NFTMarketplace__NotApprovedForMarketplace();
    error NFTMarketplace__AlreadyListed();
    error NFTMarketplace__NotListed();
    error NFTMarketplace__NotOwner();
    error NFTMarketplace__PriceNotMet();
    error NFTMarketplace__NoEarnings();
    error NFTMarketplace__TransferFailed();
    error NFTMarketplace__AuctionNotActive();
    error NFTMarketplace__AuctionAlreadyActive();
    error NFTMarketplace__AuctionEnded();
    error NFTMarketplace__BidBelowStartingPrice(uint256 startingPrice);
    error NFTMarketplace__BidIncrementTooLow(uint256 minBidRequired);
    error NFTMarketplace__AuctionStillActive();
    error NFTMarketplace__NotHighestBidder();
    error NFTMarketplace__InvalidCategory();
    error NFTMarketplace__InvalidAuctionDuration();
    error NFTMarketplace__InvalidMarketplaceFee();

    // Type declaration
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using Address for address payable;

    // Constants
    uint256 private constant MIN_AUCTION_DURATION = 1 hours;
    uint256 private constant MAX_AUCTION_DURATION = 30 days;
    uint256 private constant MIN_BID_INCREMENT = 0.01 ether;
    uint256 private constant MAX_MARKETPLACE_FEE = 1000; // 10% in basis points

    // State Variables
    uint256 private immutable i_marketplaceFee; // in basis points (e.g., 250 = 2.5%)
    EnumerableSet.Bytes32Set private s_categories;

    // Structs
    struct Listing {
        address seller;
        address highestBidder;
        bool isAuction;
        uint256 price;
        uint256 auctionEndTime;
        uint256 highestBid;
        bytes32 category;
    }

    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
    }

    // Mappings
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(address => uint256) private s_earnings;
    mapping(address => mapping(uint256 => Bid[])) private s_bids;
    mapping(bytes32 => uint256[]) private s_categoryListings;

    // Events
    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price,
        bool isAuction,
        bytes32 category,
        uint256 timestamp,
        string collectionName,
        address creator
    );

    event ItemCanceled(address indexed seller, address indexed nftAddress, uint256 indexed tokenId, uint256 timestamp);

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price,
        address seller,
        uint256 timestamp,
        uint256 royaltyAmount,
        address royaltyReceiver
    );

    event BidPlaced(
        address indexed bidder, address indexed nftAddress, uint256 indexed tokenId, uint256 amount, uint256 timestamp
    );

    event BidWithdrawn(
        address indexed bidder, address indexed nftAddress, uint256 indexed tokenId, uint256 amount, uint256 timestamp
    );

    event AuctionEnded(
        address indexed winner,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 amount,
        address seller,
        uint256 timestamp
    );

    event EarningsWithdrawn(address indexed seller, uint256 amount, uint256 timestamp);

    event CategoryAdded(bytes32 indexed category, string name, uint256 timestamp);

    constructor(uint256 marketplaceFee) Ownable(msg.sender) {
        if (marketplaceFee > MAX_MARKETPLACE_FEE) revert NFTMarketplace__InvalidMarketplaceFee();
        i_marketplaceFee = marketplaceFee;
    }

    /*//////////////////////////////////////////////////////////////
                           EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice List an NFT in the marketplace
     * @param nftAddress Address of the NFT contract
     * @param tokenId Token ID of the NFT
     * @param price Price in ETH
     * @param isAuction Whether this is an auction listing
     * @param category Category of the listing
     * @param auctionDuration Duration of the auction (if applicable)
     */
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price,
        bool isAuction,
        bytes32 category,
        uint256 auctionDuration
    ) external nonReentrant whenNotPaused {
        if (price <= 0) revert NFTMarketplace__PriceMustBeAboveZero();
        if (!s_categories.contains(category)) revert NFTMarketplace__InvalidCategory();
        if (isAuction && (auctionDuration < MIN_AUCTION_DURATION || auctionDuration > MAX_AUCTION_DURATION)) {
            revert NFTMarketplace__InvalidAuctionDuration();
        }

        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NFTMarketplace__NotApprovedForMarketplace();
        }
        if (s_listings[nftAddress][tokenId].seller != address(0)) {
            revert NFTMarketplace__AlreadyListed();
        }
        if (nft.ownerOf(tokenId) != msg.sender) revert NFTMarketplace__NotOwner();

        string memory collectionName = _getCollectionName(nftAddress);
        address creator = _getCreator(nftAddress);

        s_listings[nftAddress][tokenId] = Listing({
            seller: msg.sender,
            price: price,
            isAuction: isAuction,
            auctionEndTime: isAuction ? block.timestamp + auctionDuration : 0,
            highestBidder: address(0),
            highestBid: 0,
            category: category
        });

        s_categoryListings[category].push(tokenId);

        emit ItemListed(
            msg.sender, nftAddress, tokenId, price, isAuction, category, block.timestamp, collectionName, creator
        );
    }

    /**
     * @notice Cancel a listing
     * @param nftAddress Address of the NFT contract
     * @param tokenId Token ID of the NFT
     */
    function cancelListing(address nftAddress, uint256 tokenId) external nonReentrant {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.seller != msg.sender) revert NFTMarketplace__NotOwner();
        if (listing.isAuction && listing.highestBid > 0) {
            revert NFTMarketplace__AuctionStillActive();
        }

        delete s_listings[nftAddress][tokenId];
        emit ItemCanceled(msg.sender, nftAddress, tokenId, block.timestamp);
    }

    /**
     * @notice Buy a listed NFT
     * @param nftAddress Address of the NFT contract
     * @param tokenId Token ID of the NFT
     */
    function buyItem(address nftAddress, uint256 tokenId) external payable nonReentrant whenNotPaused {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.seller == address(0)) revert NFTMarketplace__NotListed();
        if (listing.isAuction) revert NFTMarketplace__AuctionAlreadyActive();
        if (msg.value < listing.price) revert NFTMarketplace__PriceNotMet();

        _processPaymentAndTransferNFT(nftAddress, tokenId, msg.value, listing.seller, msg.sender);

        delete s_listings[nftAddress][tokenId];
    }

    /**
     * @notice Place a bid on an auction
     * @param nftAddress Address of the NFT contract
     * @param tokenId Token ID of the NFT
     */
    function placeBid(address nftAddress, uint256 tokenId) external payable nonReentrant whenNotPaused {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (!listing.isAuction) revert NFTMarketplace__AuctionNotActive();
        if (block.timestamp > listing.auctionEndTime) revert NFTMarketplace__AuctionEnded();

        uint256 minBidRequired = listing.highestBid == 0 ? listing.price : listing.highestBid + MIN_BID_INCREMENT;
        if (msg.value < minBidRequired) {
            revert NFTMarketplace__BidIncrementTooLow(minBidRequired);
        }

        _handleBidPlacement(listing);

        s_listings[nftAddress][tokenId].highestBidder = msg.sender;
        s_listings[nftAddress][tokenId].highestBid = msg.value;

        s_bids[nftAddress][tokenId].push(Bid({bidder: msg.sender, amount: msg.value, timestamp: block.timestamp}));

        emit BidPlaced(msg.sender, nftAddress, tokenId, msg.value, block.timestamp);
    }

    /**
     * @notice End an auction and transfer NFT to highest bidder
     * @param nftAddress Address of the NFT contract
     * @param tokenId Token ID of the NFT
     */
    function endAuction(address nftAddress, uint256 tokenId) external nonReentrant {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (!listing.isAuction) revert NFTMarketplace__AuctionNotActive();
        if (block.timestamp <= listing.auctionEndTime) revert NFTMarketplace__AuctionStillActive();

        if (listing.highestBidder != address(0)) {
            _processPaymentAndTransferNFT(
                nftAddress, tokenId, listing.highestBid, listing.seller, listing.highestBidder
            );

            emit AuctionEnded(
                listing.highestBidder, nftAddress, tokenId, listing.highestBid, listing.seller, block.timestamp
            );
        }

        delete s_listings[nftAddress][tokenId];
    }

    /**
     * @notice Withdraw earnings from sales
     */
    function withdrawEarnings() external nonReentrant {
        uint256 earnings = s_earnings[msg.sender];
        if (earnings <= 0) revert NFTMarketplace__NoEarnings();
        s_earnings[msg.sender] = 0;
        payable(msg.sender).sendValue(earnings);
        emit EarningsWithdrawn(msg.sender, earnings, block.timestamp);
    }

    /**
     * @notice Add a new category
     */
    function addCategory(bytes32 category, string memory name) external onlyOwner {
        s_categories.add(category);
        emit CategoryAdded(category, name, block.timestamp);
    }

    // Admin functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /*//////////////////////////////////////////////////////////////
                           INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _processPaymentAndTransferNFT(
        address nftAddress,
        uint256 tokenId,
        uint256 paymentAmount,
        address seller,
        address buyer
    ) internal {
        (address royaltyReceiver, uint256 royaltyAmount) = IERC2981(nftAddress).royaltyInfo(tokenId, paymentAmount);

        uint256 remainingAmount = paymentAmount;

        if (royaltyAmount > 0) {
            payable(royaltyReceiver).sendValue(royaltyAmount);
            remainingAmount -= royaltyAmount;
        }

        uint256 marketplaceFee = (remainingAmount * i_marketplaceFee) / 10000;
        payable(owner()).sendValue(marketplaceFee);

        uint256 sellerEarnings = remainingAmount - marketplaceFee;
        s_earnings[seller] += sellerEarnings;

        IERC721(nftAddress).safeTransferFrom(seller, buyer, tokenId);

        emit ItemBought(
            buyer, nftAddress, tokenId, paymentAmount, seller, block.timestamp, royaltyAmount, royaltyReceiver
        );
    }

    function _handleBidPlacement(Listing memory listing) internal {
        if (listing.highestBidder != address(0)) {
            payable(listing.highestBidder).sendValue(listing.highestBid);
        }
    }

    function _getCollectionName(address nftAddress) internal view returns (string memory) {
        return IERC721Metadata(nftAddress).name();
    }

    function _getCreator(address nftAddress) internal view returns (address) {
        address creator = IERC721(nftAddress).ownerOf(0);
        if (creator != address(0)) {
            return creator;
        }
        return Ownable(nftAddress).owner();
    }

    /*//////////////////////////////////////////////////////////////
                            GETTER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function getListing(address nftAddress, uint256 tokenId) external view returns (Listing memory) {
        return s_listings[nftAddress][tokenId];
    }

    function getEarnings(address seller) external view returns (uint256) {
        return s_earnings[seller];
    }

    function getBidHistory(address nftAddress, uint256 tokenId) external view returns (Bid[] memory) {
        return s_bids[nftAddress][tokenId];
    }

    function getCategories() external view returns (bytes32[] memory) {
        return s_categories.values();
    }

    function getMarketplaceFee() external view returns (uint256) {
        return i_marketplaceFee;
    }
}
