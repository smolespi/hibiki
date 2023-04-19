/**
 * @file Constants
 * @description Globally used string and regexes
 * @module utils/constants
 */

// A regex for file types that can be ESM modules
export const moduleFiletypeRegex = /\.(cjs|mjs|js|mts|cts|ts)$/i;

// A regex for valid slash command names
export const slashCommandNameRegex = /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;

// The version of Hibiki currently running
export const hibikiVersion = process.env.npm_package_version ?? "develop";

export enum HibikiColors {
  // Gold primary
  GENERAL = 0xff_b0_00,

  // Success pink
  SUCCESS = 0xdc_26_7f,

  // Orange error
  ERROR = 0xfe_61_00,
}
