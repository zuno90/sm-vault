// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./CrowdSale.sol";
import "./AllowanceCrowdSale.sol";
import "./TimedCrowdSale.sol";

contract DadsCS is CrowdSale, AllowanceCrowdSale, TimedCrowdSale, Ownable {
	constructor(
		uint256 _rate,
		address payable _wallet,
		ERC20 _token,
		address _tokenWallet,
		uint256 _openingTime,
		uint256 _closingTime
	)
		CrowdSale(_rate, _wallet, _token)
		AllowanceCrowdSale(_tokenWallet)
		TimedCrowdSale(_openingTime, _closingTime)
	{}

	/**
	 * @dev Extend parent behavior requiring to be within contributing period.
	 * @param beneficiary Token purchaser
	 * @param weiAmount Amount of wei contributed
	 */
	function _preValidatePurchase(address beneficiary, uint256 weiAmount)
		internal
		view
		override(CrowdSale, TimedCrowdSale)
		onlyWhileOpen
	{
		super._preValidatePurchase(beneficiary, weiAmount);
	}

	/**
	 * @dev Overrides parent behavior by transferring tokens from wallet.
	 * @param beneficiary Token purchaser
	 * @param tokenAmount Amount of tokens purchased
	 */
	function _deliverTokens(address beneficiary, uint256 tokenAmount)
		internal
		override(CrowdSale, AllowanceCrowdSale)
	{
		super._deliverTokens(beneficiary, tokenAmount);
	}
}