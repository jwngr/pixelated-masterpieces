import React from 'react';
import ReactDOM from 'react-dom';

import * as serviceWorker from './serviceWorker';

import Home from './components/Home';

import './index.css';

ReactDOM.render(<Home />, document.getElementById('root'));

// Unregister any service workers.
serviceWorker.unregister();
