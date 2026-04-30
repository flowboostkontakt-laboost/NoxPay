// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {
    Nox,
    euint256,
    externalEuint256
} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";
import {ERC20ToERC7984WrapperAdvanced} from "@iexec-nox/nox-confidential-contracts/contracts/token/extensions/ERC20ToERC7984WrapperAdvanced.sol";
import {ERC7984Advanced} from "@iexec-nox/nox-confidential-contracts/contracts/token/ERC7984Advanced.sol";

/**
 * @title NoxPay
 * @dev Enterprise payroll framework with TEE privacy on Arbitrum Sepolia.
 *      Wraps USDC into confidential ncUSDC (ERC-7984) enabling encrypted batch payroll
 *      and auditor viewing policies.
 */
contract NoxPay is ERC20ToERC7984WrapperAdvanced, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    error BatchLengthMismatch();
    error EmptyBatch();
    error AuditorAccessExpired();
    error UnauthorizedAuditor();

    /// @dev Encrypted total volume transferred (for compliance / AI audit)
    euint256 private _totalVolume;

    /// @dev Timestamp until which an auditor can access volume data
    mapping(address => uint48) public auditorVolumeAccess;

    event AuditorAccessGranted(address indexed auditor, uint48 until);
    event AuditorAccessRevoked(address indexed auditor);
    event BatchConfidentialTransfer(address indexed from, uint256 count);

    constructor(IERC20 underlying)
        ERC20ToERC7984WrapperAdvanced(underlying)
        ERC7984Advanced("NoxPay Confidential USDC", "ncUSDC", "")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _totalVolume = Nox.toEuint256(0);
    }

    /// @dev Resolve supportsInterface collision between ERC20ToERC7984WrapperAdvanced and AccessControl.
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC20ToERC7984WrapperAdvanced, AccessControl) returns (bool) {
        return ERC20ToERC7984WrapperAdvanced.supportsInterface(interfaceId) || AccessControl.supportsInterface(interfaceId);
    }

    // ============ Viewing Policy ============

    /**
     * @dev Grants an auditor time-bounded access to view encrypted volume.
     */
    function grantAuditorAccess(address auditor, uint48 until) external onlyRole(ADMIN_ROLE) {
        _grantRole(AUDITOR_ROLE, auditor);
        auditorVolumeAccess[auditor] = until;
        emit AuditorAccessGranted(auditor, until);
    }

    /**
     * @dev Revokes an auditor's access immediately.
     */
    function revokeAuditorAccess(address auditor) external onlyRole(ADMIN_ROLE) {
        _revokeRole(AUDITOR_ROLE, auditor);
        auditorVolumeAccess[auditor] = 0;
        emit AuditorAccessRevoked(auditor);
    }

    /**
     * @dev Returns the encrypted total transfer volume.
     *      Only callable by auditors with valid, non-expired access.
     */
    function getTotalVolume() external view returns (euint256) {
        if (!hasRole(AUDITOR_ROLE, msg.sender)) revert UnauthorizedAuditor();
        if (block.timestamp > auditorVolumeAccess[msg.sender]) revert AuditorAccessExpired();
        return _totalVolume;
    }

    // ============ Batch Payroll ============

    /**
     * @dev Executes multiple confidential transfers in a single transaction.
     *      The caller must have ACL access to each encrypted amount.
     */
    function batchConfidentialTransfer(
        address[] calldata to,
        euint256[] calldata amounts
    ) external returns (euint256[] memory transferred) {
        uint256 len = to.length;
        if (len == 0) revert EmptyBatch();
        if (len != amounts.length) revert BatchLengthMismatch();

        transferred = new euint256[](len);
        for (uint256 i = 0; i < len; ) {
            if (!Nox.isAllowed(amounts[i], msg.sender)) {
                revert ERC7984UnauthorizedUseOfEncryptedAmount(amounts[i], msg.sender);
            }
            transferred[i] = _transfer(msg.sender, to[i], amounts[i]);
            unchecked { ++i; }
        }

        emit BatchConfidentialTransfer(msg.sender, len);
    }

    /**
     * @dev Batch transfer using external encrypted amounts with input proof.
     *      Useful when the caller does not yet hold ACL access to the handles.
     */
    function batchConfidentialTransfer(
        address[] calldata to,
        externalEuint256[] calldata encryptedAmounts,
        bytes calldata inputProof
    ) external returns (euint256[] memory transferred) {
        uint256 len = to.length;
        if (len == 0) revert EmptyBatch();
        if (len != encryptedAmounts.length) revert BatchLengthMismatch();

        transferred = new euint256[](len);
        for (uint256 i = 0; i < len; ) {
            euint256 amount = Nox.fromExternal(encryptedAmounts[i], inputProof);
            transferred[i] = _transfer(msg.sender, to[i], amount);
            unchecked { ++i; }
        }

        emit BatchConfidentialTransfer(msg.sender, len);
    }

    // ============ Internal Hooks ============

    /**
     * @dev Overrides _update to track encrypted total volume for compliance.
     */
    function _update(
        address from,
        address to,
        euint256 amount
    ) internal virtual override returns (euint256 transferred) {
        transferred = super._update(from, to, amount);

        // Count only actual transfers (not mints or burns)
        if (from != address(0) && to != address(0)) {
            _totalVolume = Nox.add(_totalVolume, transferred);
            Nox.allowThis(_totalVolume);
        }
    }
}
