// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {NFTCollection} from "./NFTCollection.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTCollectionFactory
 * @dev A factory contract for deploying new NFT collections.
 */
contract NFTCollectionFactory is Ownable {
    // Events
    event CollectionCreated(
        address indexed creator,
        address indexed collectionAddress,
        string name,
        string symbol,
        string baseTokenURI,
        uint256 maxSupply
    );

    // State Variables
    uint256 private immutable i_defaultMaxSupply;
    address public defaultCollection;
    mapping(address => address[]) private s_creatorCollections;

    constructor(string memory nftName, string memory nftSymbol, string memory nftBaseUri, uint256 defaultMaxSupply)
        Ownable(msg.sender)
    {
        i_defaultMaxSupply = defaultMaxSupply;
        // Deploy default collection
        NFTCollection newCollection = new NFTCollection(nftName, nftSymbol, nftBaseUri, defaultMaxSupply);
        // Configure before transferring ownership
        newCollection.setPublicMintEnabled(true);
        newCollection.transferOwnership(msg.sender);

        defaultCollection = address(newCollection);
    }

    /**
     * @dev Creates a new NFT collection.
     * @param name The name of the collection.
     * @param symbol The symbol of the collection.
     * @param baseTokenURI The base URI for token metadata.
     * @param maxSupply The maximum supply of tokens in the collection (optional, defaults to factory's default).
     */
    function createCollection(string memory name, string memory symbol, string memory baseTokenURI, uint256 maxSupply)
        external
        returns (address)
    {
        // Use default max supply if not provided
        if (maxSupply == 0) {
            maxSupply = i_defaultMaxSupply;
        }

        // Deploy new NFT collection
        NFTCollection newCollection = new NFTCollection(name, symbol, baseTokenURI, maxSupply);

        // Transfer ownership to the creator
        newCollection.transferOwnership(msg.sender);

        // Track the collection
        s_creatorCollections[msg.sender].push(address(newCollection));

        // Emit event
        emit CollectionCreated(msg.sender, address(newCollection), name, symbol, baseTokenURI, maxSupply);

        return address(newCollection);
    }

    /**
     * @dev Returns the list of collections created by a specific creator.
     * @param creator The address of the creator.
     */
    function getCreatorCollections(address creator) external view returns (address[] memory) {
        return s_creatorCollections[creator];
    }

    /**
     * @dev Returns the default max supply for new collections.
     */
    function getDefaultMaxSupply() external view returns (uint256) {
        return i_defaultMaxSupply;
    }

    /**
     * @dev Returns the total number of collections created by a specific creator.
     * @param creator The address of the creator.
     */
    function getCreatorCollectionCount(address creator) external view returns (uint256) {
        return s_creatorCollections[creator].length;
    }

    /**
     * @dev Returns the address of a specific collection created by a creator.
     * @param creator The address of the creator.
     * @param index The index of the collection.
     */
    function getCreatorCollection(address creator, uint256 index) external view returns (address) {
        require(index < s_creatorCollections[creator].length, "NFTCollectionFactory: Index out of bounds");
        return s_creatorCollections[creator][index];
    }

    /**
     * @dev Returns the default collection address.
     */
    function getDefaultCollection() external view returns (address) {
        return defaultCollection;
    }
}
