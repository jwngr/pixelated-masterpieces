import _ from 'lodash';
import getPixels from 'get-pixels';

import {hexToRgb, rgbToHex, compareDistance, compareDistance2} from './utils.js';
import {
  RUSTOLEUM_ENAMEL_SPRAY_PAINT_COLORS,
  RUSTOLEUM_2X_ULTRA_COVER_GLOSS_SPRAY_PAINT_COLORS,
} from './constants.js';

const INITIAL_COLOR_MATCH_DISTANCE = 1;

const pixelate = (file, pixelDimensions) => {
  let errorMessage;
  if (typeof file !== 'string') {
    errorMessage = 'Source file must be provided.';
  } else if (!Number.isInteger(pixelDimensions.width) || pixelDimensions.width < 1) {
    errorMessage = 'Pixel width must be a positive integer.';
  } else if (!Number.isInteger(pixelDimensions.height) || pixelDimensions.height < 1) {
    errorMessage = 'Pixel height must be a positive integer.';
  }

  if (typeof errorMessage !== 'undefined') {
    return Promise.reject(new Error(errorMessage));
  }

  return new Promise((resolve, reject) => {
    getPixels(file, (error, pixels) => {
      if (error) {
        return reject(error);
      }

      // Get the dimensions of the source image.
      const [sourceImageWidth, sourceImageHeight] = pixels.shape;

      // Get the dimensions of the target image.
      const targetImageWidth = Math.ceil(sourceImageWidth / pixelDimensions.width);
      const targetImageHeight = Math.ceil(sourceImageHeight / pixelDimensions.height);

      // Create a 2D array to store each pixel's hex value.
      const rawPixelBlocks = _.range(0, targetImageHeight).map(() => []);

      // Keep track of each hex value.
      const hexValuesSet = new Set();

      // Loop through each pixel in the desination image.
      for (let yCoord = 0; yCoord < targetImageHeight; ++yCoord) {
        for (let xCoord = 0; xCoord < targetImageWidth; ++xCoord) {
          // We may be reducing a block of pixels into a single pixel if the pixel width or height
          // is greater than 1, so loop through each pixel in the current block and calculate their
          // average RGB components.
          let pixelCount = 0;
          let totalR = 0;
          let totalG = 0;
          let totalB = 0;

          for (var offsetX = 0; offsetX < pixelDimensions.width; offsetX++) {
            for (var offsetY = 0; offsetY < pixelDimensions.height; offsetY++) {
              const mappedXCoord = xCoord * pixelDimensions.width + offsetX;
              const mappedYCoord = yCoord * pixelDimensions.height + offsetY;

              const currentR = pixels.get(mappedXCoord, mappedYCoord, 0);
              const currentG = pixels.get(mappedXCoord, mappedYCoord, 1);
              const currentB = pixels.get(mappedXCoord, mappedYCoord, 2);

              if (
                typeof currentR !== 'undefined' &&
                typeof currentG !== 'undefined' &&
                typeof currentB !== 'undefined'
              ) {
                totalR += currentR;
                totalG += currentG;
                totalB += currentB;
                pixelCount++;
              }
            }
          }

          // Convert the average RGB components into a hex value and store it in the pixel hex
          // values 2D array.
          const averageR = Math.round(totalR / pixelCount);
          const averageG = Math.round(totalG / pixelCount);
          const averageB = Math.round(totalB / pixelCount);

          const hexValue = rgbToHex(averageR, averageG, averageB);

          hexValuesSet.add(hexValue);

          rawPixelBlocks[yCoord][xCoord] = {
            red: averageR,
            green: averageG,
            blue: averageB,
            hex: hexValue,
          };
        }
      }

      const hexValuesArray = Array.from(hexValuesSet);

      const pixelHexValueIndexes = _.range(0, rawPixelBlocks.length).map(() => []);

      rawPixelBlocks.forEach((row, i) => {
        row.forEach(({hex: hexValue}, j) => {
          pixelHexValueIndexes[i][j] = hexValuesArray.indexOf(hexValue);
        });
      });

      return resolve({
        hexValues: hexValuesArray,
        rawPixelBlocks,
        pixelHexValueIndexes,
      });
    });
  });
};

const reduceToColorCount = (rawPixelBlocks, maxColorCount) => {
  const targetImageHeight = _.size(rawPixelBlocks);
  const targetImageWidth = _.size(rawPixelBlocks[0]);

  // We only have 10 unique digits to work with in our final image. So, we need to create
  // another 2D array of the same size to store each pixel's hex value, but consolidate the
  // colors to at most 10 unique hex values.
  const finalPixelBlocks = _.range(0, rawPixelBlocks.length).map(() => []);

  // Loop through each existing raw pixel block and, if it is within a certain distance of
  // another pixel block already seen, change its color. Until the resulting 2D contains at most
  // 10 unique hex values, keep increasing the color distance.
  let uniqueBlocks = [];
  let requiredColorMatchDistance = INITIAL_COLOR_MATCH_DISTANCE;
  while (uniqueBlocks.length === 0 || uniqueBlocks.length > maxColorCount) {
    uniqueBlocks = [];

    for (let i = 0; i < targetImageHeight; i++) {
      for (let j = 0; j < targetImageWidth; j++) {
        let rawPixelBlock = rawPixelBlocks[i][j];

        let minExistingColorMatchDistance = requiredColorMatchDistance;

        // Determine which of the existing unique blocks is closest to the raw pixel block,
        // assuming any of them are closer than the required distance.
        let normalizedPixelBlock = _.clone(rawPixelBlock);
        uniqueBlocks.forEach((blockToCompare) => {
          const distance = compareDistance(rawPixelBlock, blockToCompare);

          if (distance < minExistingColorMatchDistance) {
            normalizedPixelBlock = blockToCompare;
            minExistingColorMatchDistance = distance;
          }
        });

        finalPixelBlocks[i][j] = normalizedPixelBlock;

        if (!_.includes(uniqueBlocks, normalizedPixelBlock)) {
          uniqueBlocks.push(normalizedPixelBlock);
        }
      }
    }

    requiredColorMatchDistance += 1;
  }

  const hexValues = uniqueBlocks.map(({hex}) => hex);

  const pixelHexValueIndexes = _.range(0, finalPixelBlocks.length).map(() => []);

  finalPixelBlocks.forEach((row, i) => {
    row.forEach(({hex: hexValue}, j) => {
      pixelHexValueIndexes[i][j] = hexValues.indexOf(hexValue);
    });
  });

  return {
    hexValues,
    pixelHexValueIndexes,
  };
};

const _reduceToRustoleumSprayPaintColorsHelper = (rawPixelBlocks, rustoleumColors) => {
  const targetImageHeight = _.size(rawPixelBlocks);
  const targetImageWidth = _.size(rawPixelBlocks[0]);

  // Keep track of each hex value.
  const hexValuesSet = new Set();

  // We only have 10 unique digits to work with in our final image. So, we need to create
  // another 2D array of the same size to store each pixel's hex value, but consolidate the
  // colors to at most 10 unique hex values.
  const finalPixelBlocks = _.range(0, rawPixelBlocks.length).map(() => []);

  // Loop through the Rustoleum colors and determine which one is closest to the raw hex value.
  for (let i = 0; i < targetImageHeight; i++) {
    for (let j = 0; j < targetImageWidth; j++) {
      let normalizedPixelBlock = null;
      let minColorMatchDistance = Infinity;

      const shouldLog = i === 0 && j === 4;

      const values = [];
      if (shouldLog) {
        console.log('ACTUAL:', rawPixelBlocks[i][j].hex);
      }

      rustoleumColors.forEach((rustoleumHexValue) => {
        if (shouldLog) {
          console.log('HEX:', rustoleumHexValue);
        }

        const rustoleumBlock = {
          hex: rustoleumHexValue,
          ...hexToRgb(rustoleumHexValue),
        };

        const distance = compareDistance2(rawPixelBlocks[i][j], rustoleumBlock);

        if (shouldLog) {
          values.push({hex: rustoleumHexValue, distance});
          console.log(rustoleumHexValue, distance);
        }

        if (distance < minColorMatchDistance) {
          normalizedPixelBlock = rustoleumBlock;
          minColorMatchDistance = distance;
        }
      });

      if (shouldLog) {
        console.log(JSON.stringify(_.sortBy(values, 'distance')));
      }

      finalPixelBlocks[i][j] = normalizedPixelBlock;

      hexValuesSet.add(normalizedPixelBlock.hex);
    }
  }

  const hexValuesArray = Array.from(hexValuesSet);

  const pixelHexValueIndexes = _.range(0, finalPixelBlocks.length).map(() => []);

  finalPixelBlocks.forEach((row, i) => {
    row.forEach(({hex: hexValue}, j) => {
      pixelHexValueIndexes[i][j] = hexValuesArray.indexOf(hexValue);
    });
  });

  return {
    pixelHexValueIndexes,
    hexValues: hexValuesArray,
  };
};

const reduceToRustoleumEnamelSprayPaintColors = (rawPixelBlocks) => {
  return _reduceToRustoleumSprayPaintColorsHelper(
    rawPixelBlocks,
    RUSTOLEUM_ENAMEL_SPRAY_PAINT_COLORS
  );
};

const reduceToRustoleum2XUltraCoverGlossSprayPaintColors = (rawPixelBlocks) => {
  return _reduceToRustoleumSprayPaintColorsHelper(
    rawPixelBlocks,
    RUSTOLEUM_2X_ULTRA_COVER_GLOSS_SPRAY_PAINT_COLORS
  );
};

export {
  pixelate,
  reduceToColorCount,
  reduceToRustoleumEnamelSprayPaintColors,
  reduceToRustoleum2XUltraCoverGlossSprayPaintColors,
};
