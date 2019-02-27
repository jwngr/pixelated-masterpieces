import Loadable from 'react-loadable';
import React, {Component} from 'react';

const AsyncHomeScreen = Loadable({
  loader: () => import('./screens/Home/container'),
  loading: () => null,
});

class App extends Component {
  render() {
    return <AsyncHomeScreen />;
  }
}

export default App;
