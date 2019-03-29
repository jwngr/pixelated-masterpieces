import styled from 'styled-components';

export const PixelatedImageWrappers = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

export const PixelatedImageWrapper = styled.div`
  & > div {
    margin: 20px;
    display: grid;
    max-width: 100%;
    grid-template-rows: repeat(${({numRows, cellHeight}) => `${numRows}, ${cellHeight}`}px);
    grid-template-columns: repeat(${({numColumns, cellWidth}) => `${numColumns}, ${cellWidth}`}px);
  }
`;

export const PixelateButton = styled.button`
  padding: 20px;
  font-size: 40px;
  margin: 20px;
`;

export const CellWrapper = styled.div`
  position: relative;
`;

export const Cell = styled.div.attrs(({hexValue}) => ({
  style: {
    backgroundColor: hexValue,
  },
}))`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const Swatch = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  margin-right: 10px;
  background-color: ${({hexValue}) => hexValue};
`;

export const SwatchWrapper = styled.div`
  display: flex;
  margin: 8px;
  flex-direction: row;
`;
