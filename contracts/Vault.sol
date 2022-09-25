// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract Vault is Ownable, AccessControlEnumerable {
    IERC20 private token;
    uint256 public maxWithDrawAmount;
    bool public withdrawEnable;
    bytes32 public constant WITHDRAW_ROLE = keccak256("WITHDRAW_ROLE");

    function setWithdrawEnable(bool _isEnable) public onlyOwner {
        withdrawEnable = _isEnable;
    }

    function setMaxWithDrawAmount(uint256 _maxWithDrawAmount) public onlyOwner {
        maxWithDrawAmount = _maxWithDrawAmount;
    }

    function setToken(IERC20 _token) public onlyOwner {
        token = _token;
    }

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function deposit(uint256 _amount) external {
        require(token.balanceOf(msg.sender) >= _amount, "Your balance is low");
        SafeERC20.safeTransferFrom(token, msg.sender, address(this), _amount);
    }

    function withdraw(uint256 _amount, address _to) external onlyWithdrawer {
        require(withdrawEnable, "User has no withdrawed permission");
        require(_amount <= maxWithDrawAmount, "Exceed maximum account");
        token.transfer(_to, _amount);
    }

    modifier onlyWithdrawer() {
        require(owner() == _msgSender() || hasRole(WITHDRAW_ROLE, _msgSender()), "Caller is not a withdrawer");
        _;
    }
}