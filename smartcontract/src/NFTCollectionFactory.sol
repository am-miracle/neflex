// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {NFTCollection} from "./NFTCollection.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract NFTCollectionFactory is Ownable {
    event CollectionCreated(address indexed creator, address indexed collectionAddress, string name, string symbol);

    uint256 private immutable i_maxSupply;

    mapping(address => address[]) private creatorCollections;

    constructor(address initialOwner, uint256 maxSupply) Ownable(initialOwner) {
        i_maxSupply = maxSupply;
    }

    function createCollection(string memory name, string memory symbol, string memory baseTokenURI)
        external
        returns (address)
    {
        NFTCollection newCollection = new NFTCollection(name, symbol, baseTokenURI, i_maxSupply);

        newCollection.transferOwnership(msg.sender);

        creatorCollections[msg.sender].push(address(newCollection));

        emit CollectionCreated(msg.sender, address(newCollection), name, symbol);

        return address(newCollection);
    }

    function getCreatorCollections(address creator) external view returns (address[] memory) {
        return creatorCollections[creator];
    }

    function getMaxSupply() external view returns (uint256) {
        return i_maxSupply;
    }
}
