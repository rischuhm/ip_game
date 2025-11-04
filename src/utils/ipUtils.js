/**
 * Converts a decimal IP address to binary string format
 * @param {string} ip - IP address in decimal format (e.g., "192.168.1.0")
 * @returns {string} Binary representation (e.g., "11000000.10101000.00000001.00000000")
 */
export function ipToBinary(ip) {
  return ip.split('.').map(octet => {
    const num = parseInt(octet, 10);
    return num.toString(2).padStart(8, '0');
  }).join('.');
}

/**
 * Converts a binary IP address string to decimal format
 * @param {string} binaryIp - Binary IP string (e.g., "11000000.10101000.00000001.00000000")
 * @returns {string} Decimal IP address
 */
export function binaryToIp(binaryIp) {
  return binaryIp.split('.').map(binary => {
    return parseInt(binary, 2).toString();
  }).join('.');
}

/**
 * Normalizes an IP address by removing leading zeros from each octet
 * @param {string} ip - IP address to normalize
 * @returns {string} Normalized IP address (e.g., "001.001.002.005" -> "1.1.2.5")
 */
export function normalizeIpAddress(ip) {
  if (!ip || typeof ip !== 'string') {
    return ip;
  }

  const parts = ip.split('.');
  if (parts.length !== 4) {
    return ip; // Return as-is if invalid format, validation will catch it
  }

  const normalizedParts = parts.map(octet => {
    const trimmed = octet.trim();
    if (trimmed === '') {
      return trimmed;
    }
    const num = parseInt(trimmed, 10);
    if (isNaN(num)) {
      return trimmed; // Return as-is if not a number, validation will catch it
    }
    return num.toString(); // Remove leading zeros by converting to number and back
  });

  return normalizedParts.join('.');
}

/**
 * Validates IP address format and normalizes it
 * @param {string} ip - IP address to validate
 * @returns {{valid: boolean, error?: string, normalizedIp?: string}}
 */
export function validateIpAddress(ip) {
  if (!ip || typeof ip !== 'string') {
    return { valid: false, error: 'IP address is required' };
  }

  // Normalize the IP address first
  const normalizedIp = normalizeIpAddress(ip);
  const parts = normalizedIp.split('.');

  if (parts.length !== 4) {
    return { valid: false, error: 'IP address must contain exactly 4 octets' };
  }

  for (let i = 0; i < parts.length; i++) {
    const octet = parts[i].trim();
    if (octet === '') {
      return { valid: false, error: `Octet ${i + 1} cannot be empty` };
    }
    const num = parseInt(octet, 10);
    if (isNaN(num) || num < 0 || num > 255) {
      return { valid: false, error: `Octet ${i + 1} must be a number between 0 and 255` };
    }
  }

  return { valid: true, normalizedIp };
}

/**
 * Validates subnet mask format and checks if it's a valid subnet mask
 * @param {string} subnetMask - Subnet mask to validate
 * @returns {{valid: boolean, error?: string}}
 */
export function validateSubnetMask(subnetMask) {
  const validation = validateIpAddress(subnetMask);
  if (!validation.valid) {
    return validation;
  }

  // Check if subnet mask is valid (must be a contiguous sequence of 1s followed by 0s)
  const parts = subnetMask.split('.').map(p => parseInt(p, 10));
  const binary = parts.map(p => p.toString(2).padStart(8, '0')).join('');
  
  // Check if binary is valid subnet mask pattern (all 1s followed by all 0s)
  let foundZero = false;
  for (let i = 0; i < binary.length; i++) {
    if (binary[i] === '0') {
      foundZero = true;
    } else if (foundZero && binary[i] === '1') {
      return { valid: false, error: 'Invalid subnet mask: must be contiguous 1s followed by 0s' };
    }
  }

  return { valid: true };
}

/**
 * Converts IP address to 32-bit integer
 * @param {string} ip - IP address
 * @returns {number}
 */
function ipToInt(ip) {
  const parts = ip.split('.').map(p => parseInt(p, 10));
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

/**
 * Checks if an IP address belongs to a network given the network address and subnet mask
 * @param {string} ip - IP address to check
 * @param {string} networkAddress - Network address
 * @param {string} subnetMask - Subnet mask
 * @returns {boolean}
 */
export function isIpInNetwork(ip, networkAddress, subnetMask) {
  const ipInt = ipToInt(ip);
  const networkInt = ipToInt(networkAddress);
  const maskInt = ipToInt(subnetMask);
  
  return (ipInt & maskInt) === (networkInt & maskInt);
}

/**
 * Generates a detailed explanation of why an IP address doesn't belong to a network
 * @param {string} ip - IP address that was submitted
 * @param {string} networkAddress - Network address
 * @param {string} subnetMask - Subnet mask
 * @returns {string} Detailed explanation
 */
export function explainNetworkMismatch(ip, networkAddress, subnetMask) {
  const ipInt = ipToInt(ip);
  const networkInt = ipToInt(networkAddress);
  const maskInt = ipToInt(subnetMask);
  
  const ipNetworkId = ipInt & maskInt;
  const expectedNetworkId = networkInt & maskInt;
  
  const ipBinary = ipToBinary(ip);
  const networkBinary = ipToBinary(networkAddress);
  const maskBinary = ipToBinary(subnetMask);
  const ipNetworkIdBinary = ipToBinary(intToIp(ipNetworkId));
  const expectedNetworkIdBinary = ipToBinary(intToIp(expectedNetworkId));
  
  // Calculate CIDR notation
  const cidr = maskBinary.split('').filter(bit => bit === '1').length;
  
  // Calculate broadcast address
  const hostBits = ~maskInt >>> 0;
  const broadcastInt = expectedNetworkId | hostBits;
  const broadcastAddress = intToIp(broadcastInt);
  
  // Calculate valid range
  const firstHost = intToIp(expectedNetworkId + 1);
  const lastHost = intToIp(broadcastInt - 1);
  
  let explanation = `Your IP address ${ip} does not belong to the network ${networkAddress}/${cidr}.\n\n`;
  explanation += `Here's why:\n\n`;
  explanation += `1. Network ID Calculation:\n`;
  explanation += `   Network Address: ${networkAddress} (${networkBinary})\n`;
  explanation += `   Subnet Mask:     ${subnetMask} (${maskBinary})\n`;
  explanation += `   Network ID:      ${intToIp(expectedNetworkId)} (${expectedNetworkIdBinary})\n\n`;
  explanation += `2. Your IP's Network ID:\n`;
  explanation += `   Your IP:         ${ip} (${ipBinary})\n`;
  explanation += `   Subnet Mask:     ${subnetMask} (${maskBinary})\n`;
  explanation += `   Calculated ID:   ${intToIp(ipNetworkId)} (${ipNetworkIdBinary})\n\n`;
  
  if (ipNetworkId !== expectedNetworkId) {
    explanation += `3. The Problem:\n`;
    explanation += `   Your IP's network ID (${intToIp(ipNetworkId)}) does not match the required network ID (${intToIp(expectedNetworkId)}).\n`;
    explanation += `   This means your IP is in a different network.\n\n`;
  }
  
  explanation += `4. Valid IP Range for this Network:\n`;
  explanation += `   Network Address: ${networkAddress} (reserved)\n`;
  explanation += `   First Host:      ${firstHost}\n`;
  explanation += `   Last Host:       ${lastHost}\n`;
  explanation += `   Broadcast:       ${broadcastAddress} (reserved)\n\n`;
  explanation += `   Valid host IPs: ${firstHost} to ${lastHost}`;
  
  return explanation;
}

/**
 * Converts a 32-bit integer to IP address string
 * @param {number} ipInt - 32-bit integer representation
 * @returns {string} IP address in decimal format
 */
function intToIp(ipInt) {
  return [
    (ipInt >>> 24) & 0xFF,
    (ipInt >>> 16) & 0xFF,
    (ipInt >>> 8) & 0xFF,
    ipInt & 0xFF
  ].join('.');
}

/**
 * Generates a random valid IP address
 * @returns {string}
 */
export function generateRandomIp() {
  return [
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256)
  ].join('.');
}

/**
 * Generates a random valid subnet mask
 * @returns {string}
 */
export function generateRandomSubnetMask() {
  // Common subnet masks (CIDR notation converted to decimal)
  const commonMasks = [
    '255.255.255.0',   // /24
    '255.255.0.0',     // /16
    '255.0.0.0',       // /8
    '255.255.255.128', // /25
    '255.255.255.192', // /26
    '255.255.255.224', // /27
    '255.255.254.0',   // /23
    '255.255.252.0',   // /22
  ];
  return commonMasks[Math.floor(Math.random() * commonMasks.length)];
}

/**
 * Generates a random IP address that belongs to the given network
 * @param {string} networkAddress - Network address
 * @param {string} subnetMask - Subnet mask
 * @returns {string}
 */
export function generateIpInNetwork(networkAddress, subnetMask) {
  const networkInt = ipToInt(networkAddress);
  const maskInt = ipToInt(subnetMask);
  const networkPrefix = networkInt & maskInt;
  const hostBits = ~maskInt >>> 0; // Convert to unsigned 32-bit
  
  // Generate random host part
  const randomHost = Math.floor(Math.random() * (hostBits - 1)) + 1; // Exclude network and broadcast
  
  const ipInt = networkPrefix | randomHost;
  
  return [
    (ipInt >>> 24) & 0xFF,
    (ipInt >>> 16) & 0xFF,
    (ipInt >>> 8) & 0xFF,
    ipInt & 0xFF
  ].join('.');
}

