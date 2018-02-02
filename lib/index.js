const fs = require('fs');
const { SmartBuffer } = require('smart-buffer');
const tinycolor = require('tinycolor2');

/**
 * Extract the color palette from the given file.
 *
 * @param {string} file The path to the color palette file
 * @return {Promise<Object>} The extracted color palette object
 */
function extract(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        return reject(err);
      }

      const reader = new SmartBuffer(data);

      reader.skip(16); // Maybe the palette identifier?
      reader.skip(4); // Seems to always be `1`

      // Palette unique name
      const uniqueNameLength = reader.readUInt32LE();
      const uniqueName = reader.readString(uniqueNameLength);

      // Palette options
      const optionsLength = reader.readUInt32LE();
      const options = {};

      if (optionsLength) {
        const optionsContents = reader.readStringNT();
        const optionPairs = optionsContents.trim().split('\n');

        optionPairs.forEach((optionsPair) => {
          const [name, value] = optionsPair.split('=');

          options[name] = value;
        });
      }

      // Maybe this data is something else? The alpha channel seems to be ignored
      const colorSize = reader.readUInt32LE();

      // Palette colors
      const colorsCount = reader.readUInt32LE();
      const colors = [];

      for (let i = 0; i < colorsCount; i++) {
        // Colors are in BGRA format
        const color = tinycolor({
          b: reader.readUInt8(),
          g: reader.readUInt8(),
          r: reader.readUInt8(),
          a: reader.readUInt8(),
        });

        colors.push(color.toHex());
      }

      // Build the proper color palette
      const palette = {
        uniqueName,
        options,
        colors,
      };

      return resolve(palette);
    });
  });
}

module.exports = extract;
