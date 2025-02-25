const { isObject, isNumber, isString } = require('lodash');
const winston = require('winston');

const CONSTANTS = {
    // Maximum size for log file (10 MB)
    MAX_LOG_SIZE_10_MB: 10000000,
};

interface ILogInfo {
    timestamp: Date;
    label: string;
    level: string;
    message: string;
    durationMs: number;
}

const logToConsole = true;

function removeLastLineBreak(s: string) {
    return isString(s) ? s.replace(/\n$/, '') : '';
}

/**
 * Formats the log output, in order to include the timestamp, label, log level and the message. Also it's possible see
 * the duration when it's used the profiler.
 *
 * E.g:
 * 2018-02-24T20:20:20.202Z [label] level: message | durationMs ms
 *
 * @param {object} info
 * @returns {string}
 */
function formatLoggerOutput(info: ILogInfo) {
    let { timestamp, label, level, message, durationMs } = info;

    return `${timestamp} [${label}] ${level}: ${removeLastLineBreak(message)} ${
        isNumber(durationMs) ? `| ${durationMs} ms` : ''
    }`;
}

// Winston logger configuration
const logger = winston.createLogger({
    level: 'info',
    transports: [
        // Configures the log file
        new winston.transports.File({
            filename: 'list-webserver.log',
            maxsize: CONSTANTS.MAX_LOG_SIZE_10_MB,
            maxFiles: 1,
            tailable: true,
            format: winston.format.combine(winston.format.timestamp(), winston.format.printf(formatLoggerOutput)),
        }),
    ],
});

if (logToConsole) {
    logger.add(
        // Configures the console logger
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                winston.format.printf(formatLoggerOutput)
            ),
        })
    );
}

/**
 * The export returns a function which returns an object.
 * That object returns these methods:
 *  - info    - logs information messages
 *  - warn    - logs warning messages
 *  - error   - logs error messages
 *  - profile - logs profiling messages
 *  - restAPILogger - logs the user requests
 *
 *  Example of usage:
 *
 *  // logs: 2018-02-24T20:20:20.202Z [label-example] info: Hello world!
 *  logger('label-example').info('Hello world!');
 *
 * @param {string} label
 * @returns {object}
 */

export default (label: string) => ({
    info: (msg: unknown) => logger.log({ label: label, level: 'info', message: msg }),
    warn: (msg: unknown) => logger.log({ label: label, level: 'warn', message: msg }),
    error: (msg: unknown) => logger.log({ label: label, level: 'error', message: msg }),
    profile: (msg: unknown) => logger.profile({ label: label, message: msg }),
    restAPILogger: { write: (msg: unknown) => logger.log({ label: label, level: 'info', message: msg }) },
});
