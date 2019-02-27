import React from 'react';

import {getNumberWithCommas} from '../../lib/utils.js';
import {pixelate, reduceToTenOrFewerColors} from '../../lib/pixelator.js';

import {Cell, CellWrapper, PixelatedImageWrapper, PixelatedImageWrappers} from './index.styles';

const PIXEL_DIMENSIONS = {
  width: 14,
  height: 14,
};

const RANDOM_WORKS_OF_ART_FILENAMES = [
  'americanGothic.jpg',
  'fridaKahlo.jpg',
  'greatWave.jpg',
  'monaLisa.jpg',
  'mondrian.jpg',
  'pearlEarring.jpg',
  'persistenceOfMemory.jpg',
  'starryNight.jpg',
  'theScream.jpg',
  'theSonOfMan.jpg',
  'sunflowers.jpg',
];

class HomeScreen extends React.Component {
  state = {
    original: null,
    tenOrLess: null,
    errorMessage: null,
  };

  componentDidMount() {
    const state = {
      errorMessage: null,
    };

    return fetch(`/images/${RANDOM_WORKS_OF_ART_FILENAMES[3]}`)
      .then((res) => res.blob())
      .then(this.setSourceImageFromFileBlob)
      .then((sourceImage) => pixelate(sourceImage.fileUrl, PIXEL_DIMENSIONS))
      .then(({hexValues, rawPixelBlocks, pixelHexValueIndexes}) => {
        state.original = {
          hexValues,
          pixelHexValueIndexes,
        };

        return reduceToTenOrFewerColors(rawPixelBlocks);
      })
      .then(({hexValues, pixelHexValueIndexes}) => {
        state.tenOrLess = {
          hexValues,
          pixelHexValueIndexes,
        };

        this.setState(state);
      })
      .catch((error) => {
        this.setState({
          errorMessage: error.message,
        });
      });
  }

  setSourceImageFromFileBlob = (fileBlob) => {
    return new Promise((resolve, reject) => {
      const fileUrl = URL.createObjectURL(fileBlob);

      var img = new Image();

      img.src = fileUrl;

      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        resolve({
          width,
          height,
          fileUrl,
          fileBlob,
        });
      };

      img.onerror = (event) => {
        const errorMessage = 'Failed to set source image.';
        console.error(errorMessage, event);
        reject(new Error(errorMessage));
      };
    });
  };

  render() {
    const {original, tenOrLess, errorMessage} = this.state;

    if (errorMessage) {
      return <p>ERROR! {errorMessage}</p>;
    } else if (original === null && tenOrLess === null) {
      return <p>Pixelating...</p>;
    }

    const numRows = original.pixelHexValueIndexes.length;
    const numColumns = original.pixelHexValueIndexes[0].length;

    const originalCells = [];
    original.pixelHexValueIndexes.forEach((row, rowId) => {
      row.forEach((hexValueIndex, columnId) => {
        originalCells.push(
          <CellWrapper key={`original-cell-${rowId}-${columnId}`}>
            <Cell hexValue={original.hexValues[hexValueIndex]} />
          </CellWrapper>
        );
      });
    });

    const tenOrLessCells = [];
    tenOrLess.pixelHexValueIndexes.forEach((row, rowId) => {
      row.forEach((hexValueIndex, columnId) => {
        tenOrLessCells.push(
          <CellWrapper key={`ten-or-less-cell-${rowId}-${columnId}`}>
            <Cell hexValue={tenOrLess.hexValues[hexValueIndex]} />
          </CellWrapper>
        );
      });
    });

    return (
      <>
        <p>
          {numRows} &times; {numColumns} ({getNumberWithCommas(numRows * numColumns)} cells)
        </p>

        <PixelatedImageWrappers>
          <PixelatedImageWrapper
            numRows={numRows}
            numColumns={numColumns}
            cellWidth={12}
            cellHeight={12}
          >
            {originalCells}
          </PixelatedImageWrapper>
          <PixelatedImageWrapper
            numRows={numRows}
            numColumns={numColumns}
            cellWidth={12}
            cellHeight={12}
          >
            {tenOrLessCells}
          </PixelatedImageWrapper>
        </PixelatedImageWrappers>
      </>
    );
  }
}

export default HomeScreen;
