pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract POK is ERC20 {
    constructor() ERC20('POK', 'POK BTC') {
        _mint(msg.sender, 5000);
    }
}