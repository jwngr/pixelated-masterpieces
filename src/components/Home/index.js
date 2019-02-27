import React from 'react';

import {pixelate} from '../../lib/pixelator.js';
import {getNumberWithCommas} from '../../lib/utils.js';

import {Cell, CellWrapper, PixelatedImageWrapper} from './index.styles';

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
    hexValues: null,
    errorMessage: null,
    pixelHexValueIndexes: null,
  };

  componentDidMount() {
    return fetch(`/images/${RANDOM_WORKS_OF_ART_FILENAMES[3]}`)
      .then((res) => {
        return res.blob();
      })
      .then(this.setSourceImageFromFileBlob)
      .then((sourceImage) => {
        return pixelate(sourceImage.fileUrl, PIXEL_DIMENSIONS);
      })
      .then(({hexValues, pixelHexValueIndexes}) => {
        console.log(hexValues, pixelHexValueIndexes);
        this.setState({
          hexValues,
          errorMessage: null,
          pixelHexValueIndexes,
        });
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
    const {hexValues, errorMessage, pixelHexValueIndexes} = this.state;

    if (errorMessage) {
      return <p>ERROR! {errorMessage}</p>;
    } else if (hexValues === null && pixelHexValueIndexes === null) {
      return <p>Pixelating...</p>;
    }

    const numRows = pixelHexValueIndexes.length;
    const numColumns = pixelHexValueIndexes[0].length;

    const editorCells = [];
    pixelHexValueIndexes.forEach((row, rowId) => {
      row.forEach((hexValueIndex, columnId) => {
        const hexValue = hexValues[hexValueIndex];

        editorCells.push(
          <CellWrapper key={`cell-${rowId}-${columnId}`}>
            <Cell hexValue={hexValue} />
          </CellWrapper>
        );
      });
    });

    return (
      <>
        <p>
          {numRows} &times; {numColumns} ({getNumberWithCommas(numRows * numColumns)} cells)
        </p>
        <PixelatedImageWrapper
          numRows={numRows}
          numColumns={numColumns}
          cellWidth={12}
          cellHeight={12}
        >
          {editorCells}
        </PixelatedImageWrapper>
      </>
    );
  }
}

export default HomeScreen;
