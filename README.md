# wifi-qr

A library and command-line utility for generating QR codes with embedded wifi credentials

## Demo

https://iwharris.github.io/wifi-qr-web

## Background

Wifi QR codes are readable by iOS 11+ and Android 10+ devices. The QR codes embed the network SSID, auth type, and password, making it easy to share credentials with guests, for example. Long passwords can be deployed and shared easily with this method.

## Installation

```bash
npm install -g wifi-qr
```

## Usage

Providing a password via command-line argument:

```bash
wifi-qr --ssid "my network ssid" --password "my network password" --type wpa qr.png
```

Providing a password via stdin:

```bash
echo "my network password" > password.txt
wifi-qr --ssid "my network ssid" --type wpa qr.png < password.txt
```

SVG and PNG output formats are supported.

Run `wifi-qr --help` for more information about the command-line interface.

## Development

Compile Typescript:

```bash
npm run compile
```

Check code formatting:

```bash
npm run prettier
# or, to automatically fix formatting
npm run prettier:fix
```
