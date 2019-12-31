import QRCode from 'qrcode';
import { Writable } from 'stream';
export type WifiAuthenticationType = 'WEP' | 'WPA' | 'nopass';

export interface WifiConfig {
    /**
     * Network name (SSID).
     */
    ssid: string;

    /**
     * (Optional) Network password. Can be omitted if the network does not require a password.
     */
    password?: string;

    /**
     * (Optional) Authentication type. Can be 'WEP', 'WPA', or 'nopass' for no password.
     * Can be omitted to indicate no password as well.
     */
    type?: WifiAuthenticationType;

    /**
     * (Optional) Hidden network. If `true`, indicates that the network is not broadcasting
     * its SSID.
     */
    hidden?: boolean;
}

/**
 * Escape a tag value. Special characters are `,`, `\`, `;`, and `:` and will be prefixed by a backslash.
 *
 * @param value
 */
const escapeTagValue = (value: string): string => {
    const n = (value || '').replace(/[\\\;\:\,]/g, '\\$&');
    return n;
};

/**
 * Encodes a single tag, escaping special characters.
 *
 * @param tag
 * @param value
 * @param required
 *
 * @throws an Error if the tag is marked 'required' but the tag value is falsy
 *
 * @returns a string representing the tag if the value is defined, or `null` if the value is not defined
 */
const encodeTag = (tag: string, value?: string, required?: boolean): string | null => {
    if (required && !value) throw new Error(`Tag ${tag} requires a value`);
    return value ? `${tag}:${escapeTagValue(value)}` : null;
};

/**
 * Encodes WIFI config in a MeCard-like syntax that is accepted by iOS 11+ and Android 10+.
 * Special characters are automatically escaped.
 *
 * @param config
 *
 * @returns a string containing the encoded WIFI config
 */
export const encodeWifiConfig = (config: WifiConfig): string => {
    const type = encodeTag('T', config.type);
    const ssid = encodeTag('S', config.ssid, true);
    const password = encodeTag('P', config.password);
    const hidden = encodeTag('H', config.hidden ? 'true' : '');

    const payload = [type, ssid, password, hidden].filter(Boolean).join(';');

    return `WIFI:${payload};;`;
};

export const createQRCode = (config: WifiConfig, qrOptions?: QRCode.QRCodeOptions): WifiQRCode => {
    const code = QRCode.create(encodeWifiConfig(config), qrOptions || {});
    return new WifiQRCode(code);
};

class WifiQRCode {
    private code: QRCode.QRCode;

    constructor(qrCode: QRCode.QRCode) {
        this.code = qrCode;
    }

    async toHtmlCanvas(
        element: HTMLCanvasElement,
        opts?: QRCode.QRCodeRenderersOptions
    ): Promise<any> {
        return QRCode.toCanvas(element, this.code.segments, opts);
    }

    async toFile(path: string, opts?: QRCode.QRCodeToFileOptions): Promise<any> {
        return QRCode.toFile(path, this.code.segments, opts);
    }

    async toFileStream(stream: Writable, opts?: QRCode.QRCodeToFileStreamOptions): Promise<any> {
        return QRCode.toFileStream(stream, this.code.segments, opts);
    }
}
