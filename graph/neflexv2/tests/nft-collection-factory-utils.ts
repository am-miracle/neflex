import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  CollectionCreated,
  OwnershipTransferred
} from "../generated/NFTCollectionFactory/NFTCollectionFactory"

export function createCollectionCreatedEvent(
  creator: Address,
  collectionAddress: Address,
  name: string,
  symbol: string,
  baseTokenURI: string,
  maxSupply: BigInt
): CollectionCreated {
  let collectionCreatedEvent = changetype<CollectionCreated>(newMockEvent())

  collectionCreatedEvent.parameters = new Array()

  collectionCreatedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  collectionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "collectionAddress",
      ethereum.Value.fromAddress(collectionAddress)
    )
  )
  collectionCreatedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  collectionCreatedEvent.parameters.push(
    new ethereum.EventParam("symbol", ethereum.Value.fromString(symbol))
  )
  collectionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "baseTokenURI",
      ethereum.Value.fromString(baseTokenURI)
    )
  )
  collectionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "maxSupply",
      ethereum.Value.fromUnsignedBigInt(maxSupply)
    )
  )

  return collectionCreatedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}
