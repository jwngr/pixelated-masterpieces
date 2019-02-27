import styled from 'styled-components';

export const PixelatedImageWrapper = styled.div`
  order: 2;
  margin: 0;
  display: grid;
  max-width: 100%;
  grid-template-rows: repeat(${({numRows, cellHeight}) => `${numRows}, ${cellHeight}`}px);
  grid-template-columns: repeat(${({numColumns, cellWidth}) => `${numColumns}, ${cellWidth}`}px);

  @media (max-width: 1200px) {
    margin: 0;
  }

  @media (max-width: 768px) {
    order: 1;
    margin-bottom: 12px;
  }
`;

export const CellWrapper = styled.div`
  position: relative;
`;

export const Cell = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({hexValue}) => hexValue};
`;