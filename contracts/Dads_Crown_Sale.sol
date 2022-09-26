// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DadsCrownSale is Ownable {
    using SafeERC20 for IERC20;
    address payable public wallet;
    uint256 public BNBRate;
    uint256 public USDTRate;
    IERC20 public token;
    IERC20 public usdtToken;
    
    event BuyTokenByBNB(address buyer, uint256 amount);
    event BuyTokenByUSDT(address buyer, uint256 amount);
    event SetUSDTToken(IERC20 tokenAddress);
    event SetBNBRate(uint256 newRate);
    event SetUSDTRate(uint256 newRate);

    constructor(uint256 _BNBRate,uint256 _USDTRate,address payable _wallet,IERC20 _icoToken) {
        BNBRate = _BNBRate;
        USDTRate = _USDTRate;
        wallet = _wallet;
        token = _icoToken;
    }

    function setUSDTToken(IERC20 _token) public onlyOwner {
        usdtToken = _token;
        emit SetUSDTToken(_token);
    }

    function setBNBRate(uint256 _newRate) public onlyOwner {
        BNBRate = _newRate;
        emit SetBNBRate(_newRate);
    }

    function setUSDTRate(uint256 _newRate) public onlyOwner {
        USDTRate = _newRate;
        emit SetUSDTRate(_newRate);
    }

    function buyTokenByBNB() external payable {
        uint256 bnbAmount = msg.value;
        uint256 amount = getTokenAmountBNB(bnbAmount);
        require(amount > 0, "Amount is zero");
        require(token.balanceOf(address(this)) >= amount, "Insufficient account balance");
        require(msg.sender.balance >= bnbAmount, "Insufficient account balance");
        payable(wallet).transfer(bnbAmount);
        SafeERC20.safeTransfer(token, msg.sender, amount);
        emit BuyTokenByBNB(msg.sender, amount);
    }

    function buyTokenByUSDT() external payable {
        uint256 usdtAmount = msg.value;
        uint256 amount = getTokenAmountUSDT(usdtAmount);
        require(msg.sender.balance >= usdtAmount, "Insufficient account balance");
        require(amount > 0, "Amount is zero");
        require(token.balanceOf(address(this)) >= amount, "Insufficient account balance");
        payable(wallet).transfer(usdtAmount);
        SafeERC20.safeTransfer(token, msg.sender, amount);
        emit BuyTokenByUSDT(msg.sender, amount);
    }

    // internal func
    function getTokenAmountBNB(uint256 _amount) public view returns (uint256) {
        return _amount*BNBRate;
    }
    function getTokenAmountUSDT(uint256 _amount) public view returns (uint256) {
        return _amount*USDTRate;
    }
    // helper for FE
    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
    function withdrawERC20() public onlyOwner {
        usdtToken.transfer(msg.sender, usdtToken.balanceOf(address(this)));
    }
}