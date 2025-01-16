# Subgraph

Initialize your Subgraph.

1. Initialize Subgraph

```
graph init neflex
```

Use this command to add additional dataSources to your Subgraph.
```
// sample
graph add 0x29cDaD5194854D2063da1B751DBAB7fAC7B3b9FC \
--abi ../smartcontract/out/NFTMarketplace.sol/NFTMarketplace.json \
--contract-name NFTMarketplace \
--network sepolia
```


2. auth & deploy
Authenticate within the CLI, build and deploy your Subgraph to the Studio.

Authenticate in CLI

```
graph auth ••••••••••••••••••••••••••••••••
```
3. Enter Subgraph
```
cd neflex
```

4. Build Subgraph
```
graph codegen && graph build
```

5. Deploy Subgraph
```
graph deploy neflex
```
