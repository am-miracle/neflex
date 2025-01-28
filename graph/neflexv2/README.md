# Subgraph

Initialize your Subgraph.

1. Initialize Subgraph

```
graph init neflex
```

Use this command to add additional dataSources to your Subgraph `cd` into the directory first.
```
// sample
graph add 0x078665C74c9C0C00634Abda5B63dF03648a2ec3e \
--abi ../../smartcontract/out/NFTMarketplace.sol/NFTMarketplace.json \
--contract-name NFTMarketplace
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
