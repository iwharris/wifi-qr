import QRCode from 'qrcode';
import { Writable } from 'stream';
import { encodeWifiConfig, createQRCode, WifiConfig } from '../src/index';

describe('index', () => {
    describe('#encodeWifiConfig', () => {
        it('should encode various tags', () => {
            const config: WifiConfig = {
                ssid: 'test ssid',
                password: 'pass',
                type: 'WPA',
                hidden: false,
            };

            const encoded = encodeWifiConfig(config);

            expect(encoded).toBe('WIFI:T:WPA;S:test ssid;P:pass;;');
        });

        it('should include "H:true" for a hidden network', () => {
            const config: WifiConfig = {
                ssid: 'test ssid',
                password: 'pass',
                type: 'WPA',
                hidden: true,
            };

            const encoded = encodeWifiConfig(config);

            expect(encoded).toBe('WIFI:T:WPA;S:test ssid;P:pass;H:true;;');
        });

        it('should encode a minimal config', () => {
            const config: WifiConfig = {
                ssid: 'test ssid',
            };

            const encoded = encodeWifiConfig(config);

            expect(encoded).toBe('WIFI:S:test ssid;;');
        });

        it('should omit non-required tags with empty strings', () => {
            const config: WifiConfig = {
                ssid: 'test ssid',
                type: 'WPA',
                password: '',
            };

            const encoded = encodeWifiConfig(config);

            expect(encoded).toBe('WIFI:T:WPA;S:test ssid;;');
        });

        it('should throw an error if a required tag is empty', () => {
            const config: WifiConfig = {
                ssid: '',
            };

            expect(() => encodeWifiConfig(config)).toThrowError(/Tag \w+ requires a value/);
        });

        it('should escape special characters in tags', () => {
            const config: WifiConfig = {
                ssid: 'test,ssid',
                password: 'weird;password\\with:special,characters',
                type: 'WPA',
            };

            const encoded = encodeWifiConfig(config);

            expect(encoded).toBe(
                'WIFI:T:WPA;S:test\\,ssid;P:weird\\;password\\\\with\\:special\\,characters;;'
            );
        });
    });

    describe('#createQRCode', () => {
        const config: WifiConfig = {
            ssid: 'test',
            password: 'pass',
            type: 'WPA',
        };

        it('should expose its inner QR code', () => {
            const wrapper = createQRCode(config);
            expect(wrapper.code).toBeDefined();
        });

        it('should export to an HTML canvas', async () => {
            const stub = jest.spyOn(QRCode, 'toCanvas').mockImplementation(() => Promise.resolve());
            const canvas: HTMLCanvasElement = {} as any;
            const options: QRCode.QRCodeRenderersOptions = { width: 123 };
            const wrapper = createQRCode(config);

            const promise = wrapper.toHtmlCanvas(canvas, options);

            await expect(promise).resolves.toBeUndefined();

            expect(stub).toBeCalledTimes(1);
            expect(stub).toBeCalledWith(canvas, wrapper.code.segments, options);

            stub.mockRestore();
        });

        it('should export to a file', async () => {
            const stub = jest.spyOn(QRCode, 'toFile').mockImplementation(() => Promise.resolve());
            const filePath = '/tmp/test.png';
            const options: QRCode.QRCodeToFileOptions = { width: 123 };
            const wrapper = createQRCode(config);

            const promise = wrapper.toFile(filePath, options);

            await expect(promise).resolves.toBeUndefined();

            expect(stub).toBeCalledTimes(1);
            expect(stub).toBeCalledWith(filePath, wrapper.code.segments, options);

            stub.mockRestore();
        });

        it('should export to a PNG file stream', async () => {
            const stub = jest
                .spyOn(QRCode, 'toFileStream')
                .mockImplementation(() => Promise.resolve());
            const stream = new Writable();
            const options: QRCode.QRCodeToFileStreamOptions = { width: 123 };
            const wrapper = createQRCode(config);

            const promise = wrapper.toPngStream(stream, options);

            await expect(promise).resolves.toBeUndefined();

            expect(stub).toBeCalledTimes(1);
            expect(stub).toBeCalledWith(stream, wrapper.code.segments, options);

            stub.mockRestore();
        });
    });
});
