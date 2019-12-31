#!/usr/bin/env ts-node

import commander from 'commander';
import { readFileSync } from 'fs';
import { createQRCode, WifiConfig } from './index';

const NOPASS_TYPE = 'nopass';
const VALID_AUTH_TYPES = ['WPA', 'WEP', NOPASS_TYPE];
const VALID_OUTPUT_TYPES = ['png', 'svg', 'utf8'];

const getCommand = (): commander.Command => {
    return commander
        .description(
            'Command-line util to generate a QR code image that allows mobile devices to connect to a Wifi network'
        )
        .arguments('<path>')
        .requiredOption('-s, --ssid <ssid>', 'The SSID of the network')
        .option('-h, --hidden', 'Indicates that the network does not broadcast its SSID')
        .option(
            '-t, --type <type>',
            `Authentication type, one of [${VALID_AUTH_TYPES.join(
                ','
            )}]. If omitted, no password is assumed.`,
            (value: string): string => {
                if (!VALID_AUTH_TYPES.includes(value))
                    throw new Error(
                        `"${value}" is not a valid auth type; must be one of [${VALID_AUTH_TYPES.join(
                            ','
                        )}]`
                    );
                return value;
            },
            NOPASS_TYPE
        )
        .option(
            '-p, --password <password>',
            'The password; alternately, provide the password via stdin'
        )
        .option(
            '-o, --output <outputType>',
            `Output image type, one of [${VALID_OUTPUT_TYPES.join(
                ','
            )}]. If omitted, type will be guessed from the output file ext.`,
            (value: string): string => {
                if (!VALID_OUTPUT_TYPES.includes(value))
                    throw new Error(
                        `"${value}" is not a valid output type; must be one of [${VALID_OUTPUT_TYPES.join(
                            ','
                        )}]`
                    );
                return value;
            }
        )
        .option('-w, --width <width>', 'Width (in pixels) of the output image')
        .action((outputPath: string) => {
            console.log('doing it ', outputPath);
            if (!outputPath) throw new Error('An output path must be provided!');
        });
};

const parsePassword = (command: commander.Command): string | undefined => {
    let { password } = command;
    if (!password) {
        if (command.type !== NOPASS_TYPE) {
            console.log('No password provided via command-line argument; enter it now...');
            console.log('Press Return and then Ctrl-d when done.');
            const rawInput = readFileSync(0, 'utf8'); // Read password from stdin;
            password = rawInput.trim();
            if (!password)
                throw new Error(`A password is required when auth type is "${command.type}"`);
        }
    }
    return password;
};

const main = async () => {
    const command = getCommand().parse(process.argv);
    if (command.args.length < 1) return command.outputHelp();
    const { ssid, type, hidden, output, width } = command;
    const [outputPath] = command.args;
    const password = parsePassword(command);

    const config: WifiConfig = {
        ssid,
        password,
        type,
        hidden,
    };

    const code = createQRCode(config);

    await code.toFile(outputPath, {
        width,
        type: output,
    });

    console.log(`Wrote QR code to ${outputPath}`);
};

main().catch((err) => {
    console.log(err.message);
    process.exit(1);
});
