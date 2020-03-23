
/**
 * Bit for add server to server list.
 */
const SERVERS_START = "\xFF\xFF\xFF\xFF\x66\x0A";
/**
 * Bit for remove server of server list.
 */
const SERVERS_END= "\x00\x00\x00\x00\x00\x00";

module.exports = {
    SERVERS_START,
    SERVERS_END
}

