import _ from 'lodash';
import React from 'react';

import {getNumberWithCommas} from '../../lib/utils.js';
import {
  pixelate,
  reduceToColorCount,
  reduceToRustoleumEnamelSprayPaintColors,
  reduceToRustoleum2XUltraCoverGlossSprayPaintColors,
} from '../../lib/pixelator.js';

import {
  Cell,
  Swatch,
  CellWrapper,
  SwatchWrapper,
  PixelateButton,
  PixelatedImageWrapper,
  PixelatedImageWrappers,
} from './index.styles';

const PIXEL_DIMENSIONS = {
  width: 6,
  height: 6,
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
    pixelateButtonClicked: false,
    rustoleum2XUltraCoverGloss: null,
  };

  generatePixelatedImages = () => {
    this.setState({
      pixelateButtonClicked: true,
    });

    const state = {
      errorMessage: null,
    };

    return fetch(`/images/${RANDOM_WORKS_OF_ART_FILENAMES[10]}`)
      .then((res) => res.blob())
      .then(this.setSourceImageFromFileBlob)
      .then((sourceImage) => pixelate(sourceImage.fileUrl, PIXEL_DIMENSIONS))
      .then(({hexValues, rawPixelBlocks, pixelHexValueIndexes}) => {
        state.original = {
          hexValues,
          pixelHexValueIndexes,
        };

        return Promise.all([
          reduceToColorCount(rawPixelBlocks, 30),
          reduceToRustoleumEnamelSprayPaintColors(rawPixelBlocks),
          reduceToRustoleum2XUltraCoverGlossSprayPaintColors(rawPixelBlocks),
        ]);
      })
      .then(([tenOrLess, rustoleumEnamel, rustoleum2XUltraCoverGloss]) => {
        state.tenOrLess = tenOrLess;
        state.rustoleumEnamel = rustoleumEnamel;
        state.rustoleum2XUltraCoverGloss = rustoleum2XUltraCoverGloss;

        this.setState(state);
      })
      .catch((error) => {
        this.setState({
          errorMessage: error.message,
        });
      });
  };

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
    const {
      original,
      tenOrLess,
      errorMessage,
      rustoleumEnamel,
      pixelateButtonClicked,
      rustoleum2XUltraCoverGloss,
    } = this.state;

    if (errorMessage) {
      return <p>ERROR! {errorMessage}</p>;
    } else if (!pixelateButtonClicked) {
      return <PixelateButton onClick={this.generatePixelatedImages}>Pixelate!</PixelateButton>;
    } else if (
      pixelateButtonClicked &&
      original === null &&
      tenOrLess === null &&
      rustoleum2XUltraCoverGloss === null
    ) {
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

    const rustoleum2XUltraCoverGlossCells = [];
    rustoleum2XUltraCoverGloss.pixelHexValueIndexes.forEach((row, rowId) => {
      row.forEach((hexValueIndex, columnId) => {
        rustoleum2XUltraCoverGlossCells.push(
          <CellWrapper key={`rustoleum-2x-ultra-cover-gloss-cell-${rowId}-${columnId}`}>
            <Cell
              onClick={() => {
                console.log(rowId, columnId, rustoleum2XUltraCoverGloss.hexValues[hexValueIndex]);
              }}
              hexValue={rustoleum2XUltraCoverGloss.hexValues[hexValueIndex]}
            />
          </CellWrapper>
        );
      });
    });

    const rustoleumEnamelCells = [];
    rustoleum2XUltraCoverGloss.pixelHexValueIndexes.forEach((row, rowId) => {
      row.forEach((hexValueIndex, columnId) => {
        rustoleumEnamelCells.push(
          <CellWrapper key={`rustoleum-2x-ultra-cover-gloss-cell-${rowId}-${columnId}`}>
            <Cell
              onClick={() => {
                console.log(rowId, columnId, rustoleumEnamel.hexValues[hexValueIndex]);
              }}
              hexValue={rustoleumEnamel.hexValues[hexValueIndex]}
            />
          </CellWrapper>
        );
      });
    });

    const startHexValue = '#51704d';
    // const hexValueDistances = [
    //   {hex: '#474a59', distance: 9.3021944442652},
    //   {hex: '#403d3a', distance: 12.909448132391905},
    //   {hex: '#787878', distance: 13.267812871298705},
    //   {hex: '#17855b', distance: 14.321333818204094},
    //   {hex: '#45342a', distance: 15.960029530418042},
    //   {hex: '#263039', distance: 18.034952607948107},
    //   {hex: '#a76e5b', distance: 19.732934314367256},
    //   {hex: '#998679', distance: 19.743322803801988},
    //   {hex: '#a1886b', distance: 20.093335971285434},
    //   {hex: '#026525', distance: 20.202740191986287},
    //   {hex: '#4c1f22', distance: 20.794176966631667},
    //   {hex: '#23272a', distance: 21.081851067789195},
    //   {hex: '#004925', distance: 22.27828376387634},
    //   {hex: '#522b00', distance: 23.41037427035607},
    //   {hex: '#851835', distance: 23.77216820218417},
    //   {hex: '#085393', distance: 23.821713801548924},
    //   {hex: '#009d88', distance: 24.871320761818577},
    //   {hex: '#01253d', distance: 25.09088950450204},
    //   {hex: '#061e58', distance: 25.28322205420048},
    //   {hex: '#00779a', distance: 25.353075130188156},
    //   {hex: '#2e1a0c', distance: 25.661565723894725},
    //   {hex: '#187db0', distance: 26.031458014420352},
    //   {hex: '#02390d', distance: 26.171880334844836},
    //   {hex: '#75b4a4', distance: 26.295962366993844},
    //   {hex: '#004701', distance: 26.806630001195927},
    //   {hex: '#271304', distance: 28.407246919754698},
    //   {hex: '#006cb3', distance: 29.503994824838873},
    //   {hex: '#7f0011', distance: 30.594938095840288},
    //   {hex: '#041507', distance: 31.298933238015554},
    //   {hex: '#8f0208', distance: 32.57892948151815},
    //   {hex: '#b0b1ab', distance: 33.64788152017668},
    //   {hex: '#b40127', distance: 34.75698759379039},
    //   {hex: '#e56716', distance: 35.806019023817406},
    //   {hex: '#000000', distance: 35.82319492136287},
    //   {hex: '#c40826', distance: 36.1990028488855},
    //   {hex: '#be0027', distance: 36.415729350082},
    //   {hex: '#d3c196', distance: 38.41669721138911},
    //   {hex: '#cf1c00', distance: 38.4640384049375},
    //   {hex: '#f1b230', distance: 39.73318677095088},
    //   {hex: '#d50500', distance: 42.23780040020668},
    //   {hex: '#a4cee6', distance: 44.78951013200439},
    //   {hex: '#f7db00', distance: 47.99397629766893},
    //   {hex: '#e8e5c4', distance: 50.955750706397644},
    //   {hex: '#f8f1d5', distance: 56.840653811067426},
    //   {hex: '#fff7ee', distance: 61.76605455525156},
    //   {hex: '#ffffff', distance: 64.99598268325661},
    // ];
    const hexValueDistances = [
      {hex: '#474a59', distance: 79.95623803056269},
      {hex: '#787878', distance: 93.31666517830564},
      {hex: '#17855b', distance: 98.60020283954795},
      {hex: '#403d3a', distance: 109.73604694903129},
      {hex: '#45342a', distance: 134.31678971744373},
      {hex: '#026525', distance: 136.05513588247965},
      {hex: '#a76e5b', distance: 137.41178988718545},
      {hex: '#998679', distance: 139.95713629536723},
      {hex: '#a1886b', distance: 142.828568570857},
      {hex: '#263039', distance: 147.02380759591284},
      {hex: '#004925', distance: 157.42617317333227},
      {hex: '#085393', distance: 169.637849550152},
      {hex: '#23272a', distance: 171.51967817133985},
      {hex: '#00779a', distance: 176.57859439920796},
      {hex: '#4c1f22', distance: 176.84173715500535},
      {hex: '#009d88', distance: 179.26795586495652},
      {hex: '#522b00', distance: 186.87428929630744},
      {hex: '#187db0', distance: 187.6006396577581},
      {hex: '#01253d', distance: 192.48636315334133},
      {hex: '#02390d', distance: 192.87560758167425},
      {hex: '#004701', distance: 193.06475597581243},
      {hex: '#851835', distance: 197.48164471666726},
      {hex: '#061e58', distance: 198.600100704909},
      {hex: '#75b4a4', distance: 203.31994491441316},
      {hex: '#006cb3', distance: 209.16022566444127},
      {hex: '#2e1a0c', distance: 209.63539777432626},
      {hex: '#271304', distance: 230.7682820493319},
      {hex: '#041507', distance: 244.60784942433878},
      {hex: '#b0b1ab', distance: 248.02822420039217},
      {hex: '#7f0011', distance: 254.14562754452416},
      {hex: '#e56716', distance: 254.21447637772323},
      {hex: '#8f0208', distance: 264.4806231087639},
      {hex: '#b40127', distance: 278.33792411383683},
      {hex: '#c40826', distance: 283.90491365948566},
      {hex: '#000000', distance: 284.8859420891105},
      {hex: '#d3c196', distance: 287.41607470703514},
      {hex: '#cf1c00', distance: 288.67628929304186},
      {hex: '#be0027', distance: 289.46156912446946},
      {hex: '#f1b230', distance: 294.4724095734607},
      {hex: '#d50500', distance: 324.04937895327004},
      {hex: '#a4cee6', distance: 333.69297265600306},
      {hex: '#f7db00', distance: 364.0412064588293},
      {hex: '#e8e5c4', distance: 384.79345108772316},
      {hex: '#f8f1d5', distance: 428.7096919828149},
      {hex: '#fff7ee', distance: 462.5699947035043},
      {hex: '#ffffff', distance: 486.1594388675386},
    ];

    return (
      <>
        <p>
          {numRows} &times; {numColumns} ({getNumberWithCommas(numRows * numColumns)} cells)
        </p>

        <SwatchWrapper>
          <Swatch hexValue={startHexValue} />
        </SwatchWrapper>

        {hexValueDistances.map(({hex, distance}) => {
          return (
            <SwatchWrapper key={hex}>
              <Swatch hexValue={hex} />
              <p>
                {distance} || {hex}
              </p>
            </SwatchWrapper>
          );
        })}

        <PixelatedImageWrappers>
          <PixelatedImageWrapper
            numRows={numRows}
            numColumns={numColumns}
            cellWidth={12}
            cellHeight={12}
          >
            <p>{_.size(original.hexValues)} colors</p>
            <div>{originalCells}</div>
          </PixelatedImageWrapper>

          <PixelatedImageWrapper
            numRows={numRows}
            numColumns={numColumns}
            cellWidth={12}
            cellHeight={12}
          >
            <p>{_.size(tenOrLess.hexValues)} colors</p>
            <div>{tenOrLessCells}</div>
          </PixelatedImageWrapper>

          <PixelatedImageWrapper
            numRows={numRows}
            numColumns={numColumns}
            cellWidth={12}
            cellHeight={12}
          >
            <p>{_.size(rustoleum2XUltraCoverGloss.hexValues)} colors</p>
            <div>{rustoleum2XUltraCoverGlossCells}</div>
          </PixelatedImageWrapper>

          <PixelatedImageWrapper
            numRows={numRows}
            numColumns={numColumns}
            cellWidth={12}
            cellHeight={12}
          >
            <p>{_.size(rustoleumEnamel.hexValues)} colors</p>
            <div>{rustoleumEnamelCells}</div>
          </PixelatedImageWrapper>
        </PixelatedImageWrappers>
      </>
    );
  }
}

export default HomeScreen;
