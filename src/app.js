import { Route, BrowserRouter as Router, Switch } from "react-router-dom";

import Layout from "./_layout";
import { ThemeProvider } from "./context/theme";
import { Provider } from "react-redux";
import store from "./context/snackbar/configureStore";

import MainPage from "./pages/mainPage";
import Snackbar from "./components/snackbar";
function App() {
  return (
    <>
      <ThemeProvider>
        <Provider store={store}>
          <Layout>
            <Router>
              <Switch>
                <Route path="/">
                <Snackbar />
                  <MainPage />
                </Route>
                {/* Add more routes here */}
              </Switch>
            </Router>
          </Layout>
        </Provider>
      </ThemeProvider>
    </>
  );
}

export default App;
